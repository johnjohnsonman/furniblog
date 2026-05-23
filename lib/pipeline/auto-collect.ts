import type { SupabaseClient } from "@supabase/supabase-js"
import { classifyChair, type KnownChair } from "@/lib/pipeline/classify-chair"
import {
  crawlSubreddit,
  fetchComments,
  normalizeRedditPermalink,
  sleep,
  type RedditPost,
} from "@/lib/pipeline/subreddit-crawler"
import { CHAIR_SUBREDDITS } from "@/lib/pipeline/subreddits"

export type SubredditCollectStats = {
  new: number
  skipped: number
  classified: number
  noMatch: number
  postsScanned: number
}

export type CollectSubredditBatchResult = SubredditCollectStats & {
  subreddit: string
  postsFound: number
  done: boolean
}

async function loadPublishedChairs(
  supabase: SupabaseClient
): Promise<KnownChair[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("published", true)
    .order("name")

  if (error) {
    console.error("[auto-collect] products", error.message)
    return []
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
  }))
}

function buildPostText(post: RedditPost, comments: string[]): string {
  const parts = [post.title, "", post.body]
  if (comments.length > 0) {
    parts.push("", "Comments:", comments.join("\n---\n"))
  }
  return parts.join("\n").trim()
}

async function isDuplicate(
  supabase: SupabaseClient,
  sourceUrl: string,
  productId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("content_queue")
    .select("id")
    .eq("source_url", sourceUrl)
    .eq("item_id", productId)
    .maybeSingle()
  return Boolean(data)
}

/**
 * Crawl one subreddit and enqueue matched posts into content_queue.
 */
export async function collectSubredditBatch(
  supabase: SupabaseClient,
  options: {
    subreddit: string
    limit?: number
    targetCount: number
    statsSoFar?: SubredditCollectStats
    signal?: AbortSignal
  }
): Promise<CollectSubredditBatchResult> {
  const stats: SubredditCollectStats = {
    new: options.statsSoFar?.new ?? 0,
    skipped: options.statsSoFar?.skipped ?? 0,
    classified: options.statsSoFar?.classified ?? 0,
    noMatch: options.statsSoFar?.noMatch ?? 0,
    postsScanned: options.statsSoFar?.postsScanned ?? 0,
  }

  const target = options.targetCount
  const chairs = await loadPublishedChairs(supabase)
  const slugToId = new Map(chairs.map((c) => [c.slug, c.id]))

  const posts = await crawlSubreddit(options.subreddit, {
    sort: "top",
    timeframe: "month",
    limit: options.limit ?? 30,
  })

  for (const post of posts) {
    if (options.signal?.aborted) break
    if (stats.new >= target) break

    stats.postsScanned += 1
    const sourceUrl = normalizeRedditPermalink(post.permalink)

    const comments = await fetchComments(post.permalink)
    const fullText = buildPostText(post, comments)

    if (fullText.length < 40) {
      stats.noMatch += 1
      continue
    }

    const classification = await classifyChair(fullText, chairs)
    stats.classified += 1

    if (classification.chairs.length === 0 || !classification.isReview) {
      stats.noMatch += 1
      await sleep(400)
      continue
    }

    let insertedForPost = 0
    for (const slug of [...new Set(classification.chairs)]) {
      if (stats.new >= target) break
      const productId = slugToId.get(slug)
      if (!productId) continue

      if (await isDuplicate(supabase, sourceUrl, productId)) {
        stats.skipped += 1
        continue
      }

      const { error } = await supabase.from("content_queue").insert({
        source_type: "reddit",
        source_url: sourceUrl,
        raw_content: fullText.slice(0, 50_000),
        item_type: "chair",
        item_id: productId,
        status: "pending",
        ai_output: {
          subredditCrawl: true,
          sentiment: classification.sentiment,
          isReview: classification.isReview,
          subreddit: post.subreddit,
          postTitle: post.title,
          classifiedSlugs: classification.chairs,
          score: post.score,
          numComments: post.num_comments,
        },
      })

      if (error) {
        console.error("[auto-collect] insert", error.message)
        continue
      }

      stats.new += 1
      insertedForPost += 1
    }

    if (insertedForPost === 0 && classification.chairs.length > 0) {
      stats.skipped += 1
    }

    await sleep(500)
  }

  return {
    ...stats,
    subreddit: options.subreddit,
    postsFound: posts.length,
    done: stats.new >= target,
  }
}

export async function autoCollectFromSubreddits(
  supabase: SupabaseClient,
  options: {
    targetCount?: number
    postsPerSubreddit?: number
    signal?: AbortSignal
    onProgress?: (msg: {
      subreddit: string
      postsFound: number
      stats: SubredditCollectStats
    }) => void
  }
): Promise<SubredditCollectStats> {
  const target = options.targetCount ?? 50
  const stats: SubredditCollectStats = {
    new: 0,
    skipped: 0,
    classified: 0,
    noMatch: 0,
    postsScanned: 0,
  }

  for (const subreddit of CHAIR_SUBREDDITS) {
    if (options.signal?.aborted) break
    if (stats.new >= target) break

    const batch = await collectSubredditBatch(supabase, {
      subreddit,
      limit: options.postsPerSubreddit ?? 30,
      targetCount: target,
      statsSoFar: stats,
      signal: options.signal,
    })

    stats.new = batch.new
    stats.skipped = batch.skipped
    stats.classified = batch.classified
    stats.noMatch = batch.noMatch
    stats.postsScanned = batch.postsScanned

    options.onProgress?.({
      subreddit,
      postsFound: batch.postsFound,
      stats: { ...stats },
    })

    await sleep(1000)
  }

  return stats
}

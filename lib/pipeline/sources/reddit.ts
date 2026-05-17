import { getSearchQueries } from "@/lib/pipeline/chair-names"
import { fetchWithTimeout } from "@/lib/pipeline/fetch-with-timeout"
import type { RawContent } from "@/lib/pipeline/types"

const USER_AGENT = "furniblog/1.0 (chair review aggregator)"

const DEFAULT_SUBREDDITS = [
  "officechairs",
  "Workspaces",
  "malelivingspace",
  "femalelivingspace",
  "battlestations",
  "AskReddit",
] as const

interface RedditPost {
  title: string
  selftext: string
  score: number
  url: string
  created_utc: number
  num_comments: number
  permalink: string
}

interface RedditListing {
  data?: {
    children?: Array<{ data?: RedditPost }>
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchSubredditSearch(
  chairName: string,
  subreddit: string,
  sort: "relevance" | "top",
  limit: number
): Promise<RedditPost[]> {
  const params = new URLSearchParams({
    q: chairName,
    sort,
    limit: String(limit),
    restrict_sr: "1",
  })

  const url = `https://www.reddit.com/r/${subreddit}/search.json?${params}`

  const res = await fetchWithTimeout(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Reddit ${subreddit} (${sort}): HTTP ${res.status}`)
  }

  const json = (await res.json()) as RedditListing
  return (json.data?.children ?? [])
    .map((c) => c.data)
    .filter((d): d is RedditPost => Boolean(d?.title))
}

function postToRawContent(post: RedditPost): RawContent | null {
  if (post.score < 10) return null
  const body = (post.selftext ?? "").trim()
  if (body.length < 100) return null

  const permalink = post.permalink.startsWith("/")
    ? post.permalink
    : `/${post.permalink}`

  return {
    url: `https://www.reddit.com${permalink}`,
    title: post.title.trim(),
    body,
    source: "reddit",
    score: post.score,
    collectedAt: new Date(post.created_utc * 1000).toISOString(),
  }
}

export async function collectFromSubreddit(
  chairName: string,
  subreddit: string = "officechairs",
  maxPerSort: number = 10
): Promise<RawContent[]> {
  const query = chairName
  console.log("[REDDIT] Search query:", query, "| subreddit:", subreddit)

  const [relevance, top] = await Promise.all([
    fetchSubredditSearch(chairName, subreddit, "relevance", maxPerSort),
    fetchSubredditSearch(chairName, subreddit, "top", Math.min(5, maxPerSort)),
  ])

  const posts = [...relevance, ...top]
  console.log("[REDDIT] Posts found:", posts.length)

  const items: RawContent[] = []
  for (const post of posts) {
    const raw = postToRawContent(post)
    if (raw) items.push(raw)
  }

  console.log("[REDDIT] After filter:", items.length)
  for (const post of posts) {
    console.log(
      "[REDDIT] Post score:",
      post.score,
      "length:",
      post.selftext?.length ?? 0,
      "title:",
      post.title
    )
  }

  return items
}

function dedupeByUrl(items: RawContent[]): RawContent[] {
  const seen = new Set<string>()
  const results: RawContent[] = []
  for (const item of items) {
    if (!seen.has(item.url)) {
      seen.add(item.url)
      results.push(item)
    }
  }
  return results
}

/** Collect Reddit posts across chair-related subreddits (no API key). */
export async function collectFromReddit(
  chairSlug: string,
  chairNameEn: string,
  subreddits: readonly string[] = DEFAULT_SUBREDDITS,
  maxPerSubreddit: number = 10
): Promise<RawContent[]> {
  const queries = getSearchQueries(chairSlug, chairNameEn, "en")
  const all: RawContent[] = []

  for (const query of queries) {
    for (const subreddit of subreddits) {
      try {
        const items = await collectFromSubreddit(query, subreddit, maxPerSubreddit)
        all.push(...items)
      } catch (err) {
        console.warn(
          `[reddit] ${subreddit} (${query}) failed:`,
          err instanceof Error ? err.message : err
        )
      }
      await sleep(400)
    }
    await sleep(400)
  }

  return dedupeByUrl(all)
}

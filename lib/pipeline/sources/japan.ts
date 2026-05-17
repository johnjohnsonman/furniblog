import { getChairNames } from "@/lib/pipeline/chair-names"
import { fetchWithTimeout } from "@/lib/pipeline/fetch-with-timeout"
import type { RawContent } from "@/lib/pipeline/types"

const USER_AGENT = "furniblog/1.0"
const JAPAN_SUBREDDITS = [
  "japanlife",
  "japanfinance",
  "digitalnomad",
  "remotework",
] as const

const JAPANESE_BRAND_PREFIXES = ["okamura", "kokuyo", "itoki"]
const MIN_BODY_LENGTH = 200
const MIN_YOUTUBE_BODY_LENGTH = 300
const MAX_ITEMS = 10
const DELAY_MS = 1000

interface RedditPost {
  title: string
  selftext: string
  score: number
  permalink: string
}

interface RedditListing {
  data?: {
    children?: Array<{ data?: RedditPost }>
  }
}

interface YoutubeSearchItem {
  id?: { videoId?: string }
  snippet?: { title?: string; description?: string }
}

interface YoutubeVideoItem {
  id?: string
  snippet?: { title?: string; description?: string }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

function isJapaneseBrand(chairSlug: string): boolean {
  const slug = chairSlug.toLowerCase()
  return JAPANESE_BRAND_PREFIXES.some(
    (brand) => slug.startsWith(`${brand}-`) || slug.includes(`-${brand}-`)
  )
}

async function fetchRedditSearch(
  subreddit: string,
  query: string,
  limit: number
): Promise<RedditPost[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    restrict_sr: "1",
  })

  const url = `https://www.reddit.com/r/${subreddit}/search.json?${params}`
  console.log("[JAPAN] Reddit search:", subreddit, query)

  const res = await fetchWithTimeout(url, {
    headers: { "User-Agent": USER_AGENT },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Reddit r/${subreddit}: HTTP ${res.status}`)
  }

  const json = (await res.json()) as RedditListing
  const posts = (json.data?.children ?? [])
    .map((c) => c.data)
    .filter((d): d is RedditPost => Boolean(d?.title))

  console.log(`[JAPAN] Reddit r/${subreddit} posts: ${posts.length}`)
  return posts
}

function redditPostToRaw(post: RedditPost, minLength: number): RawContent | null {
  const body = (post.selftext ?? "").trim()
  if (body.length < minLength) return null

  const permalink = post.permalink.startsWith("/")
    ? post.permalink
    : `/${post.permalink}`

  return {
    url: `https://www.reddit.com${permalink}`,
    title: post.title.trim(),
    body,
    source: "japan_community",
    score: post.score,
    collectedAt: new Date().toISOString(),
  }
}

async function collectFromJapanSubreddits(
  queries: string[],
  results: RawContent[]
): Promise<void> {
  for (const subreddit of JAPAN_SUBREDDITS) {
    for (const query of queries) {
      if (results.length >= MAX_ITEMS) return

      try {
        const posts = await fetchRedditSearch(subreddit, query, 3)
        for (const post of posts) {
          if (results.length >= MAX_ITEMS) break
          const raw = redditPostToRaw(post, MIN_BODY_LENGTH)
          if (raw) results.push(raw)
        }
      } catch (err) {
        console.warn(
          `[JAPAN] Reddit r/${subreddit} (${query}):`,
          err instanceof Error ? err.message : err
        )
      }

      await sleep(DELAY_MS)
    }
  }
}

async function collectFromYoutubeJa(
  names: ReturnType<typeof getChairNames>,
  results: RawContent[]
): Promise<void> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    console.log("[JAPAN] YOUTUBE_API_KEY not set — skipping YouTube")
    return
  }

  const jaQueries = [`${names.ja} レビュー`, `${names.ja} 座り心地`]

  for (const jaQuery of jaQueries) {
    if (results.length >= MAX_ITEMS) return

    try {
      const searchParams = new URLSearchParams({
        part: "snippet",
        q: jaQuery,
        type: "video",
        maxResults: "3",
        key: apiKey,
        relevanceLanguage: "ja",
      })

      console.log("[JAPAN] YouTube search:", jaQuery)

      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams}`
      )

      if (!searchRes.ok) {
        console.warn(`[JAPAN] YouTube search failed: HTTP ${searchRes.status}`)
        await sleep(DELAY_MS)
        continue
      }

      const searchJson = (await searchRes.json()) as { items?: YoutubeSearchItem[] }
      const videoIds = (searchJson.items ?? [])
        .map((i) => i.id?.videoId)
        .filter((id): id is string => Boolean(id))

      if (videoIds.length === 0) {
        await sleep(DELAY_MS)
        continue
      }

      const videoParams = new URLSearchParams({
        part: "snippet",
        id: videoIds.join(","),
        key: apiKey,
      })

      const videoRes = await fetchWithTimeout(
        `https://www.googleapis.com/youtube/v3/videos?${videoParams}`
      )

      if (!videoRes.ok) {
        console.warn(`[JAPAN] YouTube videos failed: HTTP ${videoRes.status}`)
        await sleep(DELAY_MS)
        continue
      }

      const videoJson = (await videoRes.json()) as { items?: YoutubeVideoItem[] }

      for (const video of videoJson.items ?? []) {
        if (results.length >= MAX_ITEMS) break

        const id = video.id
        const description = (video.snippet?.description ?? "").trim()
        if (!id || description.length < MIN_YOUTUBE_BODY_LENGTH) continue

        results.push({
          url: `https://www.youtube.com/watch?v=${id}`,
          title: (video.snippet?.title ?? jaQuery).trim(),
          body: description,
          source: "japan_community",
          collectedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.warn(
        "[JAPAN] YouTube error:",
        err instanceof Error ? err.message : err
      )
    }

    await sleep(DELAY_MS)
  }
}

async function collectFromOfficeChairsJapan(
  names: ReturnType<typeof getChairNames>,
  results: RawContent[]
): Promise<void> {
  const officeQueries = [
    `${names.en} Japanese ergonomic chair`,
    `${names.en} vs Herman Miller`,
  ]

  for (const query of officeQueries) {
    if (results.length >= MAX_ITEMS) return

    try {
      const posts = await fetchRedditSearch("officechairs", query, 5)
      for (const post of posts) {
        if (results.length >= MAX_ITEMS) break
        const raw = redditPostToRaw(post, MIN_BODY_LENGTH)
        if (raw) results.push(raw)
      }
    } catch (err) {
      console.warn(
        `[JAPAN] officechairs (${query}):`,
        err instanceof Error ? err.message : err
      )
    }

    await sleep(DELAY_MS)
  }
}

/** Collect Japan-related chair reviews via Reddit + YouTube (no HTML crawling). */
export async function collectFromJapan(
  chairSlug: string,
  chairNameEn: string
): Promise<RawContent[]> {
  const names = getChairNames(chairSlug, chairNameEn)
  const queries = [names.en, ...names.aliases.en.slice(0, 2)].filter(Boolean)

  console.log("[JAPAN] Chair:", chairSlug, "| queries:", queries.join(", "))

  const results: RawContent[] = []

  try {
    await collectFromJapanSubreddits(queries, results)
    await collectFromYoutubeJa(names, results)

    if (isJapaneseBrand(chairSlug)) {
      console.log("[JAPAN] Japanese brand — searching r/officechairs")
      await collectFromOfficeChairsJapan(names, results)
    }
  } catch (err) {
    console.warn("[JAPAN] collection error:", err)
    return []
  }

  const deduped = dedupeByUrl(results).slice(0, MAX_ITEMS)
  console.log("[JAPAN] Collected:", deduped.length, "items")
  return deduped
}

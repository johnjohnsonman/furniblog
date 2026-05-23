import { fetchWithTimeout } from "@/lib/pipeline/fetch-with-timeout"

const REDDIT_HEADERS = {
  "User-Agent": "furniblog/1.0 (chair review aggregator)",
  Accept: "application/json",
} as const

export interface RedditPost {
  title: string
  url: string
  permalink: string
  body: string
  score: number
  num_comments: number
  created_utc: number
  subreddit: string
}

type RedditListingChild = {
  data?: {
    title?: string
    selftext?: string
    url?: string
    permalink?: string
    score?: number
    num_comments?: number
    created_utc?: number
    subreddit?: string
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function normalizeRedditPermalink(permalink: string): string {
  const path = permalink.startsWith("/") ? permalink : `/${permalink}`
  return `https://www.reddit.com${path}`.replace(/\/?$/, "/")
}

/**
 * Fetch subreddit listing via public JSON API (no OAuth).
 * Falls back to empty array on 403/429.
 */
export async function crawlSubreddit(
  subreddit: string,
  options: {
    sort?: "hot" | "new" | "top"
    timeframe?: "day" | "week" | "month" | "year" | "all"
    limit?: number
  } = {}
): Promise<RedditPost[]> {
  const sort = options.sort ?? "top"
  const tf = options.timeframe ?? "month"
  const limit = Math.min(options.limit ?? 100, 100)

  const url = new URL(
    `https://www.reddit.com/r/${subreddit}/${sort}.json`
  )
  url.searchParams.set("limit", String(limit))
  if (sort === "top") url.searchParams.set("t", tf)

  try {
    const res = await fetchWithTimeout(
      url.toString(),
      { headers: REDDIT_HEADERS, cache: "no-store" },
      15_000
    )

    if (!res.ok) {
      console.error(`[CRAWL] r/${subreddit} HTTP ${res.status}`)
      return []
    }

    const json = (await res.json()) as {
      data?: { children?: RedditListingChild[] }
    }
    const children = json?.data?.children ?? []

    return children
      .map((child) => {
        const p = child.data
        if (!p?.permalink) return null
        const permalink = normalizeRedditPermalink(p.permalink)
        const title = (p.title ?? "").trim()
        const body = (p.selftext ?? "").trim()
        return {
          title,
          url: p.url?.startsWith("http") ? p.url : permalink,
          permalink,
          body,
          score: p.score ?? 0,
          num_comments: p.num_comments ?? 0,
          created_utc: p.created_utc ?? 0,
          subreddit: p.subreddit ?? subreddit,
        } satisfies RedditPost
      })
      .filter((p): p is RedditPost => p !== null && p.title.length > 0)
  } catch (e) {
    console.error(`[CRAWL] r/${subreddit} failed:`, e)
    return []
  }
}

/** Top comments from a post permalink (JSON API). */
export async function fetchComments(permalink: string): Promise<string[]> {
  const base = normalizeRedditPermalink(permalink).replace(/\/$/, "")
  const jsonUrl = `${base}.json?limit=20&depth=2`

  try {
    const res = await fetchWithTimeout(
      jsonUrl,
      { headers: REDDIT_HEADERS, cache: "no-store" },
      10_000
    )
    if (!res.ok) return []

    const data = (await res.json()) as unknown
    if (!Array.isArray(data) || data.length < 2) return []

    const listing = data[1] as {
      data?: {
        children?: Array<{
          kind?: string
          data?: { body?: string }
        }>
      }
    }

    const comments = listing?.data?.children ?? []
    return comments
      .filter((c) => c.kind === "t1" && c.data?.body)
      .map((c) => String(c.data!.body).trim())
      .filter((body) => body.length > 50)
      .slice(0, 15)
  } catch {
    return []
  }
}

export { sleep }

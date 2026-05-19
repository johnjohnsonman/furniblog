import type { RawContent } from "@/lib/pipeline/types"

const REDDIT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
} as const

const SUBREDDITS = [
  "officechairs",
  "Workspaces",
  "remotework",
  "battlestations",
] as const

type RedditPostData = {
  title?: string
  selftext?: string
  score?: number
  permalink?: string
}

type RedditListing = {
  data?: {
    children?: Array<{ data?: RedditPostData }>
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function collectFromReddit(
  chairSlug: string,
  chairName: string
): Promise<RawContent[]> {
  void chairSlug

  const results: RawContent[] = []
  const seen = new Set<string>()

  const queries = [
    chairName,
    chairName.replace(/\s+v\d+$/i, ""),
  ].filter((q, i, arr) => q.trim().length > 0 && arr.indexOf(q) === i)

  for (const subreddit of SUBREDDITS.slice(0, 2)) {
    for (const query of queries.slice(0, 1)) {
      try {
        const searchUrl = `https://old.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&restrict_sr=1&t=all`

        console.log(`[REDDIT] Fetching: ${searchUrl}`)

        const response = await fetch(searchUrl, {
          headers: REDDIT_HEADERS,
          cache: "no-store",
        })

        console.log(`[REDDIT] Status: ${response.status}`)

        if (!response.ok) {
          console.log(
            `[REDDIT] Error: ${response.status} ${response.statusText}`
          )
          if (response.status === 403) {
            console.log("[REDDIT] 403 — giving up immediately")
            return []
          }
          continue
        }

        const data = (await response.json()) as RedditListing
        const posts = data?.data?.children ?? []

        console.log(
          `[REDDIT] Posts found: ${posts.length} for "${query}" in r/${subreddit}`
        )

        for (const post of posts) {
          const p = post.data
          if (!p?.permalink) continue

          const postUrl = `https://reddit.com${p.permalink.startsWith("/") ? p.permalink : `/${p.permalink}`}`
          if (seen.has(postUrl)) continue
          seen.add(postUrl)

          const body = (p.selftext ?? "").trim()
          const title = (p.title ?? "").trim()
          const combined = `${title}\n\n${body}`.trim()

          if (combined.length < 50) {
            console.log(`[REDDIT] Skipped (too short): ${title}`)
            continue
          }

          if ((p.score ?? 0) < 1) {
            console.log(`[REDDIT] Skipped (low score): ${p.score}`)
            continue
          }

          results.push({
            url: postUrl,
            title,
            body: combined,
            source: "reddit",
            score: p.score,
            collectedAt: new Date().toISOString(),
          })

          console.log(
            `[REDDIT] Added: "${title}" (score: ${p.score}, length: ${combined.length})`
          )

          if (results.length >= 5) break
        }

        if (results.length >= 5) break
      } catch (error) {
        console.error(`[REDDIT] Error for r/${subreddit}/${query}:`, error)
      }

      if (results.length >= 5) break

      await sleep(1000)
    }
    if (results.length >= 5) break
  }

  console.log(`[REDDIT] Total collected: ${results.length}`)
  return results
}

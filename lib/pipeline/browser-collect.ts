import type { RawContent } from "@/lib/pipeline/types"

const REDDIT_SUBREDDITS = ["officechairs", "Workspaces"] as const

function normalizeRedditPermalink(permalink: string): string {
  return permalink.startsWith("/") ? permalink : `/${permalink}`
}

/** Collect Reddit posts from the admin browser (avoids Vercel IP blocks). */
export async function collectRedditFromBrowser(
  chairName: string
): Promise<RawContent[]> {
  const results: RawContent[] = []
  const seen = new Set<string>()

  for (const sub of REDDIT_SUBREDDITS) {
    try {
      const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(chairName)}&sort=relevance&limit=10&restrict_sr=1&t=all`

      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      })

      if (!res.ok) {
        console.warn(`[REDDIT browser] r/${sub} HTTP ${res.status}`)
        continue
      }

      const data = (await res.json()) as {
        data?: { children?: Array<{ data?: Record<string, unknown> }> }
      }
      const posts = data?.data?.children ?? []

      for (const post of posts) {
        const p = post.data
        if (!p || typeof p.permalink !== "string" || typeof p.title !== "string") {
          continue
        }

        const postUrl = `https://reddit.com${normalizeRedditPermalink(p.permalink)}`
        if (seen.has(postUrl)) continue
        seen.add(postUrl)

        const combined = `${p.title}\n\n${typeof p.selftext === "string" ? p.selftext : ""}`.trim()
        if (combined.length < 50) continue

        results.push({
          url: postUrl,
          title: p.title,
          body: combined,
          source: "reddit",
          score: typeof p.score === "number" ? p.score : undefined,
          collectedAt: new Date().toISOString(),
        })
      }
    } catch (e) {
      console.error(`[REDDIT browser] r/${sub} error:`, e)
    }
  }

  console.log(`[REDDIT browser] Total: ${results.length}`)
  return results
}

/**
 * Best-effort DC Inside collection from the browser.
 * Often blocked by CORS; returns [] without throwing.
 */
export async function collectDCInsideFromBrowser(
  chairSlug: string,
  chairName: string
): Promise<RawContent[]> {
  void chairSlug
  void chairName
  // DC Inside does not expose CORS-friendly APIs from the browser.
  // Gallery HTML fetch is blocked on cross-origin requests.
  console.warn(
    "[DC Inside browser] Skipped — CORS blocks direct fetch from the admin browser."
  )
  return []
}

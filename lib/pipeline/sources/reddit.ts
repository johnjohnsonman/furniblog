import { getSearchQueries } from "@/lib/pipeline/chair-names"
import type { RawContent } from "@/lib/pipeline/types"

/**
 * Server-side Reddit collection via the official OAuth API.
 *
 * The old browser-based approach (reddit.com/search.json with mode:"cors")
 * was blocked by CORS and by Reddit rejecting anonymous/datacenter requests.
 * Running server-side with application-only OAuth (client credentials) avoids
 * both: no CORS in Node, and an authenticated token + descriptive User-Agent
 * is what Reddit's API expects.
 *
 * Requires REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET (a Reddit "web app" /
 * "script" app). REDDIT_USER_AGENT is optional but recommended.
 */

const USER_AGENT =
  process.env.REDDIT_USER_AGENT?.trim() || "web:furniblog:v1.0 (by /u/furniblog)"

/** Module-level token cache so each chair doesn't re-authenticate. */
let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID?.trim()
  const clientSecret = process.env.REDDIT_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    console.log("[REDDIT] REDDIT_CLIENT_ID/SECRET not set — skipping")
    return null
  }

  // Reuse a valid token (with a small safety margin).
  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) {
    console.warn(`[REDDIT] token request failed: HTTP ${res.status}`)
    return null
  }

  const json = (await res.json()) as {
    access_token?: string
    expires_in?: number
  }
  if (!json.access_token) {
    console.warn("[REDDIT] token response missing access_token")
    return null
  }

  cachedToken = {
    value: json.access_token,
    expiresAt: now + (json.expires_in ?? 3600) * 1000,
  }
  return cachedToken.value
}

type RedditChild = { data?: Record<string, unknown> }

function parseListing(json: unknown): RawContent[] {
  const listing = json as { data?: { children?: RedditChild[] } }
  const children = listing?.data?.children ?? []
  const results: RawContent[] = []

  for (const child of children) {
    const p = child.data
    if (!p) continue

    const permalink = String(p.permalink ?? "")
    const title = String(p.title ?? "")
    const selftext = String(p.selftext ?? "")
    const body = `${title}\n\n${selftext}`.trim()

    // Skip link-only posts with no discussion text.
    if (!permalink || body.length < 50) continue

    results.push({
      url: `https://reddit.com${permalink}`,
      title,
      body,
      source: "reddit",
      collectedAt: new Date().toISOString(),
    })
  }

  return results
}

async function searchReddit(
  token: string,
  query: string,
  limit: number
): Promise<RawContent[]> {
  const params = new URLSearchParams({
    q: `${query} review`,
    sort: "relevance",
    t: "all",
    type: "link",
    limit: String(limit),
  })

  const res = await fetch(`https://oauth.reddit.com/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
    },
  })

  if (!res.ok) {
    console.warn(`[REDDIT] search failed: HTTP ${res.status} for "${query}"`)
    return []
  }

  const json = await res.json()
  const posts = parseListing(json)
  console.log(`[REDDIT] "${query}" — items: ${posts.length}`)
  return posts
}

export async function collectFromReddit(
  chairSlug: string,
  chairNameEn: string
): Promise<RawContent[]> {
  const token = await getAccessToken()
  if (!token) return []

  const queries = getSearchQueries(chairSlug, chairNameEn, "en")
  const seen = new Set<string>()
  const results: RawContent[] = []

  try {
    for (const query of queries) {
      const posts = await searchReddit(token, query, 10)
      for (const post of posts) {
        if (seen.has(post.url)) continue
        seen.add(post.url)
        results.push(post)
      }
    }
  } catch (err) {
    console.warn("[REDDIT] error:", err instanceof Error ? err.message : err)
  }

  return results
}

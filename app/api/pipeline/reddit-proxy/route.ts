import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"

const USER_AGENT = "Mozilla/5.0 (compatible; Furniblog/1.0)"

export type RedditProxyPost = {
  url: string
  title: string
  body: string
  permalink: string
}

function parseRedditPosts(json: unknown): RedditProxyPost[] {
  const listing = json as {
    data?: { children?: Array<{ data?: Record<string, unknown> }> }
  }
  const children = listing?.data?.children ?? []
  const posts: RedditProxyPost[] = []

  for (const child of children) {
    const p = child.data
    if (!p) continue

    const permalink = String(p.permalink ?? "")
    const title = String(p.title ?? "")
    const selftext = String(p.selftext ?? "")
    const body = `${title}\n\n${selftext}`.trim()

    if (!permalink || body.length < 10) continue

    const postUrl = permalink.startsWith("/")
      ? `https://reddit.com${permalink}`
      : `https://reddit.com/${permalink}`

    posts.push({
      url: postUrl,
      title,
      body,
      permalink,
    })
  }

  return posts
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q) {
    return NextResponse.json([])
  }

  const subreddit = request.nextUrl.searchParams.get("subreddit")?.trim()
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? 10)
  const limit = Math.min(
    25,
    Math.max(1, Number.isFinite(limitParam) ? limitParam : 10)
  )
  const chairReview = request.nextUrl.searchParams.get("chairReview") !== "false"

  const redditUrl = subreddit
    ? `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(q)}&sort=relevance&limit=${limit}&restrict_sr=1&t=all`
    : `https://www.reddit.com/search.json?q=${encodeURIComponent(chairReview ? `${q} chair review` : q)}&sort=relevance&limit=${limit}&t=all`

  try {
    const res = await fetch(redditUrl, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    })

    if (!res.ok) {
      console.warn("[reddit-proxy] Reddit HTTP", res.status, redditUrl)
      return NextResponse.json([])
    }

    const json = await res.json()
    return NextResponse.json(parseRedditPosts(json))
  } catch (error) {
    console.warn("[reddit-proxy] fetch failed:", error)
    return NextResponse.json([])
  }
}

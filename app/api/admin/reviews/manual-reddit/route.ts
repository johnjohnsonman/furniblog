import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { processWithClaude } from "@/lib/pipeline/processor"
import type { RawContent } from "@/lib/pipeline/types"

export const maxDuration = 60

// Reddit blocks the public .json endpoint from data-center IPs (Vercel) with a
// 403. The reliable path is the OAuth API (oauth.reddit.com), which works from
// servers when REDDIT_CLIENT_ID/SECRET are set. We try OAuth first, then fall
// back to a best-effort public .json fetch with a browser UA.
const API_UA = "web:furniblog:v1.0 (by /u/furniblog)"
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

type RedditPost = { title: string; body: string; permalink: string }

async function getRedditToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID?.trim()
  const secret = process.env.REDDIT_CLIENT_SECRET?.trim()
  if (!id || !secret) return null
  try {
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": API_UA,
      },
      body: "grant_type=client_credentials",
    })
    if (!res.ok) return null
    const j = (await res.json()) as { access_token?: string }
    return j.access_token ?? null
  } catch {
    return null
  }
}

function parseListing(data: unknown, fallbackUrl: string): RedditPost | { error: string } {
  const arr = data as Array<{ data?: { children?: Array<{ data?: Record<string, unknown> }> } }>
  const post = arr?.[0]?.data?.children?.[0]?.data
  if (!post) return { error: "Couldn't find the post in Reddit's response." }

  const title = String(post.title ?? "").trim()
  const selftext = String(post.selftext ?? "").trim()
  const comments = (arr?.[1]?.data?.children ?? [])
    .map((c) => c?.data?.body)
    .filter(
      (b): b is string =>
        typeof b === "string" && b.trim().length > 0 && b !== "[deleted]" && b !== "[removed]"
    )
    .slice(0, 10)

  const body = [selftext, ...comments].filter(Boolean).join("\n\n").slice(0, 6000)
  const permalink = post.permalink ? `https://www.reddit.com${post.permalink}` : fallbackUrl
  if (!title && !body) return { error: "This post has no readable text to summarize." }
  return { title: title || "Reddit discussion", body, permalink }
}

async function fetchRedditPost(rawUrl: string): Promise<RedditPost | { error: string }> {
  let path: string
  try {
    const u = new URL(rawUrl.trim())
    const host = u.hostname.replace(/^www\.|^old\./, "")
    if (host !== "reddit.com" && host !== "redd.it") {
      return { error: "That's not a Reddit link." }
    }
    path = u.pathname.replace(/\/+$/, "")
  } catch {
    return { error: "That doesn't look like a valid URL." }
  }

  // 1) Authenticated API (works from servers) when credentials are configured.
  const token = await getRedditToken()
  if (token) {
    try {
      const res = await fetch(`https://oauth.reddit.com${path}?raw_json=1`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": API_UA },
      })
      if (res.ok) return parseListing(await res.json(), rawUrl)
    } catch {
      // fall through to public fetch
    }
  }

  // 2) Best-effort public .json with a browser UA.
  const get = (url: string) =>
    fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json,text/html" },
      redirect: "follow",
    })
  let res = await get(`https://www.reddit.com${path}.json`)
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("json")) {
    try {
      const resolved = await fetch(rawUrl, { headers: { "User-Agent": BROWSER_UA }, redirect: "follow" })
      const u2 = new URL(resolved.url)
      res = await get(`https://www.reddit.com${u2.pathname.replace(/\/+$/, "")}.json`)
    } catch {
      // fall through
    }
  }

  if (!res.ok) {
    return {
      error:
        res.status === 403
          ? "Reddit blocked the request (403). Reddit blocks server fetches without API keys — add REDDIT_CLIENT_ID/SECRET to enable this reliably."
          : `Reddit returned ${res.status}. The post may be private/removed — try again in a moment.`,
    }
  }
  try {
    return parseListing(await res.json(), rawUrl)
  } catch {
    return { error: "Reddit didn't return readable data (rate-limiting or blocked). Try again." }
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: { chairSlug?: string; url?: string; text?: string; sourceUrl?: string }
  try {
    body = (await request.json()) as {
      chairSlug?: string
      url?: string
      text?: string
      sourceUrl?: string
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const chairSlug = body.chairSlug?.trim()
  const text = body.text?.trim()
  const url = body.url?.trim()
  const sourceUrl = body.sourceUrl?.trim()
  if (!chairSlug) return NextResponse.json({ error: "Select a chair first." }, { status: 400 })
  if (!text && !url) {
    return NextResponse.json({ error: "Paste the Reddit text (or a link)." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("slug", chairSlug)
    .eq("track", "chair")
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!product) return NextResponse.json({ error: "Chair not found." }, { status: 404 })

  // Pasted text wins (no Reddit fetch → no 403). Otherwise fetch from the link.
  let postTitle = ""
  let postBody = ""
  let permalink: string | null = null
  if (text) {
    postBody = text
    permalink = sourceUrl && /^https?:\/\//.test(sourceUrl) ? sourceUrl : null
  } else {
    const fetched = await fetchRedditPost(url as string)
    if ("error" in fetched) return NextResponse.json({ error: fetched.error }, { status: 422 })
    postTitle = fetched.title
    postBody = fetched.body
    permalink = fetched.permalink
  }

  // Dedup only when we have a URL to key on.
  if (permalink) {
    const { data: dup } = await supabase
      .from("reviews")
      .select("id")
      .eq("product_id", product.id)
      .eq("source_url", permalink)
      .maybeSingle()
    if (dup) {
      return NextResponse.json(
        { error: "This Reddit post is already a review for this chair." },
        { status: 409 }
      )
    }
  }

  const item: RawContent = {
    url: permalink ?? "",
    title: postTitle,
    body: postBody,
    source: "reddit",
    collectedAt: new Date().toISOString(),
  }

  const outcome = await processWithClaude(item, product.name)
  if (outcome.status === "rejected") {
    return NextResponse.json(
      {
        error: `The AI judged this not specific enough to the ${product.name} (relevance ${Math.round(
          (outcome.confidence ?? 0) * 100
        )}%). Make sure the pasted text is clearly about this chair.`,
      },
      { status: 422 }
    )
  }
  if (outcome.status !== "success" || !outcome.data) {
    return NextResponse.json({ error: "AI processing failed — try again." }, { status: 502 })
  }

  const d = outcome.data
  const scores: Record<string, unknown> = { overall: d.overall }
  if (d.mentions_back_pain) scores.mentionsBackPain = true
  if (d.mentions_lumbar) scores.mentionsLumbar = true
  if (d.back_issue_sentiment) scores.backIssueSentiment = d.back_issue_sentiment

  const { error: insErr } = await supabase.from("reviews").insert({
    // Stored as "community" so it shows on-site with no source attribution.
    product_id: product.id,
    source: "community",
    summary_ko: d.summary,
    pros: d.pros ?? [],
    cons: d.cons ?? [],
    scores,
    source_url: permalink,
    original_language: "en",
    verified: false,
  })
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    chair: { slug: product.slug, name: product.name },
    review: {
      summary: d.summary,
      overall: d.overall,
      pros: d.pros ?? [],
      cons: d.cons ?? [],
      sourceUrl: permalink,
    },
  })
}

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { processWithClaude } from "@/lib/pipeline/processor"
import type { RawContent } from "@/lib/pipeline/types"

export const maxDuration = 60

const UA = "Mozilla/5.0 (compatible; FurniblogBot/1.0; +https://www.furniblog.com)"

type RedditPost = { title: string; body: string; permalink: string }

/** Fetch a Reddit post (selftext + top comments) via the public .json endpoint. */
async function fetchRedditPost(rawUrl: string): Promise<RedditPost | { error: string }> {
  let jsonUrl: string
  try {
    const u = new URL(rawUrl.trim())
    const host = u.hostname.replace(/^www\.|^old\./, "")
    if (host !== "reddit.com" && host !== "redd.it") {
      return { error: "That's not a Reddit link." }
    }
    jsonUrl = `https://www.reddit.com${u.pathname.replace(/\/+$/, "")}.json`
  } catch {
    return { error: "That doesn't look like a valid URL." }
  }

  const get = (url: string) =>
    fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      redirect: "follow",
    })

  let res = await get(jsonUrl)
  // Share links (/s/…) and redd.it shorteners need resolving to the canonical URL first.
  const ct = res.headers.get("content-type") ?? ""
  if (!res.ok || !ct.includes("json")) {
    try {
      const resolved = await fetch(rawUrl, { headers: { "User-Agent": UA }, redirect: "follow" })
      const u2 = new URL(resolved.url)
      res = await get(`https://www.reddit.com${u2.pathname.replace(/\/+$/, "")}.json`)
    } catch {
      // fall through to the error handling below
    }
  }

  if (!res.ok) {
    return {
      error: `Reddit returned ${res.status}. The post may be private/removed, or Reddit blocked the request — try again in a moment.`,
    }
  }

  let data: unknown
  try {
    data = await res.json()
  } catch {
    return { error: "Reddit didn't return readable data (it may be rate-limiting). Try again." }
  }

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
  const permalink = post.permalink ? `https://www.reddit.com${post.permalink}` : rawUrl

  if (!title && !body) return { error: "This post has no readable text to summarize." }
  return { title: title || "Reddit discussion", body, permalink }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: { chairSlug?: string; url?: string }
  try {
    body = (await request.json()) as { chairSlug?: string; url?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const chairSlug = body.chairSlug?.trim()
  const url = body.url?.trim()
  if (!chairSlug) return NextResponse.json({ error: "Select a chair first." }, { status: 400 })
  if (!url) return NextResponse.json({ error: "Paste a Reddit post link." }, { status: 400 })

  const supabase = createAdminClient()
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("slug", chairSlug)
    .eq("track", "chair")
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!product) return NextResponse.json({ error: "Chair not found." }, { status: 404 })

  const post = await fetchRedditPost(url)
  if ("error" in post) return NextResponse.json({ error: post.error }, { status: 422 })

  // Already saved this exact post for this chair?
  const { data: dup } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", product.id)
    .eq("source_url", post.permalink)
    .maybeSingle()
  if (dup) {
    return NextResponse.json({ error: "This Reddit post is already a review for this chair." }, { status: 409 })
  }

  const item: RawContent = {
    url: post.permalink,
    title: post.title,
    body: post.body,
    source: "reddit",
    collectedAt: new Date().toISOString(),
  }

  const outcome = await processWithClaude(item, product.name)
  if (outcome.status === "rejected") {
    return NextResponse.json(
      {
        error: `The AI judged this not specific enough to the ${product.name} (relevance ${Math.round(
          (outcome.confidence ?? 0) * 100
        )}%). Paste a post that clearly reviews this chair.`,
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
    product_id: product.id,
    source: "reddit",
    summary_ko: d.summary,
    pros: d.pros ?? [],
    cons: d.cons ?? [],
    scores,
    source_url: post.permalink,
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
      sourceUrl: post.permalink,
    },
  })
}

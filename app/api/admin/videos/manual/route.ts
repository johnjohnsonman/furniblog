import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 30

/** Pull an 11-char YouTube video ID out of a pasted URL (or bare ID). */
function extractYoutubeId(input: string): string | null {
  const s = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace(/^www\./, "")
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null
    if (host.endsWith("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v")
      const m = u.pathname.match(/^\/(shorts|embed|v|live)\/([a-zA-Z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {
    // not a URL — fall through to a loose match
  }
  const loose = s.match(/[a-zA-Z0-9_-]{11}/)
  return loose ? loose[0] : null
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

type Meta = {
  title: string | null
  channel_title: string | null
  thumbnail_url: string | null
  published_at: string | null
  view_count: number | null
  duration: string | null
  description: string | null
}

// Rich metadata via YouTube Data API (needs YOUTUBE_API_KEY + quota).
async function fetchMetaViaApi(id: string): Promise<Meta | null> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return null
  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    id,
    key,
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params}`)
  if (!res.ok) return null
  const json = (await res.json()) as {
    items?: Array<{
      snippet?: {
        title?: string
        channelTitle?: string
        description?: string
        publishedAt?: string
        thumbnails?: Record<string, { url?: string }>
      }
      statistics?: { viewCount?: string }
      contentDetails?: { duration?: string }
    }>
  }
  const item = json.items?.[0]
  if (!item) return null
  const t = item.snippet?.thumbnails ?? {}
  const thumb =
    t.maxres?.url ??
    t.high?.url ??
    t.medium?.url ??
    t.default?.url ??
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  const vc = Number(item.statistics?.viewCount)
  return {
    title: item.snippet?.title ? decodeEntities(item.snippet.title.trim()) : null,
    channel_title: item.snippet?.channelTitle
      ? decodeEntities(item.snippet.channelTitle.trim())
      : null,
    thumbnail_url: thumb,
    published_at: item.snippet?.publishedAt ?? null,
    view_count: Number.isFinite(vc) ? vc : null,
    duration: item.contentDetails?.duration ?? null,
    description: item.snippet?.description
      ? decodeEntities(item.snippet.description.trim())
      : null,
  }
}

// Fallback: oEmbed (no key, no quota) — gives title, channel, thumbnail only.
async function fetchMetaViaOembed(id: string): Promise<Meta | null> {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
  )
  if (!res.ok) return null
  const j = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string }
  return {
    title: j.title ? decodeEntities(String(j.title).trim()) : null,
    channel_title: j.author_name ? String(j.author_name).trim() : null,
    thumbnail_url: j.thumbnail_url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    published_at: null,
    view_count: null,
    duration: null,
    description: null,
  }
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
  if (!url) return NextResponse.json({ error: "Paste a YouTube link." }, { status: 400 })

  const youtubeId = extractYoutubeId(url)
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Couldn't read a YouTube video ID from that link." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, slug, name, brands(name)")
    .eq("slug", chairSlug)
    .eq("track", "chair")
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!product) return NextResponse.json({ error: "Chair not found." }, { status: 404 })

  const brandRel = (product as { brands?: { name: string } | { name: string }[] }).brands
  const brand = Array.isArray(brandRel) ? brandRel[0]?.name : brandRel?.name

  const meta =
    (await fetchMetaViaApi(youtubeId).catch(() => null)) ??
    (await fetchMetaViaOembed(youtubeId).catch(() => null))
  if (!meta || !meta.title) {
    return NextResponse.json(
      { error: "Couldn't fetch video info — the link may be private, deleted, or invalid." },
      { status: 422 }
    )
  }

  const { data: existing } = await supabase
    .from("videos")
    .select("id")
    .eq("youtube_id", youtubeId)
    .maybeSingle()

  const row = {
    youtube_id: youtubeId,
    title: meta.title,
    channel_title: meta.channel_title,
    thumbnail_url: meta.thumbnail_url,
    published_at: meta.published_at,
    duration: meta.duration,
    view_count: meta.view_count,
    description: meta.description,
    chair_id: product.id,
    brand: brand ?? null,
    status: "published",
    source_query: "manual",
  }

  const { error: upErr } = await supabase
    .from("videos")
    .upsert(row, { onConflict: "youtube_id" })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    relinked: Boolean(existing),
    video: {
      youtubeId,
      title: meta.title,
      channelTitle: meta.channel_title,
      thumbnailUrl: meta.thumbnail_url,
    },
    chair: { slug: product.slug, name: product.name },
  })
}

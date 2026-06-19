import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"

export const dynamic = "force-dynamic"

type ProductRow = {
  id: string
  slug: string
  name: string
  thumbnail_url: string | null
}

// Curated famous chairs shown first in the "Popular" picker (in this order);
// the rest of the catalog fills in randomly after them (re-rolled each load).
const FEATURED_SLUGS = [
  "herman-miller-aeron",
  "steelcase-leap-v2",
  "humanscale-freedom",
  "itoki-act2",
  "okamura-contessa-ii",
  "kokuyo-ing-cloud",
  "herman-miller-embody-gaming",
  "knoll-generation",
  "steelcase-gesture",
]
const POPULAR_LIMIT = 18

function toOption(row: ProductRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    thumbnailUrl: row.thumbnail_url,
  }
}

type SubmitBody = {
  rankings?: string[]
  sex?: "male" | "female" | null
  heightBand?:
    | "under_5_4"
    | "5_4_5_7"
    | "5_8_5_11"
    | "6_0_6_2"
    | "6_3plus"
    | null
  body?: "below" | "normal" | "above" | null
  ageBand?: "under20" | "20s" | "30s" | "40s" | "50plus" | null
  job?: string | null
  sitHours?: "under2" | "2to6" | "over6" | null
  uses?: string[]
  pain?: string[]
  reasons?: string[]
  comment?: string | null
  contact?: string | null
}

function cleanArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) => String(v).trim())
    .filter((v, i, arr) => v.length > 0 && arr.indexOf(v) === i)
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? ""
  const supabase = createAdminClient()

  // Search: rank by review_count then name (existing behavior).
  if (q) {
    const escaped = q.replace(/[%_\\]/g, "")
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, thumbnail_url")
      .eq("track", "chair")
      .eq("published", true)
      .or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
      .order("review_count", { ascending: false })
      .order("name", { ascending: true })
      .limit(20)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ products: (data ?? []).map(toOption) })
  }

  // Popular: curated famous chairs first (fixed order), then a random fill.
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, thumbnail_url")
    .eq("track", "chair")
    .eq("published", true)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const all = (data ?? []) as ProductRow[]
  const bySlug = new Map(all.map((r) => [r.slug, r]))
  const featured = FEATURED_SLUGS.map((s) => bySlug.get(s)).filter(
    (r): r is ProductRow => Boolean(r)
  )
  const featuredSlugs = new Set(featured.map((r) => r.slug))

  // Fisher–Yates shuffle of the remaining chairs (fresh each request).
  const rest = all.filter((r) => !featuredSlugs.has(r.slug))
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }

  const combined = [...featured, ...rest].slice(0, POPULAR_LIMIT)
  return NextResponse.json({ products: combined.map(toOption) })
}

export async function POST(request: NextRequest) {
  let body: SubmitBody
  try {
    body = (await request.json()) as SubmitBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const rankings = cleanArray(body.rankings).slice(0, 3)
  if (rankings.length < 1) {
    return NextResponse.json(
      { error: "Select at least one chair." },
      { status: 400 }
    )
  }
  if (!rankings.every(isUuid)) {
    return NextResponse.json(
      { error: "Invalid chair selection value." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const productIds = [...new Set(rankings)]
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id")
    .in("id", productIds)
    .eq("track", "chair")
    .eq("published", true)

  if (productError) {
    return NextResponse.json({ error: productError.message }, { status: 500 })
  }
  if ((products ?? []).length !== productIds.length) {
    return NextResponse.json(
      { error: "Some selected chairs are invalid." },
      { status: 400 }
    )
  }

  const uses = cleanArray(body.uses)
  const pain = cleanArray(body.pain)
  const reasons = cleanArray(body.reasons)
  const job = body.job ? String(body.job).trim() : null
  const comment = body.comment ? String(body.comment).trim() : null
  const contact = body.contact ? String(body.contact).trim() : null

  const { data: session, error: sessionError } = await supabase
    .from("review_sessions")
    .insert({
      status: "pending",
      source: "native",
      sex: body.sex ?? null,
      height_band: body.heightBand ?? null,
      body: body.body ?? null,
      age_band: body.ageBand ?? null,
      job: job || null,
      sit_hours: body.sitHours ?? null,
      uses,
      pain,
      reasons,
      comment: comment || null,
      purchased: null,
      contact: contact || null,
    })
    .select("id, created_at, status")
    .single()

  if (sessionError || !session) {
    return NextResponse.json(
      { error: sessionError?.message ?? "Failed to save review session." },
      { status: 500 }
    )
  }

  const rankingRows = rankings.map((chairId, index) => ({
    session_id: session.id,
    chair_id: chairId,
    rank: index + 1,
  }))

  const { error: rankingError } = await supabase
    .from("review_rankings")
    .insert(rankingRows)

  if (rankingError) {
    return NextResponse.json({ error: rankingError.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    session: {
      id: session.id,
      createdAt: session.created_at,
      status: session.status,
    },
  })
}

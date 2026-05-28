import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"

type ProductRow = {
  id: string
  slug: string
  name: string
  thumbnail_url: string | null
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

  let query = supabase
    .from("products")
    .select("id, slug, name, thumbnail_url, review_count")
    .eq("track", "chair")
    .eq("published", true)

  if (q) {
    const escaped = q.replace(/[%_\\]/g, "")
    query = query.or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`)
  }

  const { data, error } = await query
    .order("review_count", { ascending: false })
    .order("name", { ascending: true })
    .limit(q ? 20 : 12)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const products = (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    thumbnailUrl: row.thumbnail_url,
  }))

  return NextResponse.json({ products })
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

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

type ReviewRow = {
  id: string
  product_id: string
  source: string
  summary_ko: string
  pros: string[]
  cons: string[]
  scores: { overall?: number }
  source_url: string | null
  verified: boolean
  created_at: string
  products: { slug: string; name: string } | { slug: string; name: string }[] | null
}

function mapReviewRow(row: ReviewRow) {
  const product = Array.isArray(row.products) ? row.products[0] : row.products
  const scores = row.scores as { overall?: number }
  return {
    id: row.id,
    productId: row.product_id,
    productSlug: product?.slug ?? "",
    productName: product?.name ?? "Unknown product",
    source: row.source,
    summary: row.summary_ko,
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    score: scores?.overall ?? 0,
    verified: row.verified,
    sourceUrl: row.source_url ?? undefined,
    createdAt: row.created_at,
  }
}

async function resolveProductUuid(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string
): Promise<string | null> {
  if (productId.includes("-") && productId.length === 36) {
    return productId
  }
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("slug", productId)
    .maybeSingle()
  return data?.id ?? null
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "30", 10) || 30)
  )
  const source = searchParams.get("source")?.trim() ?? "all"
  const productIdParam = searchParams.get("productId")?.trim() ?? "all"
  const verifiedParam = searchParams.get("verified")?.trim() ?? "all"
  const search = searchParams.get("search")?.trim() ?? ""
  const sort = searchParams.get("sort")?.trim() ?? "created"

  try {
    const supabase = createAdminClient()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    let query = supabase
      .from("reviews")
      .select("*, products(slug, name)", { count: "exact" })

    if (source !== "all") {
      query = query.eq("source", source)
    }

    if (verifiedParam === "verified") {
      query = query.eq("verified", true)
    } else if (verifiedParam === "unverified") {
      query = query.eq("verified", false)
    }

    if (search) {
      query = query.ilike("summary_ko", `%${search}%`)
    }

    if (productIdParam !== "all") {
      const uuid = await resolveProductUuid(supabase, productIdParam)
      if (uuid) {
        query = query.eq("product_id", uuid)
      }
    }

    const [statsTotal, statsVerified, statsToday] = await Promise.all([
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("verified", true),
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString()),
    ])

    const total = statsTotal.count ?? 0
    const verifiedCount = statsVerified.count ?? 0

    let rows: ReviewRow[] = []
    let filteredTotal = 0

    if (sort === "score") {
      const { data, error, count } = await query.order("created_at", {
        ascending: false,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const sorted = [...(data ?? [])].sort((a, b) => {
        const sa = (a.scores as { overall?: number })?.overall ?? 0
        const sb = (b.scores as { overall?: number })?.overall ?? 0
        return sb - sa
      })

      filteredTotal = count ?? sorted.length
      const from = (page - 1) * limit
      rows = sorted.slice(from, from + limit) as ReviewRow[]
    } else if (sort === "product") {
      const { data, error, count } = await query
        .order("name", { ascending: true, referencedTable: "products" })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      rows = (data ?? []) as ReviewRow[]
      filteredTotal = count ?? 0
    } else {
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      rows = (data ?? []) as ReviewRow[]
      filteredTotal = count ?? 0
    }

    const reviews = rows.map(mapReviewRow)
    const totalPages = Math.max(1, Math.ceil(filteredTotal / limit))

    return NextResponse.json({
      reviews,
      stats: {
        total,
        verified: verifiedCount,
        unverified: total - verifiedCount,
        todayAdded: statsToday.count ?? 0,
      },
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages,
      },
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const supabase = createAdminClient()

    let productId = body.productId
    if (!productId?.includes("-") || productId.length !== 36) {
      const { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("slug", body.productSlug ?? body.productId)
        .maybeSingle()
      productId = product?.id
    }

    if (!productId) {
      return NextResponse.json({ error: "Product not found" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: productId,
        source: body.source,
        summary_ko: body.summary,
        pros: body.pros ?? [],
        cons: body.cons ?? [],
        scores: body.scores,
        reviewer_height_cm: body.reviewerHeightCm ?? null,
        reviewer_weight_kg: body.reviewerWeightKg ?? null,
        usage_hours_per_day: body.usageHoursPerDay ?? null,
        usage_purpose: body.usagePurpose ?? null,
        source_url: body.sourceUrl ?? null,
        verified: body.verified ?? false,
        original_language: "en",
      })
      .select("id")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ review: data })
  } catch (error) {
    return jsonInternalError(error)
  }
}

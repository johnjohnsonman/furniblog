import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

type RouteContext = { params: Promise<{ id: string }> }

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

function mapReviewRow(row: {
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
}) {
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

export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("reviews").delete().eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const updates: Record<string, unknown> = {}

    if (body.summary !== undefined) updates.summary_ko = body.summary
    if (body.pros !== undefined) updates.pros = body.pros
    if (body.cons !== undefined) updates.cons = body.cons
    if (body.verified !== undefined) updates.verified = body.verified
    if (body.scores !== undefined) updates.scores = body.scores
    if (body.overall !== undefined) {
      updates.scores = { overall: body.overall }
    }

    if (body.productId !== undefined) {
      const uuid = await resolveProductUuid(supabase, body.productId)
      if (!uuid) {
        return NextResponse.json({ error: "Product not found" }, { status: 400 })
      }
      updates.product_id = uuid
    }

    const { data, error } = await supabase
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select("*, products(slug, name)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ review: mapReviewRow(data) })
  } catch (error) {
    return jsonInternalError(error)
  }
}

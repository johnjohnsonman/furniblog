import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

/** Add a product to the list (by slug), appended at the end. */
export async function POST(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const body = await request.json()
    const productSlug = (body.productSlug as string)?.trim()
    if (!productSlug) {
      return NextResponse.json({ error: "productSlug is required" }, { status: 400 })
    }
    const supabase = createAdminClient()
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .maybeSingle()
    if (!product) {
      return NextResponse.json({ error: `No product with slug "${productSlug}"` }, { status: 400 })
    }
    const { data: existing } = await supabase
      .from("best_list_items")
      .select("rank")
      .eq("list_id", id)
      .order("rank", { ascending: false })
      .limit(1)
    const nextRank = (existing?.[0]?.rank ?? 0) + 1
    const { error } = await supabase
      .from("best_list_items")
      .insert({ list_id: id, product_id: product.id, rank: nextRank })
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "That chair is already in this list." }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

/** Bulk-update ranks and/or blurbs. */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const body = await request.json()
    const items = body.items as Array<{ id: string; rank?: number; blurb?: string | null }>
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 })
    }
    const supabase = createAdminClient()
    for (const it of items) {
      const patch: Record<string, unknown> = {}
      if (typeof it.rank === "number") patch.rank = it.rank
      if ("blurb" in it) patch.blurb = it.blurb
      if (Object.keys(patch).length === 0) continue
      await supabase
        .from("best_list_items")
        .update(patch)
        .eq("id", it.id)
        .eq("list_id", id)
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

/** Remove an item from the list. */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  const itemId = request.nextUrl.searchParams.get("itemId")
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 })
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("best_list_items")
      .delete()
      .eq("id", itemId)
      .eq("list_id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

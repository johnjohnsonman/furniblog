import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

const EDITABLE = [
  "title",
  "slug",
  "subtitle",
  "hero_image_url",
  "excerpt",
  "content_html",
  "tier",
  "collections",
  "featured",
  "seo_title",
  "seo_description",
  "status",
] as const

async function slugToId(supabase: ReturnType<typeof createAdminClient>, slug: string): Promise<string | null> {
  const { data } = await supabase.from("products").select("id").eq("slug", slug.trim()).maybeSingle()
  return (data?.id as string) ?? null
}

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from("comparisons").select("*").eq("id", id).maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // Resolve the two product slugs so the editor can show/select them.
    const ids = [data.product_a_id, data.product_b_id].filter(Boolean) as string[]
    const slugById: Record<string, string> = {}
    if (ids.length) {
      const { data: prods } = await supabase.from("products").select("id,slug").in("id", ids)
      for (const p of prods ?? []) slugById[p.id as string] = p.slug as string
    }
    return NextResponse.json({
      entry: data,
      productASlug: data.product_a_id ? slugById[data.product_a_id] ?? null : null,
      productBSlug: data.product_b_id ? slugById[data.product_b_id] ?? null : null,
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const body = await request.json()
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const k of EDITABLE) if (k in body) patch[k] = body[k]

    const supabase = createAdminClient()
    // Product selection by slug → id.
    if (typeof body.product_a_slug === "string") {
      patch.product_a_id = body.product_a_slug.trim() ? await slugToId(supabase, body.product_a_slug) : null
    }
    if (typeof body.product_b_slug === "string") {
      patch.product_b_id = body.product_b_slug.trim() ? await slugToId(supabase, body.product_b_slug) : null
    }
    if (body.status === "published") {
      const { data: cur } = await supabase.from("comparisons").select("published_at").eq("id", id).maybeSingle()
      if (!cur?.published_at) patch.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from("comparisons")
      .update(patch)
      .eq("id", id)
      .select("id,slug,status")
      .single()
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: `Slug "${patch.slug}" is already taken — choose another.` }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ entry: data })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from("comparisons").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

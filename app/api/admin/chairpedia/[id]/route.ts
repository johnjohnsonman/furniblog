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
  "product_id",
  "origin",
  "collections",
  "featured",
  "seo_title",
  "seo_description",
  "status",
] as const

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("chairpedia")
      .select("*")
      .eq("id", id)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ entry: data })
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
    for (const k of EDITABLE) {
      if (k in body) patch[k] = body[k]
    }
    // Resolve product_slug -> product_id (editor passes a human-readable slug).
    if (typeof body.product_slug === "string" && body.product_slug.trim()) {
      const supabaseP = createAdminClient()
      const { data: prod } = await supabaseP
        .from("products")
        .select("id")
        .eq("slug", body.product_slug.trim())
        .maybeSingle()
      if (!prod) {
        return NextResponse.json({ error: `No product found with slug "${body.product_slug.trim()}"` }, { status: 400 })
      }
      patch.product_id = prod.id
    }
    // Stamp published_at the first time it goes live.
    if (body.status === "published") {
      const supabase0 = createAdminClient()
      const { data: cur } = await supabase0
        .from("chairpedia")
        .select("published_at")
        .eq("id", id)
        .maybeSingle()
      if (!cur?.published_at) patch.published_at = new Date().toISOString()
    }
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("chairpedia")
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
    const { error } = await supabase.from("chairpedia").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

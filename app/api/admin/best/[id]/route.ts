import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

const EDITABLE = [
  "title",
  "slug",
  "intro",
  "hero_image_url",
  "seo_title",
  "seo_description",
  "status",
  "sort_order",
] as const

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("best_lists")
      .select(
        "*, best_list_items(id, rank, blurb, products(slug, name, thumbnail_url, brands(name)))"
      )
      .eq("id", id)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
    // Sort items by rank for the editor.
    const items = ((data.best_list_items as unknown[] | null) ?? [])
      .map((raw) => raw as { rank?: number })
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    return NextResponse.json({ list: { ...data, best_list_items: items } })
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
    const { data, error } = await supabase
      .from("best_lists")
      .update(patch)
      .eq("id", id)
      .select("id, slug, status")
      .single()
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: `Slug "${patch.slug}" is already taken.` }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ list: data })
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
    const { error } = await supabase.from("best_lists").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

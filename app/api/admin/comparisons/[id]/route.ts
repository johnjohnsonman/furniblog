import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import { load } from "cheerio"

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
  "faq",
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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const k of EDITABLE) if (k in body) patch[k] = body[k]

    const supabase = createAdminClient()
    const { data: current, error: readError } = await supabase.from("comparisons").select("*").eq("id", id).maybeSingle()
    if (readError) throw new Error(readError.message)
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (current.gen_status === "generating") {
      return NextResponse.json({ error: "Wait for generation to finish before editing or publishing." }, { status: 409 })
    }
    if (body.status !== undefined && !["draft", "published"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    if (body.faq !== undefined && (!Array.isArray(body.faq) || body.faq.some((item: { q?: unknown; a?: unknown } | null) =>
      !item || typeof item.q !== "string" || typeof item.a !== "string" || !item.q.trim() || !item.a.trim()))) {
      return NextResponse.json({ error: "FAQ requires question and answer text." }, { status: 400 })
    }
    // Product selection by slug → id.
    if (typeof body.product_a_slug === "string") {
      patch.product_a_id = body.product_a_slug.trim() ? await slugToId(supabase, body.product_a_slug) : null
    }
    if (typeof body.product_b_slug === "string") {
      patch.product_b_id = body.product_b_slug.trim() ? await slugToId(supabase, body.product_b_slug) : null
    }
    if ((patch.status ?? current.status) === "published") {
      const next = { ...current, ...patch }
      if (body.reviewed !== true) {
        return NextResponse.json({ error: "Confirm source and FAQ review before publishing or updating a published comparison." }, { status: 400 })
      }
      const $ = load(typeof next.content_html === "string" ? next.content_html : "")
      const hasSource = $('a[href]').toArray().some(el => {
        try { return ["https:", "http:"].includes(new URL($(el).attr("href") || "").protocol) } catch { return false }
      })
      if (typeof next.title !== "string" || !next.title.trim() || $('body').text().trim().length < 100 ||
          !next.product_a_id || !next.product_b_id || next.product_a_id === next.product_b_id || !hasSource) {
        return NextResponse.json({ error: "Publication requires two different products, a title, substantive body and linked evidence sources." }, { status: 400 })
      }
      if (!current.published_at) patch.published_at = new Date().toISOString()
    }

    let update = supabase
      .from("comparisons")
      .update(patch)
      .eq("id", id)
    update = current.updated_at === null ? update.is("updated_at", null) : update.eq("updated_at", current.updated_at)
    const { data, error } = await update
      .select("id,slug,status")
      .maybeSingle()
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: `Slug "${patch.slug}" is already taken — choose another.` }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: "Comparison changed; reload before saving." }, { status: 409 })
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

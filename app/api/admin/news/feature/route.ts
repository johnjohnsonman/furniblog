import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { newsPublicationError } from "@/lib/news/publication"

/** List recent news for admin management (newest first). */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const limit = Math.max(1, Math.min(Number(searchParams.get("limit")) || 100, 300))
  const offset = Math.max(0, Math.floor(Number(searchParams.get("offset")) || 0))

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("news")
      .select(
        "id, slug, url, title, source_name, brand, summary, why_it_matters, image_url, published_at, status, featured, created_at"
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ news: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type PatchBody = {
  id?: string
  featured?: boolean
  status?: "published" | "hidden"
  reviewed?: boolean
  title?: string
  summary?: string
  whyItMatters?: string
}

/** Toggle a news item's featured flag and/or published/hidden status. */
export async function PATCH(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const id = typeof body?.id === "string" ? body.id.trim() : ""
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const update: { featured?: boolean; status?: "published" | "hidden"; title?: string; summary?: string; why_it_matters?: string } = {}
  const editing = body.title !== undefined || body.summary !== undefined || body.whyItMatters !== undefined
  if (editing) {
    if ([body.title, body.summary, body.whyItMatters].some((value) => typeof value !== "string")) {
      return NextResponse.json({ error: "Provide title, summary and whyItMatters as text." }, { status: 400 })
    }
    update.title = body.title!.trim()
    update.summary = body.summary!.trim()
    update.why_it_matters = body.whyItMatters!.trim()
    // Saving edited content without approval always makes it private.
    update.status = "hidden"
  }
  if (typeof body.featured === "boolean") update.featured = body.featured
  if (body.status === "published" || body.status === "hidden") {
    update.status = body.status
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "Nothing to update (provide featured and/or status)" },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()
    if (update.status === "published") {
      const { data: current, error } = await supabase.from("news").select("url").eq("id", id).maybeSingle()
      if (error) throw new Error(error.message)
      if (!current) return NextResponse.json({ error: "News item not found" }, { status: 404 })
      const problem = newsPublicationError({ ...body, url: current.url })
      if (problem) return NextResponse.json({ error: problem }, { status: 422 })
    }
    const { data, error } = await supabase
      .from("news")
      .update(update)
      .eq("id", id)
      .select("id, featured, status")
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: "News item not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true, news: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

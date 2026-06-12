import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

/** List recent news for admin management (newest first). */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const limit = Math.max(1, Math.min(Number(searchParams.get("limit") ?? 100), 300))

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("news")
      .select(
        "id, url, title, source_name, brand, summary, published_at, status, featured, created_at"
      )
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit)

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

  const id = body.id?.trim()
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const update: { featured?: boolean; status?: "published" | "hidden" } = {}
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

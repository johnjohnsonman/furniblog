import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("best_lists")
      .select("id, slug, title, status, sort_order, best_list_items(count)")
      .order("sort_order", { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const lists = (data ?? []).map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      status: l.status,
      sort_order: l.sort_order,
      count: (l.best_list_items as { count: number }[] | null)?.[0]?.count ?? 0,
    }))
    return NextResponse.json({ lists })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const body = await request.json()
    const title = (body.title as string)?.trim() || "Untitled list"
    const base = (body.slug as string)?.trim() || slugify(title) || "list"
    const slug = `${base}-${Date.now().toString(36)}`
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("best_lists")
      .insert({ title, slug, status: "draft" })
      .select("id, slug")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id, slug: data.slug })
  } catch (error) {
    return jsonInternalError(error)
  }
}

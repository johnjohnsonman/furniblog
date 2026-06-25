import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,status,featured,updated_at,gen_status")
      .order("updated_at", { ascending: false })
      .limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data ?? [] })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const body = await request.json()
    const title = (body.title as string)?.trim() || "Untitled post"
    const sourceUrl = (body.sourceUrl as string)?.trim() || null
    const base = slugify(title) || "post"
    const slug = `${base}-${Date.now().toString(36)}`
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({ title, slug, status: "draft", source_url: sourceUrl })
      .select("id,slug")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id, slug: data.slug })
  } catch (error) {
    return jsonInternalError(error)
  }
}

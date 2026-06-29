import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("brands")
      .select("id, slug, name, images")
      .order("name")

    if (error) {
      // `images` column may not exist yet (migration 040 not applied) — fall
      // back so the brand dropdown on other admin pages keeps working.
      const { data: basic, error: basicErr } = await supabase
        .from("brands")
        .select("id, slug, name")
        .order("name")
      if (basicErr) {
        return NextResponse.json({ error: basicErr.message }, { status: 500 })
      }
      return NextResponse.json({
        brands: (basic ?? []).map((b) => ({ ...b, images: [] })),
      })
    }

    return NextResponse.json({ brands: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

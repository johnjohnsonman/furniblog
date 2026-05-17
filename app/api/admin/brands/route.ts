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
      .select("slug, name")
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ brands: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

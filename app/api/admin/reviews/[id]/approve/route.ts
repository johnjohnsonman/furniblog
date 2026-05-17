import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("reviews")
      .update({ verified: true })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Approve failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

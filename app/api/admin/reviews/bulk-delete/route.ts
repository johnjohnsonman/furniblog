import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = (await request.json()) as { ids?: string[] }
    const ids = body.ids?.filter(Boolean) ?? []

    if (ids.length === 0) {
      return NextResponse.json({ error: "No ids provided" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("reviews").delete().in("id", ids)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, deleted: ids.length })
  } catch (error) {
    return jsonInternalError(error)
  }
}

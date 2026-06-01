import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import { deleteStorageObject } from "@/lib/supabase/storage-server"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

const VALID_STATUS = ["pending", "approved", "rejected"]

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const body = await request.json()

    if (body.status === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("review_sessions")
      .update({ status: body.status })
      .eq("id", id)
      .select("id, status")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ review: data })
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

    const { data: existing } = await supabase
      .from("review_sessions")
      .select("photo_url")
      .eq("id", id)
      .maybeSingle()

    // review_rankings rows cascade-delete via FK (on delete cascade).
    const { error } = await supabase.from("review_sessions").delete().eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const photoUrl = (existing as { photo_url: string | null } | null)?.photo_url
    if (photoUrl) {
      await deleteStorageObject("gallery", photoUrl).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

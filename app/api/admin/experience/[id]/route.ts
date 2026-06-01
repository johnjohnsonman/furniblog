import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import { deleteStorageObject } from "@/lib/supabase/storage-server"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.status !== undefined) {
      if (body.status !== "pending" && body.status !== "published") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updates.status = body.status
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("experience_reviews")
      .update(updates)
      .eq("id", id)
      .select("*")
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
      .from("experience_reviews")
      .select("photo_url")
      .eq("id", id)
      .maybeSingle()

    const { error } = await supabase
      .from("experience_reviews")
      .delete()
      .eq("id", id)

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

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: { queueId?: string; productId?: string; productSlug?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { queueId, productId, productSlug } = body
  if (!queueId) {
    return NextResponse.json({ error: "queueId required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  let resolvedId = productId?.trim()

  if (!resolvedId && productSlug?.trim()) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug.trim())
      .maybeSingle()
    resolvedId = data?.id
  }

  if (!resolvedId || !isUuid(resolvedId)) {
    return NextResponse.json({ error: "Valid productId required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("content_queue")
    .update({ item_id: resolvedId })
    .eq("id", queueId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, productId: resolvedId })
}

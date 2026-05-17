import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSecret } from "@/lib/pipeline/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { queueId?: string; reason?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { queueId, reason } = body
  if (!queueId) {
    return NextResponse.json({ error: "queueId is required" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("content_queue")
    .update({
      status: "failed",
      processed_at: new Date().toISOString(),
      ai_output: { rejected: true, reason: reason ?? "rejected_by_admin" },
    })
    .eq("id", queueId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

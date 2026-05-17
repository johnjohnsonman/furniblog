import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSecret } from "@/lib/pipeline/auth"
import { processReviewContent } from "@/lib/pipeline/processor"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { queueId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { queueId } = body
  if (!queueId) {
    return NextResponse.json({ error: "queueId is required" }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: row, error: fetchError } = await supabase
    .from("content_queue")
    .select("id, raw_content, item_type, status")
    .eq("id", queueId)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: "Queue item not found" }, { status: 404 })
  }

  await supabase
    .from("content_queue")
    .update({ status: "processing" })
    .eq("id", queueId)

  const result = await processReviewContent({
    rawContent: row.raw_content,
    itemType: row.item_type as "chair" | "furniture",
    queueId,
  })

  if (!result.success) {
    await supabase
      .from("content_queue")
      .update({
        status: "failed",
        processed_at: new Date().toISOString(),
        ai_output: { error: result.error },
      })
      .eq("id", queueId)

    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.error === "low_confidence" ? 422 : 500 }
    )
  }

  const { error: updateError } = await supabase
    .from("content_queue")
    .update({
      status: "processed",
      ai_output: result.data,
      processed_at: new Date().toISOString(),
    })
    .eq("id", queueId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: result.data })
}

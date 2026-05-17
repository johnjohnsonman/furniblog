import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSecret } from "@/lib/pipeline/auth"
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
    .select("id, source_type, source_url, item_id, item_type, status, ai_output")
    .eq("id", queueId)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: "Queue item not found" }, { status: 404 })
  }

  if (row.status !== "processed" || !row.ai_output) {
    return NextResponse.json(
      { error: "Item must be processed before approval" },
      { status: 422 }
    )
  }

  if (!row.item_id) {
    return NextResponse.json(
      { error: "Product not linked (item_id missing)" },
      { status: 422 }
    )
  }

  const ai = row.ai_output as {
    summary: string
    scores: Record<string, number>
    pros: string[]
    cons: string[]
    reviewerHeightCm?: number
    reviewerWeightKg?: number
    confidence?: number
  }

  const { data: review, error: insertError } = await supabase
    .from("reviews")
    .insert({
      product_id: row.item_id,
      source: row.source_type,
      summary_ko: ai.summary ?? (ai as { summaryKo?: string }).summaryKo,
      pros: ai.pros ?? [],
      cons: ai.cons ?? [],
      scores: ai.scores,
      reviewer_height_cm: ai.reviewerHeightCm ?? null,
      reviewer_weight_kg: ai.reviewerWeightKg ?? null,
      source_url: row.source_url,
      original_language: "ko",
      verified: true,
      helpful_count: 0,
    })
    .select("id")
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, reviewId: review?.id })
}

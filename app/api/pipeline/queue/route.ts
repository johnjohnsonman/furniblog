import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSecret } from "@/lib/pipeline/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { mapQueueRow, type ContentQueueRow } from "@/lib/pipeline/queue-mapper"

export async function GET(request: NextRequest) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get("status")

  const supabase = createAdminClient()
  let query = supabase
    .from("content_queue")
    .select(
      `
      id,
      source_type,
      source_url,
      raw_content,
      item_type,
      item_id,
      status,
      ai_output,
      created_at,
      processed_at,
      products ( name, slug )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100)

  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = (data as ContentQueueRow[]).map(mapQueueRow)
  return NextResponse.json({ items })
}

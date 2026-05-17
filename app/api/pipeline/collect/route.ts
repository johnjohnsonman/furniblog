import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSecret } from "@/lib/pipeline/auth"
import { collectBySource, type CollectSource } from "@/lib/pipeline/collector"
import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"

const VALID_SOURCES: CollectSource[] = ["reddit", "youtube", "naver", "dcinside"]

async function resolveProductId(
  itemId: string | undefined
): Promise<string | null> {
  if (!itemId) return null
  if (isUuid(itemId)) return itemId

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("slug", itemId)
    .maybeSingle()

  return data?.id ?? null
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: {
    source?: CollectSource
    query?: string
    itemType?: "chair" | "furniture"
    itemId?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { source, query, itemType, itemId } = body

  if (!source || !VALID_SOURCES.includes(source)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 })
  }
  if (!query?.trim()) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }
  if (itemType !== "chair" && itemType !== "furniture") {
    return NextResponse.json({ error: "itemType must be chair or furniture" }, { status: 400 })
  }

  const collected = await collectBySource(source, query.trim())
  const productUuid = await resolveProductId(itemId)

  const supabase = createAdminClient()
  const inserts = collected.map((item) => ({
    source_type: item.source,
    source_url: item.url,
    raw_content: `${item.title}\n\n${item.body}`,
    item_type: itemType,
    item_id: productUuid,
    status: "pending" as const,
  }))

  const { data, error } = await supabase
    .from("content_queue")
    .insert(inserts)
    .select("id")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    count: data?.length ?? 0,
    ids: data?.map((r) => r.id) ?? [],
  })
}

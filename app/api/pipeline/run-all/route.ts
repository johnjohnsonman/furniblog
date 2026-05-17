import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { runPipeline } from "@/lib/pipeline"
import type { PipelineSource } from "@/lib/pipeline/types"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

const VALID_SOURCES: PipelineSource[] = [
  "reddit",
  "youtube",
  "naver",
  "dcinside",
  "japan_community",
]

function normalizeSource(source: string | undefined): PipelineSource {
  if (!source || source === "japan") return "reddit"
  if (source === "japan_community") return "japan_community"
  if (VALID_SOURCES.includes(source as PipelineSource)) {
    return source as PipelineSource
  }
  return "reddit"
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const debug = request.nextUrl.searchParams.get("debug") === "true"

  let body: {
    index?: number
    source?: string
    sources?: string[]
    maxPerSource?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const index = Math.max(0, Number(body.index ?? 0) || 0)

  const sources: PipelineSource[] = Array.isArray(body.sources) && body.sources.length > 0
    ? body.sources
        .map((s) => (s === "japan" ? "japan_community" : s))
        .filter((s): s is PipelineSource =>
          VALID_SOURCES.includes(s as PipelineSource)
        )
    : [normalizeSource(body.source)]

  try {
    const supabase = createAdminClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("id, slug, name")
      .eq("track", "chair")
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const list = products ?? []
    const total = list.length

    if (total === 0) {
      return NextResponse.json({
        done: true,
        next: 0,
        total: 0,
        current: null,
        collected: 0,
        saved: 0,
        failed: 0,
        message: "No chairs found",
      })
    }

    if (index >= total) {
      return NextResponse.json({
        done: true,
        next: total,
        total,
        current: null,
        collected: 0,
        saved: 0,
        failed: 0,
      })
    }

    const product = list[index]

    const result = await runPipeline({
      chairSlug: product.slug,
      chairName: product.name,
      productId: product.id,
      sources,
      maxPerSource: body.maxPerSource ?? 5,
      debug,
    })

    const nextIndex = index + 1
    const done = nextIndex >= total

    return NextResponse.json({
      done,
      next: done ? total : nextIndex,
      total,
      index,
      current: product.name,
      currentSlug: product.slug,
      collected: result.collected,
      processed: result.processed,
      saved: result.saved,
      failed: result.failed,
    })
  } catch (error) {
    console.error("[pipeline/run-all]", error)
    return jsonInternalError(error)
  }
}

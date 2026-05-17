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

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const debug = request.nextUrl.searchParams.get("debug") === "true"

  let body: {
    chairSlug?: string
    sources?: string[]
    maxPerSource?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()

    const chairSlug = body.chairSlug?.trim()
    if (!chairSlug) {
      return NextResponse.json({ error: "chairSlug is required" }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, slug, name")
      .eq("slug", chairSlug)
      .eq("track", "chair")
      .maybeSingle()

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const sources = (body.sources ?? ["reddit", "youtube"]).filter(
      (s): s is PipelineSource => VALID_SOURCES.includes(s as PipelineSource)
    )

    if (sources.length === 0) {
      return NextResponse.json({ error: "No valid sources" }, { status: 400 })
    }

    const result = await runPipeline({
      chairSlug: product.slug,
      chairName: product.name,
      productId: product.id,
      sources,
      maxPerSource: body.maxPerSource,
      debug,
    })

    return NextResponse.json({
      success: true,
      debug,
      chairName: product.name,
      chairSlug: product.slug,
      collected: result.collected,
      processed: result.processed,
      saved: result.saved,
      failed: result.failed,
      ...(debug
        ? {
            debugItems: result.debugItems,
            debug: {
              samples:
                result.debugSamples ??
                result.collectedItems?.slice(0, 2).map((item) => ({
                  source: item.source,
                  url: item.url,
                  textPreview: item.body.substring(0, 300),
                  claudeOutput: result.results[0] ?? null,
                })) ??
                [],
            },
          }
        : {}),
    })
  } catch (error) {
    console.error("[pipeline/run]", error)
    return jsonInternalError(error)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { executeServerPipeline } from "@/lib/pipeline/server-run"
import type { PipelineSource } from "@/lib/pipeline/types"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

const SERVER_SOURCES: PipelineSource[] = [
  "youtube",
  "naver",
  "dcinside",
  "trustpilot",
  "review_sites",
  "hackernews",
]
const ALL_SOURCES: PipelineSource[] = [
  "reddit",
  "youtube",
  "naver",
  "dcinside",
  "japan_community",
  "trustpilot",
  "review_sites",
  "hackernews",
]

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: {
    chairSlug?: string
    productId?: string
    productSlug?: string
    productName?: string
    sources?: string[]
    allSources?: string[]
    browserItems?: unknown[]
    maxPerSource?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()

    let productId = body.productId?.trim()
    let productSlug = body.productSlug?.trim()
    let productName = body.productName?.trim()

    const chairSlug = body.chairSlug?.trim() ?? productSlug

    if (chairSlug) {
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

      productId = product.id
      productSlug = product.slug
      productName = product.name
    }

    if (!productId || !productSlug || !productName) {
      return NextResponse.json(
        { error: "chairSlug or productId/productSlug/productName is required" },
        { status: 400 }
      )
    }

    const browserItems = Array.isArray(body.browserItems) ? body.browserItems : []

    const serverSources = (body.sources ?? [])
      .map((s) => (s === "japan" ? "japan_community" : s))
      .filter((s): s is PipelineSource =>
        SERVER_SOURCES.includes(s as PipelineSource)
      )

    const allSources = (body.allSources ?? [...serverSources])
      .map((s) => (s === "japan" ? "japan_community" : s))
      .filter((s): s is PipelineSource =>
        ALL_SOURCES.includes(s as PipelineSource)
      )

    if (serverSources.length === 0 && browserItems.length === 0) {
      return NextResponse.json(
        { error: "No items to process (enable sources or provide browserItems)" },
        { status: 400 }
      )
    }

    const result = await executeServerPipeline({
      productId,
      productSlug,
      productName,
      sources: serverSources,
      allSources: [...new Set(allSources)],
      browserItems,
      maxPerSource: body.maxPerSource ?? 5,
    })

    return NextResponse.json({
      success: true,
      chairName: productName,
      chairSlug: productSlug,
      collected: result.collected,
      processed: result.processed,
      saved: result.saved,
      failed: result.failed,
      sourceCounts: result.sourceCounts,
    })
  } catch (error) {
    console.error("[PIPELINE] Fatal:", error)
    return NextResponse.json(
      {
        error: String(error),
        collected: 0,
        processed: 0,
        saved: 0,
        failed: 0,
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { processPipelineItems } from "@/lib/pipeline/process-items"
import type { PipelineSource, RawContent } from "@/lib/pipeline/types"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

const VALID_SOURCES: PipelineSource[] = [
  "reddit",
  "youtube",
  "naver",
  "dcinside",
  "japan_community",
]

function normalizeSources(raw: string[] | undefined): PipelineSource[] {
  if (!raw?.length) return ["reddit"]
  return raw
    .map((s) => (s === "japan" ? "japan_community" : s))
    .filter((s): s is PipelineSource =>
      VALID_SOURCES.includes(s as PipelineSource)
    )
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const debug = request.nextUrl.searchParams.get("debug") === "true"

  try {
    const body = await request.json()
    console.log("[process-items] Request:", {
      productId: body.productId,
      productSlug: body.productSlug,
      itemCount: body.items?.length,
    })

    const items = (body.items ?? []) as RawContent[]
    let productId = body.productId as string | undefined
    let productSlug = body.productSlug as string | undefined
    let productName = body.productName as string | undefined

    const supabase = createAdminClient()

    if (body.chairSlug?.trim() && (!productId || !productSlug || !productName)) {
      const { data: product, error } = await supabase
        .from("products")
        .select("id, slug, name")
        .eq("slug", body.chairSlug.trim())
        .eq("track", "chair")
        .maybeSingle()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
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
        { error: "productId, productSlug, and productName are required" },
        { status: 400 }
      )
    }

    const sources = normalizeSources(body.sources)

    const result = await processPipelineItems({
      productId,
      productSlug,
      productName,
      items,
      sources,
      maxPerSource: body.maxPerSource,
      debug,
    })

    return NextResponse.json({
      success: true,
      debug,
      ...result,
    })
  } catch (error) {
    console.error("[process-items] Fatal:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

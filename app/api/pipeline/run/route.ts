import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { collectFromYoutube } from "@/lib/pipeline/sources/youtube"
import { collectFromNaver } from "@/lib/pipeline/sources/naver"
import { collectFromJapan } from "@/lib/pipeline/sources/japan"
import type { PipelineSource, RawContent } from "@/lib/pipeline/types"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

/** Sources collected on the server (API keys / non-blocked). */
const SERVER_SOURCES: PipelineSource[] = [
  "youtube",
  "naver",
  "japan_community",
]

const BROWSER_SOURCES: PipelineSource[] = ["reddit", "dcinside"]

function normalizeSources(raw: string[] | undefined): PipelineSource[] {
  if (!raw?.length) return []
  return raw
    .map((s) => (s === "japan" ? "japan_community" : s))
    .filter(
      (s): s is PipelineSource =>
        SERVER_SOURCES.includes(s as PipelineSource) ||
        BROWSER_SOURCES.includes(s as PipelineSource)
    )
}

function filterServerSources(sources: PipelineSource[]): PipelineSource[] {
  return sources.filter((s) => SERVER_SOURCES.includes(s))
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    console.log("[pipeline/run] collect-only body:", JSON.stringify(body))

    const chairSlug = body.chairSlug?.trim()
    if (!chairSlug) {
      return NextResponse.json({ error: "chairSlug is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
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

    const requested = normalizeSources(body.sources)
    const sources = filterServerSources(requested)

    console.log("[pipeline/run] Server sources:", sources)
    console.log(
      "[pipeline/run] Browser sources (collect in admin UI):",
      requested.filter((s) => BROWSER_SOURCES.includes(s))
    )

    const allItems: RawContent[] = []

    if (sources.includes("youtube")) {
      console.log("[pipeline/run] YouTube...")
      try {
        const items = await collectFromYoutube(product.name)
        console.log("[pipeline/run] YouTube collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[pipeline/run] YouTube error:", e)
      }
    }

    if (sources.includes("naver")) {
      console.log("[pipeline/run] Naver...")
      try {
        const items = await collectFromNaver(product.slug, product.name)
        console.log("[pipeline/run] Naver collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[pipeline/run] Naver error:", e)
      }
    }

    if (sources.includes("japan_community")) {
      console.log("[pipeline/run] Japan...")
      try {
        const items = await collectFromJapan(product.slug, product.name)
        console.log("[pipeline/run] Japan collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[pipeline/run] Japan error:", e)
      }
    }

    return NextResponse.json({
      success: true,
      collectOnly: true,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      items: allItems,
      serverItemCount: allItems.length,
    })
  } catch (error) {
    console.error("[pipeline/run] Fatal:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

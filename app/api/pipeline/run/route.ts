import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { processWithClaude } from "@/lib/pipeline/processor"
import { collectFromReddit } from "@/lib/pipeline/sources/reddit"
import { collectFromYoutube } from "@/lib/pipeline/sources/youtube"
import { collectFromDCInside } from "@/lib/pipeline/sources/dcinside"
import { collectFromJapan } from "@/lib/pipeline/sources/japan"
import { collectFromNaver } from "@/lib/pipeline/sources/naver"
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

function hasSource(sources: PipelineSource[], key: PipelineSource): boolean {
  return sources.includes(key)
}

async function getExistingUrls(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string
): Promise<Set<string>> {
  const [queueRes, reviewRes] = await Promise.all([
    supabase.from("content_queue").select("source_url").eq("item_id", productId),
    supabase.from("reviews").select("source_url").eq("product_id", productId),
  ])

  const urls = new Set<string>()
  for (const row of queueRes.data ?? []) {
    if (row.source_url) urls.add(row.source_url)
  }
  for (const row of reviewRes.data ?? []) {
    if (row.source_url) urls.add(row.source_url)
  }
  return urls
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const debug = request.nextUrl.searchParams.get("debug") === "true"

  try {
    const body = await request.json()
    console.log("[PIPELINE] Request body:", JSON.stringify(body))

    let productId: string
    let productSlug: string
    let productName: string

    const supabase = createAdminClient()
    console.log("[PIPELINE] Supabase admin client ready")

    if (body.chairSlug?.trim()) {
      const chairSlug = body.chairSlug.trim()
      console.log("[PIPELINE] Looking up product by slug:", chairSlug)

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, slug, name")
        .eq("slug", chairSlug)
        .eq("track", "chair")
        .maybeSingle()

      if (productError) {
        console.error("[PIPELINE] Product lookup error:", productError.message)
        return NextResponse.json({ error: productError.message }, { status: 500 })
      }
      if (!product) {
        console.log("[PIPELINE] Product not found for slug:", chairSlug)
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      productId = product.id
      productSlug = product.slug
      productName = product.name
    } else if (body.productSlug && body.productName) {
      productSlug = String(body.productSlug).trim()
      productName = String(body.productName).trim()
      productId = body.productId

      if (!productId) {
        console.log("[PIPELINE] Looking up product by productSlug:", productSlug)
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, slug, name")
          .eq("slug", productSlug)
          .eq("track", "chair")
          .maybeSingle()

        if (productError) {
          console.error("[PIPELINE] Product lookup error:", productError.message)
          return NextResponse.json({ error: productError.message }, { status: 500 })
        }
        if (!product) {
          console.log("[PIPELINE] Product not found for slug:", productSlug)
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }
        productId = product.id
        productSlug = product.slug
        productName = product.name
      }
    } else {
      console.log("[PIPELINE] Missing chairSlug or productSlug/productName")
      return NextResponse.json(
        { error: "chairSlug or productSlug+productName is required" },
        { status: 400 }
      )
    }

    console.log(
      "[PIPELINE] Processing:",
      productName,
      "| slug:",
      productSlug,
      "| id:",
      productId
    )

    const sources = normalizeSources(body.sources)
    console.log("[PIPELINE] Received sources:", body.sources)
    console.log("[PIPELINE] Validated sources:", sources)

    if (sources.length === 0) {
      return NextResponse.json({ error: "No valid sources" }, { status: 400 })
    }

    const redditTest = await fetch(
      "https://www.reddit.com/r/officechairs.json?limit=1",
      {
        headers: { "User-Agent": "furniblog/1.0" },
        cache: "no-store",
      }
    ).catch((e) => {
      console.error("[PIPELINE] Reddit reachability check failed:", e)
      return null
    })
    console.log("[PIPELINE] Reddit reachable:", redditTest?.ok ?? false)

    const allItems: RawContent[] = []

    if (hasSource(sources, "reddit")) {
      console.log("[PIPELINE] Starting Reddit collection...")
      try {
        const items = await collectFromReddit(productSlug, productName)
        console.log("[PIPELINE] Reddit collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[PIPELINE] Reddit error:", e)
      }
    }

    if (hasSource(sources, "youtube")) {
      console.log("[PIPELINE] Starting YouTube collection...")
      try {
        const items = await collectFromYoutube(productName)
        console.log("[PIPELINE] YouTube collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[PIPELINE] YouTube error:", e)
      }
    }

    if (hasSource(sources, "dcinside")) {
      console.log("[PIPELINE] Starting DC Inside collection...")
      try {
        const items = await collectFromDCInside(productSlug, productName)
        console.log("[PIPELINE] DC Inside collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[PIPELINE] DC Inside error:", e)
      }
    }

    if (hasSource(sources, "japan_community")) {
      console.log("[PIPELINE] Starting Japan collection...")
      try {
        const items = await collectFromJapan(productSlug, productName)
        console.log("[PIPELINE] Japan collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[PIPELINE] Japan error:", e)
      }
    }

    if (hasSource(sources, "naver")) {
      console.log("[PIPELINE] Starting Naver collection...")
      try {
        const items = await collectFromNaver(productSlug, productName)
        console.log("[PIPELINE] Naver collected:", items.length)
        allItems.push(...items)
      } catch (e) {
        console.error("[PIPELINE] Naver error:", e)
      }
    }

    const existingUrls = await getExistingUrls(supabase, productId)
    const seen = new Set<string>()
    const maxPerSource = body.maxPerSource ?? 15
    const perSourceCount = new Map<PipelineSource, number>()

    const capped = allItems.filter((item) => {
      if (seen.has(item.url) || existingUrls.has(item.url)) return false
      seen.add(item.url)
      const count = perSourceCount.get(item.source) ?? 0
      if (count >= maxPerSource) return false
      perSourceCount.set(item.source, count + 1)
      return true
    })

    console.log("[PIPELINE] Total collected (raw):", allItems.length)
    console.log("[PIPELINE] Total after dedupe/cap:", capped.length)

    if (capped.length === 0) {
      try {
        await supabase.from("pipeline_runs").insert({
          product_id: productId,
          chair_slug: productSlug,
          chair_name: productName,
          sources,
          collected: 0,
          processed: 0,
          saved: 0,
          failed: 0,
        })
      } catch (e) {
        console.error("[PIPELINE] Failed to save run history:", e)
      }

      return NextResponse.json({
        success: true,
        chairName: productName,
        chairSlug: productSlug,
        collected: 0,
        processed: 0,
        saved: 0,
        failed: 0,
      })
    }

    let saved = 0
    let failed = 0
    let processed = 0

    for (const item of capped) {
      try {
        console.log("[PIPELINE] Processing item:", item.url)

        const { data: queueRow, error: insertError } = await supabase
          .from("content_queue")
          .insert({
            source_type: item.source,
            source_url: item.url,
            raw_content: `${item.title}\n\n${item.body}`,
            item_type: "chair",
            item_id: productId,
            status: "pending",
          })
          .select("id")
          .single()

        if (insertError || !queueRow) {
          console.error("[PIPELINE] Queue insert failed:", insertError?.message)
          failed++
          continue
        }

        await supabase
          .from("content_queue")
          .update({ status: "processing" })
          .eq("id", queueRow.id)

        const result = await processWithClaude(item, "chair", { debug })
        processed++

        if (!result) {
          console.log("[PIPELINE] Not relevant or low confidence, skipping")
          failed++
          await supabase
            .from("content_queue")
            .update({
              status: "failed",
              processed_at: new Date().toISOString(),
              ai_output: { error: "low_confidence_or_parse_error" },
            })
            .eq("id", queueRow.id)
          continue
        }

        const originalLanguage =
          item.source === "naver" || item.source === "dcinside"
            ? "ko"
            : item.source === "japan_community"
              ? "ja"
              : "en"

        const { error: reviewError } = await supabase.from("reviews").insert({
          product_id: productId,
          source: result.source,
          summary_ko: result.summary,
          pros: result.pros,
          cons: result.cons,
          scores: result.scores,
          reviewer_height_cm: result.reviewerHeightCm ?? null,
          reviewer_weight_kg: result.reviewerWeightKg ?? null,
          usage_hours_per_day: result.usageHoursPerDay ?? null,
          usage_purpose: null,
          body_type: result.bodyType ?? null,
          back_issues: result.backIssues ?? [],
          occupation: result.occupation ?? null,
          source_url: item.url,
          original_language: originalLanguage,
          verified: false,
        })

        if (reviewError) {
          console.error("[PIPELINE] Save error:", reviewError.message)
          failed++
          await supabase
            .from("content_queue")
            .update({
              status: "failed",
              processed_at: new Date().toISOString(),
              ai_output: { error: reviewError.message },
            })
            .eq("id", queueRow.id)
        } else {
          saved++
          console.log("[PIPELINE] Saved review from:", item.source)
          await supabase
            .from("content_queue")
            .update({
              status: "processed",
              processed_at: new Date().toISOString(),
              ai_output: {
                summary: result.summary,
                scores: result.scores,
                pros: result.pros,
                cons: result.cons,
                confidence: result.confidence,
              },
            })
            .eq("id", queueRow.id)
        }
      } catch (e) {
        console.error("[PIPELINE] Process error:", e)
        failed++
      }

      await new Promise((r) => setTimeout(r, 500))
    }

    try {
      await supabase.from("pipeline_runs").insert({
        product_id: productId,
        chair_slug: productSlug,
        chair_name: productName,
        sources,
        collected: capped.length,
        processed,
        saved,
        failed,
      })
    } catch (e) {
      console.error("[PIPELINE] Failed to save run history:", e)
    }

    return NextResponse.json({
      success: true,
      debug,
      chairName: productName,
      chairSlug: productSlug,
      collected: capped.length,
      processed,
      saved,
      failed,
    })
  } catch (error) {
    console.error("[PIPELINE] Fatal error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

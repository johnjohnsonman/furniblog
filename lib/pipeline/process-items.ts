import { processWithClaude } from "@/lib/pipeline/processor"
import type { PipelineSource, RawContent } from "@/lib/pipeline/types"
import { createAdminClient } from "@/lib/supabase/admin"

export type ProcessItemsInput = {
  productId: string
  productSlug: string
  productName: string
  items: RawContent[]
  sources: PipelineSource[]
  maxPerSource?: number
  debug?: boolean
}

export type ProcessItemsResult = {
  collected: number
  processed: number
  saved: number
  failed: number
  chairName: string
  chairSlug: string
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

function capItems(
  items: RawContent[],
  existingUrls: Set<string>,
  maxPerSource: number
): RawContent[] {
  const seen = new Set<string>()
  const perSourceCount = new Map<PipelineSource, number>()
  const capped: RawContent[] = []

  for (const item of items) {
    if (seen.has(item.url) || existingUrls.has(item.url)) continue
    seen.add(item.url)
    const count = perSourceCount.get(item.source) ?? 0
    if (count >= maxPerSource) continue
    perSourceCount.set(item.source, count + 1)
    capped.push({
      ...item,
      collectedAt: item.collectedAt ?? new Date().toISOString(),
    })
  }

  return capped
}

/** Claude processing + Supabase save (no external fetch). */
export async function processPipelineItems(
  input: ProcessItemsInput
): Promise<ProcessItemsResult> {
  const supabase = createAdminClient()
  const maxPerSource = input.maxPerSource ?? 15

  const existingUrls = await getExistingUrls(supabase, input.productId)
  const capped = capItems(input.items, existingUrls, maxPerSource)

  console.log(
    `[process-items] ${input.productName}: raw=${input.items.length} capped=${capped.length}`
  )

  if (capped.length === 0) {
    try {
      await supabase.from("pipeline_runs").insert({
        product_id: input.productId,
        chair_slug: input.productSlug,
        chair_name: input.productName,
        sources: input.sources,
        collected: 0,
        processed: 0,
        saved: 0,
        failed: 0,
      })
    } catch (e) {
      console.error("[process-items] Failed to save run history:", e)
    }

    return {
      collected: 0,
      processed: 0,
      saved: 0,
      failed: 0,
      chairName: input.productName,
      chairSlug: input.productSlug,
    }
  }

  let saved = 0
  let failed = 0
  let processed = 0

  for (const item of capped) {
    try {
      const { data: queueRow, error: insertError } = await supabase
        .from("content_queue")
        .insert({
          source_type: item.source,
          source_url: item.url,
          raw_content: `${item.title}\n\n${item.body}`,
          item_type: "chair",
          item_id: input.productId,
          status: "pending",
        })
        .select("id")
        .single()

      if (insertError || !queueRow) {
        failed++
        continue
      }

      await supabase
        .from("content_queue")
        .update({ status: "processing" })
        .eq("id", queueRow.id)

      const result = await processWithClaude(item, "chair", { debug: input.debug })
      processed++

      if (!result) {
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
        product_id: input.productId,
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
      console.error("[process-items] Item error:", e)
      failed++
    }

    await new Promise((r) => setTimeout(r, 500))
  }

  try {
    await supabase.from("pipeline_runs").insert({
      product_id: input.productId,
      chair_slug: input.productSlug,
      chair_name: input.productName,
      sources: input.sources,
      collected: capped.length,
      processed,
      saved,
      failed,
    })
  } catch (e) {
    console.error("[process-items] Failed to save run history:", e)
  }

  return {
    collected: capped.length,
    processed,
    saved,
    failed,
    chairName: input.productName,
    chairSlug: input.productSlug,
  }
}

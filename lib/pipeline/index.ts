import { createAdminClient } from "@/lib/supabase/admin"
import { processWithClaude, processorSleep } from "@/lib/pipeline/processor"
import { collectFromReddit } from "@/lib/pipeline/sources/reddit"
import { collectFromYoutube } from "@/lib/pipeline/sources/youtube"
import { collectFromNaver } from "@/lib/pipeline/sources/naver"
import { collectFromDCInside } from "@/lib/pipeline/sources/dcinside"
import { collectFromJapan } from "@/lib/pipeline/sources/japan"
import { withTimeout } from "@/lib/pipeline/with-timeout"
import type {
  PipelineOptions,
  PipelineResult,
  PipelineSource,
  RawContent,
} from "@/lib/pipeline/types"

const DEFAULT_SOURCES: PipelineSource[] = ["reddit", "youtube", "naver"]

function getSourceTimeoutMs(
  source: PipelineSource,
  activeSourceCount: number
): number {
  if (source === "reddit") {
    // Reddit: 2 subreddits × ~1s delay + fetch; allow headroom on Vercel
    return activeSourceCount >= 3 ? 20_000 : 25_000
  }
  if (source === "youtube") {
    return activeSourceCount >= 3 ? 12_000 : 30_000
  }
  return 8_000
}

async function collectFromSourceTimed(
  source: PipelineSource,
  chairSlug: string,
  chairName: string,
  activeSourceCount: number
): Promise<RawContent[]> {
  const ms = getSourceTimeoutMs(source, activeSourceCount)
  const task = (async (): Promise<RawContent[]> => {
    switch (source) {
      case "reddit":
        return collectFromReddit(chairSlug, chairName)
      case "youtube":
        return collectFromYoutube(chairName)
      case "naver":
        return collectFromNaver(chairSlug, chairName)
      case "dcinside":
        return collectFromDCInside(chairSlug, chairName)
      case "japan_community":
        return collectFromJapan(chairSlug, chairName)
      default:
        return []
    }
  })()

  return withTimeout(task, ms).catch((err) => {
    console.warn(
      `[pipeline] ${source} failed:`,
      err instanceof Error ? err.message : err
    )
    return []
  })
}

async function collectAllSources(
  sources: PipelineSource[],
  chairSlug: string,
  chairName: string
): Promise<RawContent[]> {
  console.log("[pipeline] Collecting from sources:", sources)
  console.log("[pipeline] Running Reddit:", sources.includes("reddit"))
  console.log("[pipeline] Running YouTube:", sources.includes("youtube"))
  console.log("[pipeline] Running DC Inside:", sources.includes("dcinside"))
  console.log("[pipeline] Running Japan:", sources.includes("japan_community"))
  console.log("[pipeline] Running Naver:", sources.includes("naver"))

  const results = await Promise.allSettled(
    sources.map((source) =>
      collectFromSourceTimed(source, chairSlug, chairName, sources.length)
    )
  )

  const allItems: RawContent[] = []
  results.forEach((result, i) => {
    const source = sources[i]
    if (result.status === "fulfilled") {
      console.log(`[pipeline] ${source} collected:`, result.value.length)
      allItems.push(...result.value)
    } else {
      console.warn(`[pipeline] ${source} rejected:`, result.reason)
    }
  })

  return allItems
}

async function getExistingUrls(productId: string): Promise<Set<string>> {
  const supabase = createAdminClient()

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

export async function runPipeline(
  options: PipelineOptions
): Promise<PipelineResult> {
  const sources = options.sources ?? DEFAULT_SOURCES
  const maxPerSource = options.maxPerSource ?? 15
  const supabase = createAdminClient()

  const existingUrls = await getExistingUrls(options.productId)

  let allRaw = await collectAllSources(
    sources,
    options.chairSlug,
    options.chairName
  )
  const seen = new Set<string>()
  allRaw = allRaw.filter((item) => {
    if (seen.has(item.url) || existingUrls.has(item.url)) return false
    seen.add(item.url)
    return true
  })

  const perSourceCount = new Map<PipelineSource, number>()
  const capped: RawContent[] = []
  for (const item of allRaw) {
    const count = perSourceCount.get(item.source) ?? 0
    if (count >= maxPerSource) continue
    perSourceCount.set(item.source, count + 1)
    capped.push(item)
  }

  const result: PipelineResult = {
    collected: capped.length,
    processed: 0,
    saved: 0,
    failed: 0,
    results: [],
    collectedItems: options.debug ? capped : undefined,
    debugItems: options.debug ? [] : undefined,
    debugSamples: options.debug
      ? capped.slice(0, 2).map((item) => ({
          source: item.source,
          url: item.url,
          textPreview: item.body.substring(0, 300),
          claudeOutput: null,
        }))
      : undefined,
  }

  for (const raw of capped) {
    const rawContentText = `${raw.title}\n\n${raw.body}`

    const { data: queueRow, error: insertError } = await supabase
      .from("content_queue")
      .insert({
        source_type: raw.source,
        source_url: raw.url,
        raw_content: rawContentText,
        item_type: "chair",
        item_id: options.productId,
        status: "pending",
      })
      .select("id")
      .single()

    if (insertError || !queueRow) {
      console.log("[PIPELINE] Queue insert failed:", insertError?.message)
      result.failed += 1
      if (options.debug && result.debugItems) {
        result.debugItems.push({
          url: raw.url,
          source: raw.source,
          title: raw.title,
          bodyLength: raw.body.length,
          bodyPreview: raw.body.substring(0, 200),
          rawBody: raw.body,
          saved: false,
          failureReason: insertError?.message ?? "queue_insert_failed",
        })
      }
      continue
    }

    await supabase
      .from("content_queue")
      .update({ status: "processing" })
      .eq("id", queueRow.id)

    const processed = await processWithClaude(raw, "chair", { debug: options.debug })
    result.processed += 1

    if (!processed) {
      result.failed += 1
      console.log("[PIPELINE] processWithClaude returned null for", raw.url)
      await supabase
        .from("content_queue")
        .update({
          status: "failed",
          processed_at: new Date().toISOString(),
          ai_output: { error: "low_confidence_or_parse_error" },
        })
        .eq("id", queueRow.id)
      if (options.debug && result.debugItems) {
        result.debugItems.push({
          url: raw.url,
          source: raw.source,
          title: raw.title,
          bodyLength: raw.body.length,
          bodyPreview: raw.body.substring(0, 200),
          rawBody: raw.body,
          saved: false,
          failureReason: "low_confidence_or_parse_error",
        })
      }
      await processorSleep(1500)
      continue
    }

    const originalLanguage =
      raw.source === "naver" || raw.source === "dcinside"
        ? "ko"
        : raw.source === "japan_community"
          ? "ja"
          : "en"

    const { error: reviewError } = await supabase.from("reviews").insert({
      product_id: options.productId,
      source: processed.source,
      summary_ko: processed.summary,
      pros: processed.pros,
      cons: processed.cons,
      scores: processed.scores,
      reviewer_height_cm: processed.reviewerHeightCm ?? null,
      reviewer_weight_kg: processed.reviewerWeightKg ?? null,
      usage_hours_per_day: processed.usageHoursPerDay ?? null,
      usage_purpose: null,
      body_type: processed.bodyType ?? null,
      back_issues: processed.backIssues ?? [],
      occupation: processed.occupation ?? null,
      source_url: raw.url,
      original_language: originalLanguage,
      verified: false,
    })

    if (reviewError) {
      result.failed += 1
      console.log("[PIPELINE] Review insert failed:", reviewError.message)
      await supabase
        .from("content_queue")
        .update({
          status: "failed",
          processed_at: new Date().toISOString(),
          ai_output: { error: reviewError.message },
        })
        .eq("id", queueRow.id)
      if (options.debug && result.debugItems) {
        result.debugItems.push({
          url: raw.url,
          source: raw.source,
          title: raw.title,
          bodyLength: raw.body.length,
          bodyPreview: raw.body.substring(0, 200),
          rawBody: raw.body,
          saved: false,
          confidence: processed.confidence,
          failureReason: reviewError.message,
        })
      }
    } else {
      result.saved += 1
      result.results.push(processed)

      if (result.debugSamples && result.results.length === 1) {
        for (const sample of result.debugSamples) {
          sample.claudeOutput = processed
        }
      }
      await supabase
        .from("content_queue")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
          ai_output: {
            summary: processed.summary,
            scores: processed.scores,
            pros: processed.pros,
            cons: processed.cons,
            confidence: processed.confidence,
          },
        })
        .eq("id", queueRow.id)

      if (options.debug && result.debugItems) {
        result.debugItems.push({
          url: raw.url,
          source: raw.source,
          title: raw.title,
          bodyLength: raw.body.length,
          bodyPreview: raw.body.substring(0, 200),
          rawBody: raw.body,
          saved: true,
          confidence: processed.confidence,
        })
      }
    }

    await processorSleep(1500)
  }

  try {
    await supabase.from("pipeline_runs").insert({
      product_id: options.productId,
      chair_slug: options.chairSlug,
      chair_name: options.chairName,
      sources,
      collected: result.collected,
      processed: result.processed,
      saved: result.saved,
      failed: result.failed,
    })
  } catch {
    // pipeline_runs table optional until migration applied
  }

  return result
}

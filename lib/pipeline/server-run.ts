import { createAdminClient } from "@/lib/supabase/admin"
import { processWithClaude } from "@/lib/pipeline/processor"
import { collectFromDCInside } from "@/lib/pipeline/sources/dcinside"
import { collectFromHackerNews } from "@/lib/pipeline/sources/hackernews"
import { collectFromReviewSites } from "@/lib/pipeline/sources/reviews-sites"
import { collectFromTrustpilot } from "@/lib/pipeline/sources/trustpilot"
import { collectFromYoutube } from "@/lib/pipeline/sources/youtube"
import { collectFromNaver } from "@/lib/pipeline/sources/naver"
import { collectFromReddit } from "@/lib/pipeline/sources/reddit"
import type { PipelineSource, RawContent } from "@/lib/pipeline/types"
import type { SupabaseClient } from "@supabase/supabase-js"

const SERVER_SOURCE_TIMEOUT_MS = 10_000
const DC_INSIDE_TIMEOUT_MS = 10_000
const SCRAPE_SOURCE_TIMEOUT_MS = 10_000
const DEFAULT_MAX_PER_SOURCE = 5

export type SourceCounts = {
  reddit: number
  youtube: number
  dcinside: number
  japan_community: number
  naver: number
  trustpilot: number
  review_sites: number
  hackernews: number
  browser: number
  server: number
}

export type ServerPipelineResult = {
  collected: number
  processed: number
  saved: number
  failed: number
  sourceCounts: SourceCounts
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  name: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      console.log(`[PIPELINE] ${name} timeout after ${ms}ms`)
      reject(new Error(`${name} timeout`))
    }, ms)
    promise.then(
      (val) => {
        clearTimeout(timer)
        resolve(val)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      }
    )
  })
}

const VALID_SOURCES: PipelineSource[] = [
  "reddit",
  "youtube",
  "naver",
  "dcinside",
  "japan_community",
  "trustpilot",
  "review_sites",
  "hackernews",
]

function normalizeBrowserItems(items: unknown[]): RawContent[] {
  const results: RawContent[] = []
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue
    const item = raw as Record<string, unknown>
    const url = typeof item.url === "string" ? item.url.trim() : ""
    const title = typeof item.title === "string" ? item.title.trim() : ""
    const body = typeof item.body === "string" ? item.body.trim() : ""
    const source = item.source
    if (!url || !body || !VALID_SOURCES.includes(source as PipelineSource)) {
      continue
    }
    results.push({
      url,
      title: title || url,
      body,
      source: source as RawContent["source"],
      collectedAt:
        typeof item.collectedAt === "string"
          ? item.collectedAt
          : new Date().toISOString(),
    })
  }
  return results
}

async function collectServerSources(
  productSlug: string,
  productName: string,
  sources: string[]
): Promise<RawContent[]> {
  const serverItems: RawContent[] = []

  if (sources.includes("reddit")) {
    try {
      const items = await withTimeout(
        collectFromReddit(productSlug, productName),
        SERVER_SOURCE_TIMEOUT_MS,
        "Reddit"
      )
      serverItems.push(...items)
      console.log("[PIPELINE] Reddit:", items.length)
    } catch (e) {
      console.warn("[PIPELINE] Reddit failed:", e)
    }
  }

  if (sources.includes("youtube")) {
    try {
      const items = await withTimeout(
        collectFromYoutube(productName),
        SERVER_SOURCE_TIMEOUT_MS,
        "YouTube"
      )
      serverItems.push(...items)
      console.log("[PIPELINE] YouTube:", items.length)
    } catch (e) {
      console.warn("[PIPELINE] YouTube failed:", e)
    }
  }

  if (sources.includes("naver")) {
    try {
      const items = await withTimeout(
        collectFromNaver(productSlug, productName),
        SERVER_SOURCE_TIMEOUT_MS,
        "Naver"
      )
      serverItems.push(...items)
      console.log("[PIPELINE] Naver:", items.length)
    } catch (e) {
      console.warn("[PIPELINE] Naver failed:", e)
    }
  }

  if (sources.includes("dcinside")) {
    try {
      const items = await withTimeout(
        collectFromDCInside(productSlug, productName),
        DC_INSIDE_TIMEOUT_MS,
        "DCInside"
      )
      serverItems.push(...items)
      console.log("[PIPELINE] DC Inside (Naver):", items.length)
    } catch (e) {
      console.warn("[PIPELINE] DC Inside failed:", e)
    }
  }

  if (sources.includes("trustpilot")) {
    try {
      const items = await withTimeout(
        collectFromTrustpilot(productSlug, productName),
        SCRAPE_SOURCE_TIMEOUT_MS,
        "Trustpilot"
      )
      serverItems.push(...items)
      console.log("[PIPELINE] Trustpilot:", items.length)
    } catch (e) {
      console.warn("[PIPELINE] Trustpilot failed:", e)
    }
  }

  if (sources.includes("review_sites")) {
    try {
      const items = await withTimeout(
        collectFromReviewSites(productSlug, productName),
        SCRAPE_SOURCE_TIMEOUT_MS,
        "ReviewSites"
      )
      serverItems.push(...items)
      console.log("[PIPELINE] Review Sites:", items.length)
    } catch (e) {
      console.warn("[PIPELINE] Review Sites failed:", e)
    }
  }

  if (sources.includes("hackernews")) {
    try {
      const items = await withTimeout(
        collectFromHackerNews(productSlug, productName),
        10_000,
        "HackerNews"
      )
      serverItems.push(...items)
      console.log("[PIPELINE] Hacker News:", items.length)
    } catch (e) {
      console.warn("[PIPELINE] Hacker News failed:", e)
    }
  }

  return serverItems
}

function countBySource(items: RawContent[]): SourceCounts {
  const counts: SourceCounts = {
    reddit: 0,
    youtube: 0,
    dcinside: 0,
    japan_community: 0,
    naver: 0,
    trustpilot: 0,
    review_sites: 0,
    hackernews: 0,
    browser: 0,
    server: 0,
  }
  for (const item of items) {
    const key = item.source as keyof Omit<SourceCounts, "browser" | "server">
    if (key in counts) {
      counts[key]++
    }
  }
  return counts
}

async function saveRunHistory(
  supabase: SupabaseClient,
  productId: string,
  chairSlug: string,
  productName: string,
  sources: string[],
  collected: number,
  processed: number,
  saved: number,
  failed: number
) {
  try {
    await supabase.from("pipeline_runs").insert({
      product_id: productId,
      chair_slug: chairSlug,
      chair_name: productName,
      sources,
      collected,
      processed,
      saved,
      failed,
    })
  } catch (e) {
    console.error("[PIPELINE] History save failed:", e)
  }
}

function capPerSource(
  items: RawContent[],
  maxPerSource?: number
): RawContent[] {
  if (!maxPerSource || maxPerSource <= 0) return items
  const perSource = new Map<PipelineSource, number>()
  const capped: RawContent[] = []
  for (const item of items) {
    const count = perSource.get(item.source) ?? 0
    if (count >= maxPerSource) continue
    perSource.set(item.source, count + 1)
    capped.push(item)
  }
  return capped
}

export async function executeServerPipeline(params: {
  productId: string
  productSlug: string
  productName: string
  /** Server-only sources: youtube, naver */
  sources: string[]
  /** All sources selected in UI (for history) */
  allSources?: string[]
  browserItems?: unknown[]
  maxPerSource?: number
}): Promise<ServerPipelineResult> {
  const {
    productId,
    productSlug,
    productName,
    sources,
    allSources,
    maxPerSource,
  } = params

  const browserItems = normalizeBrowserItems(params.browserItems ?? [])
  const supabase = createAdminClient()

  console.log("[PIPELINE] Start:", productName)
  console.log("[PIPELINE] Browser items:", browserItems.length)
  console.log("[PIPELINE] Server sources:", sources)

  const serverItems = await collectServerSources(
    productSlug,
    productName,
    sources
  )

  console.log("[PIPELINE] Server items:", serverItems.length)

  const historySources = allSources?.length
    ? allSources
    : [
        ...new Set([
          ...browserItems.map((i) => i.source),
          ...sources,
        ]),
      ]

  const allItemsRaw = [...browserItems, ...serverItems]
  const totalCount = allItemsRaw.length

  const existingUrls = new Set<string>()
  try {
    const { data: existingReviews } = await supabase
      .from("reviews")
      .select("source_url")
      .eq("product_id", productId)
      .not("source_url", "is", null)

    existingReviews?.forEach((r) => {
      if (r.source_url) existingUrls.add(r.source_url)
    })
  } catch (e) {
    console.warn("[PIPELINE] Could not load existing URLs:", e)
  }

  const seen = new Set<string>()
  let newItems = allItemsRaw.filter((item) => {
    if (!item.url || seen.has(item.url) || existingUrls.has(item.url)) {
      return false
    }
    seen.add(item.url)
    return true
  })

  const duplicatesSkipped = totalCount - newItems.length
  if (duplicatesSkipped > 0) {
    console.log(`[PIPELINE] Skipped ${duplicatesSkipped} duplicates`)
  }
  console.log(
    "[PIPELINE] Total:",
    totalCount,
    "New:",
    newItems.length,
    "Duplicates skipped:",
    duplicatesSkipped
  )

  const cap = maxPerSource ?? DEFAULT_MAX_PER_SOURCE
  newItems = capPerSource(newItems, cap)

  const sourceCounts = countBySource(newItems)
  sourceCounts.browser = browserItems.length
  sourceCounts.server = serverItems.length

  if (newItems.length === 0) {
    await saveRunHistory(
      supabase,
      productId,
      productSlug,
      productName,
      historySources,
      0,
      0,
      0,
      0
    )
    return {
      collected: 0,
      processed: 0,
      saved: 0,
      failed: 0,
      sourceCounts,
    }
  }

  const itemsToProcess = newItems.slice(0, DEFAULT_MAX_PER_SOURCE)
  console.log("[PIPELINE] Processing:", itemsToProcess.length, "items")

  let saved = 0
  let failed = 0

  function originalLanguageFor(source: RawContent["source"]): string {
    if (source === "naver" || source === "dcinside") return "ko"
    if (source === "japan_community") return "ja"
    return "en"
  }

  async function insertReview(row: {
    summary: string
    pros: string[]
    cons: string[]
    overall: number
    mentionsBackPain?: boolean
    mentionsLumbar?: boolean
    backIssueSentiment?: "positive" | "negative" | "neutral" | null
    item: RawContent
  }): Promise<boolean> {
    const scores: Record<string, unknown> = { overall: row.overall }
    if (row.mentionsBackPain === true) scores.mentionsBackPain = true
    if (row.mentionsLumbar === true) scores.mentionsLumbar = true
    if (row.backIssueSentiment) scores.backIssueSentiment = row.backIssueSentiment

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      source: row.item.source,
      summary_ko: row.summary,
      pros: row.pros,
      cons: row.cons,
      scores,
      source_url: row.item.url,
      original_language: originalLanguageFor(row.item.source),
      verified: false,
    })

    if (error) {
      console.error("[PIPELINE] Save error:", error.message)
      return false
    }
    existingUrls.add(row.item.url)
    return true
  }

  for (const item of itemsToProcess) {
    const rawSummary =
      item.title?.trim() || item.body.slice(0, 200).trim() || "Collected review"

    try {
      const outcome = await processWithClaude(item, productName)

      if (outcome.status === "rejected") {
        console.log(
          "[PIPELINE] Skipped irrelevant content (confidence:",
          outcome.confidence,
          ")"
        )
        failed++
        continue
      }

      if (outcome.status === "error") {
        const ok = await insertReview({
          summary: rawSummary,
          pros: [],
          cons: [],
          overall: 3,
          item,
        })
        if (ok) saved++
        else failed++
        continue
      }

      const result = outcome.data
      const ok = await insertReview({
        summary: result.summary,
        pros: result.pros,
        cons: result.cons,
        overall: result.overall,
        mentionsBackPain: result.mentions_back_pain,
        mentionsLumbar: result.mentions_lumbar,
        backIssueSentiment: result.back_issue_sentiment ?? null,
        item,
      })

      if (ok) saved++
      else failed++
    } catch (e) {
      console.error("[PIPELINE] Process error:", e)
      try {
        const ok = await insertReview({
          summary: rawSummary,
          pros: [],
          cons: [],
          overall: 3,
          item,
        })
        if (ok) saved++
        else failed++
      } catch (e2) {
        console.error("[PIPELINE] Raw save error:", e2)
        failed++
      }
    }

    await new Promise((r) => setTimeout(r, 200))
  }

  const collected = newItems.length
  const processed = itemsToProcess.length

  await saveRunHistory(
    supabase,
    productId,
    productSlug,
    productName,
    historySources,
    collected,
    processed,
    saved,
    failed
  )

  return { collected, processed, saved, failed, sourceCounts }
}

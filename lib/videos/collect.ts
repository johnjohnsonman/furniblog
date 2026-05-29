import type { SupabaseClient } from "@supabase/supabase-js"
import { generateVideoSummary } from "@/lib/videos/summary"
import { checkVideoRelevance, stripVariantSuffix } from "@/lib/videos/relevance"

type ProductRow = {
  id: string
  slug: string
  name: string
  published: boolean
  track: string | null
  brands?: { name?: string | null } | Array<{ name?: string | null }> | null
}

type YoutubeSearchItem = {
  id?: { videoId?: string }
  snippet?: {
    title?: string
    channelTitle?: string
    publishedAt?: string
    description?: string
    thumbnails?: {
      maxres?: { url?: string }
      standard?: { url?: string }
      high?: { url?: string }
      medium?: { url?: string }
      default?: { url?: string }
    }
  }
}

type YoutubeVideoItem = {
  id?: string
  statistics?: { viewCount?: string }
  contentDetails?: { duration?: string }
}

type YoutubeErrorPayload = {
  error?: {
    errors?: Array<{ reason?: string; message?: string }>
    message?: string
  }
}

export type RejectedVideo = {
  title: string
  confidence: number
  isChairVideo: boolean
  isThisModel: boolean
  reason: string
}

export type CollectSingleResult = {
  chairId: string
  chairSlug: string
  chairName: string
  sourceQuery: string
  fetchedVideos: number
  insertedVideos: number
  skippedDuplicates: number
  skippedIrrelevant: number
  quotaExceeded: boolean
  rejectedVideos: RejectedVideo[]
}

export type CollectBatchOptions = {
  maxChairs: number
  delayMs: number
  skipChairsWithVideos: boolean
}

export type CollectBatchResult = {
  processedChairs: number
  skippedChairs: number
  totalFetchedVideos: number
  totalInsertedVideos: number
  totalDuplicateSkips: number
  totalSkippedIrrelevant: number
  quotaExceeded: boolean
  message: string
}

export type SummaryBackfillResult = {
  processed: number
  updated: number
  failed: number
}

/** Decode the HTML entities YouTube commonly returns in titles/descriptions. */
export function decodeHtmlEntities(input: string | null): string | null {
  if (!input) return input
  return input
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&amp;/g, "&")
}

export function buildYoutubeSearchQuery(
  chairName: string,
  brandName?: string | null
): string {
  // Search by base model name, dropping "(Size B)", "(V2)" etc.
  const name = stripVariantSuffix(chairName.trim()).replace(/"/g, "")
  const brand = brandName?.trim().replace(/"/g, "") ?? ""

  if (brand) {
    const brandLower = brand.toLowerCase()
    const nameLower = name.toLowerCase()
    if (nameLower.startsWith(brandLower)) {
      return `"${name}" office chair review`
    }
    return `"${brand} ${name}" office chair review`
  }

  return `"${name}" office chair review`
}

function extractBrandName(row: ProductRow): string | null {
  const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands
  return typeof brand?.name === "string" && brand.name.trim() ? brand.name.trim() : null
}

function pickThumbnail(item: YoutubeSearchItem): string | null {
  const thumbs = item.snippet?.thumbnails
  return (
    thumbs?.maxres?.url ??
    thumbs?.standard?.url ??
    thumbs?.high?.url ??
    thumbs?.medium?.url ??
    thumbs?.default?.url ??
    null
  )
}

async function parseQuotaExceeded(res: Response): Promise<boolean> {
  if (res.status !== 403) return false
  try {
    const payload = (await res.json()) as YoutubeErrorPayload
    return Boolean(
      payload.error?.errors?.some((e) => e.reason === "quotaExceeded")
    )
  } catch {
    return false
  }
}

async function fetchYoutubeSearch(params: {
  apiKey: string
  query: string
}): Promise<{ items: YoutubeSearchItem[]; quotaExceeded: boolean }> {
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: params.query,
    type: "video",
    maxResults: "5",
    key: params.apiKey,
  })

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`)
  if (!res.ok) {
    const quotaExceeded = await parseQuotaExceeded(res)
    if (quotaExceeded) return { items: [], quotaExceeded: true }
    throw new Error(`YouTube search failed: HTTP ${res.status}`)
  }

  const json = (await res.json()) as { items?: YoutubeSearchItem[] }
  return { items: json.items ?? [], quotaExceeded: false }
}

async function fetchYoutubeVideos(params: {
  apiKey: string
  videoIds: string[]
}): Promise<{ items: YoutubeVideoItem[]; quotaExceeded: boolean }> {
  if (params.videoIds.length === 0) return { items: [], quotaExceeded: false }
  const videoParams = new URLSearchParams({
    part: "statistics,contentDetails",
    id: params.videoIds.join(","),
    key: params.apiKey,
  })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?${videoParams}`)
  if (!res.ok) {
    const quotaExceeded = await parseQuotaExceeded(res)
    if (quotaExceeded) return { items: [], quotaExceeded: true }
    throw new Error(`YouTube videos failed: HTTP ${res.status}`)
  }
  const json = (await res.json()) as { items?: YoutubeVideoItem[] }
  return { items: json.items ?? [], quotaExceeded: false }
}

function mergeVideoData(
  searchItems: YoutubeSearchItem[],
  detailItems: YoutubeVideoItem[]
): Array<{
  youtube_id: string
  title: string | null
  channel_title: string | null
  thumbnail_url: string | null
  published_at: string | null
  description: string | null
  view_count: number | null
  duration: string | null
}> {
  const byId = new Map<string, YoutubeVideoItem>()
  for (const item of detailItems) {
    if (item.id) byId.set(item.id, item)
  }

  const rows: Array<{
    youtube_id: string
    title: string | null
    channel_title: string | null
    thumbnail_url: string | null
    published_at: string | null
    description: string | null
    view_count: number | null
    duration: string | null
  }> = []

  for (const item of searchItems) {
    const videoId = item.id?.videoId
    if (!videoId) continue
    const detail = byId.get(videoId)
    const rawViewCount = detail?.statistics?.viewCount
    const parsedViewCount =
      typeof rawViewCount === "string" && rawViewCount.trim()
        ? Number(rawViewCount)
        : null

    rows.push({
      youtube_id: videoId,
      title: decodeHtmlEntities(item.snippet?.title?.trim() || null),
      channel_title: decodeHtmlEntities(item.snippet?.channelTitle?.trim() || null),
      thumbnail_url: pickThumbnail(item),
      published_at: item.snippet?.publishedAt ?? null,
      description: decodeHtmlEntities(item.snippet?.description?.trim() || null),
      view_count:
        typeof parsedViewCount === "number" && Number.isFinite(parsedViewCount)
          ? parsedViewCount
          : null,
      duration: detail?.contentDetails?.duration ?? null,
    })
  }

  return rows
}

async function filterRelevantVideos(
  rows: ReturnType<typeof mergeVideoData>,
  chairName: string,
  brand: string | null
): Promise<{
  relevant: ReturnType<typeof mergeVideoData>
  skippedIrrelevant: number
  rejectedVideos: RejectedVideo[]
}> {
  const relevant: ReturnType<typeof mergeVideoData> = []
  const rejectedVideos: RejectedVideo[] = []
  let skippedIrrelevant = 0

  for (const row of rows) {
    const relevance = await checkVideoRelevance({
      title: row.title ?? "",
      description: row.description ?? "",
      chairName,
      brandName: brand,
    })

    if (!relevance.relevant) {
      skippedIrrelevant += 1
      rejectedVideos.push({
        title: row.title ?? "(untitled)",
        confidence: relevance.confidence,
        isChairVideo: relevance.isChairVideo,
        isThisModel: relevance.isThisModel,
        reason: relevance.reason,
      })
      console.log(
        `[videos] Rejected "${row.title}" — confidence=${relevance.confidence}, chairVideo=${relevance.isChairVideo}, thisModel=${relevance.isThisModel}, reason=${relevance.reason}`
      )
      continue
    }

    relevant.push(row)
  }

  return { relevant, skippedIrrelevant, rejectedVideos }
}

export async function collectVideosForChair(params: {
  supabase: SupabaseClient
  product: ProductRow
}): Promise<CollectSingleResult> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set")

  const brand = extractBrandName(params.product)
  const sourceQuery = buildYoutubeSearchQuery(params.product.name, brand)

  const searchResult = await fetchYoutubeSearch({ apiKey, query: sourceQuery })
  if (searchResult.quotaExceeded) {
    return {
      chairId: params.product.id,
      chairSlug: params.product.slug,
      chairName: params.product.name,
      sourceQuery,
      fetchedVideos: 0,
      insertedVideos: 0,
      skippedDuplicates: 0,
      skippedIrrelevant: 0,
      quotaExceeded: true,
      rejectedVideos: [],
    }
  }

  const videoIds = searchResult.items
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id))

  const detailsResult = await fetchYoutubeVideos({ apiKey, videoIds })
  if (detailsResult.quotaExceeded) {
    return {
      chairId: params.product.id,
      chairSlug: params.product.slug,
      chairName: params.product.name,
      sourceQuery,
      fetchedVideos: 0,
      insertedVideos: 0,
      skippedDuplicates: 0,
      skippedIrrelevant: 0,
      quotaExceeded: true,
      rejectedVideos: [],
    }
  }

  const merged = mergeVideoData(searchResult.items, detailsResult.items)
  const { relevant, skippedIrrelevant, rejectedVideos } = await filterRelevantVideos(
    merged,
    params.product.name,
    brand
  )

  if (relevant.length === 0) {
    return {
      chairId: params.product.id,
      chairSlug: params.product.slug,
      chairName: params.product.name,
      sourceQuery,
      fetchedVideos: merged.length,
      insertedVideos: 0,
      skippedDuplicates: 0,
      skippedIrrelevant,
      quotaExceeded: false,
      rejectedVideos,
    }
  }

  const youtubeIds = relevant.map((row) => row.youtube_id)
  const { data: existingRows, error: existingError } = await params.supabase
    .from("videos")
    .select("youtube_id")
    .in("youtube_id", youtubeIds)

  if (existingError) {
    throw new Error(existingError.message)
  }

  const existingSet = new Set((existingRows ?? []).map((row) => row.youtube_id))

  const upsertRows = relevant.map((row) => ({
    ...row,
    chair_id: params.product.id,
    brand,
    status: "published" as const,
    source_query: sourceQuery,
    summary: null as string | null,
  }))

  const { error: upsertError } = await params.supabase
    .from("videos")
    .upsert(upsertRows, { onConflict: "youtube_id" })

  if (upsertError) {
    throw new Error(upsertError.message)
  }

  const insertedRows = relevant.filter((row) => !existingSet.has(row.youtube_id))
  const insertedVideos = insertedRows.length
  const skippedDuplicates = relevant.length - insertedVideos

  for (const row of insertedRows) {
    const summary = await generateVideoSummary(
      row.title ?? "",
      row.description ?? "",
      params.product.name
    )
    if (!summary) continue

    const { error: summaryError } = await params.supabase
      .from("videos")
      .update({ summary })
      .eq("youtube_id", row.youtube_id)

    if (summaryError) {
      console.warn(
        "[videos] failed to save summary:",
        row.youtube_id,
        summaryError.message
      )
    }
  }

  return {
    chairId: params.product.id,
    chairSlug: params.product.slug,
    chairName: params.product.name,
    sourceQuery,
    fetchedVideos: merged.length,
    insertedVideos,
    skippedDuplicates,
    skippedIrrelevant,
    quotaExceeded: false,
    rejectedVideos,
  }
}

export async function backfillMissingVideoSummaries(params: {
  supabase: SupabaseClient
  maxItems: number
}): Promise<SummaryBackfillResult> {
  const limit = Math.max(1, Math.min(params.maxItems, 200))
  const { data, error } = await params.supabase
    .from("videos")
    .select("id, title, description, products(name)")
    .is("summary", null)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  let processed = 0
  let updated = 0
  let failed = 0

  for (const row of data ?? []) {
    processed += 1
    const product = Array.isArray(row.products) ? row.products[0] : row.products
    const chairName =
      typeof product?.name === "string" ? product.name : undefined

    try {
      const summary = await generateVideoSummary(
        typeof row.title === "string" ? row.title : "",
        typeof row.description === "string" ? row.description : "",
        chairName
      )
      if (!summary) {
        failed += 1
        continue
      }

      const { error: updateError } = await params.supabase
        .from("videos")
        .update({ summary })
        .eq("id", row.id)

      if (updateError) {
        failed += 1
        continue
      }
      updated += 1
    } catch {
      failed += 1
    }
  }

  return { processed, updated, failed }
}

export type FixTitlesResult = {
  scanned: number
  updated: number
}

/** One-off backfill: re-decode HTML entities in already-stored video titles/channels/descriptions. */
export async function fixVideoTitleEntities(params: {
  supabase: SupabaseClient
}): Promise<FixTitlesResult> {
  const { supabase } = params
  const batchSize = 500
  let offset = 0
  let scanned = 0
  let updated = 0

  while (true) {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, channel_title, description")
      .order("created_at", { ascending: false })
      .range(offset, offset + batchSize - 1)

    if (error) throw new Error(error.message)
    const rows = data ?? []
    if (rows.length === 0) break

    for (const row of rows) {
      scanned += 1
      const title = typeof row.title === "string" ? row.title : null
      const channel = typeof row.channel_title === "string" ? row.channel_title : null
      const description = typeof row.description === "string" ? row.description : null

      const nextTitle = decodeHtmlEntities(title)
      const nextChannel = decodeHtmlEntities(channel)
      const nextDescription = decodeHtmlEntities(description)

      if (
        nextTitle === title &&
        nextChannel === channel &&
        nextDescription === description
      ) {
        continue
      }

      const { error: updateError } = await supabase
        .from("videos")
        .update({
          title: nextTitle,
          channel_title: nextChannel,
          description: nextDescription,
        })
        .eq("id", row.id)

      if (!updateError) updated += 1
    }

    if (rows.length < batchSize) break
    offset += batchSize
  }

  return { scanned, updated }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function collectVideosForPublishedChairs(params: {
  supabase: SupabaseClient
  options: CollectBatchOptions
}): Promise<CollectBatchResult> {
  const { supabase, options } = params

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, name, published, track, brands(name)")
    .eq("track", "chair")
    .eq("published", true)
    .order("name")
    .limit(Math.max(1, Math.min(options.maxChairs, 200)))

  if (error) {
    throw new Error(error.message)
  }

  const list = (products ?? []) as ProductRow[]
  let processedChairs = 0
  let skippedChairs = 0
  let totalFetchedVideos = 0
  let totalInsertedVideos = 0
  let totalDuplicateSkips = 0
  let totalSkippedIrrelevant = 0
  let quotaExceeded = false

  for (let idx = 0; idx < list.length; idx++) {
    const product = list[idx]

    if (options.skipChairsWithVideos) {
      const { count, error: countError } = await supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("chair_id", product.id)

      if (countError) throw new Error(countError.message)
      if ((count ?? 0) > 0) {
        skippedChairs += 1
        continue
      }
    }

    const one = await collectVideosForChair({ supabase, product })
    if (one.quotaExceeded) {
      quotaExceeded = true
      break
    }

    processedChairs += 1
    totalFetchedVideos += one.fetchedVideos
    totalInsertedVideos += one.insertedVideos
    totalDuplicateSkips += one.skippedDuplicates
    totalSkippedIrrelevant += one.skippedIrrelevant

    if (idx < list.length - 1 && options.delayMs > 0) {
      await sleep(options.delayMs)
    }
  }

  return {
    processedChairs,
    skippedChairs,
    totalFetchedVideos,
    totalInsertedVideos,
    totalDuplicateSkips,
    totalSkippedIrrelevant,
    quotaExceeded,
    message: quotaExceeded ? "quota exceeded" : "completed",
  }
}

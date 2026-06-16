import type { SupabaseClient } from "@supabase/supabase-js"
import { fetchGoogleNews } from "@/lib/news/sources/google-news"
import { checkNewsRelevance } from "@/lib/news/relevance"
import { newsSlug } from "@/lib/news/slug"
import {
  loadBrandImages,
  pickBrandImage,
  type BrandImageMap,
} from "@/lib/news/brand-images"

/** Max articles considered per brand per run (keeps Claude calls bounded). */
const DEFAULT_MAX_PER_BRAND = 10

export type RejectedNews = {
  title: string
  confidence: number
  isFurnitureNews: boolean
  reason: string
}

export type CollectNewsSingleResult = {
  brand: string
  sourceQuery: string
  fetched: number
  inserted: number
  skippedDuplicates: number
  skippedIrrelevant: number
  rejected: RejectedNews[]
}

export type CollectNewsBatchOptions = {
  maxBrands: number
  delayMs: number
  skipBrandsWithNews: boolean
  maxPerBrand: number
}

export type CollectNewsBatchResult = {
  processedBrands: number
  skippedBrands: number
  totalFetched: number
  totalInserted: number
  totalDuplicateSkips: number
  totalSkippedIrrelevant: number
  message: string
}

type NewsRow = {
  url: string
  slug: string
  title: string | null
  source_name: string | null
  image_url: string | null
  published_at: string | null
  brand: string | null
  summary: string | null
  why_it_matters: string | null
  status: "published"
  source_query: string
}

/** All tracked brand names, used both as collection targets and the curation whitelist. */
export async function loadKnownBrands(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from("brands")
    .select("name")
    .order("name")

  if (error) throw new Error(error.message)
  return (data ?? [])
    .map((row) => (typeof row.name === "string" ? row.name.trim() : ""))
    .filter((name): name is string => Boolean(name))
}

export async function collectNewsForBrand(params: {
  supabase: SupabaseClient
  brand: string
  knownBrands?: string[]
  brandImages?: BrandImageMap
  maxItems?: number
}): Promise<CollectNewsSingleResult> {
  const { supabase, brand } = params
  const knownBrands =
    params.knownBrands ?? (await loadKnownBrands(supabase))
  const brandImages = params.brandImages ?? (await loadBrandImages(supabase))
  const maxItems = Math.max(1, params.maxItems ?? DEFAULT_MAX_PER_BRAND)

  const { query, items: allItems } = await fetchGoogleNews(brand)
  const items = allItems.slice(0, maxItems)

  if (items.length === 0) {
    return {
      brand,
      sourceQuery: query,
      fetched: 0,
      inserted: 0,
      skippedDuplicates: 0,
      skippedIrrelevant: 0,
      rejected: [],
    }
  }

  // Which of these URLs already exist (so we can report true inserts).
  const urls = items.map((item) => item.url)
  const { data: existingRows, error: existingError } = await supabase
    .from("news")
    .select("url")
    .in("url", urls)

  if (existingError) throw new Error(existingError.message)
  const existingSet = new Set((existingRows ?? []).map((row) => row.url))

  const rows: NewsRow[] = []
  const rejected: RejectedNews[] = []
  let skippedIrrelevant = 0

  for (const item of items) {
    // Skip Claude work for articles we already stored.
    if (existingSet.has(item.url)) continue

    const relevance = await checkNewsRelevance({
      title: item.title,
      description: item.description,
      candidateBrand: brand,
      knownBrands,
    })

    if (!relevance.relevant) {
      skippedIrrelevant += 1
      rejected.push({
        title: item.title || "(untitled)",
        confidence: relevance.confidence,
        isFurnitureNews: relevance.isFurnitureNews,
        reason: relevance.reason,
      })
      console.log(
        `[news] Rejected "${item.title}" — confidence=${relevance.confidence}, furniture=${relevance.isFurnitureNews}, reason=${relevance.reason}`
      )
      continue
    }

    const resolvedBrand = relevance.brand ?? brand
    rows.push({
      url: item.url,
      slug: newsSlug(item.title, item.url),
      title: item.title,
      source_name: item.sourceName,
      // Google News RSS has no image, so fall back to the brand's image.
      // Real article thumbnails are filled in later by the backfill script.
      image_url: item.imageUrl ?? pickBrandImage(brandImages, resolvedBrand),
      published_at: item.publishedAt,
      brand: resolvedBrand,
      summary: relevance.summary,
      why_it_matters: relevance.whyItMatters,
      status: "published",
      source_query: query,
    })
  }

  if (rows.length === 0) {
    return {
      brand,
      sourceQuery: query,
      fetched: items.length,
      inserted: 0,
      skippedDuplicates: 0,
      skippedIrrelevant,
      rejected,
    }
  }

  const { error: upsertError } = await supabase
    .from("news")
    .upsert(rows, { onConflict: "url" })

  if (upsertError) throw new Error(upsertError.message)

  return {
    brand,
    sourceQuery: query,
    fetched: items.length,
    inserted: rows.length,
    skippedDuplicates: 0,
    skippedIrrelevant,
    rejected,
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function collectNewsForAllBrands(params: {
  supabase: SupabaseClient
  options: CollectNewsBatchOptions
}): Promise<CollectNewsBatchResult> {
  const { supabase, options } = params
  const knownBrands = await loadKnownBrands(supabase)
  const brandImages = await loadBrandImages(supabase)
  const targets = knownBrands.slice(0, Math.max(1, options.maxBrands))

  let processedBrands = 0
  let skippedBrands = 0
  let totalFetched = 0
  let totalInserted = 0
  let totalDuplicateSkips = 0
  let totalSkippedIrrelevant = 0

  for (let idx = 0; idx < targets.length; idx++) {
    const brand = targets[idx]

    if (options.skipBrandsWithNews) {
      const { count, error: countError } = await supabase
        .from("news")
        .select("id", { count: "exact", head: true })
        .eq("brand", brand)

      if (countError) throw new Error(countError.message)
      if ((count ?? 0) > 0) {
        skippedBrands += 1
        continue
      }
    }

    const one = await collectNewsForBrand({
      supabase,
      brand,
      knownBrands,
      brandImages,
      maxItems: options.maxPerBrand,
    })

    processedBrands += 1
    totalFetched += one.fetched
    totalInserted += one.inserted
    totalDuplicateSkips += one.skippedDuplicates
    totalSkippedIrrelevant += one.skippedIrrelevant

    if (idx < targets.length - 1 && options.delayMs > 0) {
      await sleep(options.delayMs)
    }
  }

  return {
    processedBrands,
    skippedBrands,
    totalFetched,
    totalInserted,
    totalDuplicateSkips,
    totalSkippedIrrelevant,
    message: "completed",
  }
}

import type { SupabaseClient } from "@supabase/supabase-js"
import { collectNewsForBrand, loadKnownBrands } from "@/lib/news/collect"
import { collectVideosForChair } from "@/lib/videos/collect"
import { executeServerPipeline } from "@/lib/pipeline/server-run"

/** Server-collectable review sources (no browser-only sources like Reddit). */
const REVIEW_SERVER_SOURCES = [
  "youtube",
  "naver",
  "dcinside",
  "trustpilot",
  "review_sites",
  "hackernews",
]

type ChairRow = {
  id: string
  slug: string
  name: string
  published: boolean
  track: string | null
  brands?: { name?: string | null } | Array<{ name?: string | null }> | null
}

export type CronCollectionResult = {
  news: { brands: number; inserted: number }
  videos: { chairs: number; inserted: number }
  reviews: { chairs: number; saved: number }
  elapsedMs: number
}

export type CronCollectionOptions = {
  newsBudgetMs: number
  videoBudgetMs: number
  reviewBudgetMs: number
  maxNewsBrands: number
  maxVideoChairs: number
  maxReviewChairs: number
}

// Budgets run sequentially (news → videos → reviews); the sum stays well under
// the 300s maxDuration. Weighted toward reviews, which were under-collected.
export const DEFAULT_CRON_OPTIONS: CronCollectionOptions = {
  newsBudgetMs: 70_000,
  videoBudgetMs: 75_000,
  reviewBudgetMs: 120_000,
  maxNewsBrands: 15,
  maxVideoChairs: 12,
  maxReviewChairs: 16,
}

/** Build brand|key -> latest created_at (ISO) from a collected table. */
async function latestByKey(
  supabase: SupabaseClient,
  table: "news" | "videos" | "reviews",
  keyColumn: "brand" | "chair_id" | "product_id"
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const { data } = await supabase
    .from(table)
    .select(`${keyColumn}, created_at`)
    .order("created_at", { ascending: false })
    .limit(5000)
  for (const row of (data ?? []) as Record<string, string | null>[]) {
    const key = row[keyColumn]
    if (!key) continue
    // First time we see a key it's the newest (rows are desc by created_at).
    if (!map.has(key)) map.set(key, row.created_at ?? "")
  }
  return map
}

/** Brand names ordered by least-recently-collected news (never-collected first). */
async function newsBrandsToRefresh(
  supabase: SupabaseClient,
  limit: number
): Promise<string[]> {
  const brands = await loadKnownBrands(supabase)
  const latest = await latestByKey(supabase, "news", "brand")
  return [...brands]
    .sort((a, b) => (latest.get(a) ?? "").localeCompare(latest.get(b) ?? ""))
    .slice(0, limit)
}

/** Published chairs ordered by least-recently-collected for the given table. */
async function chairsToRefresh(
  supabase: SupabaseClient,
  keyColumn: "chair_id" | "product_id",
  table: "videos" | "reviews",
  limit: number
): Promise<ChairRow[]> {
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, published, track, brands(name)")
    .eq("track", "chair")
    .eq("published", true)
  const chairs = (data ?? []) as ChairRow[]
  const latest = await latestByKey(supabase, table, keyColumn)
  return chairs
    .sort((a, b) => (latest.get(a.id) ?? "").localeCompare(latest.get(b.id) ?? ""))
    .slice(0, limit)
}

/**
 * One cron pass: collect news, videos, and reviews for the least-recently
 * refreshed targets, each within its own wall-clock budget. Over repeated runs
 * the oldest-first ordering rotates coverage across all brands/chairs.
 */
export async function runCronCollection(params: {
  supabase: SupabaseClient
  options?: Partial<CronCollectionOptions>
}): Promise<CronCollectionResult> {
  const { supabase } = params
  const opts = { ...DEFAULT_CRON_OPTIONS, ...params.options }
  const startedAt = Date.now()

  const result: CronCollectionResult = {
    news: { brands: 0, inserted: 0 },
    videos: { chairs: 0, inserted: 0 },
    reviews: { chairs: 0, saved: 0 },
    elapsedMs: 0,
  }

  // --- News ---
  try {
    const knownBrands = await loadKnownBrands(supabase)
    const brands = await newsBrandsToRefresh(supabase, opts.maxNewsBrands)
    const deadline = Date.now() + opts.newsBudgetMs
    for (const brand of brands) {
      if (Date.now() > deadline) break
      try {
        const r = await collectNewsForBrand({
          supabase,
          brand,
          knownBrands,
          maxItems: 6,
        })
        result.news.brands += 1
        result.news.inserted += r.inserted
      } catch (e) {
        console.warn("[cron] news brand failed:", brand, (e as Error).message)
      }
    }
  } catch (e) {
    console.warn("[cron] news phase failed:", (e as Error).message)
  }

  // --- Videos ---
  try {
    const chairs = await chairsToRefresh(supabase, "chair_id", "videos", opts.maxVideoChairs)
    const deadline = Date.now() + opts.videoBudgetMs
    for (const chair of chairs) {
      if (Date.now() > deadline) break
      try {
        const r = await collectVideosForChair({ supabase, product: chair })
        result.videos.chairs += 1
        result.videos.inserted += r.insertedVideos
        if (r.quotaExceeded) break
      } catch (e) {
        console.warn("[cron] video chair failed:", chair.slug, (e as Error).message)
      }
    }
  } catch (e) {
    console.warn("[cron] video phase failed:", (e as Error).message)
  }

  // --- Reviews (server sources only — no browser-only Reddit) ---
  try {
    const chairs = await chairsToRefresh(supabase, "product_id", "reviews", opts.maxReviewChairs)
    const deadline = Date.now() + opts.reviewBudgetMs
    for (const chair of chairs) {
      if (Date.now() > deadline) break
      try {
        const r = await executeServerPipeline({
          productId: chair.id,
          productSlug: chair.slug,
          productName: chair.name,
          sources: REVIEW_SERVER_SOURCES,
          allSources: REVIEW_SERVER_SOURCES,
        })
        result.reviews.chairs += 1
        result.reviews.saved += r.saved
      } catch (e) {
        console.warn("[cron] review chair failed:", chair.slug, (e as Error).message)
      }
    }
  } catch (e) {
    console.warn("[cron] review phase failed:", (e as Error).message)
  }

  result.elapsedMs = Date.now() - startedAt
  return result
}

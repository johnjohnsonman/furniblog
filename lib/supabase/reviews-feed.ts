import type { ReviewSource } from "@/types/review"
import { getChairCategoryLabel, isChairCategory } from "@/lib/chair-categories"
import { resolveProductImageUrl } from "@/lib/chair-placeholder-images"
import { getFeedReviews } from "@/lib/data/reviews"
import type {
  GetReviewsParams,
  GetReviewsResult,
  ReviewFeedItem,
  ReviewFeedPeriod,
  ReviewFeedSort,
  ReviewsFeedMeta,
} from "@/lib/reviews/feed-types"
import { createPublicServerClient } from "./public-server"
import type { Review } from "@/types/review"
import { seededShuffle, hourSeed } from "@/lib/utils/shuffle"

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

const REVIEW_SELECT = `
  *,
  products!inner (
    id,
    slug,
    name,
    thumbnail_url,
    category,
    brands (
      name,
      slug
    )
  )
`

type DbFeedReviewRow = {
  id: string
  product_id: string
  source: string
  summary_ko: string
  pros: string[] | null
  cons: string[] | null
  scores: Review["scores"] | null
  reviewer_height_cm: number | null
  reviewer_weight_kg: number | null
  usage_hours_per_day: number | null
  source_url: string | null
  created_at: string
  products: {
    id: string
    slug: string
    name: string
    thumbnail_url: string | null
    category: string
    brands: { name: string; slug: string } | { name: string; slug: string }[] | null
  }
}

function escapeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "\\$&")
}

function periodCutoff(period: ReviewFeedPeriod): string | null {
  if (period === "all") return null
  const now = Date.now()
  const days =
    period === "week" ? 7 : period === "month" ? 30 : period === "year" ? 365 : 0
  if (!days) return null
  return new Date(now - days * 86400000).toISOString()
}

function unwrapBrand(
  brands: DbFeedReviewRow["products"]["brands"]
): { name: string; slug: string } | undefined {
  if (!brands) return undefined
  return Array.isArray(brands) ? brands[0] : brands
}

function mapFeedRow(row: DbFeedReviewRow): ReviewFeedItem {
  const product = row.products
  const brand = unwrapBrand(product.brands)
  const category = isChairCategory(product.category)
    ? product.category
    : "office"

  return {
    id: row.id,
    productId: row.product_id,
    productSlug: product.slug,
    productName: product.name,
    productThumbnail: product.thumbnail_url?.trim()
      ? resolveProductImageUrl(product.thumbnail_url, category)
      : null,
    productCategory: category,
    productCategoryLabel: getChairCategoryLabel(category),
    brandName: brand?.name ?? "",
    brandSlug: brand?.slug ?? "",
    source: row.source as ReviewSource,
    summary: row.summary_ko,
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    scores: row.scores ?? { overall: 0 },
    reviewerHeightCm: row.reviewer_height_cm ?? undefined,
    reviewerWeightKg: row.reviewer_weight_kg ?? undefined,
    usageHoursPerDay: row.usage_hours_per_day ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    createdAt: row.created_at,
  }
}

function matchesSearch(item: ReviewFeedItem, term: string): boolean {
  const q = term.toLowerCase()
  if (item.summary.toLowerCase().includes(q)) return true
  if (item.productName.toLowerCase().includes(q)) return true
  if (item.pros.some((p) => p.toLowerCase().includes(q))) return true
  if (item.cons.some((c) => c.toLowerCase().includes(q))) return true
  return false
}

function getOverallScore(scores: Review["scores"]): number {
  return "overall" in scores ? Number(scores.overall) || 0 : 0
}

async function resolveProductIds(
  supabase: ReturnType<typeof createPublicServerClient>,
  category?: string,
  brand?: string
): Promise<string[] | null> {
  const hasCategory = category && category !== "all"
  const hasBrand = brand && brand !== "all"
  if (!hasCategory && !hasBrand) return null

  let query = supabase
    .from("products")
    .select("id")
    .eq("published", true)
    .eq("track", "chair")

  if (hasCategory) {
    query = query.eq("category", category)
  }

  if (hasBrand) {
    const { data: brandRow } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", brand)
      .maybeSingle()
    if (!brandRow) return []
    query = query.eq("brand_id", brandRow.id)
  }

  const { data } = await query
  return data?.map((p) => p.id) ?? []
}

async function resolveProductIdsByNameSearch(
  supabase: ReturnType<typeof createPublicServerClient>,
  search: string
): Promise<string[]> {
  const term = escapeIlike(search.trim())
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("published", true)
    .eq("track", "chair")
    .ilike("name", `%${term}%`)

  return data?.map((p) => p.id) ?? []
}

function filterLocalFeed(
  all: ReviewFeedItem[],
  params: GetReviewsParams
): GetReviewsResult {
  const {
    page = 1,
    limit = 20,
    category,
    brand,
    source,
    search,
    sortBy = "recent",
    period = "all",
    seed,
  } = params

  let list = [...all]

  if (category && category !== "all") {
    list = list.filter((r) => r.productCategory === category)
  }
  if (brand && brand !== "all") {
    list = list.filter((r) => r.brandSlug === brand)
  }
  if (source && source !== "all") {
    list = list.filter((r) => r.source === source)
  }

  const cutoff = periodCutoff(period)
  if (cutoff) {
    const t = new Date(cutoff).getTime()
    list = list.filter((r) => new Date(r.createdAt).getTime() >= t)
  }

  if (search?.trim()) {
    list = list.filter((r) => matchesSearch(r, search.trim()))
  }

  if (sortBy === "random") {
    list = seededShuffle(list, seed ?? hourSeed())
  } else if (sortBy === "rating") {
    list.sort(
      (a, b) => getOverallScore(b.scores) - getOverallScore(a.scores)
    )
  } else if (sortBy === "relevance" && search?.trim()) {
    const q = search.trim().toLowerCase()
    list.sort((a, b) => {
      const score = (r: ReviewFeedItem) => {
        let s = 0
        if (r.productName.toLowerCase().includes(q)) s += 3
        if (r.summary.toLowerCase().includes(q)) s += 2
        if (r.pros.some((p) => p.toLowerCase().includes(q))) s += 1
        return s
      }
      return score(b) - score(a)
    })
  } else {
    list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const total = list.length
  const start = (page - 1) * limit
  const reviews = list.slice(start, start + limit)
  return { reviews, total }
}

function mapLocalFeedReview(
  r: Awaited<ReturnType<typeof getFeedReviews>>[number]
): ReviewFeedItem {
  const category = isChairCategory(r.feedCategory) ? r.feedCategory : "office"
  return {
    id: r.id,
    productId: r.productId,
    productSlug: r.productSlug,
    productName: r.productName,
    productThumbnail: null,
    productCategory: category,
    productCategoryLabel: getChairCategoryLabel(category),
    brandName: r.brandName,
    brandSlug: r.brandId,
    source: r.source,
    summary: r.summary,
    pros: r.pros,
    cons: r.cons,
    scores: r.scores,
    reviewerHeightCm: r.reviewerHeightCm,
    reviewerWeightKg: r.reviewerWeightKg,
    usageHoursPerDay: r.usageHoursPerDay,
    sourceUrl: r.sourceUrl,
    createdAt: r.createdAt,
  }
}

export async function getReviews(
  params: GetReviewsParams = {}
): Promise<GetReviewsResult> {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(50, Math.max(1, params.limit ?? 20))
  const sortBy: ReviewFeedSort = params.sortBy ?? "recent"
  const period: ReviewFeedPeriod = params.period ?? "all"

  if (!isSupabaseConfigured()) {
    const local = getFeedReviews().map(mapLocalFeedReview)
    return filterLocalFeed(local, { ...params, page, limit, sortBy, period })
  }

  try {
    const supabase = createPublicServerClient()
    const searchTerm = params.search?.trim() ?? ""

    const productIds = await resolveProductIds(
      supabase,
      params.category,
      params.brand
    )
    if (productIds && productIds.length === 0) {
      return { reviews: [], total: 0 }
    }

    const nameSearchIds = searchTerm
      ? await resolveProductIdsByNameSearch(supabase, searchTerm)
      : []

    let query = supabase
      .from("reviews")
      .select(REVIEW_SELECT, { count: "exact" })
      .not("summary_ko", "is", null)
      .neq("summary_ko", "")

    if (productIds) {
      query = query.in("product_id", productIds)
    }

    if (params.source && params.source !== "all") {
      query = query.eq("source", params.source)
    }

    const cutoff = periodCutoff(period)
    if (cutoff) {
      query = query.gte("created_at", cutoff)
    }

    if (searchTerm) {
      const escaped = escapeIlike(searchTerm)
      if (nameSearchIds.length > 0) {
        query = query.or(
          `summary_ko.ilike.%${escaped}%,product_id.in.(${nameSearchIds.join(",")})`
        )
      } else {
        query = query.ilike("summary_ko", `%${escaped}%`)
      }
    }

    query = query.order("created_at", { ascending: false })

    const needsWideFetch =
      sortBy === "rating" ||
      sortBy === "random" ||
      (sortBy === "relevance" && Boolean(searchTerm)) ||
      (searchTerm.length > 0 && nameSearchIds.length > 0)

    if (needsWideFetch) {
      const { data, error } = await query.limit(500)
      if (error) throw error

      let rows = (data ?? []) as DbFeedReviewRow[]
      let items = rows.map(mapFeedRow)

      if (searchTerm) {
        items = items.filter((r) => matchesSearch(r, searchTerm))
      }

      if (sortBy === "random") {
        items = seededShuffle(items, params.seed ?? hourSeed())
      } else if (sortBy === "rating") {
        items.sort(
          (a, b) => getOverallScore(b.scores) - getOverallScore(a.scores)
        )
      } else if (sortBy === "relevance") {
        const q = searchTerm.toLowerCase()
        items.sort((a, b) => {
          const score = (r: ReviewFeedItem) => {
            let s = 0
            if (r.productName.toLowerCase().includes(q)) s += 3
            if (r.summary.toLowerCase().includes(q)) s += 2
            if (r.pros.some((p) => p.toLowerCase().includes(q))) s += 1
            return s
          }
          return score(b) - score(a)
        })
      }

      const total = items.length
      const start = (page - 1) * limit
      return {
        reviews: items.slice(start, start + limit),
        total,
      }
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await query.range(from, to)

    if (error) throw error

    let items = ((data ?? []) as DbFeedReviewRow[]).map(mapFeedRow)
    if (searchTerm) {
      items = items.filter((r) => matchesSearch(r, searchTerm))
    }

    return {
      reviews: items,
      total: count ?? items.length,
    }
  } catch (err) {
    console.error("[getReviews] Failed:", err)
    const local = getFeedReviews().map(mapLocalFeedReview)
    return filterLocalFeed(local, { ...params, page, limit, sortBy, period })
  }
}

export async function getReviewsFeedMeta(): Promise<ReviewsFeedMeta> {
  if (!isSupabaseConfigured()) {
    const { brands } = await import("@/lib/data")
    const feed = getFeedReviews()
    const sources = new Set(feed.map((r) => r.source))
    return {
      reviews: feed.length,
      brands: brands.length,
      sources: sources.size,
    }
  }

  try {
    const supabase = createPublicServerClient()

    const [reviewsRes, brandsRes, sourcesRes] = await Promise.all([
      supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .not("summary_ko", "is", null)
        .neq("summary_ko", ""),
      supabase.from("brands").select("*", { count: "exact", head: true }),
      supabase
        .from("reviews")
        .select("source")
        .not("summary_ko", "is", null)
        .neq("summary_ko", ""),
    ])

    const sourceSet = new Set(
      (sourcesRes.data ?? []).map((r) => r.source as string)
    )

    return {
      reviews: reviewsRes.count ?? 0,
      brands: brandsRes.count ?? 0,
      sources: sourceSet.size,
    }
  } catch {
    const { brands } = await import("@/lib/data")
    const feed = getFeedReviews()
    return {
      reviews: feed.length,
      brands: brands.length,
      sources: new Set(feed.map((r) => r.source)).size,
    }
  }
}

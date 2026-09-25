import "server-only"
import { unstable_cache } from "next/cache"
import { createPublicServerClient } from "./public-server"
import type { ProductCardView } from "@/lib/data/mappers"
import { getChairCategoryLabel, isChairCategory } from "@/lib/chair-categories"
import { resolveProductImageUrl } from "@/lib/chair-placeholder-images"
import { formatProductPrice } from "@/lib/pricing"
import { displayPrice } from "@/lib/products/price-provenance"
import { runPublicReviewQuery } from "@/lib/reviews/exclusion"
type ReviewCountStats = { count: number; avgScore: number }

const isSupabaseConfigured = () => Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Only aggregate counters are cached. Prices and publication state are read live.
export const getCatalogStats = unstable_cache(async () => {
  const { getSiteStats } = await import("./queries")
  return getSiteStats()
}, ["catalog-stats-v1"], { revalidate: 60 })

export const getCatalogReviewCounts = unstable_cache(loadCatalogReviewCounts, ["catalog-review-counts-v1"], { revalidate: 60 })

export async function loadCatalogReviewCounts(): Promise<Record<string, ReviewCountStats>> {
  if (!isSupabaseConfigured()) return {}
  const db = createPublicServerClient()
  const counts: Record<string, ReviewCountStats> = {}
  const scored: Record<string, number> = {}
  // Fetch only the fields used by catalog sorting/counts, in parallel with cards.
  // Paginate instead of silently stopping at the PostgREST default row limit.
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await runPublicReviewQuery(apply => {
      let q = db.from("reviews").select("id,scores,products!inner(slug)")
        .eq("products.published", true).eq("products.track", "chair")
        .order("id").range(offset, offset + 999)
      if (apply) q = q.eq("excluded", false)
      return q
    })
    if (error) throw new Error("Catalog review counts unavailable")
    for (const row of data ?? []) {
      const product = Array.isArray(row.products) ? row.products[0] : row.products
      if (product) {
        const bucket = counts[product.slug] ?? { count: 0, avgScore: 0 }
        bucket.count++
        const score = row.scores && "overall" in row.scores ? Number(row.scores.overall) : NaN
        if (Number.isFinite(score)) { bucket.avgScore += score; scored[product.slug] = (scored[product.slug] ?? 0) + 1 }
        counts[product.slug] = bucket
      }
    }
    if (!data || data.length < 1000) break
  }
  for (const [slug, bucket] of Object.entries(counts)) bucket.avgScore = scored[slug] ? Math.round(bucket.avgScore / scored[slug] * 10) / 10 : 0
  return counts
}

async function loadCatalogCards(): Promise<ProductCardView[]> {
  if (!isSupabaseConfigured()) {
    const [{ getProducts }, { toProductCardView }] = await Promise.all([
      import("./queries"),
      import("@/lib/data/mappers"),
    ])
    return (await getProducts()).map(toProductCardView)
  }
  const db = createPublicServerClient()
  const { data, error } = await db.from("products").select(`
    slug,name,category,price_usd,thumbnail_url,images,rating_overall,review_count,created_at,
    brands(name,slug),product_images(url,sort_order,is_thumbnail,model_status)
  `).eq("published", true).eq("track", "chair")
    .order("rating_overall", { ascending: false, nullsFirst: false })
  // Preserve existing schema compatibility and image filtering on older databases.
  if (error || !data) {
    const [{ getProducts }, { toProductCardView }] = await Promise.all([
      import("./queries"),
      import("@/lib/data/mappers"),
    ])
    return (await getProducts()).map(toProductCardView)
  }
  return data.map(row => {
    const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands
    const category = isChairCategory(row.category) ? row.category : "office"
    const gallery = (row.product_images ?? []).filter(i => i.model_status !== "candidate")
      .sort((a,b) => Number(b.is_thumbnail)-Number(a.is_thumbnail) || a.sort_order-b.sort_order)
      .map(i => i.url).filter(Boolean)
    const source = gallery[0] || row.thumbnail_url?.trim() || row.images?.find((s: string) => s?.trim())
    const image = resolveProductImageUrl(source, category)
    return { id: row.slug, name: row.name, brand: brand?.name ?? "", brandId: brand?.slug ?? "",
      category, categoryLabel: getChairCategoryLabel(category), priceUsd: row.price_usd ?? undefined,
      price: displayPrice(row.slug) ?? formatProductPrice(row.price_usd), image, images: [image],
      rating: Number(row.rating_overall ?? 0), reviewCount: row.review_count ?? 0, publishedAt: row.created_at }
  })
}

// A short shared cache removes a full database round trip from normal navigation
// while keeping prices and publication changes within one minute of the source.
export const getCatalogCards = unstable_cache(loadCatalogCards, ["catalog-cards-v2"], {
  revalidate: 60,
})

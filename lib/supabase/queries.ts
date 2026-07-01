import type { Product } from "@/types/product"
import type { Brand } from "@/types/brand"
import type { Review } from "@/types/review"
import type { AffiliateLink, AffiliateChannel } from "@/types/affiliate-link"
import type { ProductView, DesignerView } from "@/lib/data/mappers"
import { toProductView, toDesignerView } from "@/lib/data/mappers"
import { isChairCategory } from "@/lib/chair-categories"
import { resolveProductImageUrl } from "@/lib/chair-placeholder-images"
import { formatProductPrice } from "@/lib/pricing"
import { createPublicServerClient } from "./public-server"

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

type DbBrand = {
  id: string
  slug: string
  name: string
  country: string
  logo_url: string | null
  description_ko: string
  description_long?: string | null
  hero_image_url?: string | null
  color_primary?: string | null
  color_secondary?: string | null
  website_url: string | null
  tier: string
  founded_year: number | null
  images?: string[] | null
}

type DbDesigner = {
  id: string
  slug: string
  name: string
  nationality: string
  birth_year: number
  death_year: number | null
  bio_ko: string
  portrait_url: string | null
}

type DbProduct = {
  id: string
  slug: string
  name: string
  brand_id: string
  category: string
  track: "chair" | "furniture"
  chair_type: string | null
  country: string | null
  designer_id: string | null
  launch_year: number | null
  price_krw: number | null
  price_usd: number | null
  price_range: Product["priceRange"] | null
  thumbnail_url: string | null
  images: string[] | null
  description_ko: string
  description_en: string | null
  best_for: string | null
  pros: string[] | null
  cons: string[] | null
  rating_overall: number | null
  rating_comfort: number | null
  rating_ergonomics: number | null
  rating_build_quality: number | null
  rating_design: number | null
  rating_value: number | null
  review_count: number | null
  available_in_korea: boolean | null
  try_at_chairpark: boolean | null
  chair_specs: Product["chairSpecs"] | null
  furniture_info: Record<string, unknown> | null
  seo_title: string | null
  seo_description: string | null
  published: boolean
  created_at: string
  updated_at: string
  brands?: DbBrand | DbBrand[] | null
  product_images?: DbProductImage[] | null
}

type DbProductImage = {
  id: string
  url: string
  sort_order: number
  is_thumbnail: boolean
}

type DbAffiliateLink = {
  id: string
  product_id: string
  retailer_name: string
  channel: string | null
  url: string
  price_krw: number | null
  price_usd: number | null
  is_official: boolean
  is_active: boolean
}

type DbReview = {
  id: string
  product_id: string
  source: string
  summary_ko: string
  pros: string[]
  cons: string[]
  scores: Review["scores"]
  reviewer_height_cm: number | null
  reviewer_weight_kg: number | null
  usage_hours_per_day: number | null
  usage_purpose: Review["usagePurpose"] | null
  source_url: string | null
  original_language: string
  verified: boolean
  helpful_count: number
  created_at: string
}

function unwrapBrand(
  brands: DbProduct["brands"]
): DbBrand | undefined {
  if (!brands) return undefined
  return Array.isArray(brands) ? brands[0] : brands
}

export type SiteStats = {
  products: number
  brands: number
  reviews: number
  comparisons: number
}

function mapDbBrand(row: DbBrand, productCount = 0): Brand {
  const initials = row.name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    country: row.country,
    founded: row.founded_year ?? 0,
    logo: initials || row.name.slice(0, 2).toUpperCase(),
    description: row.description_ko,
    descriptionLong: row.description_long ?? undefined,
    productCount,
    category: "Office",
    website: row.website_url ?? undefined,
    heroImageUrl: row.hero_image_url ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    images: (row.images ?? []).filter((u): u is string => Boolean(u?.trim())),
    colorPrimary: row.color_primary ?? undefined,
    colorSecondary: row.color_secondary ?? undefined,
  }
}

function mapDbDesigner(row: DbDesigner): DesignerView {
  return toDesignerView({
    id: row.slug,
    slug: row.slug,
    name: row.name,
    country: row.nationality,
    born: row.birth_year,
    imageUrl: row.portrait_url ?? "",
    bio: row.bio_ko,
    notableWorks: [],
    brandIds: [],
  })
}

function mapDbAffiliateLink(row: DbAffiliateLink): AffiliateLink {
  const channel = (row.channel ??
    (row.is_official ? "official" : "amazon")) as AffiliateChannel

  return {
    channel,
    label: row.retailer_name,
    url: row.url,
  }
}

function sortedProductImageUrls(
  images: DbProductImage[] | null | undefined
): string[] {
  if (!images?.length) return []
  return [...images]
    .sort((a, b) => {
      if (a.is_thumbnail !== b.is_thumbnail) {
        return a.is_thumbnail ? -1 : 1
      }
      return a.sort_order - b.sort_order
    })
    .map((img) => img.url)
    .filter((url) => Boolean(url?.trim()))
}

function mapDbProduct(row: DbProduct, affiliateLinks: AffiliateLink[] = []): ProductView {
  const brand = unwrapBrand(row.brands)
  const category = isChairCategory(row.category) ? row.category : "office"
  const galleryFromDb = sortedProductImageUrls(row.product_images)
  const gallery =
    galleryFromDb.length > 0
      ? galleryFromDb
      : row.thumbnail_url?.trim()
        ? [row.thumbnail_url]
        : row.images?.filter((u) => u?.trim()) ?? []
  const thumbnailFallback = row.thumbnail_url?.trim() || null
  const primaryImage =
    gallery[0] ?? thumbnailFallback ?? row.images?.[0] ?? ""

  const product: Product = {
    id: row.slug,
    slug: row.slug,
    name: row.name,
    brand: brand?.name ?? "",
    brandId: brand?.slug ?? "",
    category,
    chairType: row.chair_type ?? undefined,
    country: row.country ?? brand?.country ?? "",
    launchYear: row.launch_year ?? undefined,
    priceRange: row.price_range ?? "$$$",
    priceUsd: row.price_usd ?? undefined,
    priceLabel: formatProductPrice(row.price_usd),
    imageUrl: resolveProductImageUrl(primaryImage, category),
    galleryImages: gallery,
    summary: row.description_ko,
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    bestFor: row.best_for ?? "",
    ratingOverall: Number(row.rating_overall ?? 0) || 0,
    ratingComfort: Number(row.rating_comfort ?? 0) || 0,
    ratingErgonomics: Number(row.rating_ergonomics ?? 0) || 0,
    ratingBuildQuality: Number(row.rating_build_quality ?? 0) || 0,
    ratingDesign: Number(row.rating_design ?? 0) || 0,
    ratingValue: Number(row.rating_value ?? 0) || 0,
    reviewCount: row.review_count ?? 0,
    availableInKorea: row.available_in_korea ?? false,
    tryAtChairpark: row.try_at_chairpark ?? false,
    affiliateLinks: affiliateLinks ?? [],
    overview: row.description_en ?? row.description_ko,
    chairSpecs: row.chair_specs ?? undefined,
    publishedAt: row.created_at,
    updatedAt: row.updated_at,
  }

  return toProductView(product)
}

function mapDbReview(row: DbReview & {
  body_type?: string | null
  back_issues?: string[] | null
  occupation?: string | null
}): Review {
  const bodyType = row.body_type as Review["bodyType"] | undefined
  const backIssues = Array.isArray(row.back_issues)
    ? (row.back_issues as Review["backIssues"])
    : undefined

  return {
    id: row.id,
    productId: row.product_id,
    source: row.source as Review["source"],
    summary: row.summary_ko,
    pros: Array.isArray(row.pros) ? row.pros : [],
    cons: Array.isArray(row.cons) ? row.cons : [],
    scores: row.scores,
    reviewerHeightCm: row.reviewer_height_cm ?? undefined,
    reviewerWeightKg: row.reviewer_weight_kg ?? undefined,
    usageHoursPerDay: row.usage_hours_per_day ?? undefined,
    usagePurpose: row.usage_purpose ?? undefined,
    bodyType: bodyType ?? undefined,
    backIssues: backIssues ?? undefined,
    occupation: (row.occupation as Review["occupation"]) ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    originalLanguage: row.original_language ?? "en",
    verified: row.verified,
    helpfulCount: row.helpful_count,
    createdAt: row.created_at,
  }
}

const PRODUCT_SELECT_BASE = `
  *,
  brands (
    id,
    slug,
    name,
    country,
    logo_url,
    description_ko,
    website_url,
    tier,
    founded_year
  )
`

const PRODUCT_SELECT = `
  ${PRODUCT_SELECT_BASE},
  product_images (
    id,
    url,
    sort_order,
    is_thumbnail
  )
`

function isProductImagesPermissionError(error: { message?: string } | null): boolean {
  const msg = error?.message?.toLowerCase() ?? ""
  return msg.includes("product_images") && msg.includes("permission")
}

function productListQuery(
  supabase: ReturnType<typeof createPublicServerClient>,
  includeImages = true
) {
  const base = supabase.from("products")
  if (!includeImages) {
    return base.select(PRODUCT_SELECT_BASE)
  }
  return base
    .select(PRODUCT_SELECT)
    .order("sort_order", {
      foreignTable: "product_images",
      ascending: true,
    })
}

export async function resolveProductUuid(slug: string): Promise<string | null> {
  const supabase = createPublicServerClient()
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// Queries (async — swap import from @/lib/data/queries when ready)
// ---------------------------------------------------------------------------

export async function getProductBySlug(
  slug: string
): Promise<ProductView | undefined> {
  const { getProductBySlug: localFallback } = await import("@/lib/data/queries")

  if (!isSupabaseConfigured()) {
    return localFallback(slug)
  }

  try {
    const supabase = createPublicServerClient()
    let { data, error } = await productListQuery(supabase)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()

    if (isProductImagesPermissionError(error)) {
      console.warn(
        "[getProductBySlug] product_images not readable — run 013_product_images_anon_grant.sql"
      )
      ;({ data, error } = await productListQuery(supabase, false)
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle())
    }

    if (error || !data) {
      if (error) {
        console.error("[getProductBySlug] Supabase error:", error.message)
      }
      return localFallback(slug)
    }

    const links = await getAffiliateLinks(data.slug)
    return mapDbProduct(data as DbProduct, links ?? [])
  } catch (err) {
    console.error("[getProductBySlug] Failed:", err)
    return localFallback(slug)
  }
}

function normalizeCategoryFilter(category?: string): string | null {
  if (!category || category === "All" || category === "all") return null
  return category
}

export async function getProducts(filters?: {
  brand?: string
  category?: string
}): Promise<ProductView[]> {
  const categoryFilter = normalizeCategoryFilter(filters?.category)

  if (!isSupabaseConfigured()) {
    const { products } = await import("@/lib/data")
    let list = products

    if (filters?.brand) {
      list = list.filter((p) => p.brandId === filters.brand)
    }
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter)
    }

    return list
  }

  const supabase = createPublicServerClient()
  let query = productListQuery(supabase)
    .eq("published", true)
    .order("rating_overall", { ascending: false, nullsFirst: false })
    .eq("track", "chair")

  if (categoryFilter) {
    query = query.eq("category", categoryFilter)
  }
  if (filters?.brand) {
    const { data: brandRow } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", filters.brand)
      .maybeSingle()

    if (!brandRow) {
      return []
    }
    query = query.eq("brand_id", brandRow.id)
  }

  let { data, error } = await query

  if (isProductImagesPermissionError(error)) {
    console.warn(
      "[getProducts] product_images not readable — run 013_product_images_anon_grant.sql"
    )
    let fallbackQuery = productListQuery(supabase, false)
      .eq("published", true)
      .order("rating_overall", { ascending: false, nullsFirst: false })
      .eq("track", "chair")
    if (categoryFilter) {
      fallbackQuery = fallbackQuery.eq("category", categoryFilter)
    }
    if (filters?.brand) {
      const { data: brandRow } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", filters.brand)
        .maybeSingle()
      if (!brandRow) {
        return []
      }
      fallbackQuery = fallbackQuery.eq("brand_id", brandRow.id)
    }
    ;({ data, error } = await fallbackQuery)
  }

  if (error) {
    console.error("[getProducts] Supabase error:", error.message)
  }

  if (error || !data?.length) {
    if (error?.message?.includes("permission denied")) {
      console.error(
        "[getProducts] Falling back to local data — run lib/supabase/migrations/003_anon_read_grants.sql in Supabase SQL Editor"
      )
    }
    const { products } = await import("@/lib/data")
    let list = products

    if (filters?.brand) {
      list = list.filter((p) => p.brandId === filters.brand)
    }
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter)
    }

    return list
  }

  return (data as DbProduct[]).map((row) => mapDbProduct(row))
}

export type CategoryCountMap = Record<string, number>

export async function getCategoryCounts(): Promise<CategoryCountMap> {
  if (!isSupabaseConfigured()) {
    const { products } = await import("@/lib/data")
    const counts: CategoryCountMap = {}
    for (const p of products) {
      if (p.category) {
        counts[p.category] = (counts[p.category] ?? 0) + 1
      }
    }
    return counts
  }

  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from("products")
    .select("category")
    .eq("published", true)
    .eq("track", "chair")

  if (error || !data?.length) {
    const { products } = await import("@/lib/data")
    const counts: CategoryCountMap = {}
    for (const p of products) {
      if (p.category) {
        counts[p.category] = (counts[p.category] ?? 0) + 1
      }
    }
    return counts
  }

  const counts: CategoryCountMap = {}
  for (const row of data) {
    const cat = row.category as string | null
    if (cat) {
      counts[cat] = (counts[cat] ?? 0) + 1
    }
  }
  return counts
}

/** Brands that have at least one published chair product */
export async function getBrandsForProductFilter(): Promise<Brand[]> {
  const brands = await getBrandsWithCounts()
  return brands
    .filter((b) => b.productCount > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getFeaturedProducts(
  limit = 6
): Promise<ProductView[]> {
  if (!isSupabaseConfigured()) {
    const { getFeaturedProducts: local } = await import("@/lib/data/queries")
    return local(limit)
  }

  const supabase = createPublicServerClient()
  let { data, error } = await productListQuery(supabase)
    .eq("published", true)
    .order("rating_overall", { ascending: false, nullsFirst: false })
    .limit(limit)

  if (isProductImagesPermissionError(error)) {
    ;({ data, error } = await productListQuery(supabase, false)
      .eq("published", true)
      .order("rating_overall", { ascending: false, nullsFirst: false })
      .limit(limit))
  }

  if (error || !data?.length) {
    const { getFeaturedProducts: local } = await import("@/lib/data/queries")
    return local(limit)
  }

  return (data as DbProduct[]).map((row) => mapDbProduct(row))
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  const supabase = createPublicServerClient()
  const uuid =
    productId.includes("-") && productId.length === 36
      ? productId
      : await resolveProductUuid(productId)

  if (!uuid) return []

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", uuid)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return (data as DbReview[]).map(mapDbReview)
}

export async function getBrands(): Promise<Brand[]> {
  return getBrandsWithCounts()
}

export async function getBrandsWithCounts(): Promise<Brand[]> {
  if (!isSupabaseConfigured()) {
    const { brands } = await import("@/lib/data")
    const { products } = await import("@/lib/data")
    return brands.map((b) => ({
      ...b,
      productCount: products.filter((p) => p.brandId === b.slug).length,
    }))
  }

  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name")

  if (error || !data?.length) {
    const { brands, products } = await import("@/lib/data")
    return brands.map((b) => ({
      ...b,
      productCount: products.filter((p) => p.brandId === b.slug).length,
    }))
  }

  const { data: productRows } = await supabase
    .from("products")
    .select("brand_id")
    .eq("published", true)
    .eq("track", "chair")

  const countByBrandId = new Map<string, number>()
  for (const row of productRows ?? []) {
    const id = row.brand_id as string
    countByBrandId.set(id, (countByBrandId.get(id) ?? 0) + 1)
  }

  return (data as DbBrand[]).map((row) =>
    mapDbBrand(row, countByBrandId.get(row.id) ?? 0)
  )
}

export async function getProductsByBrandSlug(
  brandSlug: string
): Promise<ProductView[]> {
  return getProducts({ brand: brandSlug })
}

export async function getBrandBySlug(slug: string): Promise<Brand | undefined> {
  if (!isSupabaseConfigured()) {
    const { getBrandById } = await import("@/lib/data/queries")
    return getBrandById(slug)
  }

  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error || !data) {
    const { getBrandById } = await import("@/lib/data/queries")
    return getBrandById(slug)
  }

  return mapDbBrand(data as DbBrand)
}

export async function getDesigners(): Promise<DesignerView[]> {
  if (!isSupabaseConfigured()) {
    const { designers } = await import("@/lib/data")
    return designers
  }

  const supabase = createPublicServerClient()
  const { data, error } = await supabase
    .from("designers")
    .select("*")
    .order("name")

  if (error || !data?.length) {
    const { designers } = await import("@/lib/data")
    return designers
  }

  return (data as DbDesigner[]).map(mapDbDesigner)
}

export async function getAffiliateLinks(
  productId: string
): Promise<AffiliateLink[]> {
  if (!isSupabaseConfigured()) {
    const { getProductBySlug } = await import("@/lib/data/queries")
    const product = getProductBySlug(productId)
    return product?.affiliateLinks ?? []
  }

  const supabase = createPublicServerClient()
  const uuid =
    productId.includes("-") && productId.length === 36
      ? productId
      : await resolveProductUuid(productId)

  if (!uuid) {
    const { getProductBySlug } = await import("@/lib/data/queries")
    const product = getProductBySlug(productId)
    return product?.affiliateLinks ?? []
  }

  const { data, error } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("product_id", uuid)
    .eq("is_active", true)

  if (error || !data?.length) {
    const { getProductBySlug } = await import("@/lib/data/queries")
    const product = getProductBySlug(productId)
    return product?.affiliateLinks ?? []
  }

  return (data as DbAffiliateLink[]).map(mapDbAffiliateLink)
}

export type ReviewCountStats = {
  count: number
  avgScore: number
}

function aggregateReviewCounts(
  rows: Array<{
    product_id: string
    scores: Review["scores"] | null
  }>,
  uuidToSlug: Map<string, string>
): Record<string, ReviewCountStats> {
  const buckets = new Map<string, { count: number; sum: number; scored: number }>()

  for (const row of rows) {
    const slug = uuidToSlug.get(row.product_id)
    if (!slug) continue

    const bucket = buckets.get(slug) ?? { count: 0, sum: 0, scored: 0 }
    bucket.count += 1

    const overall =
      row.scores && "overall" in row.scores
        ? Number(row.scores.overall)
        : NaN

    if (Number.isFinite(overall)) {
      bucket.sum += overall
      bucket.scored += 1
    }

    buckets.set(slug, bucket)
  }

  const result: Record<string, ReviewCountStats> = {}
  for (const [slug, bucket] of buckets) {
    result[slug] = {
      count: bucket.count,
      avgScore:
        bucket.scored > 0
          ? Math.round((bucket.sum / bucket.scored) * 10) / 10
          : 0,
    }
  }

  return result
}

async function getReviewCountsLocal(
  productIds: string[]
): Promise<Record<string, ReviewCountStats>> {
  const { chairReviewsByProduct } = await import("@/lib/data/chair-reviews")
  const result: Record<string, ReviewCountStats> = {}

  for (const id of productIds) {
    const reviews = (chairReviewsByProduct[id] ?? []).filter(
      (r) => r.verified || r.source === "chairpark"
    )

    if (reviews.length === 0) continue

    let sum = 0
    let scored = 0
    for (const r of reviews) {
      const overall =
        r.scores && "overall" in r.scores ? Number(r.scores.overall) : NaN
      if (Number.isFinite(overall)) {
        sum += overall
        scored += 1
      }
    }

    result[id] = {
      count: reviews.length,
      avgScore: scored > 0 ? Math.round((sum / scored) * 10) / 10 : 0,
    }
  }

  return result
}

export async function getReviewCounts(
  productIds: string[]
): Promise<Record<string, ReviewCountStats>> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))]
  if (uniqueIds.length === 0) return {}

  if (!isSupabaseConfigured()) {
    return getReviewCountsLocal(uniqueIds)
  }

  try {
    const supabase = createPublicServerClient()
    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select("id, slug")
      .in("slug", uniqueIds)

    if (productError || !productRows?.length) {
      return getReviewCountsLocal(uniqueIds)
    }

    const slugToUuid = new Map(
      productRows.map((p) => [p.slug, p.id as string])
    )
    const uuidToSlug = new Map(
      productRows.map((p) => [p.id as string, p.slug])
    )
    const uuids = [...slugToUuid.values()]

    // Count ALL reviews for each product — the web-collected reviews (Reddit,
    // YouTube, Naver, etc.) are unverified but are exactly what the feed and
    // product pages show, so cards must reflect them too. .limit raises the
    // default 1000-row cap so later products aren't undercounted.
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("product_id, scores")
      .in("product_id", uuids)
      .limit(5000)

    if (reviewError || !reviews?.length) {
      return getReviewCountsLocal(uniqueIds)
    }

    return aggregateReviewCounts(
      reviews as Array<{
        product_id: string
        scores: Review["scores"] | null
      }>,
      uuidToSlug
    )
  } catch (err) {
    console.error("[getReviewCounts] Failed:", err)
    return getReviewCountsLocal(uniqueIds)
  }
}

export async function getSiteStats(): Promise<SiteStats> {
  const { comparisons } = await import("@/lib/data/lists")

  if (!isSupabaseConfigured()) {
    const { products, brands, reviews } = await import("@/lib/data")
    return {
      products: products.length,
      brands: brands.length,
      reviews: reviews.length,
      comparisons: comparisons.length,
    }
  }

  const supabase = createPublicServerClient()

  const [productsRes, brandRowsRes, reviewsRes] = await Promise.all([
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("published", true)
      .eq("track", "chair"),
    supabase
      .from("products")
      .select("brand_id")
      .eq("published", true)
      .eq("track", "chair"),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
  ])

  const brandIds = new Set(
    (brandRowsRes.data ?? []).map((r) => r.brand_id as string).filter(Boolean)
  )

  return {
    products: productsRes.count ?? 0,
    brands: brandIds.size,
    reviews: reviewsRes.count ?? 0,
    comparisons: comparisons.length,
  }
}

export {
  getReviews,
  getReviewsFeedMeta,
} from "@/lib/supabase/reviews-feed"
export type {
  GetReviewsParams,
  GetReviewsResult,
  ReviewFeedItem,
  ReviewsFeedMeta,
  ReviewFeedSort,
  ReviewFeedPeriod,
} from "@/lib/reviews/feed-types"

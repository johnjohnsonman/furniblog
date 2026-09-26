import { comparisonMedia } from "./card-media"
import { getVerifiedComparisonPilot } from "./verified-pilots"
import { isVerifiedComparisonImage } from "./product-visuals"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ComparisonProductInput } from "@/lib/comparisons/generate"
import { runPublicReviewQuery } from "@/lib/reviews/exclusion"
import { filterChairSpecsByEvidence } from "@/lib/data/product-fit-evidence"
import { comparisonNeedsSourceReview, ledgerComparisonNeedsSourceReview, neutralComparisonSummary } from "@/lib/comparisons/public-safety"
import { ledgerPairFigures } from "@/lib/comparisons/ledger-figures"

/** Where the ledger-built spec table goes in place of the stored one. */
export const OFFICIAL_SPEC_TABLE_MARKER = "<!--official-spec-table-->"

type ReviewInput = {
  subtitle?: string | null
  excerpt?: string | null
  seo_description?: string | null
  content_html?: string | null
  faq?: unknown
}

/**
 * Whether a comparison shows its body. When both chairs are in the official
 * spec ledger, the stored spec table is replaced by a ledger-built one and the
 * rest of the page (FAQ included) must only state ledger or price-source
 * figures; otherwise the original unsourced-claim check applies.
 */
export function comparisonReviewState(row: ReviewInput, slugA?: string | null, slugB?: string | null) {
  const content = row.content_html ?? ""
  const allowed = ledgerPairFigures(slugA, slugB)
  if (!allowed) {
    return { requiresSourceReview: comparisonNeedsSourceReview(row.subtitle, row.excerpt, row.seo_description, content), officialSpecTable: false, content }
  }
  const stripped = content.replace(/<table[\s\S]*?<\/table>/i, OFFICIAL_SPEC_TABLE_MARKER)
  const faqText = Array.isArray(row.faq) ? (row.faq as { q?: string; a?: string }[]).map((f) => `${f?.q ?? ""} ${f?.a ?? ""}`).join(" ") : ""
  return {
    requiresSourceReview: ledgerComparisonNeedsSourceReview(allowed, row.subtitle, row.excerpt, row.seo_description, stripped, faqText),
    officialSpecTable: true,
    content: stripped,
  }
}

/** Assemble one product's grounding data for the AI generator (admin/server). */
export async function loadProductInput(
  supabase: SupabaseClient,
  productId: string
): Promise<(ComparisonProductInput & { id: string; slug: string }) | null> {
  const { data: p } = await supabase
    .from("products")
    .select(
      "id, slug, name, price_usd, price_range, category, description_en, description_ko, chair_specs, brands(name)"
    )
    .eq("id", productId)
    .maybeSingle()
  if (!p) return null

  // Exclude hidden reviews (P1-3) from the pros/cons that feed comparison pages
  // and the AI generator. NOTE: comparisons already generated store their prose
  // in content_html — regenerate those to drop pros/cons from now-excluded rows.
  const [{ data: reviews }, { data: fitEvidence }] = await Promise.all([runPublicReviewQuery((applyFilter) => {
    let q = supabase
      .from("reviews")
      .select("summary_ko, scores, pros, cons")
      .eq("product_id", productId)
      .limit(12)
    if (applyFilter) q = q.eq("excluded", false)
    return q
  }), supabase.from("product_fit_evidence").select("field_key").eq("product_id", productId)])

  const rows = reviews ?? []
  const ratings = rows
    .map((r) => (r.scores as { overall?: number } | null)?.overall)
    .filter((n): n is number => typeof n === "number" && n > 0)
  const rating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null

  const uniq = (arr: string[], max: number) =>
    [...new Set(arr.map((s) => s.trim()).filter(Boolean))].slice(0, max)

  const prosFromReviews = uniq(rows.flatMap((r) => (r.pros as string[] | null) ?? []), 6)
  const consFromReviews = uniq(rows.flatMap((r) => (r.cons as string[] | null) ?? []), 6)
  const sampleReviews = uniq(
    rows.map((r) => String(r.summary_ko ?? "").replace(/\s+/g, " ").trim()).filter((s) => s.length > 40),
    6
  ).map((s) => (s.length > 320 ? s.slice(0, 320) + "…" : s))

  const brand =
    (Array.isArray(p.brands) ? p.brands[0]?.name : (p.brands as { name?: string } | null)?.name) ?? ""
  const priceLabel =
    p.price_usd != null ? `$${p.price_usd}` : (p.price_range as string | null) ?? "Price not specified"

  return {
    id: p.id as string,
    slug: p.slug as string,
    name: p.name as string,
    brand,
    priceLabel,
    category: (p.category as string) ?? "office",
    specs: filterChairSpecsByEvidence(
      p.chair_specs as Record<string, unknown> | null,
      new Set((fitEvidence ?? []).map((row) => row.field_key as string))
    ) ?? null,
    description: (p.description_en as string) || (p.description_ko as string) || "",
    rating,
    reviewCount: rows.length,
    prosFromReviews,
    consFromReviews,
    sampleReviews,
  }
}

export type PublicComparisonProduct = {
  slug: string
  name: string
  brand: string
  image: string | null
  imageAlt: string | null
}

export type PublicComparison = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  seo_title: string | null
  seo_description: string | null
  hero_image_url: string | null
  content_html: string
  tier: string | null
  faq: { q: string; a: string }[]
  published_at: string | null
  updated_at: string | null
  productA: PublicComparisonProduct | null
  productB: PublicComparisonProduct | null
  requiresSourceReview: boolean
  /** Both chairs are in the official spec ledger; render the ledger table at the marker. */
  officialSpecTable: boolean
}

async function loadPublicProduct(
  supabase: SupabaseClient,
  productId: string | null,
  verified = false
): Promise<PublicComparisonProduct | null> {
  if (!productId) return null
  const { data } = await supabase
    .from("products")
    .select("slug, name, thumbnail_url, brands(name), product_images(id, url, sort_order, is_thumbnail, alt, rights, model_status)")
    .eq("id", productId)
    .maybeSingle()
  if (!data) return null
  const brand =
    (Array.isArray(data.brands) ? data.brands[0]?.name : (data.brands as { name?: string } | null)?.name) ?? ""
  const images = Array.isArray(data.product_images)
    ? [...data.product_images]
        .filter((image) => verified ? isVerifiedComparisonImage(data.slug, image) : image.model_status !== "candidate" && image.rights !== "candidate")
        .sort((a, b) => Number(Boolean(b.is_thumbnail)) - Number(Boolean(a.is_thumbnail)) || a.sort_order - b.sort_order)
    : []
  const primaryImage = images[0]
  return {
    slug: data.slug as string,
    name: data.name as string,
    brand,
    image: (primaryImage?.url as string | undefined) ?? (verified ? null : (data.thumbnail_url as string | null)) ?? null,
    imageAlt: (primaryImage?.alt as string | null | undefined) ?? null,
  }
}

export async function getPublicComparison(
  supabase: SupabaseClient,
  slug: string
): Promise<PublicComparison | null> {
  const { data } = await supabase
    .from("comparisons")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  if (!data) return null

  const [productA, productB] = await Promise.all([
    loadPublicProduct(supabase, (data.product_a_id as string | null) ?? null, Boolean(getVerifiedComparisonPilot(slug))),
    loadPublicProduct(supabase, (data.product_b_id as string | null) ?? null, Boolean(getVerifiedComparisonPilot(slug))),
  ])
  const review = comparisonReviewState(data, productA?.slug, productB?.slug)
  const content = review.content

  return {
    slug: data.slug as string,
    title: data.title as string,
    subtitle: (data.subtitle as string | null) ?? null,
    excerpt: (data.excerpt as string | null) ?? null,
    seo_title: (data.seo_title as string | null) ?? null,
    seo_description: (data.seo_description as string | null) ?? null,
    hero_image_url: (data.hero_image_url as string | null) ?? null,
    content_html: content,
    tier: (data.tier as string | null) ?? null,
    faq: Array.isArray(data.faq)
      ? (data.faq as { q: string; a: string }[]).filter((f) => f && f.q && f.a)
      : [],
    published_at: (data.published_at as string | null) ?? null,
    updated_at: (data.updated_at as string | null) ?? null,
    productA,
    productB,
    requiresSourceReview: review.requiresSourceReview,
    officialSpecTable: review.officialSpecTable,
  }
}

export type ComparisonCard = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  hero_image_url: string | null
  tier: string | null
  requiresSourceReview?: boolean
}

export async function getComparisonCards(
  supabase: SupabaseClient
): Promise<ComparisonCard[]> {
  const { data } = await supabase
    .from("comparisons")
    .select("slug, title, subtitle, excerpt, hero_image_url, tier, featured, published_at, product_a_id, product_b_id, content_html, seo_description, faq")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200)
  const ids = [...new Set((data ?? []).flatMap((c) => [c.product_a_id, c.product_b_id]).filter(Boolean))]
  const { data: products } = ids.length ? await supabase.from("products").select("id, slug").in("id", ids) : { data: [] }
  const slugOf = new Map((products ?? []).map((p) => [p.id as string, p.slug as string]))
  return (await comparisonMedia(supabase, data ?? [])).map((c) => {
    const slugA = slugOf.get(c.product_a_id as string), slugB = slugOf.get(c.product_b_id as string)
    const allowed = ledgerPairFigures(slugA, slugB)
    const excerptHidden = allowed
      ? ledgerComparisonNeedsSourceReview(allowed, c.excerpt as string | null, c.subtitle as string | null)
      : comparisonNeedsSourceReview(c.excerpt as string | null, c.subtitle as string | null)
    return {
    requiresSourceReview: comparisonReviewState(c, slugA, slugB).requiresSourceReview,
    slug: c.slug as string,
    title: c.title as string,
    subtitle: (c.subtitle as string | null) ?? null,
    excerpt: excerptHidden ? neutralComparisonSummary() : (c.excerpt as string | null) ?? null,
    hero_image_url: (c.hero_image_url as string | null) ?? null,
    tier: (c.tier as string | null) ?? null,
    }
  })
}

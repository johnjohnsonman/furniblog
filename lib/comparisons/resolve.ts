import type { SupabaseClient } from "@supabase/supabase-js"
import type { ComparisonProductInput } from "@/lib/comparisons/generate"

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

  const { data: reviews } = await supabase
    .from("reviews")
    .select("summary_ko, scores, pros, cons")
    .eq("product_id", productId)
    .limit(12)

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
    specs: (p.chair_specs as Record<string, unknown> | null) ?? null,
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
  published_at: string | null
  updated_at: string | null
  productA: PublicComparisonProduct | null
  productB: PublicComparisonProduct | null
}

async function loadPublicProduct(
  supabase: SupabaseClient,
  productId: string | null
): Promise<PublicComparisonProduct | null> {
  if (!productId) return null
  const { data } = await supabase
    .from("products")
    .select("slug, name, thumbnail_url, brands(name)")
    .eq("id", productId)
    .maybeSingle()
  if (!data) return null
  const brand =
    (Array.isArray(data.brands) ? data.brands[0]?.name : (data.brands as { name?: string } | null)?.name) ?? ""
  return {
    slug: data.slug as string,
    name: data.name as string,
    brand,
    image: (data.thumbnail_url as string | null) ?? null,
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
    loadPublicProduct(supabase, (data.product_a_id as string | null) ?? null),
    loadPublicProduct(supabase, (data.product_b_id as string | null) ?? null),
  ])

  return {
    slug: data.slug as string,
    title: data.title as string,
    subtitle: (data.subtitle as string | null) ?? null,
    excerpt: (data.excerpt as string | null) ?? null,
    seo_title: (data.seo_title as string | null) ?? null,
    seo_description: (data.seo_description as string | null) ?? null,
    hero_image_url: (data.hero_image_url as string | null) ?? null,
    content_html: (data.content_html as string) ?? "",
    tier: (data.tier as string | null) ?? null,
    published_at: (data.published_at as string | null) ?? null,
    updated_at: (data.updated_at as string | null) ?? null,
    productA,
    productB,
  }
}

export type ComparisonCard = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  hero_image_url: string | null
  tier: string | null
}

export async function getComparisonCards(
  supabase: SupabaseClient
): Promise<ComparisonCard[]> {
  const { data } = await supabase
    .from("comparisons")
    .select("slug, title, subtitle, excerpt, hero_image_url, tier, featured, published_at")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200)
  return (data ?? []).map((c) => ({
    slug: c.slug as string,
    title: c.title as string,
    subtitle: (c.subtitle as string | null) ?? null,
    excerpt: (c.excerpt as string | null) ?? null,
    hero_image_url: (c.hero_image_url as string | null) ?? null,
    tier: (c.tier as string | null) ?? null,
  }))
}

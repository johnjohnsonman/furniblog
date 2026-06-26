import { createPublicServerClient } from "@/lib/supabase/public-server"
import { shuffle } from "@/lib/utils/shuffle"
import type { NewsItem } from "@/components/news/news-card"

// Pull a wider recent pool, then show a random slice so the homepage feels
// fresh on each visit (homepage is force-dynamic, so this reshuffles per load).
function poolSize(limit: number): number {
  return Math.min(60, Math.max(limit * 6, limit))
}

export type HomeReview = {
  id: string
  summary: string
  source: string | null
  productName: string
  productSlug: string
  productImage: string | null
  brandName: string | null
}

export type HomeChairpedia = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  heroImage: string | null
}

export type HomeVideo = {
  id: string
  youtubeId: string
  title: string
  thumbnailUrl: string | null
  brand: string | null
  productSlug: string | null
  productName: string | null
}

type BrandRel = { name?: string | null } | Array<{ name?: string | null }> | null
type ProductRel =
  | { slug?: string | null; name?: string | null; thumbnail_url?: string | null; brands?: BrandRel }
  | Array<{ slug?: string | null; name?: string | null; thumbnail_url?: string | null; brands?: BrandRel }>
  | null

function first<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null
  return Array.isArray(rel) ? (rel[0] ?? null) : rel
}

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/** Newest curated reviews with their product, for the homepage feed. */
export async function getLatestReviews(limit = 9): Promise<HomeReview[]> {
  if (!isConfigured()) return []
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("reviews")
      .select("id, summary_ko, source, products!inner(slug, name, thumbnail_url, brands(name))")
      .order("created_at", { ascending: false })
      .limit(poolSize(limit))

    const items = (data ?? [])
      .map((row): HomeReview | null => {
        const product = first(row.products as ProductRel)
        if (!product?.slug || !product?.name) return null
        return {
          id: row.id as string,
          summary: (row.summary_ko as string | null)?.trim() || "",
          source: (row.source as string | null) ?? null,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.thumbnail_url?.trim() || null,
          brandName: first(product.brands)?.name?.trim() || null,
        }
      })
      .filter((r): r is HomeReview => r !== null)
    return shuffle(items).slice(0, limit)
  } catch {
    return []
  }
}

/** Newest published videos for the homepage feed. */
export async function getLatestVideos(limit = 8): Promise<HomeVideo[]> {
  if (!isConfigured()) return []
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("videos")
      .select("id, youtube_id, title, thumbnail_url, brand, products(slug, name)")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(poolSize(limit))

    const items = (data ?? [])
      .map((row): HomeVideo | null => {
        const youtubeId = row.youtube_id as string | null
        if (!youtubeId) return null
        const product = first(row.products as ProductRel)
        return {
          id: row.id as string,
          youtubeId,
          title: (row.title as string | null)?.trim() || "Untitled video",
          thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
          brand: (row.brand as string | null) ?? null,
          productSlug: product?.slug ?? null,
          productName: product?.name ?? null,
        }
      })
      .filter((v): v is HomeVideo => v !== null)
    return shuffle(items).slice(0, limit)
  } catch {
    return []
  }
}

/** Published Chairpedia entries (with hero images) for the homepage showcase. */
export async function getHomeChairpedia(limit = 9): Promise<HomeChairpedia[]> {
  if (!isConfigured()) return []
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("chairpedia")
      .select("slug, title, subtitle, excerpt, hero_image_url, featured, published_at")
      .eq("status", "published")
      .not("hero_image_url", "is", null)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit)
    return (data ?? []).map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      subtitle: (r.subtitle as string | null) ?? null,
      excerpt: (r.excerpt as string | null) ?? null,
      heroImage: (r.hero_image_url as string | null) ?? null,
    }))
  } catch {
    return []
  }
}

/** Newest published news for the homepage feed. */
export async function getLatestNews(limit = 4): Promise<NewsItem[]> {
  if (!isConfigured()) return []
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("news")
      .select(
        "id, slug, url, title, source_name, image_url, published_at, brand, summary"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit)
    return (data ?? []) as NewsItem[]
  } catch {
    return []
  }
}

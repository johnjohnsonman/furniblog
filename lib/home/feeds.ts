import { createPublicServerClient } from "@/lib/supabase/public-server"
import type { NewsItem } from "@/components/news/news-card"

export type HomeReview = {
  id: string
  summary: string
  source: string | null
  productName: string
  productSlug: string
  brandName: string | null
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
  | { slug?: string | null; name?: string | null; brands?: BrandRel }
  | Array<{ slug?: string | null; name?: string | null; brands?: BrandRel }>
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
      .select("id, summary_ko, source, products!inner(slug, name, brands(name))")
      .order("created_at", { ascending: false })
      .limit(limit)

    return (data ?? [])
      .map((row): HomeReview | null => {
        const product = first(row.products as ProductRel)
        if (!product?.slug || !product?.name) return null
        return {
          id: row.id as string,
          summary: (row.summary_ko as string | null)?.trim() || "",
          source: (row.source as string | null) ?? null,
          productName: product.name,
          productSlug: product.slug,
          brandName: first(product.brands)?.name?.trim() || null,
        }
      })
      .filter((r): r is HomeReview => r !== null)
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
      .limit(limit)

    return (data ?? [])
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

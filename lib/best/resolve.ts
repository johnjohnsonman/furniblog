import { createPublicServerClient } from "@/lib/supabase/public-server"
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link"
import { buildAffiliateUrl } from "@/lib/affiliate/links"
import {
  products as staticProducts,
  bestLists as staticLists,
  listProductMap,
} from "@/lib/data"

export type BestItem = {
  slug: string
  name: string
  brand: string
  brandSlug: string | null
  image: string | null
  price: string
  description: string | null
  bestFor: string | null
  pros: string[]
  cons: string[]
  amazonUrl: string | null
  blurb: string | null
}

export type ResolvedBestList = {
  slug: string
  title: string
  intro: string | null
  heroImage: string | null
  items: BestItem[]
}

export type BestListCard = {
  slug: string
  title: string
  heroImage: string | null
  count: number
}

function priceStr(usd: number | null, range: string | null): string {
  if (usd) return `$${usd.toLocaleString()}`
  return range || "Price on request"
}

type Rel = { name?: string | null; slug?: string | null } | Array<{ name?: string | null; slug?: string | null }> | null
function first<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null
  return Array.isArray(rel) ? (rel[0] ?? null) : rel
}

// ---- Index (the /best grid + home) ----

export async function getBestListCards(): Promise<BestListCard[]> {
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("best_lists")
      .select("slug, title, hero_image_url, best_list_items(count)")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
    if (error) throw error
    if (data && data.length > 0) {
      return data.map((l) => {
        const items = l.best_list_items as { count: number }[] | null
        return {
          slug: l.slug as string,
          title: l.title as string,
          heroImage: (l.hero_image_url as string | null) ?? null,
          count: items?.[0]?.count ?? 0,
        }
      })
    }
  } catch {
    // fall through to static
  }
  return staticLists.map((l) => ({
    slug: l.id,
    title: l.title,
    heroImage: null,
    count: l.count,
  }))
}

// ---- Detail (/best/[slug]) ----

function staticResolved(slug: string): ResolvedBestList | null {
  const list = staticLists.find((l) => l.id === slug)
  if (!list) return null
  const ids = listProductMap[slug] ?? []
  const items: BestItem[] = ids
    .map((id) => staticProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      slug: p.id,
      name: p.name,
      brand: p.brand,
      brandSlug: p.brandId ?? null,
      image: p.image ?? null,
      price: p.price ?? "Price on request",
      description: p.description ?? null,
      bestFor: p.bestFor ?? null,
      pros: p.pros ?? [],
      cons: p.cons ?? [],
      amazonUrl: p.amazonUrl ? buildAffiliateUrl(p.amazonUrl, "amazon", "US") : null,
      blurb: null,
    }))
  return { slug, title: list.title, intro: null, heroImage: null, items }
}

export async function getResolvedBestList(slug: string): Promise<ResolvedBestList | null> {
  try {
    const supabase = createPublicServerClient()
    const { data, error } = await supabase
      .from("best_lists")
      .select(
        "slug, title, intro, hero_image_url, best_list_items(rank, blurb, products(slug, name, thumbnail_url, price_usd, price_range, description_en, best_for, pros, cons, brands(slug, name)))"
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (error) throw error
    if (data) {
      const rawItems = (data.best_list_items as unknown[] | null) ?? []
      const items: BestItem[] = rawItems
        .map((raw) => {
          const it = raw as {
            rank?: number
            blurb?: string | null
            products?: unknown
          }
          const p = first(it.products as
            | {
                slug?: string
                name?: string
                thumbnail_url?: string | null
                price_usd?: number | null
                price_range?: string | null
                description_en?: string | null
                best_for?: string | null
                pros?: string[] | null
                cons?: string[] | null
                brands?: Rel
              }
            | Array<{
                slug?: string
                name?: string
                thumbnail_url?: string | null
                price_usd?: number | null
                price_range?: string | null
                description_en?: string | null
                best_for?: string | null
                pros?: string[] | null
                cons?: string[] | null
                brands?: Rel
              }>)
          if (!p?.slug || !p?.name) return null
          const brand = first(p.brands)
          const aff = resolveAmazonAffiliateLink(p.slug, p.name)
          return {
            rank: it.rank ?? 0,
            item: {
              slug: p.slug,
              name: p.name,
              brand: brand?.name ?? "",
              brandSlug: brand?.slug ?? null,
              image: p.thumbnail_url ?? null,
              price: priceStr(p.price_usd ?? null, p.price_range ?? null),
              description: p.description_en ?? null,
              bestFor: p.best_for ?? null,
              pros: p.pros ?? [],
              cons: p.cons ?? [],
              amazonUrl: aff?.url ?? null,
              blurb: it.blurb ?? null,
            } as BestItem,
          }
        })
        .filter((x): x is { rank: number; item: BestItem } => x !== null)
        .sort((a, b) => a.rank - b.rank)
        .map((x) => x.item)

      // Use DB content; if the curated list is still empty, fall back to the
      // old static picks so the page is never blank.
      if (items.length > 0) {
        return {
          slug: data.slug as string,
          title: data.title as string,
          intro: (data.intro as string | null) ?? null,
          heroImage: (data.hero_image_url as string | null) ?? null,
          items,
        }
      }
      const fallback = staticResolved(slug)
      return {
        slug: data.slug as string,
        title: data.title as string,
        intro: (data.intro as string | null) ?? null,
        heroImage: (data.hero_image_url as string | null) ?? null,
        items: fallback?.items ?? [],
      }
    }
  } catch {
    // fall through to static
  }
  return staticResolved(slug)
}

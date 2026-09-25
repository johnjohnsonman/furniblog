import { createPublicServerClient } from "@/lib/supabase/public-server"
import { loadReviewSitemapPages } from "@/lib/reviews/sitemap-pages"
import { isNewsSearchable } from "@/lib/seo/search-visibility"
import { bestLists } from "@/lib/data"
import { SITE_URL } from "@/lib/site-config"
import { isThinReview, isThinTrialPage, storeSearchPolicy, thinCityPaths } from "@/lib/seo/thin-pages"

/** Sitemap sections, listed in the sitemap index in this order. */
export const SITEMAP_SECTIONS = ["products", "chairpedia", "compare", "brands", "blog", "other", "stores", "reviews"] as const
export type SitemapSection = (typeof SITEMAP_SECTIONS)[number]

export type SitemapEntry = {
  url: string
  lastModified?: Date
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority: number
}

export function isSitemapSection(value: string): value is SitemapSection {
  return (SITEMAP_SECTIONS as readonly string[]).includes(value)
}

function url(path: string, lastModified: Date | undefined, changeFrequency: SitemapEntry["changeFrequency"], priority: number): SitemapEntry {
  return { url: `${SITE_URL}${path}`, ...(lastModified ? { lastModified } : {}), changeFrequency, priority }
}

function toDate(value: unknown): Date | undefined {
  if (typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d
  }
  return undefined
}

const isConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

function staticPages(): SitemapEntry[] {
  return [
    url("", undefined, "daily", 1),
    url("/products", undefined, "daily", 0.9),
    url("/chairpedia", undefined, "daily", 0.9),
    url("/blog", undefined, "daily", 0.7),
    url("/compare", undefined, "weekly", 0.7),
    url("/chair", undefined, "weekly", 0.6),
    url("/chair-fit-calculator", undefined, "weekly", 0.8),
    url("/reviews", undefined, "daily", 0.9),
    url("/videos", undefined, "daily", 0.8),
    url("/news", undefined, "daily", 0.8),
    url("/brands", undefined, "weekly", 0.7),
    url("/best", undefined, "weekly", 0.8),
    url("/best/best-chairs-to-buy", undefined, "weekly", 0.9),
    url("/designers", undefined, "monthly", 0.5),
    url("/gallery", undefined, "monthly", 0.5),
    url("/about", undefined, "yearly", 0.3),
    url("/contact", undefined, "yearly", 0.3),
    url("/editorial-policy", undefined, "yearly", 0.2),
    url("/affiliate-disclosure", undefined, "yearly", 0.2),
    url("/privacy", undefined, "yearly", 0.2),
    url("/terms", undefined, "yearly", 0.2),
  ]
}

const STORE_GUIDES = [
  "/stores/guides/best-ergonomic-chair-showrooms-singapore",
  "/stores/guides/where-to-try-herman-miller-chairs-singapore",
  "/stores/guides/where-to-try-office-chairs-singapore",
]

async function products(): Promise<SitemapEntry[]> {
  if (!isConfigured()) return []
  const { data } = await createPublicServerClient().from("products").select("slug, updated_at").eq("published", true).eq("track", "chair")
  return (data ?? []).filter(p => p.slug).map(p => url(`/products/${p.slug}`, toDate(p.updated_at), "weekly", 0.8))
}

async function chairpedia(): Promise<SitemapEntry[]> {
  if (!isConfigured()) return []
  const { data } = await createPublicServerClient().from("chairpedia").select("slug, updated_at").eq("status", "published").limit(5000)
  return (data ?? []).filter(c => c.slug).map(c => url(`/chairpedia/${c.slug}`, toDate(c.updated_at), "weekly", 0.8))
}

async function compare(): Promise<SitemapEntry[]> {
  if (!isConfigured()) return []
  try {
    // Comparisons table may not exist before migration 041.
    const { data } = await createPublicServerClient().from("comparisons").select("slug, updated_at").eq("status", "published").limit(5000)
    return (data ?? []).filter(c => c.slug).map(c => url(`/compare/${c.slug}`, toDate(c.updated_at), "weekly", 0.7))
  } catch { return [] }
}

async function brands(): Promise<SitemapEntry[]> {
  if (!isConfigured()) return []
  const { data } = await createPublicServerClient().from("brands").select("slug")
  return (data ?? []).filter(b => b.slug).map(b => url(`/brands/${b.slug}`, undefined, "weekly", 0.6))
}

async function blog(): Promise<SitemapEntry[]> {
  if (!isConfigured()) return []
  try {
    const { data } = await createPublicServerClient().from("blog_posts").select("slug, updated_at").eq("status", "published").limit(5000)
    return (data ?? []).filter(b => b.slug).map(b => url(`/blog/${b.slug}`, toDate(b.updated_at), "weekly", 0.7))
  } catch { return [] }
}

/** Static pages, best lists (code + DB) and searchable news. */
async function other(): Promise<SitemapEntry[]> {
  const entries = [...staticPages(), ...bestLists.map(list => url(`/best/${list.id}`, undefined, "weekly", 0.7))]
  if (!isConfigured()) return entries
  const db = createPublicServerClient()
  const { data: news } = await db.from("news").select("slug, published_at, url, summary, why_it_matters").eq("status", "published").limit(5000)
  for (const n of news ?? []) if (n.slug && isNewsSearchable(n)) entries.push(url(`/news/${n.slug}`, toDate(n.published_at), "monthly", 0.6))
  try {
    // DB-curated best lists; code bestLists above covers legacy ids.
    const { data: dbLists } = await db.from("best_lists").select("slug, updated_at").eq("status", "published").limit(200)
    const known = new Set([...bestLists.map(l => l.id), "best-chairs-to-buy"])
    for (const l of dbLists ?? []) if (l.slug && !known.has(l.slug)) entries.push(url(`/best/${l.slug}`, toDate(l.updated_at), "weekly", 0.7))
  } catch { /* best_lists table may not exist yet */ }
  return entries
}

async function stores(): Promise<SitemapEntry[]> {
  const entries = STORE_GUIDES.map(path => url(path, undefined, "weekly", 0.8))
  if (process.env.SHOWROOMS_ENABLED !== "true") return entries
  const { getPublicStores, getStoreCatalog, enrichStore } = await import("@/lib/showrooms/server")
  const result = await getPublicStores()
  if (result.unavailable) return entries
  const { locationPages } = await import("@/lib/showrooms/locations")
  const { trialPages } = await import("@/lib/showrooms/trial-pages")
  entries.push(url("/stores/locations", undefined, "weekly", 0.7))
  // Thin pages stay public but are left out of the sitemap (see lib/seo/thin-pages.ts).
  const thinCities = thinCityPaths(result.stores)
  for (const path of locationPages(result.stores)) if (!thinCities.has(path)) entries.push(url(path, undefined, "weekly", 0.7))
  const catalog = await getStoreCatalog()
  for (const page of trialPages(result.stores.map(store => enrichStore(store, catalog)))) if (!isThinTrialPage(page)) entries.push(url(page.path, undefined, "weekly", 0.7))
  entries.push(url("/stores", undefined, "weekly", 0.7))
  for (const store of result.stores) if (storeSearchPolicy(result.stores, store.slug) === "index") entries.push(url(`/stores/${store.slug}`, toDate(store.updated_at), "weekly", 0.6))
  return entries
}

async function reviews(): Promise<SitemapEntry[]> {
  if (!isConfigured()) return []
  const db = createPublicServerClient()
  type ReviewRow = { id: string; created_at: string | null; summary_ko: string | null; pros: unknown; cons: unknown }
  const rows = await loadReviewSitemapPages<ReviewRow>((after, size) => {
    // Search-visibility policy: only reviews with a recorded original source
    // earn a sitemap entry (their pages are noindexed otherwise).
    let q = db.from("reviews").select("id, created_at, summary_ko, pros, cons").eq("excluded", false).not("source_url", "is", null).order("id").limit(size)
    if (after) q = q.gt("id", after)
    return q
  }).catch((error) => {
    console.error("Review sitemap query failed:", error instanceof Error ? error.message : "Unknown error")
    return []
  })
  return rows.filter(r => r.id && !isThinReview(r)).map(r => url(`/reviews/${r.id}`, toDate(r.created_at), "monthly", 0.6))
}

const LOADERS: Record<SitemapSection, () => Promise<SitemapEntry[]>> = { products, chairpedia, compare, brands, blog, other, stores, reviews }

export async function loadSitemapSection(section: SitemapSection): Promise<SitemapEntry[]> {
  try {
    return await LOADERS[section]()
  } catch (error) {
    console.error(`Sitemap section ${section} failed:`, error instanceof Error ? error.message : "Unknown error")
    return section === "other" ? staticPages() : []
  }
}

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")

export function renderUrlset(entries: SitemapEntry[]): string {
  const body = entries.map(e => `<url>\n<loc>${escapeXml(e.url)}</loc>\n${e.lastModified ? `<lastmod>${e.lastModified.toISOString()}</lastmod>\n` : ""}<changefreq>${e.changeFrequency}</changefreq>\n<priority>${e.priority}</priority>\n</url>`).join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

export function sectionSitemapUrl(section: SitemapSection): string {
  return `${SITE_URL}/sitemaps/${section}.xml`
}

export function renderSitemapIndex(sections: readonly SitemapSection[] = SITEMAP_SECTIONS): string {
  const body = sections.map(s => `<sitemap>\n<loc>${escapeXml(sectionSitemapUrl(s))}</loc>\n</sitemap>`).join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}

import type { MetadataRoute } from "next"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { bestLists } from "@/lib/data"

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://furniblog.vercel.app"

function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

function url(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  return { url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority }
}

function toDate(value: unknown): Date {
  if (typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date()
}

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    url("", now, "daily", 1),
    url("/products", now, "daily", 0.9),
    url("/reviews", now, "daily", 0.9),
    url("/videos", now, "daily", 0.8),
    url("/news", now, "daily", 0.8),
    url("/brands", now, "weekly", 0.7),
    url("/best", now, "weekly", 0.8),
    url("/designers", now, "monthly", 0.5),
    url("/gallery", now, "monthly", 0.5),
    url("/about", now, "yearly", 0.3),
    url("/contact", now, "yearly", 0.3),
    url("/editorial-policy", now, "yearly", 0.2),
    url("/affiliate-disclosure", now, "yearly", 0.2),
    url("/privacy", now, "yearly", 0.2),
    url("/terms", now, "yearly", 0.2),
  ]

  const bestPages: MetadataRoute.Sitemap = bestLists.map((list) =>
    url(`/best/${list.id}`, now, "weekly", 0.7)
  )

  if (!isConfigured()) return [...staticPages, ...bestPages]

  const dynamicPages: MetadataRoute.Sitemap = []
  try {
    const supabase = createPublicServerClient()
    const [products, reviews, news, brands] = await Promise.all([
      supabase
        .from("products")
        .select("slug")
        .eq("published", true)
        .eq("track", "chair"),
      supabase.from("reviews").select("id, created_at").limit(5000),
      supabase
        .from("news")
        .select("slug, published_at")
        .eq("status", "published")
        .limit(5000),
      supabase.from("brands").select("slug"),
    ])

    for (const p of products.data ?? []) {
      if (p.slug) dynamicPages.push(url(`/products/${p.slug}`, now, "weekly", 0.8))
    }
    for (const r of reviews.data ?? []) {
      if (r.id)
        dynamicPages.push(
          url(`/reviews/${r.id}`, toDate(r.created_at), "monthly", 0.6)
        )
    }
    for (const n of news.data ?? []) {
      if (n.slug)
        dynamicPages.push(
          url(`/news/${n.slug}`, toDate(n.published_at), "monthly", 0.6)
        )
    }
    for (const b of brands.data ?? []) {
      if (b.slug) dynamicPages.push(url(`/brands/${b.slug}`, now, "weekly", 0.6))
    }
  } catch {
    // On any DB error, still return the static + best pages.
  }

  return [...staticPages, ...bestPages, ...dynamicPages]
}

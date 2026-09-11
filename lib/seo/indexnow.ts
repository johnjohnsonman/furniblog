// IndexNow ping for URLs published or updated recently. Consumed by Bing,
// Yandex, Seznam and Naver — currently the site's strongest search channels.
// The key is not a secret; it must match the file served at /<key>.txt.
import { createPublicServerClient } from "@/lib/supabase/public-server"

const KEY = "4f43f721b9b58ffddf6bba77f7fb176c"
const HOST = "www.furniblog.com"

/** Collect public URLs changed in the last `hours`, then ping IndexNow. */
export async function pingIndexNowForRecentChanges(hours = 26): Promise<{ urls: number; status: number | null }> {
  const since = new Date(Date.now() - hours * 3600_000).toISOString()
  const urls = new Set<string>()
  try {
    const supabase = createPublicServerClient()
    const [blog, chairpedia, news, comparisons, products, best] = await Promise.all([
      supabase.from("blog_posts").select("slug").eq("status", "published").gte("updated_at", since).limit(500),
      supabase.from("chairpedia").select("slug").eq("status", "published").gte("updated_at", since).limit(500),
      supabase.from("news").select("slug").eq("status", "published").gte("published_at", since).limit(500),
      supabase.from("comparisons").select("slug").eq("status", "published").gte("updated_at", since).limit(500),
      supabase.from("products").select("slug").eq("published", true).eq("track", "chair").gte("updated_at", since).limit(500),
      supabase.from("best_lists").select("slug").eq("status", "published").gte("updated_at", since).limit(200),
    ])
    for (const b of blog.data ?? []) if (b.slug) urls.add(`https://${HOST}/blog/${b.slug}`)
    for (const c of chairpedia.data ?? []) if (c.slug) urls.add(`https://${HOST}/chairpedia/${c.slug}`)
    for (const n of news.data ?? []) if (n.slug) urls.add(`https://${HOST}/news/${n.slug}`)
    for (const c of comparisons.data ?? []) if (c.slug) urls.add(`https://${HOST}/compare/${c.slug}`)
    for (const p of products.data ?? []) if (p.slug) urls.add(`https://${HOST}/products/${p.slug}`)
    for (const l of best.data ?? []) if (l.slug) urls.add(`https://${HOST}/best/${l.slug}`)
  } catch (e) {
    console.warn("[indexnow] collect failed:", (e as Error).message)
  }
  if (!urls.size) return { urls: 0, status: null }
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: [...urls].slice(0, 10000),
      }),
      signal: AbortSignal.timeout(30000),
    })
    console.log(`[indexnow] pinged ${urls.size} urls → ${res.status}`)
    return { urls: urls.size, status: res.status }
  } catch (e) {
    console.warn("[indexnow] ping failed:", (e as Error).message)
    return { urls: urls.size, status: null }
  }
}

import { cache } from "react"
import { unstable_cache } from "next/cache"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { BLOG_DUPLICATE_LOSERS } from "@/lib/seo/search-visibility"
import { enrichBlogPosts } from "@/lib/blog/media-server"
import { selectRelatedBlogPosts, toRelatedBlogIndex, type RelatedBlogPost } from "./related-blog"

const getPublishedPosts = cache(unstable_cache(async (): Promise<RelatedBlogPost[]> => {
  const db = createPublicServerClient()
  const posts: RelatedBlogPost[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("blog_posts").select("slug,title,content_html,hero_image_url,published_at")
      .eq("status", "published").order("slug").range(from, from + 999)
    if (error) throw error
    posts.push(...(data as RelatedBlogPost[]).map(toRelatedBlogIndex))
    if (data.length < 1000) return posts.filter(post => !BLOG_DUPLICATE_LOSERS.has(post.slug))
  }
}, ["public-blog-relationships-v1"], { revalidate: 300 }))

export async function getProductRelatedBlogPosts(productSlug: string, limit = 3): Promise<RelatedBlogPost[]> {
  if (!productSlug || !Number.isFinite(limit) || limit <= 0) return []
  const count = Math.min(12, Math.floor(limit))
  if (!count) return []
  try {
    const db = createPublicServerClient()
    const { data: product, error } = await db.from("products").select("id").eq("slug", productSlug).eq("published", true).maybeSingle()
    if (error) throw error
    if (!product) return []
    const [{ data: guides, error: guideError }, posts] = await Promise.all([
      db.from("chairpedia").select("slug").eq("product_id", product.id).eq("status", "published"),
      getPublishedPosts(),
    ])
    if (guideError) throw guideError
    const guideSlugs = (guides ?? []).map(row => row.slug)
    const candidates = selectRelatedBlogPosts(posts, productSlug, guideSlugs, Math.max(12, count * 3))
    if (!candidates.length) return []
    // Always recheck publication, relationships and current display fields.
    // A cached index must never expose a withdrawn article or stale title/image.
    const { data: current, error: currentError } = await db.from("blog_posts")
      .select("slug,title,content_html,hero_image_url,published_at")
      .eq("status", "published").in("slug", candidates.map(post => post.slug))
    if (currentError) throw currentError
    return await enrichBlogPosts(selectRelatedBlogPosts(
      ((current ?? []) as RelatedBlogPost[]).filter(post => !BLOG_DUPLICATE_LOSERS.has(post.slug)), productSlug, guideSlugs, count))
  } catch (error) {
    console.error("Related blog lookup failed:", error instanceof Error ? error.message : "Unknown error")
    return []
  }
}

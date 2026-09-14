import { createPublicServerClient } from "@/lib/supabase/public-server"
import { enrichBlogMedia, linkedProductSlugs, linkedChairpediaSlugs, type MediaPost, type BlogProductMedia } from "./media"

/** Batch lookup shared by existing articles, cards and new drafts. */
export async function enrichBlogPosts<T extends MediaPost>(posts: T[]): Promise<T[]> {
  const empty = posts.filter(p => !/<img\b/i.test(p.content_html))
  const slugs = [...new Set(empty.flatMap(p => linkedProductSlugs(p.content_html)))]
  const guides = [...new Set(empty.flatMap(p => linkedChairpediaSlugs(p.content_html)))]
  let products: BlogProductMedia[] = []
  if (slugs.length || guides.length) {
    const db = createPublicServerClient()
    const { data: guideRows, error: guideError } = guides.length
      ? await db.from("chairpedia").select("slug,product_id").eq("status", "published").in("slug", guides)
      : { data: [], error: null }
    if (guideError) console.error("Blog guide media lookup failed:", guideError.message)
    const ids = [...new Set((guideRows ?? []).map(row => row.product_id).filter((id): id is string => !!id))]
    const filters = [slugs.length ? `slug.in.(${slugs.join(",")})` : "", ids.length ? `id.in.(${ids.join(",")})` : ""].filter(Boolean)
    if (filters.length) {
      const { data, error } = await db.from("products")
        .select("id,slug,name,product_images(url,alt,sort_order,model_status)")
        .eq("published", true).or(filters.join(","))
      if (error) console.error("Blog media lookup failed:", error.message)
      else products = (data ?? []).map(product => ({
        slug: product.slug, name: product.name,
        chairpediaSlugs: (guideRows ?? []).filter(row => row.product_id === product.id).map(row => row.slug),
        images: (product.product_images ?? [])
          .filter(image => image.model_status === "verified")
          .sort((a, b) => a.sort_order - b.sort_order),
      }))
    }
  }
  return posts.map(post => enrichBlogMedia(post, products))
}

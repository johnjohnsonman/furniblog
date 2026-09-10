import { createPublicServerClient } from "@/lib/supabase/public-server"

export type BrandGuide = { slug: string; title: string }

export async function getPublishedBrandGuides(productSlugs: string[]): Promise<BrandGuide[]> {
  const slugs = [...new Set(productSlugs.filter(Boolean))]
  if (slugs.length === 0) return []
  try {
    const { data, error } = await createPublicServerClient()
      .from("chairpedia")
      .select("slug,title,products!inner(slug)")
      .in("products.slug", slugs)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("slug", { ascending: true })
      .limit(6)
    if (error) {
      console.error("Failed to load brand guides:", error.message)
      return []
    }
    return (data ?? []).filter(row => row.slug && row.title).map(row => ({ slug: row.slug, title: row.title }))
  } catch {
    return []
  }
}

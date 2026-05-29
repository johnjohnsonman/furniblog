import type { SupabaseClient } from "@supabase/supabase-js"

export type VideoFilterChair = {
  id: string
  slug: string
  name: string
}

export type VideoFilterOptions = {
  brands: string[]
  chairs: VideoFilterChair[]
}

type VideoFilterRow = {
  brand: string | null
  chair_id: string | null
  products?:
    | { slug?: string | null; name?: string | null }
    | Array<{ slug?: string | null; name?: string | null }>
    | null
}

/** Load all distinct brands/chairs from published videos (paginated, no 5-item cap). */
export async function fetchVideoFilterOptions(
  supabase: SupabaseClient
): Promise<VideoFilterOptions> {
  const brands = new Set<string>()
  const chairs = new Map<string, VideoFilterChair>()

  const batchSize = 1000
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from("videos")
      .select("brand, chair_id, products(slug, name)")
      .eq("status", "published")
      .range(offset, offset + batchSize - 1)

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as VideoFilterRow[]
    if (rows.length === 0) break

    for (const row of rows) {
      if (row.brand?.trim()) brands.add(row.brand.trim())

      const chairId = row.chair_id
      if (!chairId) continue
      const product = Array.isArray(row.products) ? row.products[0] : row.products
      if (!product?.slug || !product?.name) continue
      chairs.set(chairId, {
        id: chairId,
        slug: product.slug,
        name: product.name,
      })
    }

    if (rows.length < batchSize) break
    offset += batchSize
  }

  return {
    brands: [...brands].sort((a, b) => a.localeCompare(b)),
    chairs: [...chairs.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }
}

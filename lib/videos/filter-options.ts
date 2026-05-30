import type { SupabaseClient } from "@supabase/supabase-js"

export type VideoFilterChair = {
  id: string
  slug: string
  name: string
  count: number
}

export type VideoFilterBrand = {
  name: string
  count: number
}

export type VideoFilterOptions = {
  total: number
  brands: VideoFilterBrand[]
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
  const brandCounts = new Map<string, number>()
  const chairs = new Map<string, VideoFilterChair>()
  let total = 0

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
      total += 1

      const brand = row.brand?.trim()
      if (brand) brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1)

      const chairId = row.chair_id
      if (!chairId) continue
      const product = Array.isArray(row.products) ? row.products[0] : row.products
      if (!product?.slug || !product?.name) continue

      const existing = chairs.get(chairId)
      if (existing) {
        existing.count += 1
      } else {
        chairs.set(chairId, {
          id: chairId,
          slug: product.slug,
          name: product.name,
          count: 1,
        })
      }
    }

    if (rows.length < batchSize) break
    offset += batchSize
  }

  return {
    total,
    brands: [...brandCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    // Chairs sorted by video count desc (most-covered models first), then name.
    chairs: [...chairs.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    ),
  }
}

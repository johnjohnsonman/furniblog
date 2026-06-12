import type { SupabaseClient } from "@supabase/supabase-js"

export type NewsFilterBrand = {
  name: string
  count: number
}

export type NewsFilterOptions = {
  total: number
  brands: NewsFilterBrand[]
}

type NewsFilterRow = {
  brand: string | null
}

/** Load all distinct brands from published news with per-brand counts (paginated). */
export async function fetchNewsFilterOptions(
  supabase: SupabaseClient
): Promise<NewsFilterOptions> {
  const brandCounts = new Map<string, number>()
  let total = 0

  const batchSize = 1000
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from("news")
      .select("brand")
      .eq("status", "published")
      .range(offset, offset + batchSize - 1)

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as NewsFilterRow[]
    if (rows.length === 0) break

    for (const row of rows) {
      total += 1
      const brand = row.brand?.trim()
      if (brand) brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1)
    }

    if (rows.length < batchSize) break
    offset += batchSize
  }

  return {
    total,
    brands: [...brandCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  }
}

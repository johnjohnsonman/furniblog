import type { SupabaseClient } from "@supabase/supabase-js"

/** Lowercased brand name -> best available brand image (hero, falling back to logo). */
export type BrandImageMap = Map<string, string>

type BrandImageRow = {
  name: string | null
  hero_image_url: string | null
  logo_url: string | null
}

/**
 * Load a map of brand name -> image, used as a reliable thumbnail fallback for
 * news articles when no real article image is available.
 */
export async function loadBrandImages(
  supabase: SupabaseClient
): Promise<BrandImageMap> {
  const { data, error } = await supabase
    .from("brands")
    .select("name, hero_image_url, logo_url")

  if (error) throw new Error(error.message)

  const map: BrandImageMap = new Map()
  for (const row of (data ?? []) as BrandImageRow[]) {
    const name = row.name?.trim().toLowerCase()
    if (!name) continue
    const img = row.hero_image_url?.trim() || row.logo_url?.trim() || ""
    if (img) map.set(name, img)
  }
  return map
}

/** Pick a brand's fallback image (case-insensitive), or null if none. */
export function pickBrandImage(
  map: BrandImageMap,
  brand: string | null
): string | null {
  if (!brand) return null
  return map.get(brand.trim().toLowerCase()) ?? null
}

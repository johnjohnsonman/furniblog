import type { SupabaseClient } from "@supabase/supabase-js"
import { usableImageUrl } from "@/lib/blog/media"
export async function comparisonMedia<T extends { hero_image_url: string | null; product_a_id?: string | null; product_b_id?: string | null }>(db: SupabaseClient, rows: T[]): Promise<T[]> {
  const ids = [...new Set(rows.filter(r => !usableImageUrl(r.hero_image_url)).flatMap(r => [r.product_a_id, r.product_b_id]).filter((id): id is string => !!id))]
  if (!ids.length) return rows
  const { data } = await db.from("products").select("id,thumbnail_url,product_images(url,model_status,sort_order)").eq("published", true).in("id", ids)
  const media = new Map((data ?? []).map(p => [p.id, usableImageUrl(p.product_images?.filter((i: {model_status: string}) => i.model_status === "verified").sort((a: {sort_order: number}, b: {sort_order: number}) => a.sort_order - b.sort_order)[0]?.url) || usableImageUrl(p.thumbnail_url)]))
  return rows.map(r => ({...r, hero_image_url: usableImageUrl(r.hero_image_url) || media.get(r.product_a_id) || media.get(r.product_b_id) || null}))
}

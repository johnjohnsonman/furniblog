import type { createAdminClient } from "@/lib/supabase/admin"

export async function getFirstProductImageUrl(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()

  const url = data?.url?.trim()
  return url || null
}

/** Sync products.thumbnail_url from the first product_images row (by sort_order). */
export async function syncProductThumbnail(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string
): Promise<string | null> {
  const url = await getFirstProductImageUrl(supabase, productId)

  const { error } = await supabase
    .from("products")
    .update({ thumbnail_url: url })
    .eq("id", productId)

  if (error) {
    console.error("[syncProductThumbnail] update error:", error)
    throw new Error(error.message)
  }

  if (url) {
    console.log("[syncProductThumbnail] Updated thumbnail_url:", url)
  }

  return url
}

/** Prefer explicit thumbnail from form; otherwise first gallery image; then existing. */
export async function resolveThumbnailForSave(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string,
  bodyThumbnail?: string | null,
  existingThumbnail?: string | null
): Promise<string | null> {
  const fromBody = bodyThumbnail?.trim()
  if (fromBody) return fromBody

  const fromGallery = await getFirstProductImageUrl(supabase, productId)
  if (fromGallery) return fromGallery

  const existing = existingThumbnail?.trim()
  return existing || null
}

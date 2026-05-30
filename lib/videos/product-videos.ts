import { createPublicServerClient } from "@/lib/supabase/public-server"
import { resolveProductUuid } from "@/lib/supabase/queries"

export type ProductVideo = {
  id: string
  youtube_id: string
  title: string | null
  channel_title: string | null
  thumbnail_url: string | null
  view_count: number | null
  published_at: string | null
  summary: string | null
}

export type ProductVideosResult = {
  videos: ProductVideo[]
  total: number
  chairId: string | null
}

const PRODUCT_VIDEO_LIMIT = 6

function isUuid(value: string): boolean {
  return value.includes("-") && value.length === 36
}

/**
 * Published videos for a chair, most-viewed first, capped at 6 (with total count for "view all").
 * Accepts either a product UUID or slug (ProductView.id is the slug), resolving to UUID as needed.
 */
export async function fetchProductVideos(
  productIdOrSlug: string
): Promise<ProductVideosResult> {
  const chairId = isUuid(productIdOrSlug)
    ? productIdOrSlug
    : await resolveProductUuid(productIdOrSlug)

  if (!chairId) return { videos: [], total: 0, chairId: null }

  const supabase = createPublicServerClient()
  const { data, count, error } = await supabase
    .from("videos")
    .select(
      "id, youtube_id, title, channel_title, thumbnail_url, view_count, published_at, summary",
      { count: "exact" }
    )
    .eq("status", "published")
    .eq("chair_id", chairId)
    .order("view_count", { ascending: false, nullsFirst: false })
    .limit(PRODUCT_VIDEO_LIMIT)

  if (error) return { videos: [], total: 0, chairId }

  return {
    videos: (data ?? []) as ProductVideo[],
    total: count ?? 0,
    chairId,
  }
}

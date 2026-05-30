import { createPublicServerClient } from "@/lib/supabase/public-server"

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
}

const PRODUCT_VIDEO_LIMIT = 6

/** Published videos for a chair, most-viewed first, capped at 6 (with total count for "view all"). */
export async function fetchProductVideos(
  productId: string
): Promise<ProductVideosResult> {
  const supabase = createPublicServerClient()
  const { data, count, error } = await supabase
    .from("videos")
    .select(
      "id, youtube_id, title, channel_title, thumbnail_url, view_count, published_at, summary",
      { count: "exact" }
    )
    .eq("status", "published")
    .eq("chair_id", productId)
    .order("view_count", { ascending: false, nullsFirst: false })
    .limit(PRODUCT_VIDEO_LIMIT)

  if (error) return { videos: [], total: 0 }

  return {
    videos: (data ?? []) as ProductVideo[],
    total: count ?? 0,
  }
}

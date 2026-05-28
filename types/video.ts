export type VideoStatus = "published" | "hidden"

export interface Video {
  id: string
  createdAt: string
  youtubeId: string
  title?: string | null
  channelTitle?: string | null
  thumbnailUrl?: string | null
  publishedAt?: string | null
  duration?: string | null
  viewCount?: number | null
  description?: string | null
  summary?: string | null
  chairId?: string | null
  brand?: string | null
  status: VideoStatus
  sourceQuery?: string | null
}

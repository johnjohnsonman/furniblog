import type { ReviewSource, ChairScores, FurnitureScores } from "@/types/review"

export type ReviewFeedSort = "recent" | "rating" | "relevance"
export type ReviewFeedPeriod = "all" | "week" | "month" | "year"

export type GetReviewsParams = {
  page?: number
  limit?: number
  category?: string
  brand?: string
  source?: string
  search?: string
  sortBy?: ReviewFeedSort
  period?: ReviewFeedPeriod
}

export type ReviewFeedItem = {
  id: string
  productId: string
  productSlug: string
  productName: string
  productThumbnail: string | null
  productCategory: string
  productCategoryLabel: string
  brandName: string
  brandSlug: string
  source: ReviewSource
  summary: string
  pros: string[]
  cons: string[]
  scores: ChairScores | FurnitureScores
  reviewerHeightCm?: number
  reviewerWeightKg?: number
  usageHoursPerDay?: number
  sourceUrl?: string
  createdAt: string
}

export type GetReviewsResult = {
  reviews: ReviewFeedItem[]
  total: number
}

export type ReviewsFeedMeta = {
  reviews: number
  brands: number
  sources: number
}

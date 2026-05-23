import type { ReviewSource, ChairScores, FurnitureScores } from "./review"

export type SubredditCrawlMeta = {
  subredditCrawl?: boolean
  sentiment?: "positive" | "negative" | "mixed" | "neutral"
  isReview?: boolean
  subreddit?: string
  postTitle?: string
  classifiedSlugs?: string[]
  score?: number
  numComments?: number
}

export interface QueueItem {
  id: string
  sourceType: ReviewSource
  sourceUrl: string
  rawContent: string
  itemType: "chair" | "furniture"
  itemId?: string
  status: "pending" | "processing" | "processed" | "failed"
  subredditMeta?: SubredditCrawlMeta
  aiOutput?: {
    summary: string
    scores: ChairScores | FurnitureScores
    pros: string[]
    cons: string[]
    confidence: number
    reviewerHeightCm?: number
    reviewerWeightKg?: number
    designKeywords?: string[]
  }
  createdAt: string
  processedAt?: string
}

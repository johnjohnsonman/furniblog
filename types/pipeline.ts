import type { ReviewSource, ChairScores, FurnitureScores } from "./review"

export interface QueueItem {
  id: string
  sourceType: ReviewSource
  sourceUrl: string
  rawContent: string
  itemType: "chair" | "furniture"
  itemId?: string
  status: "pending" | "processing" | "processed" | "failed"
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

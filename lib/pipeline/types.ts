import type { ReviewSource, ChairScores, BodyType, BackIssueId } from "@/types/review"

export interface RawContent {
  url: string
  title: string
  body: string
  source: Extract<
    ReviewSource,
    "reddit" | "youtube" | "naver" | "dcinside" | "japan_community"
  >
  score?: number
  viewCount?: number
  collectedAt: string
}

export interface ProcessedReview {
  summary: string
  scores: ChairScores
  pros: string[]
  cons: string[]
  reviewerHeightCm?: number | null
  reviewerWeightKg?: number | null
  usageHoursPerDay?: number | null
  occupation?: string | null
  bodyType?: BodyType | null
  backIssues?: BackIssueId[]
  confidence: number
  sourceUrl: string
  source: ReviewSource
}

export type PipelineSource =
  | "reddit"
  | "youtube"
  | "naver"
  | "dcinside"
  | "japan_community"

export interface PipelineOptions {
  chairSlug: string
  chairName: string
  productId: string
  sources?: PipelineSource[]
  maxPerSource?: number
  /** Skip confidence threshold; include raw samples in result */
  debug?: boolean
}

export interface PipelineDebugItem {
  url: string
  source: string
  title: string
  bodyLength: number
  bodyPreview: string
  rawBody: string
  saved: boolean
  confidence?: number
  failureReason?: string
}

export interface PipelineDebugSample {
  source: string
  url: string
  textPreview: string
  claudeOutput: ProcessedReview | null
}

export interface PipelineResult {
  collected: number
  processed: number
  saved: number
  failed: number
  results: ProcessedReview[]
  collectedItems?: RawContent[]
  debugItems?: PipelineDebugItem[]
  debugSamples?: PipelineDebugSample[]
}

export type ReviewSource =
  | "chairpark"
  | "reddit"
  | "youtube"
  | "dcinside"
  | "naver"
  | "japan_community"
  | "google"
  | "trustpilot"
  | "review_sites"
  | "hackernews"
  | "twitter"
  | "quora"
  // Curated/owner-added reviews shown without any source attribution.
  | "community"

export type BodyType = "slim" | "average" | "athletic" | "plus"

export type ReviewOccupation =
  | "office_worker"
  | "developer"
  | "designer"
  | "executive"
  | "student"
  | "creator"
  | "healthcare"
  | "other"

export type ReviewUsagePurpose = "office" | "home" | "gaming" | "study"

export type BackIssueId =
  | "lower_back_pain"
  | "herniated_disc"
  | "sciatica"
  | "scoliosis"
  | "neck_pain"
  | "hip_pain"
  | "no_issues"

export interface ReviewerProfile {
  heightCm?: number
  weightKg?: number
  bodyType?: BodyType
  usageHoursPerDay?: number
  occupation?: string
  backIssues?: BackIssueId[]
}

export type BackIssueSentiment = "positive" | "negative" | "neutral"

export interface ChairScores {
  lumbarSupport?: number
  seatComfort?: number
  armrest?: number
  headrest?: number
  adjustability?: number
  buildQuality?: number
  valueForMoney?: number
  overall: number
  mentionsBackPain?: boolean
  mentionsLumbar?: boolean
  backIssueSentiment?: BackIssueSentiment | null
}

export interface FurnitureScores {
  design?: number
  quality?: number
  value?: number
  overall: number
}

export interface Review {
  id: string
  productId: string
  source: ReviewSource
  summary: string
  pros: string[]
  cons: string[]
  scores: ChairScores | FurnitureScores
  reviewerHeightCm?: number
  reviewerWeightKg?: number
  usageHoursPerDay?: number
  usagePurpose?: ReviewUsagePurpose
  occupation?: ReviewOccupation
  bodyType?: BodyType
  backIssues?: BackIssueId[]
  sourceUrl?: string
  /** Defaults to English summaries in the app; source language when known */
  originalLanguage?: string
  verified: boolean
  helpfulCount?: number
  createdAt: string
}

export type ExperienceReviewStatus = "pending" | "approved" | "rejected"
export type ExperienceReviewSource = "native" | "google_form"
export type ExperienceReviewSex = "male" | "female"
export type ExperienceReviewHeightBand =
  | "under_5_4"
  | "5_4_5_7"
  | "5_8_5_11"
  | "6_0_6_2"
  | "6_3plus"
export type ExperienceReviewBody = "below" | "normal" | "above"
export type ExperienceReviewAgeBand =
  | "under20"
  | "20s"
  | "30s"
  | "40s"
  | "50plus"
export type ExperienceReviewSitHours = "under2" | "2to6" | "over6"

export interface ExperienceReviewSession {
  id: string
  createdAt: string
  status: ExperienceReviewStatus
  source: ExperienceReviewSource
  sex?: ExperienceReviewSex | null
  heightBand?: ExperienceReviewHeightBand | null
  body?: ExperienceReviewBody | null
  ageBand?: ExperienceReviewAgeBand | null
  job?: string | null
  sitHours?: ExperienceReviewSitHours | null
  uses: string[]
  pain: string[]
  reasons: string[]
  comment?: string | null
  purchased?: boolean | null
  /** Private giveaway contact (must never be returned to clients) */
  contact?: string | null
}

export interface ExperienceReviewRanking {
  id: string
  sessionId: string
  chairId: string
  rank: 1 | 2 | 3
}

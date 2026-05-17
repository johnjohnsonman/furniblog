export type ReviewSource =
  | "chairpark"
  | "reddit"
  | "youtube"
  | "dcinside"
  | "naver"
  | "japan_community"
  | "google"

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

export interface ChairScores {
  lumbarSupport?: number
  seatComfort?: number
  armrest?: number
  headrest?: number
  adjustability?: number
  buildQuality?: number
  valueForMoney?: number
  overall: number
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

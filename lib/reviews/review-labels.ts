import type {
  BackIssueId,
  BodyType,
  ReviewOccupation,
  ReviewSource,
} from "@/types/review"
import type { UsagePurposeFilter } from "./review-filters"

export const OCCUPATION_LABELS: Record<ReviewOccupation, string> = {
  office_worker: "Office Worker",
  developer: "Developer",
  designer: "Designer",
  executive: "Executive",
  student: "Student",
  creator: "Creator",
  healthcare: "Healthcare",
  other: "Other",
}

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  slim: "Slim",
  average: "Average",
  athletic: "Athletic",
  plus: "Plus Size",
}

export const BACK_ISSUE_LABELS: Record<BackIssueId, string> = {
  lower_back_pain: "Lower back pain",
  herniated_disc: "Herniated disc",
  sciatica: "Sciatica",
  scoliosis: "Scoliosis",
  neck_pain: "Neck pain",
  hip_pain: "Hip pain",
  no_issues: "No issues",
}

/** Subset shown on product page profile filter */
export const PRODUCT_BACK_ISSUE_OPTIONS: BackIssueId[] = [
  "lower_back_pain",
  "herniated_disc",
  "neck_pain",
  "no_issues",
]

export const USAGE_PURPOSE_FILTER_LABELS: Record<UsagePurposeFilter, string> = {
  any: "Any",
  work_from_home: "Work from Home",
  office: "Office",
  gaming: "Gaming",
  study: "Study",
}

export const USAGE_PURPOSE_REVIEW_LABELS: Record<
  "office" | "home" | "gaming" | "study",
  string
> = {
  office: "Office",
  home: "WFH",
  gaming: "Gaming",
  study: "Study",
}

export const SOURCE_FILTER_OPTIONS: {
  id: ReviewSource | "all"
  label: string
}[] = [
  { id: "all", label: "All" },
  { id: "chairpark", label: "Chairpark ⭐" },
  { id: "reddit", label: "Reddit" },
  { id: "youtube", label: "YouTube" },
  { id: "dcinside", label: "DC Inside" },
  { id: "naver", label: "Naver" },
  { id: "japan_community", label: "Japanese Community" },
  { id: "trustpilot", label: "Trustpilot" },
  { id: "review_sites", label: "Review Sites" },
  { id: "hackernews", label: "Hacker News" },
  { id: "twitter", label: "Twitter" },
]

export const ALL_OCCUPATIONS: ReviewOccupation[] = [
  "office_worker",
  "developer",
  "designer",
  "executive",
  "student",
  "creator",
  "healthcare",
  "other",
]

export const ALL_BACK_ISSUES: BackIssueId[] = [
  "lower_back_pain",
  "herniated_disc",
  "sciatica",
  "scoliosis",
  "neck_pain",
  "hip_pain",
  "no_issues",
]

import type { FeedReview } from "@/lib/data/reviews"
import type {
  BackIssueId,
  BodyType,
  Review,
  ReviewOccupation,
  ReviewSource,
} from "@/types/review"
import type { FeedCategoryId } from "./feed-category-pills"
import { getReviewOverall } from "@/components/chairs/review-utils"

export type SortOption = "latest" | "rating" | "helpful" | "match"

export type SittingHoursFilter = "any" | "under_4" | "4_6" | "6_8" | "8_plus"

export type UsagePurposeFilter =
  | "any"
  | "work_from_home"
  | "office"
  | "gaming"
  | "study"

export type BodyTypeFilter = "all" | BodyType | "plus_size"

export const HEIGHT_MIN = 140
export const HEIGHT_MAX = 210
export const WEIGHT_MIN = 40
export const WEIGHT_MAX = 150

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  category: "all",
  brandIds: [],
  sort: "latest",
  heightRange: [HEIGHT_MIN, HEIGHT_MAX],
  weightRange: [WEIGHT_MIN, WEIGHT_MAX],
  bodyType: "all",
  sittingHours: "any",
  occupations: [],
  usagePurpose: "any",
  backIssues: [],
  sources: [],
}

export type ReviewFilters = {
  category: FeedCategoryId
  brandIds: string[]
  sort: SortOption
  heightRange: [number, number]
  weightRange: [number, number]
  bodyType: BodyTypeFilter
  sittingHours: SittingHoursFilter
  occupations: ReviewOccupation[]
  usagePurpose: UsagePurposeFilter
  backIssues: BackIssueId[]
  sources: ReviewSource[]
}

export type ProfileHighlight = {
  height?: boolean
  weight?: boolean
  hours?: boolean
  bodyType?: boolean
  occupation?: boolean
  usagePurpose?: boolean
  backIssues?: boolean
}

type ProfileReview = Pick<
  Review,
  | "reviewerHeightCm"
  | "reviewerWeightKg"
  | "bodyType"
  | "usageHoursPerDay"
  | "occupation"
  | "usagePurpose"
  | "backIssues"
>

function heightFilterActive(filters: ReviewFilters): boolean {
  return (
    filters.heightRange[0] > HEIGHT_MIN || filters.heightRange[1] < HEIGHT_MAX
  )
}

function weightFilterActive(filters: ReviewFilters): boolean {
  return (
    filters.weightRange[0] > WEIGHT_MIN || filters.weightRange[1] < WEIGHT_MAX
  )
}

function matchesHeight(review: ProfileReview, filters: ReviewFilters): boolean {
  if (!heightFilterActive(filters)) return true
  const h = review.reviewerHeightCm
  if (h == null) return true
  return h >= filters.heightRange[0] && h <= filters.heightRange[1]
}

function matchesWeight(review: ProfileReview, filters: ReviewFilters): boolean {
  if (!weightFilterActive(filters)) return true
  const w = review.reviewerWeightKg
  if (w == null) return true
  return w >= filters.weightRange[0] && w <= filters.weightRange[1]
}

function matchesBodyType(review: ProfileReview, filters: ReviewFilters): boolean {
  if (filters.bodyType === "all") return true
  const bt = review.bodyType
  if (!bt) return true
  if (filters.bodyType === "plus_size") return bt === "plus"
  return bt === filters.bodyType
}

function matchesSittingHours(review: ProfileReview, filters: ReviewFilters): boolean {
  if (filters.sittingHours === "any") return true
  const h = review.usageHoursPerDay
  if (h == null) return true
  switch (filters.sittingHours) {
    case "under_4":
      return h < 4
    case "4_6":
      return h >= 4 && h < 6
    case "6_8":
      return h >= 6 && h <= 8
    case "8_plus":
      return h > 8
    default:
      return true
  }
}

function normalizeUsagePurpose(
  purpose?: Review["usagePurpose"]
): UsagePurposeFilter | null {
  if (!purpose) return null
  if (purpose === "home") return "work_from_home"
  return purpose
}

function matchesUsagePurpose(review: ProfileReview, filters: ReviewFilters): boolean {
  if (filters.usagePurpose === "any") return true
  const p = normalizeUsagePurpose(review.usagePurpose)
  if (!p) return true
  return p === filters.usagePurpose
}

function matchesOccupations(review: ProfileReview, filters: ReviewFilters): boolean {
  if (filters.occupations.length === 0) return true
  if (!review.occupation) return true
  return filters.occupations.includes(review.occupation)
}

function matchesBackIssues(review: ProfileReview, filters: ReviewFilters): boolean {
  if (filters.backIssues.length === 0) return true
  const issues = review.backIssues
  if (!issues?.length) return true
  return filters.backIssues.some((id) => issues.includes(id))
}

function matchesSources(
  review: ProfileReview & { source: ReviewSource },
  filters: ReviewFilters
): boolean {
  if (filters.sources.length === 0) return true
  return filters.sources.includes(review.source)
}

function filterByProfile<
  T extends ProfileReview & {
    source: ReviewSource
    feedCategory?: FeedCategoryId
    brandId?: string
  },
>(
  reviews: T[],
  filters: ReviewFilters,
  options?: { skipCategoryBrand?: boolean }
): T[] {
  return reviews.filter((review) => {
    if (
      !options?.skipCategoryBrand &&
      filters.category !== "all" &&
      "feedCategory" in review &&
      review.feedCategory !== filters.category
    ) {
      return false
    }
    if (
      !options?.skipCategoryBrand &&
      filters.brandIds.length > 0 &&
      "brandId" in review &&
      review.brandId &&
      !filters.brandIds.includes(review.brandId)
    ) {
      return false
    }
    if (!matchesHeight(review, filters)) return false
    if (!matchesWeight(review, filters)) return false
    if (!matchesBodyType(review, filters)) return false
    if (!matchesSittingHours(review, filters)) return false
    if (!matchesOccupations(review, filters)) return false
    if (!matchesUsagePurpose(review, filters)) return false
    if (!matchesBackIssues(review, filters)) return false
    if (!matchesSources(review, filters)) return false
    return true
  })
}

export function filterReviews(
  reviews: FeedReview[],
  filters: ReviewFilters
): FeedReview[] {
  return filterByProfile(reviews, filters)
}

export function filterProductReviews(
  reviews: Review[],
  filters: ReviewFilters
): Review[] {
  return filterByProfile(
    reviews as (ProfileReview & { source: ReviewSource })[],
    filters,
    { skipCategoryBrand: true }
  ) as Review[]
}

export function getProductProfileHighlights(
  review: Review,
  filters: ReviewFilters
): ProfileHighlight {
  return getProfileHighlights(review as FeedReview, filters)
}

export function sortReviews(
  reviews: FeedReview[],
  sort: SortOption,
  filters: ReviewFilters
): FeedReview[] {
  const list = [...reviews]

  if (sort === "rating") {
    return list.sort(
      (a, b) => getReviewOverall(b.scores) - getReviewOverall(a.scores)
    )
  }

  if (sort === "helpful") {
    return list.sort(
      (a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0)
    )
  }

  if (sort === "match") {
    return list.sort(
      (a, b) => profileMatchScore(b, filters) - profileMatchScore(a, filters)
    )
  }

  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function profileMatchScore(
  review: FeedReview,
  filters: ReviewFilters
): number {
  let score = 0
  if (heightFilterActive(filters) && review.reviewerHeightCm != null) {
    const h = review.reviewerHeightCm
    if (h >= filters.heightRange[0] && h <= filters.heightRange[1]) score += 2
  }
  if (weightFilterActive(filters) && review.reviewerWeightKg != null) {
    const w = review.reviewerWeightKg
    if (w >= filters.weightRange[0] && w <= filters.weightRange[1]) score += 2
  }
  if (filters.bodyType !== "all" && review.bodyType) {
    const match =
      filters.bodyType === "plus_size"
        ? review.bodyType === "plus"
        : review.bodyType === filters.bodyType
    if (match) score += 2
  }
  if (filters.sittingHours !== "any" && review.usageHoursPerDay != null) {
    if (matchesSittingHours(review, filters)) score += 1
  }
  if (filters.occupations.length > 0 && review.occupation) {
    if (filters.occupations.includes(review.occupation)) score += 2
  }
  if (filters.usagePurpose !== "any" && review.usagePurpose) {
    if (matchesUsagePurpose(review, filters)) score += 1
  }
  if (filters.backIssues.length > 0 && review.backIssues?.length) {
    if (filters.backIssues.some((id) => review.backIssues!.includes(id))) {
      score += 3
    }
  }
  return score
}

export function getProfileHighlights(
  review: FeedReview,
  filters: ReviewFilters
): ProfileHighlight {
  return {
    height:
      heightFilterActive(filters) &&
      review.reviewerHeightCm != null &&
      review.reviewerHeightCm >= filters.heightRange[0] &&
      review.reviewerHeightCm <= filters.heightRange[1],
    weight:
      weightFilterActive(filters) &&
      review.reviewerWeightKg != null &&
      review.reviewerWeightKg >= filters.weightRange[0] &&
      review.reviewerWeightKg <= filters.weightRange[1],
    hours:
      filters.sittingHours !== "any" &&
      review.usageHoursPerDay != null &&
      matchesSittingHours(review, filters),
    bodyType:
      filters.bodyType !== "all" &&
      review.bodyType != null &&
      matchesBodyType(review, filters),
    occupation:
      filters.occupations.length > 0 &&
      review.occupation != null &&
      filters.occupations.includes(review.occupation),
    usagePurpose:
      filters.usagePurpose !== "any" &&
      review.usagePurpose != null &&
      matchesUsagePurpose(review, filters),
    backIssues:
      filters.backIssues.length > 0 &&
      review.backIssues != null &&
      filters.backIssues.some((id) => review.backIssues!.includes(id)),
  }
}

export function hasActiveProfileFilters(filters: ReviewFilters): boolean {
  return (
    heightFilterActive(filters) ||
    weightFilterActive(filters) ||
    filters.bodyType !== "all" ||
    filters.sittingHours !== "any" ||
    filters.occupations.length > 0 ||
    filters.usagePurpose !== "any" ||
    filters.backIssues.length > 0
  )
}

export function countActiveFilters(filters: ReviewFilters): number {
  let n = 0
  if (filters.category !== "all") n++
  if (filters.brandIds.length > 0) n++
  if (heightFilterActive(filters)) n++
  if (weightFilterActive(filters)) n++
  if (filters.bodyType !== "all") n++
  if (filters.sittingHours !== "any") n++
  if (filters.occupations.length > 0) n++
  if (filters.usagePurpose !== "any") n++
  if (filters.backIssues.length > 0) n++
  if (filters.sources.length > 0) n++
  return n
}

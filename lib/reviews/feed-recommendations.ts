import type { FeedReview } from "@/lib/data/reviews"
import { getReviewOverall } from "@/components/chairs/review-utils"
import type { ReviewFilters } from "./review-filters"
import { hasActiveProfileFilters } from "./review-filters"
import {
  BACK_ISSUE_LABELS,
  OCCUPATION_LABELS,
  USAGE_PURPOSE_FILTER_LABELS,
} from "@/lib/reviews/review-labels"

export type FeedRecommendation = {
  profileSummary: string
  mostReviewed: { productName: string; count: number } | null
  highestRated: { productName: string; avgRating: number } | null
}

function buildProfileSummary(filters: ReviewFilters): string {
  const parts: string[] = []
  if (
    filters.heightRange[0] > 140 ||
    filters.heightRange[1] < 200
  ) {
    parts.push(`${filters.heightRange[0]}–${filters.heightRange[1]}cm`)
  }
  if (filters.occupations.length === 1) {
    parts.push(OCCUPATION_LABELS[filters.occupations[0]])
  } else if (filters.occupations.length > 1) {
    parts.push(`${filters.occupations.length} occupations`)
  }
  if (filters.sittingHours !== "any") {
    const hours =
      filters.sittingHours === "under_4"
        ? "under 4h/day"
        : filters.sittingHours === "4_6"
          ? "4–6h/day"
          : filters.sittingHours === "6_8"
            ? "6–8h/day"
            : "8h+/day"
    parts.push(hours)
  }
  if (filters.backIssues.length > 0) {
    const first = filters.backIssues[0]
    parts.push(BACK_ISSUE_LABELS[first].toLowerCase())
  }
  if (filters.usagePurpose !== "any") {
    parts.push(USAGE_PURPOSE_FILTER_LABELS[filters.usagePurpose])
  }
  return parts.length > 0 ? parts.join(", ") : "your filters"
}

export function buildFeedRecommendation(
  filtered: FeedReview[],
  filters: ReviewFilters
): FeedRecommendation | null {
  if (filtered.length === 0 || !hasActiveProfileFilters(filters)) {
    return null
  }

  const byProduct = new Map<
    string,
    { productName: string; reviews: FeedReview[] }
  >()

  for (const r of filtered) {
    const existing = byProduct.get(r.productId)
    if (existing) {
      existing.reviews.push(r)
    } else {
      byProduct.set(r.productId, {
        productName: r.productName,
        reviews: [r],
      })
    }
  }

  let mostReviewed: FeedRecommendation["mostReviewed"] = null
  let highestRated: FeedRecommendation["highestRated"] = null

  for (const { productName, reviews } of byProduct.values()) {
    if (!mostReviewed || reviews.length > mostReviewed.count) {
      mostReviewed = { productName, count: reviews.length }
    }
    const avg =
      reviews.reduce((sum, r) => sum + getReviewOverall(r.scores), 0) /
      reviews.length
    if (!highestRated || avg > highestRated.avgRating) {
      highestRated = {
        productName,
        avgRating: Math.round(avg * 10) / 10,
      }
    }
  }

  return {
    profileSummary: buildProfileSummary(filters),
    mostReviewed,
    highestRated,
  }
}

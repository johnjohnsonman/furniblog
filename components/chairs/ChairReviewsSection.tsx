"use client"

import { useMemo, useState } from "react"
import type { Review, ReviewSource } from "@/types/review"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewCard } from "./ReviewCard"
import { ChairScoreRadar } from "./ChairScoreRadar"
import {
  SOURCE_LABELS,
  averageOverall,
  averageBodyStats,
  countBySource,
  getSourceBadgeClass,
} from "./review-utils"
import {
  DEFAULT_REVIEW_FILTERS,
  filterProductReviews,
  getProductProfileHighlights,
  hasActiveProfileFilters,
} from "@/lib/reviews/review-filters"
import type { ReviewFilters } from "@/lib/reviews/review-filters"
import { ReviewerProfileFilters } from "@/components/reviews/reviewer-profile-filters"
import { cn } from "@/lib/utils"

const FILTER_SOURCES: (ReviewSource | "all")[] = [
  "all",
  "chairpark",
  "reddit",
  "youtube",
  "dcinside",
  "naver",
  "japan_community",
  "trustpilot",
  "review_sites",
  "hackernews",
]

interface ChairReviewsSectionProps {
  reviews: Review[]
}

export function ChairReviewsSection({ reviews }: ChairReviewsSectionProps) {
  const [sourceFilter, setSourceFilter] = useState<ReviewSource | "all">("all")
  const [profileFilters, setProfileFilters] =
    useState<ReviewFilters>(DEFAULT_REVIEW_FILTERS)

  const profileFiltered = useMemo(
    () => filterProductReviews(reviews, profileFilters),
    [reviews, profileFilters]
  )

  const filtered = useMemo(
    () =>
      sourceFilter === "all"
        ? profileFiltered
        : profileFiltered.filter((r) => r.source === sourceFilter),
    [profileFiltered, sourceFilter]
  )

  const overall = averageOverall(reviews)
  const bySource = countBySource(reviews)
  const body = averageBodyStats(reviews)

  return (
    <div className="space-y-8">
      <div className="p-6 bg-card rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Overall rating
            </p>
            <p className="text-5xl font-bold text-foreground tabular-nums">{overall}</p>
            <p className="text-sm text-muted-foreground mt-1">
              / 5.0 · {reviews.length} reviews
            </p>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.entries(bySource) as [ReviewSource, number][]).map(
                ([source, count]) => (
                  <span
                    key={source}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      getSourceBadgeClass(source)
                    )}
                  >
                    {SOURCE_LABELS[source]} ({count})
                  </span>
                )
              )}
            </div>
            {(body.height || body.weight) && (
              <p className="text-sm text-muted-foreground">
                Avg. reviewer:{" "}
                {body.height && `${body.height} cm`}
                {body.height && body.weight && " / "}
                {body.weight && `${body.weight} kg`}
              </p>
            )}
          </div>
        </div>
      </div>

      <section>
        <h3 className="font-medium text-foreground mb-4">Scores by source</h3>
        <ChairScoreRadar reviews={reviews} />
      </section>

      <ReviewerProfileFilters
        filters={profileFilters}
        onChange={setProfileFilters}
        matchCount={profileFiltered.length}
        totalCount={reviews.length}
      />

      <section>
        <Tabs
          value={sourceFilter}
          onValueChange={(v) => setSourceFilter(v as ReviewSource | "all")}
        >
          <TabsList className="flex-wrap h-auto gap-1">
            {FILTER_SOURCES.map((source) => (
              <TabsTrigger
                key={source}
                value={source}
                className={cn(
                  "text-xs",
                  source !== "all" && getSourceBadgeClass(source)
                )}
              >
                {source === "all" ? "All" : SOURCE_LABELS[source]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {hasActiveProfileFilters(profileFilters) && (
          <p className="text-sm text-muted-foreground mt-4">
            Showing {filtered.length} of {reviews.length} reviews for this source
            filter.
          </p>
        )}

        <div className={cn("mt-6 space-y-4")}>
          {filtered.length > 0 ? (
            filtered.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                highlights={getProductProfileHighlights(review, profileFilters)}
                showBackBadges={profileFilters.backIssues.length > 0}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No reviews match your filters.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

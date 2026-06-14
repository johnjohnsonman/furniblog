"use client"

import Link from "next/link"
import type { Review } from "@/types/review"
import { SourceBadge } from "@/components/reviews/source-badge"
import { SOURCE_LABELS } from "@/components/chairs/review-utils"
import type { ProfileHighlight } from "@/lib/reviews/review-filters"
import {
  BACK_ISSUE_LABELS,
  BODY_TYPE_LABELS,
} from "@/lib/reviews/review-labels"
import { cn } from "@/lib/utils"
import {
  getBackIssueSentiment,
  reviewHasBackMention,
} from "@/lib/reviews/back-issue-utils"

interface ReviewCardProps {
  review: Review
  highlights?: ProfileHighlight
  showBackBadges?: boolean
}

function HighlightStat({
  active,
  children,
}: {
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex px-1.5 py-0.5 rounded",
        active && "bg-amber-100 text-amber-950 ring-1 ring-amber-300/60"
      )}
    >
      {children}
    </span>
  )
}

export function ReviewCard({
  review,
  highlights,
  showBackBadges = false,
}: ReviewCardProps) {
  const backSentiment =
    showBackBadges || highlights?.backSentiment
      ? getBackIssueSentiment(review)
      : null
  const showBack =
    (showBackBadges || highlights?.backSentiment) && reviewHasBackMention(review)

  return (
    <article className="p-5 bg-card rounded-lg border border-border">
      <header className="flex flex-wrap items-center gap-2 mb-3">
        <SourceBadge source={review.source} variant="compact" />
        {review.verified && (
          <span className="px-2 py-0.5 rounded-full bg-foreground/10 text-xs text-foreground">
            Verified
          </span>
        )}
        {showBack && backSentiment === "positive" && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-200">
            Good for back ✓
          </span>
        )}
        {showBack && backSentiment === "negative" && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-medium border border-red-200">
            Bad for back ✗
          </span>
        )}
        {showBack && backSentiment === "neutral" && (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 text-xs font-medium border border-amber-200">
            Mentions back
          </span>
        )}
      </header>

      <p className="text-sm text-muted-foreground leading-relaxed">{review.summary}</p>

      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {review.pros.length > 0 && (
            <ul className="space-y-1">
              {review.pros.map((pro) => (
                <li key={pro} className="text-foreground">
                  <span className="text-green-600 mr-1">+</span>
                  {pro}
                </li>
              ))}
            </ul>
          )}
          {review.cons.length > 0 && (
            <ul className="space-y-1">
              {review.cons.map((con) => (
                <li key={con} className="text-foreground">
                  <span className="text-red-500 mr-1">−</span>
                  {con}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(review.reviewerHeightCm ||
        review.reviewerWeightKg ||
        review.usageHoursPerDay ||
        review.bodyType ||
        review.backIssues?.length) && (
        <p className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-x-1 gap-y-1">
          {review.reviewerHeightCm != null && (
            <HighlightStat active={highlights?.height}>
              {review.reviewerHeightCm} cm
            </HighlightStat>
          )}
          {review.reviewerWeightKg != null && (
            <>
              <span>·</span>
              <HighlightStat active={highlights?.weight}>
                {review.reviewerWeightKg} kg
              </HighlightStat>
            </>
          )}
          {review.bodyType && (
            <>
              <span>·</span>
              <HighlightStat active={highlights?.bodyType}>
                {BODY_TYPE_LABELS[review.bodyType]}
              </HighlightStat>
            </>
          )}
          {review.usageHoursPerDay != null && (
            <>
              <span>·</span>
              <HighlightStat active={highlights?.hours}>
                {review.usageHoursPerDay}h/day
              </HighlightStat>
            </>
          )}
          {review.backIssues?.map((issue) => (
            <span key={issue}>
              <span>·</span>
              <HighlightStat active={highlights?.backIssues}>
                {BACK_ISSUE_LABELS[issue]}
              </HighlightStat>
            </span>
          ))}
        </p>
      )}

      <footer className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Summarized from {SOURCE_LABELS[review.source] ?? "the original review"}
        </p>
        <Link
          href={`/reviews/${review.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
        >
          Read full review →
        </Link>
      </footer>
    </article>
  )
}

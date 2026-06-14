import Link from "next/link"
import { Briefcase, User } from "lucide-react"
import type { FeedReview } from "@/lib/data/reviews"
import { SourceBadge } from "./source-badge"
import { SOURCE_LABELS } from "@/components/chairs/review-utils"
import type { ProfileHighlight } from "@/lib/reviews/review-filters"
import {
  BACK_ISSUE_LABELS,
  BODY_TYPE_LABELS,
  OCCUPATION_LABELS,
  USAGE_PURPOSE_REVIEW_LABELS,
} from "@/lib/reviews/review-labels"
import { cn } from "@/lib/utils"

interface FeedReviewCardProps {
  review: FeedReview
  highlights?: ProfileHighlight
}

function HighlightChip({
  children,
  active,
  className,
}: {
  children: React.ReactNode
  active?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs",
        active
          ? "bg-amber-100 text-amber-950 ring-1 ring-amber-300/60"
          : "text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

function joinChips(chips: React.ReactNode[]) {
  return chips.reduce<React.ReactNode[]>((acc, chip, i) => {
    if (i > 0) acc.push(<span key={`sep-${i}`}>·</span>)
    acc.push(chip)
    return acc
  }, [])
}

export function FeedReviewCard({ review, highlights }: FeedReviewCardProps) {
  const topPros = review.pros.slice(0, 2)
  const topCons = review.cons.slice(0, 1)

  const bodyLine: React.ReactNode[] = []
  if (review.reviewerHeightCm) {
    bodyLine.push(
      <HighlightChip key="h" active={highlights?.height}>
        {review.reviewerHeightCm}cm
      </HighlightChip>
    )
  }
  if (review.reviewerWeightKg) {
    bodyLine.push(
      <HighlightChip key="w" active={highlights?.weight}>
        {review.reviewerWeightKg}kg
      </HighlightChip>
    )
  }
  if (review.usageHoursPerDay) {
    bodyLine.push(
      <HighlightChip key="hrs" active={highlights?.hours}>
        {review.usageHoursPerDay}h/day
      </HighlightChip>
    )
  }

  const workLine: React.ReactNode[] = []
  if (review.occupation) {
    workLine.push(
      <HighlightChip key="occ" active={highlights?.occupation}>
        {OCCUPATION_LABELS[review.occupation]}
      </HighlightChip>
    )
  }
  if (review.usagePurpose) {
    workLine.push(
      <HighlightChip key="purp" active={highlights?.usagePurpose}>
        {USAGE_PURPOSE_REVIEW_LABELS[review.usagePurpose]}
      </HighlightChip>
    )
  }

  const visibleBackIssues =
    review.backIssues?.filter((id) => id !== "no_issues") ?? []

  const hasProfile =
    bodyLine.length > 0 ||
    workLine.length > 0 ||
    visibleBackIssues.length > 0 ||
    review.bodyType

  return (
    <article className="flex flex-col h-full p-5 bg-card rounded-xl border border-border hover:border-foreground/20 transition-colors">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <SourceBadge source={review.source} variant="compact" />
            <span className="text-xs text-muted-foreground truncate">
              {review.brandName}
            </span>
          </div>
          <Link
            href={`/products/${review.productSlug}`}
            className="mt-1 font-serif text-lg font-medium text-foreground hover:underline line-clamp-2 leading-snug block"
          >
            {review.productName}
          </Link>
        </div>
      </header>

      {hasProfile && (
        <div className="mt-3 space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/60">
          {bodyLine.length > 0 && (
            <p className="flex flex-wrap items-center gap-1.5 text-xs">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {joinChips(bodyLine)}
            </p>
          )}
          {workLine.length > 0 && (
            <p className="flex flex-wrap items-center gap-1.5 text-xs">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {joinChips(workLine)}
            </p>
          )}
          {visibleBackIssues.length > 0 && (
            <p className="flex flex-wrap gap-1.5 pt-0.5">
              {visibleBackIssues.map((issue) => (
                <HighlightChip
                  key={issue}
                  active={highlights?.backIssues}
                  className="text-red-700/90"
                >
                  {BACK_ISSUE_LABELS[issue]}
                </HighlightChip>
              ))}
            </p>
          )}
          {review.bodyType && (
            <p className="text-[10px] text-muted-foreground pt-0.5">
              Body type: {BODY_TYPE_LABELS[review.bodyType]}
            </p>
          )}
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
        &ldquo;{review.summary}&rdquo;
      </p>

      {(topPros.length > 0 || topCons.length > 0) && (
        <div className="mt-3 space-y-1.5">
          {topPros.map((pro) => (
            <p key={pro} className="text-xs text-green-800 flex gap-1.5">
              <span className="shrink-0">✅</span>
              <span>{pro}</span>
            </p>
          ))}
          {topCons.map((con) => (
            <p key={con} className="text-xs text-red-700 flex gap-1.5">
              <span className="shrink-0">❌</span>
              <span>{con}</span>
            </p>
          ))}
        </div>
      )}

      <footer className="mt-4 pt-3 border-t border-border space-y-1.5">
        <Link
          href={`/reviews/${review.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
        >
          Read full review →
        </Link>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Summarized from {SOURCE_LABELS[review.source] ?? "the original review"}
        </p>
      </footer>
    </article>
  )
}

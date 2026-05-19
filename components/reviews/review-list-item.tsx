import Link from "next/link"
import { ExternalLink, Star } from "lucide-react"
import type { ReviewFeedItem } from "@/lib/reviews/feed-types"
import { SourceBadge } from "./source-badge"
import { cn } from "@/lib/utils"

function getOverall(scores: ReviewFeedItem["scores"]): number {
  return "overall" in scores ? Number(scores.overall) || 0 : 0
}

function StarRating({ score }: { score: number }) {
  const rounded = Math.round(score)
  return (
    <div className="flex items-center gap-1 shrink-0">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < rounded
                ? "fill-foreground text-foreground"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-semibold tabular-nums">{score.toFixed(1)}</span>
    </div>
  )
}

type ReviewListItemProps = {
  review: ReviewFeedItem
}

export function ReviewListItem({ review }: ReviewListItemProps) {
  const overall = getOverall(review.scores)
  const topPros = review.pros.slice(0, 2)
  const topCons = review.cons.slice(0, 1)

  const metaParts: string[] = []
  if (review.reviewerHeightCm) metaParts.push(`${review.reviewerHeightCm}cm`)
  if (review.reviewerWeightKg) metaParts.push(`${review.reviewerWeightKg}kg`)
  if (review.usageHoursPerDay) metaParts.push(`${review.usageHoursPerDay}h/day`)

  return (
    <article className="group flex gap-4 rounded-lg border border-[#EFEFEF] bg-white p-4 transition-colors hover:border-neutral-300">
      <Link
        href={`/products/${review.productSlug}`}
        className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md bg-neutral-100"
      >
        {review.productThumbnail ? (
          <img
            src={review.productThumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
            No image
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/products/${review.productSlug}`}
              className="font-medium text-base text-foreground hover:underline"
            >
              {review.productName}
            </Link>
            <p className="mt-0.5 text-xs text-gray-400">
              {review.brandName}
              {review.brandName && review.productCategoryLabel && " · "}
              {review.productCategoryLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SourceBadge source={review.source} variant="compact" />
            <StarRating score={overall} />
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{review.summary}</p>

        {(topPros.length > 0 || topCons.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topPros.map((pro) => (
              <span
                key={`pro-${pro}`}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-green-50 text-green-800"
              >
                ✓ {pro}
              </span>
            ))}
            {topCons.map((con) => (
              <span
                key={`con-${con}`}
                className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-red-50 text-red-700"
              >
                ✗ {con}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          {metaParts.length > 0 ? (
            <span>{metaParts.join(" · ")}</span>
          ) : (
            <span />
          )}
          {review.sourceUrl && (
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
            >
              View source
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

import Link from "next/link"
import { PenLine } from "lucide-react"
import type { Review, ReviewSource } from "@/types/review"
import { CompactReviewItem } from "./CompactReviewItem"
import { SOURCE_LABELS, countBySource } from "@/components/chairs/review-utils"
import { pickReviewLinks } from "./ProductReviewLinks"
import { MoreProductReviews } from "./MoreProductReviews"

const FIRST = 10

/**
 * Reviews on the product page: the first reviews are server-rendered (their
 * detail links are in the first HTML); the rest load on request, so the page
 * never ships every review up front.
 */
export function ProductReviewsSection({ reviews, productId, productSlug, productName }: { reviews: Review[]; productId: string; productSlug: string; productName: string }) {
  const first = pickReviewLinks(reviews, FIRST)
  const sources = (Object.entries(countBySource(reviews)) as [ReviewSource, number][])
    .filter(([source]) => source !== "community")
    .sort((a, b) => b[1] - a[1])
  return (
    <div>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        Condensed from {reviews.length.toLocaleString()} published owner {reviews.length === 1 ? "review" : "reviews"}; each summary links to its original source.
        {sources.length > 0 && <> Sources: {sources.map(([s, n]) => `${SOURCE_LABELS[s] ?? s} ${n}`).join(", ")}.</>}
      </p>
      <ul className="mt-4 divide-y divide-border border-y border-border">{first.map((review) => <CompactReviewItem key={review.id} review={review} />)}</ul>
      <MoreProductReviews productId={productId} shownIds={first.map((r) => r.id)} total={reviews.length} />
      <p className="mt-6 text-sm">
        <Link href={`/reviews/new?product=${encodeURIComponent(productSlug)}`} className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
          <PenLine className="h-4 w-4" /> Sat in the {productName}? Write a review
        </Link>
      </p>
    </div>
  )
}

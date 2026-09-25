import Link from "next/link"
import type { Review } from "@/types/review"
import { SOURCE_LABELS } from "@/components/chairs/review-utils"
import { isThinReview } from "@/lib/seo/thin-pages"
import { OpenReviewsTabButton } from "./OpenReviewsTabButton"

const LIMIT = 10

/**
 * Server-rendered links to this product's review summaries, so the review detail
 * pages are reachable from the first HTML (the Reviews tab only renders on click).
 * Order is fixed: sourced, non-thin summaries first, then newest, then id.
 */
export function pickReviewLinks(reviews: Review[]): Review[] {
  const rank = (r: Review) =>
    r.sourceUrl && !isThinReview({ id: r.id, summary_ko: r.summary, pros: r.pros, cons: r.cons }) ? 0 : 1
  return [...reviews]
    .filter((r) => r.summary?.trim())
    .sort((a, b) => rank(a) - rank(b) || (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || a.id.localeCompare(b.id))
    .slice(0, LIMIT)
}

function snippet(text: string, max = 120): string {
  const t = text.replace(/\s+/g, " ").trim()
  return t.length > max ? `${t.slice(0, max).replace(/\s+\S*$/, "")}…` : t
}

export function ProductReviewLinks({ reviews, productName }: { reviews: Review[]; productName: string }) {
  const picks = pickReviewLinks(reviews)
  if (picks.length === 0) return null
  return (
    <section aria-labelledby="review-summaries" className="mt-10 border-t border-border pt-6">
      <h2 id="review-summaries" className="text-lg font-semibold">{productName} review summaries</h2>
      <p className="mt-1 text-sm text-muted-foreground">Condensed from published owner reviews; each summary links to its original source.</p>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {picks.map((r) => (
          <li key={r.id}>
            <Link href={`/reviews/${r.id}`} className="block py-3 text-sm leading-6 hover:bg-muted/40">
              <span className="font-medium text-foreground">{r.source === "chairpark" ? "Community" : SOURCE_LABELS[r.source] ?? "Review"}</span>
              <span className="text-muted-foreground"> · {snippet(r.summary)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {reviews.length > picks.length && (
        <OpenReviewsTabButton className="mt-4 text-sm font-medium underline underline-offset-4">
          {`See all ${reviews.length.toLocaleString()} reviews`}
        </OpenReviewsTabButton>
      )}
    </section>
  )
}

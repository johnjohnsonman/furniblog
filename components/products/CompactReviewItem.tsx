import Link from "next/link"
import type { Review } from "@/types/review"
import { SOURCE_LABELS } from "@/components/chairs/review-utils"
import { formatReviewMonth } from "@/lib/reviews/format-date"

/** Short review row for the product page; the full summary lives on /reviews/{id}. */
export function CompactReviewItem({ review }: { review: Review }) {
  const source = review.source === "chairpark" ? "Showroom" : SOURCE_LABELS[review.source] ?? "Review"
  const date = review.source !== "chairpark" ? formatReviewMonth(review.createdAt) : null
  const points = [...review.pros.slice(0, 2).map((t) => ({ t, good: true })), ...review.cons.slice(0, 1).map((t) => ({ t, good: false }))]
  return (
    <li className="py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{source}{date ? ` · ${date}` : ""}</p>
      <p className="mt-1 line-clamp-3 text-sm leading-6 text-foreground">{review.summary}</p>
      {points.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {points.map((p) => <li key={p.t}>{p.good ? "✓" : "✗"} {p.t}</li>)}
        </ul>
      )}
      <Link href={`/reviews/${review.id}`} className="mt-2 inline-block text-sm font-semibold underline underline-offset-4">Read full review →</Link>
    </li>
  )
}

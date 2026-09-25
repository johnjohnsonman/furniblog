"use client"

import { useState, useTransition } from "react"
import type { Review } from "@/types/review"
import { CompactReviewItem } from "./CompactReviewItem"
import { loadMoreProductReviews } from "@/app/products/[id]/actions"

/** Loads the rest of a product's reviews on the same page, in batches. */
export function MoreProductReviews({ productId, shownIds, total }: { productId: string; shownIds: string[]; total: number }) {
  const [items, setItems] = useState<Review[]>([])
  const [remaining, setRemaining] = useState(total - shownIds.length)
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()

  function loadMore() {
    setError(false)
    startTransition(async () => {
      try {
        const next = await loadMoreProductReviews(productId, shownIds, items.length)
        setItems((prev) => [...prev, ...next.items])
        setRemaining(next.remaining)
      } catch {
        setError(true)
      }
    })
  }

  return (
    <>
      {items.length > 0 && <ul className="divide-y divide-border border-b border-border">{items.map((review) => <CompactReviewItem key={review.id} review={review} />)}</ul>}
      {remaining > 0 && (
        <button
          type="button"
          onClick={loadMore}
          disabled={pending}
          className="mt-6 inline-flex min-h-11 items-center border border-[#171717] bg-white px-5 text-sm font-semibold hover:bg-[#f5f1e8] disabled:opacity-60"
        >
          {pending ? "Loading…" : items.length === 0 ? `See all ${total.toLocaleString()} reviews` : `Show more (${remaining.toLocaleString()} left)`}
        </button>
      )}
      {error && <p className="mt-3 text-sm text-red-700">Couldn&rsquo;t load more reviews. Please try again.</p>}
    </>
  )
}

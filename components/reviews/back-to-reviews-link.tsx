"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

/**
 * "All reviews" back link on a review detail page. Returns to the feed with its
 * previous filters/sort/scroll (browser back) when the user came from within the
 * app; falls back to the reviews index for direct/external landings.
 */
export function BackToReviewsLink() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back()
        } else {
          router.push("/reviews")
        }
      }}
      className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      All reviews
    </button>
  )
}

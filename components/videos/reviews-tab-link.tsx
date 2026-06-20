"use client"

type Props = {
  reviewCount: number
  className?: string
}

export function ReviewsTabLink({ reviewCount, className }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("product-select-tab", { detail: "reviews" })
        )
      }}
      className={className}
    >
      read what {reviewCount.toLocaleString()} review{reviewCount === 1 ? "" : "s"} say →
    </button>
  )
}

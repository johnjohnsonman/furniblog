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
        const trigger = document.querySelector<HTMLElement>(
          '[data-product-tab="reviews"]'
        )
        trigger?.click()
        trigger?.scrollIntoView({ behavior: "smooth", block: "start" })
      }}
      className={className}
    >
      read what {reviewCount.toLocaleString()} review{reviewCount === 1 ? "" : "s"} say →
    </button>
  )
}

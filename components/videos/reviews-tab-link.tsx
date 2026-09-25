"use client"

type Props = {
  reviewCount: number
  className?: string
}

export function ReviewsTabLink({ reviewCount, className }: Props) {
  return (
    <a href="#reviews" className={className}>
      read what {reviewCount.toLocaleString()} review{reviewCount === 1 ? "" : "s"} say →
    </a>
  )
}

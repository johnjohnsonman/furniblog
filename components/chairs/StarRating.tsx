import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  className?: string
  starClassName?: string
}

export function StarRating({
  rating,
  className,
  starClassName,
}: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating))

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = clamped - i
        if (fill >= 1) {
          return (
            <span
              key={i}
              className={cn("text-[13px] leading-none text-premium-star", starClassName)}
            >
              ★
            </span>
          )
        }
        if (fill >= 0.25) {
          return (
            <span
              key={i}
              className={cn("text-[13px] leading-none text-premium-star", starClassName)}
            >
              ½
            </span>
          )
        }
        return (
          <span
            key={i}
            className={cn(
              "text-[13px] leading-none text-premium-text-tertiary",
              starClassName
            )}
          >
            ☆
          </span>
        )
      })}
    </span>
  )
}

import type { ChairScores } from "@/types/review"
import { isChairScores } from "@/components/chairs/review-utils"
import type { Review } from "@/types/review"
import { cn } from "@/lib/utils"

const MINI_AXES: { key: keyof ChairScores; label: string }[] = [
  { key: "lumbarSupport", label: "\uc694\ucd95" },
  { key: "seatComfort", label: "\uc88c\ud310" },
  { key: "overall", label: "\uc885\ud569" },
]

interface MiniScoreBarsProps {
  scores: Review["scores"]
  className?: string
}

export function MiniScoreBars({ scores, className }: MiniScoreBarsProps) {
  if (!isChairScores(scores)) {
    return (
      <p className="text-xs text-muted-foreground">
        {"\uc885\ud569 "} {scores.overall}/5
      </p>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {MINI_AXES.map(({ key, label }) => {
        const value = scores[key]
        if (value == null) return null
        const pct = (value / 5) * 100
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-8 shrink-0 text-muted-foreground">{label}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-right font-medium text-foreground tabular-nums">
              {value.toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

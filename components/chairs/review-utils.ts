import type { Review, ReviewSource, ChairScores } from "@/types/review"

export const SOURCE_LABELS: Record<ReviewSource, string> = {
  chairpark: "Chairpark",
  reddit: "Reddit",
  youtube: "YouTube",
  dcinside: "DC Inside",
  naver: "Naver",
  japan_community: "Japan Community",
  google: "Google",
}

export const SOURCE_COLORS: Record<ReviewSource, string> = {
  chairpark: "#3b82f6",
  reddit: "#f97316",
  youtube: "#ef4444",
  dcinside: "#6b7280",
  naver: "#22c55e",
  japan_community: "#a855f7",
  google: "#64748b",
}

export const RADAR_AXES: { key: keyof ChairScores; label: string }[] = [
  { key: "lumbarSupport", label: "Lumbar" },
  { key: "seatComfort", label: "Seat" },
  { key: "armrest", label: "Armrests" },
  { key: "headrest", label: "Headrest" },
  { key: "adjustability", label: "Adjustability" },
  { key: "buildQuality", label: "Build" },
  { key: "valueForMoney", label: "Value" },
  { key: "overall", label: "Overall" },
]

export function isChairScores(
  scores: Review["scores"]
): scores is ChairScores {
  return "lumbarSupport" in scores || "seatComfort" in scores || "overall" in scores
}

export function getReviewOverall(scores: Review["scores"]): number {
  return scores.overall
}

export function averageOverall(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, r) => acc + getReviewOverall(r.scores), 0)
  return Math.round((sum / reviews.length) * 10) / 10
}

export function countBySource(reviews: Review[]): Partial<Record<ReviewSource, number>> {
  return reviews.reduce(
    (acc, r) => {
      acc[r.source] = (acc[r.source] ?? 0) + 1
      return acc
    },
    {} as Partial<Record<ReviewSource, number>>
  )
}

export function averageBodyStats(reviews: Review[]) {
  const withHeight = reviews.filter((r) => r.reviewerHeightCm)
  const withWeight = reviews.filter((r) => r.reviewerWeightKg)
  return {
    height:
      withHeight.length > 0
        ? Math.round(
            withHeight.reduce((s, r) => s + (r.reviewerHeightCm ?? 0), 0) /
              withHeight.length
          )
        : null,
    weight:
      withWeight.length > 0
        ? Math.round(
            withWeight.reduce((s, r) => s + (r.reviewerWeightKg ?? 0), 0) /
              withWeight.length
          )
        : null,
  }
}

export function buildRadarBySource(reviews: Review[]) {
  const sources = [...new Set(reviews.map((r) => r.source))]

  return sources
    .map((source) => {
      const subset = reviews.filter((r) => r.source === source && isChairScores(r.scores))
      if (subset.length === 0) return null

      const avg: ChairScores = {
        lumbarSupport: 0,
        seatComfort: 0,
        armrest: 0,
        headrest: 0,
        adjustability: 0,
        buildQuality: 0,
        valueForMoney: 0,
        overall: 0,
      }

      for (const review of subset) {
        const s = review.scores as ChairScores
        for (const axis of RADAR_AXES) {
          const val = s[axis.key]
          if (val != null) avg[axis.key] = (avg[axis.key] ?? 0) + val
        }
      }

      for (const axis of RADAR_AXES) {
        if (avg[axis.key] != null) {
          avg[axis.key] = Math.round(((avg[axis.key] ?? 0) / subset.length) * 10) / 10
        }
      }

      return {
        source,
        label: SOURCE_LABELS[source],
        color: SOURCE_COLORS[source],
        data: RADAR_AXES.map((axis) => ({
          subject: axis.label,
          value: avg[axis.key] ?? 0,
          fullMark: 5,
        })),
      }
    })
    .filter(Boolean) as {
    source: ReviewSource
    label: string
    color: string
    data: { subject: string; value: number; fullMark: number }[]
  }[]
}

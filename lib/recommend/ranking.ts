import type { Recommendation } from "@/lib/recommend/engine"

export type ResultAwardId =
  | "overall"
  | "value"
  | "seat-range"
  | "verified-data"
  | "desk-clearance"

export type ResultAward = {
  id: ResultAwardId
  title: string
  reason: string
}

export type RankedRecommendation = Recommendation & {
  awards: ResultAward[]
  strongAlternative: boolean
  alternativeReason: string | null
}

export type RankedRecommendationResults = {
  standouts: RankedRecommendation[]
  alternatives: RankedRecommendation[]
}

const AWARDS: Record<ResultAwardId, Omit<ResultAward, "id">> = {
  overall: {
    title: "Best Overall Fit",
    reason: "The strongest balance of fit score and published evidence.",
  },
  value: {
    title: "Best Value Fit",
    reason: "The strongest qualifying fit at a lower documented price.",
  },
  "seat-range": {
    title: "Best Seat-Range Match",
    reason: "The strongest combined seat-height and seat-depth overlap among qualifying candidates.",
  },
  "verified-data": {
    title: "Best Verified Data",
    reason: "The most complete published measurements among these candidates.",
  },
  "desk-clearance": {
    title: "Best Desk Clearance",
    reason: "Published armrest measurements confirm clearance under the entered desk.",
  },
}

const knownComponentCount = (r: Recommendation) =>
  Object.values(r.fit.components).filter((value) => value != null).length

const award = (id: ResultAwardId): ResultAward => ({ id, ...AWARDS[id] })

const winner = (
  candidates: Recommendation[],
  eligible: (candidate: Recommendation) => boolean,
  score: (candidate: Recommendation) => number,
) => candidates.filter(eligible).sort((a, b) => score(b) - score(a))[0]

/**
 * Assign evidence-backed awards independently, then render every chair once.
 * Winning one role never removes a chair from consideration for another.
 */
export function rankRecommendationResults(
  recommendations: Recommendation[],
): RankedRecommendationResults {
  if (!recommendations.length) return { standouts: [], alternatives: [] }

  const viable = recommendations.filter(
    (r) => r.fitStatus !== "insufficient-data" && r.fit.score > 0,
  )
  const pool = viable.length ? viable : recommendations
  const awards = new Map<string, ResultAward[]>()
  const give = (id: ResultAwardId, candidate?: Recommendation) => {
    if (!candidate) return
    awards.set(candidate.id, [...(awards.get(candidate.id) ?? []), award(id)])
  }

  const overall = winner(
    pool,
    () => true,
    (r) => r.fit.score + knownComponentCount(r) * 1.5,
  )
  give("overall", overall)

  const priced = pool.filter((r) => r.priceUsd != null && r.fit.score >= 60)
  const maxPrice = Math.max(1, ...priced.map((r) => r.priceUsd ?? 0))
  give(
    "value",
    winner(
      priced,
      () => true,
      (r) => r.fit.score - ((r.priceUsd ?? maxPrice) / maxPrice) * 18,
    ),
  )
  give(
    "seat-range",
    winner(
      pool,
      (r) => r.fitStatus === "good" && r.fit.components.seatHeight != null && r.fit.components.seatDepth != null,
      (r) => (r.fit.components.seatHeight ?? 0) + (r.fit.components.seatDepth ?? 0),
    ),
  )
  give(
    "verified-data",
    winner(
      pool,
      () => true,
      (r) => knownComponentCount(r) * 20 + (r.fitConfidence === "high" ? 10 : 0),
    ),
  )
  give(
    "desk-clearance",
    winner(
      pool,
      (r) => r.fit.components.deskClearance === 1,
      (r) => r.fit.score,
    ),
  )

  const overallId = overall?.id
  const awardHolders = recommendations.filter((r) => awards.has(r.id))
  awardHolders.sort((a, b) => {
    if (a.id === overallId) return -1
    if (b.id === overallId) return 1
    return (awards.get(b.id)?.length ?? 0) - (awards.get(a.id)?.length ?? 0) || b.fit.score - a.fit.score
  })

  const standoutIds = new Set(awardHolders.slice(0, 5).map((r) => r.id))
  const featured = overall ?? recommendations[0]
  const enrich = (r: Recommendation, isAlternative: boolean): RankedRecommendation => {
    const scoreGap = Math.abs(featured.fit.score - r.fit.score)
    const priceAdvantage =
      featured.priceUsd != null && r.priceUsd != null && r.priceUsd <= featured.priceUsd * 0.85
        ? `${Math.round((1 - r.priceUsd / featured.priceUsd) * 100)}% lower documented price than ${featured.name}.`
        : null
    const clearanceAdvantage =
      r.fit.components.deskClearance === 1 && featured.fit.components.deskClearance !== 1
        ? `Published armrest measurements confirm desk clearance; ${featured.name} does not.`
        : null
    const nearTie = isAlternative && scoreGap <= 3
    const alternativeReason = nearTie
      ? `Within ${scoreGap} Fit Score ${scoreGap === 1 ? "point" : "points"} of ${featured.name}.`
      : clearanceAdvantage ?? priceAdvantage
    return {
      ...r,
      awards: awards.get(r.id) ?? [],
      strongAlternative: isAlternative && Boolean(alternativeReason),
      alternativeReason,
    }
  }

  return {
    standouts: awardHolders.slice(0, 5).map((r) => enrich(r, false)),
    alternatives: recommendations
      .filter((r) => !standoutIds.has(r.id))
      .slice(0, 5)
      .map((r) => enrich(r, true)),
  }
}

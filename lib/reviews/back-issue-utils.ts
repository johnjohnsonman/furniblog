import type {
  BackIssueId,
  BackIssueSentiment,
  ChairScores,
  Review,
} from "@/types/review"

export type { BackIssueSentiment }

export const BACK_KEYWORDS = [
  "back pain",
  "lower back",
  "lumbar",
  "spine",
  "posture",
  "backache",
  "back support",
  "back issue",
  "herniated",
  "disc",
  "sciatica",
  "back problems",
  "back ache",
  "허리",
  "요추",
  "척추",
  "요통",
  "디스크",
] as const

const NECK_KEYWORDS = [
  "neck pain",
  "neck support",
  "cervical",
  "목",
  "경추",
] as const

export function getReviewTextBlob(review: Pick<Review, "summary" | "pros" | "cons">): string {
  return [review.summary, ...(review.pros ?? []), ...(review.cons ?? [])]
    .join(" ")
    .toLowerCase()
}

export function textMatchesKeywords(text: string, keywords: readonly string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(kw))
}

export function getChairScoresFields(scores: Review["scores"]): {
  mentionsBackPain?: boolean
  mentionsLumbar?: boolean
  backIssueSentiment?: BackIssueSentiment | null
} {
  if (!scores || !("overall" in scores)) return {}
  const chair = scores as ChairScores & {
    mentionsBackPain?: boolean
    mentionsLumbar?: boolean
    backIssueSentiment?: BackIssueSentiment | null
  }
  return {
    mentionsBackPain: chair.mentionsBackPain,
    mentionsLumbar: chair.mentionsLumbar,
    backIssueSentiment: chair.backIssueSentiment ?? null,
  }
}

export function reviewHasBackMention(review: Review): boolean {
  const { mentionsBackPain, mentionsLumbar } = getChairScoresFields(review.scores)
  if (mentionsBackPain === true || mentionsLumbar === true) return true

  const text = getReviewTextBlob(review)
  return textMatchesKeywords(text, BACK_KEYWORDS)
}

export function reviewHasNeckMention(review: Review): boolean {
  const text = getReviewTextBlob(review)
  return textMatchesKeywords(text, NECK_KEYWORDS)
}

export function reviewMatchesBackIssueFilter(
  review: Review,
  issueId: BackIssueId
): boolean {
  if (review.backIssues?.includes(issueId)) return true

  switch (issueId) {
    case "lower_back_pain":
    case "herniated_disc":
    case "sciatica":
      return reviewHasBackMention(review)
    case "neck_pain":
      return reviewHasNeckMention(review) || reviewHasBackMention(review)
    case "scoliosis":
    case "hip_pain":
      return reviewHasBackMention(review)
    case "no_issues":
      return review.backIssues?.includes("no_issues") ?? false
    default:
      return reviewHasBackMention(review)
  }
}

export function getBackIssueSentiment(
  review: Review
): BackIssueSentiment | null {
  const { backIssueSentiment } = getChairScoresFields(review.scores)
  if (backIssueSentiment) return backIssueSentiment

  if (!reviewHasBackMention(review)) return null

  const text = getReviewTextBlob(review)
  const positive = [
    "good for back",
    "helps my back",
    "back pain gone",
    "lumbar support is great",
    "허리에 좋",
    "요추 지지",
  ]
  const negative = [
    "bad for back",
    "worse back pain",
    "no lumbar",
    "back hurts",
    "허리 아프",
    "허리에 안",
  ]

  if (positive.some((p) => text.includes(p))) return "positive"
  if (negative.some((n) => text.includes(n))) return "negative"
  return "neutral"
}

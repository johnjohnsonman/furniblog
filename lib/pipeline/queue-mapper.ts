import type { QueueItem, SubredditCrawlMeta } from "@/types/pipeline"
import type { ReviewSource } from "@/types/review"
import type { ChairScores, FurnitureScores } from "@/types/review"

export type ContentQueueRow = {
  id: string
  source_type: string
  source_url: string
  raw_content: string
  item_type: "chair" | "furniture"
  item_id: string | null
  status: QueueItem["status"]
  ai_output: QueueItem["aiOutput"] | null
  created_at: string
  processed_at: string | null
  products?: { name: string; slug: string } | { name: string; slug: string }[] | null
}

function extractSubredditMeta(
  ai: QueueItem["aiOutput"] | Record<string, unknown> | null | undefined
): SubredditCrawlMeta | undefined {
  if (!ai || typeof ai !== "object") return undefined
  const o = ai as SubredditCrawlMeta & { summary?: string }
  if (!o.subredditCrawl) return undefined
  return {
    subredditCrawl: true,
    sentiment: o.sentiment,
    isReview: o.isReview,
    subreddit: o.subreddit,
    postTitle: o.postTitle,
    classifiedSlugs: o.classifiedSlugs,
    score: o.score,
    numComments: o.numComments,
  }
}

export function mapQueueRow(row: ContentQueueRow): QueueItem & {
  productName?: string
  productSlug?: string
} {
  const product = Array.isArray(row.products) ? row.products[0] : row.products
  const rawAi = row.ai_output as Record<string, unknown> | null
  const subredditMeta = extractSubredditMeta(rawAi)
  const hasReviewOutput =
    rawAi &&
    typeof rawAi.summary === "string" &&
    rawAi.summary.length > 0

  return {
    id: row.id,
    sourceType: row.source_type as ReviewSource,
    sourceUrl: row.source_url,
    rawContent: row.raw_content,
    itemType: row.item_type,
    itemId: row.item_id ?? undefined,
    status: row.status,
    subredditMeta,
    aiOutput:
      row.ai_output && hasReviewOutput
        ? {
            summary:
              row.ai_output.summary ??
              (row.ai_output as { summaryKo?: string }).summaryKo ??
              "",
            scores: row.ai_output.scores as ChairScores | FurnitureScores,
            pros: row.ai_output.pros ?? [],
            cons: row.ai_output.cons ?? [],
            confidence: row.ai_output.confidence ?? 0,
            reviewerHeightCm: row.ai_output.reviewerHeightCm,
            reviewerWeightKg: row.ai_output.reviewerWeightKg,
            designKeywords: row.ai_output.designKeywords,
          }
        : undefined,
    createdAt: row.created_at,
    processedAt: row.processed_at ?? undefined,
    productName: product?.name,
    productSlug: product?.slug,
  }
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

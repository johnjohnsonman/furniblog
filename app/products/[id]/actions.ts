"use server"

import { getProductReviews } from "@/lib/supabase/queries"
import type { Review } from "@/types/review"

const PAGE = 24

/**
 * Next batch of a product's public reviews for "See all N reviews" on the product
 * page (newest first), skipping the ones already server-rendered. Only public,
 * non-excluded reviews are returned (getProductReviews filters them).
 */
export async function loadMoreProductReviews(
  productId: string,
  skipIds: string[],
  offset: number
): Promise<{ items: Review[]; remaining: number }> {
  const skip = new Set(skipIds.slice(0, 50))
  const rest = (await getProductReviews(productId)).filter((r) => !skip.has(r.id))
  const start = Math.max(0, Math.floor(offset))
  const items = rest.slice(start, start + PAGE)
  return { items, remaining: Math.max(0, rest.length - start - items.length) }
}

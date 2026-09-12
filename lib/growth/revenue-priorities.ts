/**
 * Commercial-priority products for US acquisition and affiliate conversion.
 *
 * Order combines observed US entry traffic, a model-specific Amazon.com
 * destination, existing editorial/comparison coverage, and buyer intent.
 * It is a routing priority, not a product rating or a claim about sales.
 */
export const REVENUE_PRIORITY_SLUGS = [
  "herman-miller-aeron",
  "steelcase-leap-v2",
  "steelcase-gesture",
  "steelcase-series-1",
  "sihoo-doro-c300",
  "steelcase-karman",
  "steelcase-series-2",
  "autonomous-ergochair-pro",
  "herman-miller-mirra-2",
  "steelcase-amia",
  "humanscale-freedom",
  "humanscale-diffrient-world",
  "humanscale-liberty",
  "sihoo-m18",
  "ticova-ergonomic",
  "branch-ergonomic-chair",
  "branch-verve",
  "flexispot-c7",
  "sidiz-t50",
  "hon-ignition-2",
  "nouhaus-ergo3d",
  "duramont-ergonomic",
  "gabrylly-ergonomic",
  "mimoglad-high-back",
  "ergohuman-elite",
  "knoll-generation",
  "knoll-regeneration",
  "okamura-contessa-ii",
  "aeris-swopper",
  "varier-variable-balans",
] as const

const REVENUE_PRIORITY = new Map<string, number>(
  REVENUE_PRIORITY_SLUGS.map((slug, index) => [slug, index])
)

export function revenuePriorityRank(slug: string): number {
  return REVENUE_PRIORITY.get(slug) ?? Number.MAX_SAFE_INTEGER
}

export function isRevenuePriority(slug: string): boolean {
  return REVENUE_PRIORITY.has(slug)
}

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

/**
 * Second commercial cohort: products with a model-specific Amazon.com ASIN.
 * Order is generated from editorial coverage, review coverage and content gaps
 * by scripts/select-revenue-expansion-products.cjs.
 */
export const REVENUE_EXPANSION_SLUGS = [
  "x-chair-x1",
  "andaseat-kaiser-3",
  "hbada-p5",
  "office-star-progrid",
  "sihoo-doro-s300",
  "allsteel-acuity",
  "sidiz-t80",
  "x-chair-x3",
  "duorest-alpha",
  "furmax-gaming",
  "modway-articulate",
  "ergohuman-classic",
  "x-chair-x2",
  "hon-wave",
  "la-z-boy-bellamy",
  "aeris-3dee",
  "allsteel-mimeo",
  "bestoffice-mesh-task",
  "boss-office-b991",
  "corsair-tc100-relaxed",
  "dowinx-gaming",
  "duorest-gold-plus",
  "flash-furniture-mid-back-mesh",
  "flexispot-oc3",
  "gtracing-gaming",
  "homall-racing",
  "hon-convergence",
  "hon-nucleus",
  "la-z-boy-delano",
  "la-z-boy-trafford",
  "noblechairs-epic",
  "noblechairs-hero",
  "office-star-ventilated-managers",
  "razer-enki",
  "razer-iskur-v2",
  "razer-iskur-v2-x",
  "serta-fairbanks",
  "sweetcrispy-high-back-mesh",
  "uplift-envoke",
  "uplift-pursuit",
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

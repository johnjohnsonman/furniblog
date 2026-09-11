// Editorial selections reviewed on 2026-09-11, not product or commission rankings.
export const PRIORITY_COMPARISONS = [
  "herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj",
  "sihoo-m18-vs-sihoo-doro-c300",
  "steelcase-leap-v2-vs-steelcase-karman-which-should-you-buy-mtdsokvd",
  "ticova-ergonomic-vs-sihoo-m18",
  "okamura-contessa-ii-vs-herman-miller-aeron-which-should-you-buy-ms5i1068",
] as const

export function orderComparisonCards<T extends { slug: string }>(cards: T[]): T[] {
  const priority = new Map<string, number>(PRIORITY_COMPARISONS.map((slug, index) => [slug, index]))
  // Only reorder already-public results; retain the existing order for other cards.
  return [...cards].sort((a, b) =>
    (priority.get(a.slug) ?? priority.size) - (priority.get(b.slug) ?? priority.size)
  )
}

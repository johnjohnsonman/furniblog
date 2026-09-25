import type { ProductCardView } from "@/lib/data/mappers"

export const PRODUCTS_PAGE_SIZE = 12

/**
 * Default /products order: most reviewed first, then brand and name.
 * Deterministic so each ?page=N lists the same chairs for crawlers and visitors.
 */
export function orderCatalogForListing<T extends Pick<ProductCardView, "id" | "brand" | "name">>(
  products: T[],
  reviewCounts: Record<string, { count: number }>,
): T[] {
  return [...products].sort((a, b) =>
    (reviewCounts[b.id]?.count ?? 0) - (reviewCounts[a.id]?.count ?? 0) ||
    `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, "en") ||
    a.id.localeCompare(b.id, "en"))
}

/** Listing URL for a page, keeping other query parameters (e.g. category). */
export function productsPageHref(page: number, current: URLSearchParams | null): string {
  const params = new URLSearchParams(current?.toString() ?? "")
  if (page > 1) params.set("page", String(page))
  else params.delete("page")
  const query = params.toString()
  return query ? `/products?${query}` : "/products"
}

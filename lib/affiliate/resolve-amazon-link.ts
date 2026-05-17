import { AFFILIATE_LINKS_DATA } from "@/lib/data/affiliate-links-data"

const DEFAULT_TAG = "furniblog0e-20"

export type ResolvedAmazonLink = {
  retailerName: string
  url: string
  priceUsd?: number
  isOfficial: false
  source: "catalog" | "search"
}

function amazonAssociateTag(): string {
  return process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || DEFAULT_TAG
}

export function buildAmazonSearchUrl(query: string): string {
  const tag = amazonAssociateTag()
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${tag}`
}

function isAmazonEntry(retailer: string, url: string): boolean {
  const r = retailer.toLowerCase()
  return r.includes("amazon") || url.includes("amazon.")
}

/** Prefer catalog Amazon URL; otherwise Amazon search for brand + product name. */
export function resolveAmazonAffiliateLink(
  slug: string,
  productName: string,
  brandName?: string
): ResolvedAmazonLink {
  const catalog = AFFILIATE_LINKS_DATA[slug]
  const fromCatalog = catalog?.find((l) => isAmazonEntry(l.retailer, l.url))

  if (fromCatalog) {
    return {
      retailerName: "Amazon",
      url: fromCatalog.url,
      priceUsd: fromCatalog.priceUsd,
      isOfficial: false,
      source: "catalog",
    }
  }

  const query = brandName?.trim()
    ? `${brandName.trim()} ${productName.trim()}`
    : productName.trim()

  return {
    retailerName: "Amazon",
    url: buildAmazonSearchUrl(query),
    isOfficial: false,
    source: "search",
  }
}

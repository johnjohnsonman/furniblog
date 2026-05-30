import { AFFILIATE_LINKS_DATA } from "@/lib/data/affiliate-links-data"

// Minimal fallback only — the real tag lives in NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG.
const FALLBACK_TAG = "furniblog0e-20"

export type ResolvedAmazonLink = {
  retailerName: string
  url: string
  priceUsd?: number
  isOfficial: false
  source: "catalog" | "search"
}

function amazonAssociateTag(): string {
  return process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || FALLBACK_TAG
}

/** Apply the env affiliate tag to any Amazon URL (catalog URLs are now stored tagless). */
function withAmazonTag(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    url.searchParams.set("tag", amazonAssociateTag())
    return url.toString()
  } catch {
    return rawUrl
  }
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
      url: withAmazonTag(fromCatalog.url),
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

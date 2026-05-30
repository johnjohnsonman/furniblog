import { AFFILIATE_LINKS_DATA } from "./affiliate-links-data"

export interface CatalogAffiliateLink {
  retailer: string
  url: string
  isOfficial: boolean
  priceUsd?: number
  priceKrw?: number
}

export function getDefaultAffiliateLinks(
  slug: string,
  name: string
): CatalogAffiliateLink[] {
  return [
    {
      retailer: "Amazon",
      // No tag here — buildAffiliateUrl injects NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG at render time.
      url: `https://www.amazon.com/s?k=${encodeURIComponent(name)}`,
      isOfficial: false,
    },
  ]
}

export function getProductAffiliateLinks(
  slug: string,
  name: string
): CatalogAffiliateLink[] {
  const links = AFFILIATE_LINKS_DATA[slug]
  if (links?.length) return links
  return getDefaultAffiliateLinks(slug, name)
}

export { AFFILIATE_LINKS_DATA }

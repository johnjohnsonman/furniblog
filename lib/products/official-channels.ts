import type { PriceProvenance } from "./price-provenance"
import type { ProductContentHub } from "./content-hubs"
import { getOfficialLink, type OfficialLink } from "./official-links-data"

/**
 * Where to send buyers for chairs without a buyable Amazon US listing.
 * The per-product channels live in official-links-data (client-safe, shared
 * with the buy buttons); hub products flagged notOnAmazon fall back to their
 * sourced US store. Amazon search fallbacks are never used for these chairs.
 */
export type OfficialChannel = OfficialLink

export function getOfficialChannel(
  slug: string,
  price: PriceProvenance | undefined,
  hub: ProductContentHub | null | undefined
): OfficialChannel | null {
  const listed = getOfficialLink(slug)
  if (listed) return listed
  // Hub products flagged as not sold on Amazon go to their sourced US store.
  if (hub?.notOnAmazon && price?.sourceUrl) {
    const store = price.sourceLabel.replace(/^US\s+/, "")
    return {
      kind: "store",
      url: price.sourceUrl,
      label: `View on ${store}`,
      retailer: price.sourceLabel,
      note: "Not sold on Amazon. Warranty, shipping and returns follow the official store's terms — check before ordering.",
    }
  }
  return null
}

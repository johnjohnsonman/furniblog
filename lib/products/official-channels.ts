import type { PriceProvenance } from "./price-provenance"
import type { ProductContentHub } from "./content-hubs"

/**
 * Where to send buyers for chairs without a buyable Amazon US listing.
 * The destination is the sourced price page (price-provenance) unless a
 * channel names a better official page. Amazon search fallbacks are never
 * used for these products.
 */
export type OfficialChannel = {
  kind: "store" | "site" | "quote"
  url: string
  /** Button text, without the trailing arrow. */
  label: string
  /** Retailer name for the Where-to-buy row. */
  retailer: string
  /** One line under the button. */
  note: string
}

const JAPAN_STORE_NOTE = "Official store in Japan. Confirm shipping to your country, warranty and returns before ordering."
const QUOTE_NOTE = "No published price. The brand quotes by configuration, so ask for the exact build you want."

const CHANNELS: Record<string, { kind: OfficialChannel["kind"]; label: string; note: string; url?: string }> = {
  // Japan-only chairs: the official shop is the sourced price page.
  "kokuyo-ing-cloud": { kind: "store", label: "View on KOKUYO official store", note: JAPAN_STORE_NOTE },
  "kokuyo-ing": { kind: "store", label: "View on KOKUYO official store", note: JAPAN_STORE_NOTE },
  // The Amazon US listing (Contessa Seconda, white) showed "Currently unavailable" on 2026-09-25.
  "okamura-contessa-ii": { kind: "store", label: "View on OKAMURA official store", note: JAPAN_STORE_NOTE },
  // ITOKI's product page moved; its official launch notice links to the ITOKI shop.
  "itoki-act2": { kind: "site", label: "View on ITOKI official site", note: "Official ITOKI page in Japan. Confirm where to buy in your country before ordering." },
  // Contract chairs sold through dealers.
  "wilkhahn-on": { kind: "quote", label: "Ask for a quote", note: QUOTE_NOTE },
  "hag-tion": { kind: "quote", label: "Ask for a quote", note: QUOTE_NOTE },
}

export function getOfficialChannel(
  slug: string,
  price: PriceProvenance | undefined,
  hub: ProductContentHub | null | undefined
): OfficialChannel | null {
  const cfg = CHANNELS[slug]
  const url = cfg?.url ?? price?.sourceUrl
  if (cfg && url) return { ...cfg, url, retailer: price?.sourceLabel ?? cfg.label }
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

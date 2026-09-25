/**
 * Sourced display prices, keyed by product slug.
 *
 * Field names mirror the planned DB columns 1:1 (camelCase here, snake_case in
 * the table), e.g. regularMinUsd → price_regular_min_usd, sourceUrl →
 * price_source_url, fxRate → price_fx_rate, so the phase-2 migration can copy
 * these rows as-is.
 *
 * Only the *display* label comes from here. Numeric products.price_usd stays
 * untouched, so sorting, budget filters and recommendations are unaffected.
 */

export type PriceType =
  /** Official regular list price (single value or configuration range). */
  | "regular"
  /** Official store currently sells below its list price; show the sale price. */
  | "sale"
  /** No US price; converted from an official local-currency price ("≈"). */
  | "converted"
  /** No reliable published price. */
  | "on_request"

export type PriceVariant = {
  /** e.g. "Fabric", "Leather" */
  label: string
  regularMinUsd: number
  regularMaxUsd: number
}

export type PriceProvenance = {
  priceType: PriceType
  regularMinUsd?: number
  regularMaxUsd?: number
  saleMinUsd?: number
  saleMaxUsd?: number
  /** Separate ranges shown side by side, e.g. by upholstery material. */
  variants?: PriceVariant[]
  /** Which configurations the range covers, when it is narrower than the product. */
  scope?: string
  sourceLabel: string
  sourceUrl?: string
  /** ISO date the price was read from the source. */
  checkedOn: string
  /** converted only: the official local price the "≈" figure comes from. */
  localCurrency?: "JPY"
  localMin?: number
  localMax?: number
  localTaxIncluded?: boolean
  /** converted only: local units per 1 USD, fixed at fxDate. */
  fxRate?: number
  fxSource?: string
  fxDate?: string
}

const HM = "US Herman Miller Store"
const STEELCASE = "US Steelcase Store"
const KNOLL = "US Knoll Store"
const CHECKED = "2026-09-25"
const ECB = { fxRate: 158.85, fxSource: "ECB euro reference rates (USD/JPY cross)", fxDate: "2026-09-24" } as const

export const priceProvenance: Record<string, PriceProvenance> = {
  // Hub products
  "herman-miller-aeron": { priceType: "regular", regularMinUsd: 2045, regularMaxUsd: 2730, sourceLabel: HM, sourceUrl: "https://store.hermanmiller.com/office-chairs-aeron/aeron-chair/2195348.html?lang=en_US", checkedOn: CHECKED },
  "herman-miller-embody": { priceType: "regular", regularMinUsd: 2340, regularMaxUsd: 2705, sourceLabel: HM, sourceUrl: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/embody-chair/4737.html?lang=en_US", checkedOn: CHECKED },
  "herman-miller-embody-gaming": { priceType: "regular", regularMinUsd: 2395, regularMaxUsd: 2395, sourceLabel: HM, sourceUrl: "https://store.hermanmiller.com/gaming-chairs/embody-gaming-chair/2517590.html?lang=en_US", checkedOn: CHECKED },

  // Official US stores
  "steelcase-leap-v2": { priceType: "regular", regularMinUsd: 1499, regularMaxUsd: 2667, sourceLabel: STEELCASE, sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/leap", checkedOn: CHECKED },
  "steelcase-gesture": { priceType: "regular", regularMinUsd: 1599, regularMaxUsd: 2560, scope: "without headrest", sourceLabel: STEELCASE, sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/gesture", checkedOn: CHECKED },
  "steelcase-karman": { priceType: "regular", regularMinUsd: 1199, regularMaxUsd: 1543, sourceLabel: STEELCASE, sourceUrl: "https://store.steelcase.com/seating/ergonomic-chairs/steelcase-karman", checkedOn: CHECKED },
  "herman-miller-mirra-2": { priceType: "regular", regularMinUsd: 1365, regularMaxUsd: 1915, sourceLabel: HM, sourceUrl: "https://store.hermanmiller.com/collection-mirra2?lang=en_US", checkedOn: CHECKED },
  "knoll-generation": { priceType: "regular", regularMinUsd: 1494, regularMaxUsd: 1705, sourceLabel: KNOLL, sourceUrl: "https://www.knoll.com/shop/en_us/collection-generation-family", checkedOn: CHECKED },
  "knoll-barcelona-chair": {
    priceType: "regular", regularMinUsd: 5550, regularMaxUsd: 12725,
    variants: [{ label: "Fabric", regularMinUsd: 5550, regularMaxUsd: 7170 }, { label: "Leather", regularMinUsd: 8327, regularMaxUsd: 12725 }],
    sourceLabel: KNOLL, sourceUrl: "https://www.knoll.com/shop/en_us/collection-barcelona", checkedOn: CHECKED,
  },
  "knoll-womb-chair": { priceType: "regular", regularMinUsd: 6128, regularMaxUsd: 11336, scope: "Standard size, chair only", sourceLabel: KNOLL, sourceUrl: "https://www.knoll.com/shop/en_us/collection-womb", checkedOn: CHECKED },
  "noblechairs-hero": { priceType: "regular", regularMinUsd: 399.99, regularMaxUsd: 699.99, scope: "Black Edition to Real Leather", sourceLabel: "US noblechairs Store", sourceUrl: "https://noblechairs.com/collections/hero-series", checkedOn: CHECKED },
  "autonomous-ergochair-pro": { priceType: "regular", regularMinUsd: 499, regularMaxUsd: 499, sourceLabel: "Autonomous", sourceUrl: "https://www.autonomous.ai/office-chairs/ergonomic-chair", checkedOn: CHECKED },
  "nouhaus-ergo3d": { priceType: "sale", regularMinUsd: 499.99, regularMaxUsd: 499.99, saleMinUsd: 299.99, saleMaxUsd: 299.99, sourceLabel: "Nouhaus", sourceUrl: "https://nouhaus.com/products/ergo3d", checkedOn: CHECKED },

  // Not sold in the US: official Japanese price converted at a fixed rate ("≈")
  "okamura-contessa-ii": {
    priceType: "converted", localCurrency: "JPY", localMin: 244310, localMax: 391820, localTaxIncluded: true, ...ECB,
    scope: "standard fabric and mesh configurations",
    sourceLabel: "OKAMURA Lifestyle Store (Japan)", sourceUrl: "https://lifestylestore.okamura.co.jp/products/cc88xs-ff71", checkedOn: CHECKED,
  },
  "kokuyo-ing-cloud": {
    priceType: "converted", localCurrency: "JPY", localMin: 246180, localMax: 266860, localTaxIncluded: true, ...ECB,
    scope: "chair only, with or without headrest",
    sourceLabel: "KOKUYO Workstyle Shop (Japan)", sourceUrl: "https://workstyle.kokuyo.co.jp/shop/c/c1165/", checkedOn: CHECKED,
  },
  "itoki-act2": {
    priceType: "converted", localCurrency: "JPY", localMin: 132240, localMax: 132240, localTaxIncluded: true, ...ECB,
    scope: "official launch price, from",
    sourceLabel: "ITOKI (Japan)", sourceUrl: "https://www.itoki.jp/company/news/2025/2505_act2/", checkedOn: CHECKED,
  },

  // No published US price
  "wilkhahn-on": { priceType: "on_request", sourceLabel: "Wilkhahn US (dealer network)", sourceUrl: "https://www.wilkhahn.com/en-us/products/task-chairs-office-chairs/on/", checkedOn: CHECKED },
  "hag-tion": { priceType: "on_request", sourceLabel: "Flokk US store (ask for price)", sourceUrl: "https://store.flokk.com/us/en-gb/products/hag-tion", checkedOn: CHECKED },
}

export function getPriceProvenance(slug?: string | null): PriceProvenance | undefined {
  return slug ? priceProvenance[slug] : undefined
}

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`
const yen = (n: number) => `¥${n.toLocaleString("en-US")}`
const range = (min: number, max: number, fmt = usd) => (min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`)
/** Converted figures are rounded to $10 so they never read as exact prices. */
const round10 = (n: number) => Math.round(n / 10) * 10

function asOf(isoDate: string) {
  const [year, month] = isoDate.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
}

/** Short label for cards and tables, e.g. "$1,499 – $2,667" or "≈ $1,420". */
export function formatPriceAmount(p: PriceProvenance): string {
  switch (p.priceType) {
    case "on_request":
      return "Price on request"
    case "sale":
      return range(p.saleMinUsd!, p.saleMaxUsd!)
    case "converted": {
      const min = round10(p.localMin! / p.fxRate!), max = round10(p.localMax! / p.fxRate!)
      return `≈ ${range(min, max)}`
    }
    default:
      if (p.variants?.length) return p.variants.map((v) => `${v.label} ${usd(v.regularMinUsd)}–${usd(v.regularMaxUsd).slice(1)}`).join(" · ")
      return range(p.regularMinUsd!, p.regularMaxUsd!)
  }
}

/** Qualifier shown under the amount on the product page. */
export function formatPriceNote(p: PriceProvenance): string {
  const parts: string[] = []
  if (p.scope) parts.push(p.scope)
  switch (p.priceType) {
    case "on_request":
      parts.push("ask the manufacturer or an authorized dealer")
      return parts.join(" · ")
    case "sale":
      parts.push(`sale price · list ${range(p.regularMinUsd!, p.regularMaxUsd!)}`)
      break
    case "converted":
      parts.push(`Japan retail ${range(p.localMin!, p.localMax!, yen)} (${p.localTaxIncluded ? "tax incl." : "excl. tax"}) at ¥${p.fxRate}/$`)
      break
    default:
      parts.push(p.variants?.length ? "varies by material and configuration" : p.regularMinUsd === p.regularMaxUsd ? "listed price" : "varies by configuration")
  }
  parts.push(`as of ${asOf(p.checkedOn)}`)
  return parts.join(" · ")
}

/** Display label for product cards, or null when the catalog price should be used. */
export function displayPrice(slug?: string | null): string | null {
  const p = getPriceProvenance(slug)
  return p ? formatPriceAmount(p) : null
}

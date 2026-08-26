import type { CatalogAffiliateLink } from "@/lib/data/affiliate-links"
import type { PriceRow } from "@/lib/affiliate/price-rows"
import { formatUsdPrice } from "@/lib/pricing"
import type { AffiliateLink } from "@/types/affiliate-link"
import type { AffiliateCountry } from "@/lib/affiliate/links"

function formatKrw(priceKrw: number): string {
  return `₩${priceKrw.toLocaleString("en-US")}`
}

export function detectChannel(
  retailer: string,
  url: string
): AffiliateLink["channel"] {
  const r = retailer.toLowerCase()
  if (r.includes("coupang") || url.includes("link.coupang.com")) return "coupang"
  if (r.includes("amazon") || url.includes("amazon.")) return "amazon"
  if (r.includes("official") || r.includes("official store")) return "official"
  if (r.includes("rakuten")) return "rakuten"
  if (r.includes("naver")) return "naver"
  return "official"
}

export function buildPriceRowsFromCatalog(
  links: CatalogAffiliateLink[]
): PriceRow[] {
  return links.map((link) => {
    const channel = detectChannel(link.retailer, link.url)
    let priceDisplay = "Check price"
    if (link.priceUsd != null && link.priceUsd > 0) {
      priceDisplay = formatUsdPrice(link.priceUsd)
    } else if (link.priceKrw != null && link.priceKrw > 0) {
      priceDisplay = formatKrw(link.priceKrw)
    }

    return {
      retailer: link.retailer,
      priceDisplay,
      shipping:
        channel === "official"
          ? "Free (brand policy)"
          : channel === "amazon"
            ? "Free shipping eligible"
            : channel === "coupang"
              ? "Rocket delivery available"
              : "—",
      isOfficial: link.isOfficial,
      url: link.url,
      channel,
    }
  })
}

export function sortCatalogLinksForCountry(
  links: CatalogAffiliateLink[],
  country: AffiliateCountry
): CatalogAffiliateLink[] {
  if (country !== "KR") return links
  const coupang = links.filter((l) => detectChannel(l.retailer, l.url) === "coupang")
  const rest = links.filter((l) => detectChannel(l.retailer, l.url) !== "coupang")
  return [...coupang, ...rest]
}

export function urlsFromCatalog(links: CatalogAffiliateLink[]) {
  const find = (pred: (l: CatalogAffiliateLink) => boolean) =>
    links.find(pred)?.url

  return {
    officialUrl: find((l) => l.isOfficial),
    amazonUrl: find(
      (l) =>
        detectChannel(l.retailer, l.url) === "amazon" &&
        !l.url.includes("amazon.co.jp")
    ),
    coupangUrl: find((l) => detectChannel(l.retailer, l.url) === "coupang"),
    rakutenUrl: find((l) => l.url.includes("amazon.co.jp")),
  }
}

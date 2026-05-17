import type { AffiliateLink } from "@/types/affiliate-link"
import { formatProductPrice, resolvePriceUsd } from "@/lib/pricing"

export interface PriceRow {
  retailer: string
  priceDisplay: string
  shipping: string
  isOfficial: boolean
  url: string
  channel: AffiliateLink["channel"]
}

const RETAILER_SHIPPING: Record<string, string> = {
  official: "Free (brand policy)",
  amazon: "Free shipping eligible",
  coupang: "Rocket delivery available",
  naver: "Varies by seller",
  rakuten: "International shipping",
  chairpark: "In-store visit",
}

export function buildPriceRows(
  links: AffiliateLink[] | undefined | null,
  defaultPrice?: string,
  priceUsd?: number | null
): PriceRow[] {
  const safeLinks = links ?? []
  const resolvedUsd = resolvePriceUsd(priceUsd, defaultPrice)
  const displayPrice = formatProductPrice(resolvedUsd)

  return safeLinks.map((link) => ({
    retailer: link.label,
    priceDisplay:
      link.channel === "official" || link.channel === "amazon"
        ? displayPrice
        : "Check price",
    shipping: RETAILER_SHIPPING[link.channel] ?? "—",
    isOfficial: link.channel === "official",
    url: link.url,
    channel: link.channel,
  }))
}

export function parsePriceNumber(display: string): number {
  if (display === "Price on request") return Number.MAX_SAFE_INTEGER
  const digits = display.replace(/[^\d]/g, "")
  return digits ? parseInt(digits, 10) : Number.MAX_SAFE_INTEGER
}

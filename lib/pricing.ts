export const PRICE_ON_REQUEST = "Price on request"

export function formatUsdPrice(priceUsd: number): string {
  return `$${priceUsd.toLocaleString("en-US")}`
}

export function formatProductPrice(priceUsd?: number | null): string {
  if (priceUsd != null && priceUsd > 0) {
    return formatUsdPrice(priceUsd)
  }
  return PRICE_ON_REQUEST
}

/** Parse a USD amount from legacy priceLabel strings like "$1,395" or "$1,395+" */
export function parseUsdFromLabel(priceLabel?: string | null): number | null {
  if (!priceLabel) return null
  const match = priceLabel.match(/\$([\d,]+)/)
  if (!match) return null
  const value = parseInt(match[1].replace(/,/g, ""), 10)
  return value > 0 ? value : null
}

export function resolvePriceUsd(
  priceUsd?: number | null,
  priceLabel?: string | null
): number | null {
  if (priceUsd != null && priceUsd > 0) return priceUsd
  return parseUsdFromLabel(priceLabel)
}

export function singaporeAmazonUrl(baseUrl: string, productName: string, country: string): string {
  if (country !== "SG") return baseUrl
  let source: URL
  try {
    source = new URL(baseUrl)
  } catch {
    return baseUrl
  }
  if (source.protocol !== "https:" || !["amazon.com", "www.amazon.com", "amazon.co.jp", "www.amazon.co.jp", "amazon.sg", "www.amazon.sg"].includes(source.hostname)) return baseUrl

  // Never assume an overseas ASIN identifies an available Singapore listing.
  const query = source.searchParams.get("k")?.trim() || productName.trim()
  if (!query && !source.hostname.endsWith("amazon.sg")) return baseUrl
  const destination = source.hostname === "amazon.sg" || source.hostname === "www.amazon.sg"
    ? source
    : new URL("https://www.amazon.sg/s")
  if (destination !== source) destination.searchParams.set("k", query)
  destination.searchParams.set("tag", process.env.NEXT_PUBLIC_AMAZON_SG_TAG?.trim() || "furniblog-22")
  return destination.toString()
}

export function readAmazonCountry(): string {
  if (typeof document === "undefined") return "US"
  return document.cookie.match(/(?:^|;\s*)x-country=([^;]+)/)?.[1]?.toUpperCase() || "US"
}

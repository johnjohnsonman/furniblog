export type AmazonMarketplace = { country: string; domain: string; label: string; tag?: string }
export type AmazonDestination = AmazonMarketplace & { url: string; affiliate: boolean; search: boolean }

// Public variables must be referenced statically for the Next.js client bundle.
// Never guess a marketplace tracking ID.
const MARKETPLACES: Record<string, AmazonMarketplace> = {
  US: { country: "US", domain: "www.amazon.com", label: "Amazon.com", tag: process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || "furniblog0e-20" },
  GB: { country: "GB", domain: "www.amazon.co.uk", label: "Amazon.co.uk", tag: process.env.NEXT_PUBLIC_AMAZON_GB_TAG?.trim() || undefined },
  DE: { country: "DE", domain: "www.amazon.de", label: "Amazon.de", tag: process.env.NEXT_PUBLIC_AMAZON_DE_TAG?.trim() || undefined },
  FR: { country: "FR", domain: "www.amazon.fr", label: "Amazon.fr", tag: process.env.NEXT_PUBLIC_AMAZON_FR_TAG?.trim() || undefined },
  JP: { country: "JP", domain: "www.amazon.co.jp", label: "Amazon.co.jp", tag: process.env.NEXT_PUBLIC_AMAZON_JP_TAG?.trim() || "furniblogjp-22" },
  CA: { country: "CA", domain: "www.amazon.ca", label: "Amazon.ca", tag: process.env.NEXT_PUBLIC_AMAZON_CA_TAG?.trim() || undefined },
  IT: { country: "IT", domain: "www.amazon.it", label: "Amazon.it", tag: process.env.NEXT_PUBLIC_AMAZON_IT_TAG?.trim() || undefined },
  ES: { country: "ES", domain: "www.amazon.es", label: "Amazon.es", tag: process.env.NEXT_PUBLIC_AMAZON_ES_TAG?.trim() || undefined },
  IN: { country: "IN", domain: "www.amazon.in", label: "Amazon.in", tag: process.env.NEXT_PUBLIC_AMAZON_IN_TAG?.trim() || undefined },
  BR: { country: "BR", domain: "www.amazon.com.br", label: "Amazon.com.br", tag: process.env.NEXT_PUBLIC_AMAZON_BR_TAG?.trim() || undefined },
  MX: { country: "MX", domain: "www.amazon.com.mx", label: "Amazon.com.mx", tag: process.env.NEXT_PUBLIC_AMAZON_MX_TAG?.trim() || undefined },
  AU: { country: "AU", domain: "www.amazon.com.au", label: "Amazon.com.au", tag: process.env.NEXT_PUBLIC_AMAZON_AU_TAG?.trim() || undefined },
  AE: { country: "AE", domain: "www.amazon.ae", label: "Amazon.ae", tag: process.env.NEXT_PUBLIC_AMAZON_AE_TAG?.trim() || undefined },
  SG: { country: "SG", domain: "www.amazon.sg", label: "Amazon.sg", tag: process.env.NEXT_PUBLIC_AMAZON_SG_TAG?.trim() || "furniblog-22" },
  NL: { country: "NL", domain: "www.amazon.nl", label: "Amazon.nl", tag: process.env.NEXT_PUBLIC_AMAZON_NL_TAG?.trim() || undefined },
  SA: { country: "SA", domain: "www.amazon.sa", label: "Amazon.sa", tag: process.env.NEXT_PUBLIC_AMAZON_SA_TAG?.trim() || undefined },
  SE: { country: "SE", domain: "www.amazon.se", label: "Amazon.se", tag: process.env.NEXT_PUBLIC_AMAZON_SE_TAG?.trim() || undefined },
  PL: { country: "PL", domain: "www.amazon.pl", label: "Amazon.pl", tag: process.env.NEXT_PUBLIC_AMAZON_PL_TAG?.trim() || undefined },
  BE: { country: "BE", domain: "www.amazon.com.be", label: "Amazon.com.be", tag: process.env.NEXT_PUBLIC_AMAZON_BE_TAG?.trim() || undefined },
  IE: { country: "IE", domain: "www.amazon.ie", label: "Amazon.ie", tag: process.env.NEXT_PUBLIC_AMAZON_IE_TAG?.trim() || undefined },
  TR: { country: "TR", domain: "www.amazon.com.tr", label: "Amazon.com.tr", tag: process.env.NEXT_PUBLIC_AMAZON_TR_TAG?.trim() || undefined },
  EG: { country: "EG", domain: "www.amazon.eg", label: "Amazon.eg", tag: process.env.NEXT_PUBLIC_AMAZON_EG_TAG?.trim() || undefined },
}

const AMAZON_HOSTS = new Set(Object.values(MARKETPLACES).flatMap(({ domain }) => [domain, domain.replace(/^www\./, "")]))

export function getAmazonMarketplace(country: string): AmazonMarketplace {
  return MARKETPLACES[country.toUpperCase()] || MARKETPLACES.US
}

export function resolveAmazonDestination(baseUrl: string, productName: string, country: string): AmazonDestination {
  const marketplace = getAmazonMarketplace(country)
  let source: URL
  try { source = new URL(baseUrl) } catch { return { ...marketplace, url: baseUrl, affiliate: false, search: false } }
  if (source.protocol !== "https:" || !AMAZON_HOSTS.has(source.hostname)) {
    return { ...marketplace, url: baseUrl, affiliate: false, search: false }
  }
  const sourceCountry = Object.values(MARKETPLACES).find(({ domain }) =>
    source.hostname === domain || source.hostname === domain.replace(/^www\./, "")
  )?.country
  const query = source.searchParams.get("k")?.trim() || productName.trim()
  let destination = source
  // ASINs and availability are marketplace-specific. Preserve direct pages only
  // in their own marketplace; use an honest product-name search elsewhere.
  if (sourceCountry !== marketplace.country) {
    if (!query) return { ...marketplace, url: baseUrl, affiliate: false, search: false }
    destination = new URL(`https://${marketplace.domain}/s`)
    destination.searchParams.set("k", query)
    const subtag = source.searchParams.get("ascsubtag")
    if (subtag) destination.searchParams.set("ascsubtag", subtag)
  }
  destination.searchParams.delete("tag")
  if (marketplace.tag) destination.searchParams.set("tag", marketplace.tag)
  const search = destination.pathname === "/s" || Boolean(destination.searchParams.get("k"))
  return { ...marketplace, url: destination.toString(), affiliate: Boolean(marketplace.tag), search }
}

/** Compatibility wrapper retained for older imports. */
export function singaporeAmazonUrl(baseUrl: string, productName: string, country: string): string {
  return resolveAmazonDestination(baseUrl, productName, country).url
}

export function readAmazonCountry(): string {
  if (typeof document === "undefined") return "US"
  return document.cookie.match(/(?:^|;\s*)x-country=([^;]+)/)?.[1]?.toUpperCase() || "US"
}

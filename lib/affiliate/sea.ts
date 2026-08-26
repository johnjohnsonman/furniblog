// Southeast Asia affiliate routing. SEA shoppers buy furniture on Shopee /
// Lazada (not Amazon), so for visitors geolocated to these countries we swap the
// Amazon buy button for Shopee + Lazada *search* deep links built from the
// product name. Tracking is wrapped via Involve Asia deep links when the env
// templates are set; otherwise the raw marketplace search URL is used (still a
// working link, just no commission until the templates are configured).

export const SEA_COUNTRIES = ["SG", "MY", "ID", "TH", "PH", "VN"] as const
export type SeaCountry = (typeof SEA_COUNTRIES)[number]

export function isSeaCountry(c: string | null | undefined): c is SeaCountry {
  return !!c && (SEA_COUNTRIES as readonly string[]).includes(c)
}

const SHOPEE_DOMAIN: Record<SeaCountry, string> = {
  SG: "shopee.sg",
  MY: "shopee.com.my",
  ID: "shopee.co.id",
  TH: "shopee.co.th",
  PH: "shopee.ph",
  VN: "shopee.vn",
}

const LAZADA_DOMAIN: Record<SeaCountry, string> = {
  SG: "lazada.sg",
  MY: "lazada.com.my",
  ID: "lazada.co.id",
  TH: "lazada.co.th",
  PH: "lazada.com.ph",
  VN: "lazada.vn",
}

export function buildShopeeSearchUrl(query: string, country: SeaCountry): string {
  return `https://${SHOPEE_DOMAIN[country]}/search?keyword=${encodeURIComponent(query)}`
}

export function buildLazadaSearchUrl(query: string, country: SeaCountry): string {
  return `https://www.${LAZADA_DOMAIN[country]}/catalog/?q=${encodeURIComponent(query)}`
}

// Involve Asia (or any network) deep-link wrapper. The template must contain the
// literal `{url}` token, which is replaced with the URL-encoded destination.
// e.g. https://invol.co/aff_m?offer_id=XXX&aff_id=YYY&source=deeplink&url={url}
function wrapDeeplink(template: string | undefined, destination: string): string {
  const t = template?.trim()
  if (!t || !t.includes("{url}")) return destination
  return t.replace("{url}", encodeURIComponent(destination))
}

export type SeaRetailer = "shopee" | "lazada"
export type SeaLink = { retailer: SeaRetailer; label: string; url: string }

export function resolveSeaLinks(query: string, country: SeaCountry): SeaLink[] {
  const q = query.trim()
  const shopee = wrapDeeplink(
    process.env.NEXT_PUBLIC_INVOLVE_SHOPEE_DEEPLINK,
    buildShopeeSearchUrl(q, country)
  )
  const lazada = wrapDeeplink(
    process.env.NEXT_PUBLIC_INVOLVE_LAZADA_DEEPLINK,
    buildLazadaSearchUrl(q, country)
  )
  return [
    { retailer: "shopee", label: "Shopee", url: shopee },
    { retailer: "lazada", label: "Lazada", url: lazada },
  ]
}

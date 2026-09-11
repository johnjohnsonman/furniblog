import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"

export type AffiliateCountry =
  | "US"
  | "KR"
  | "JP"
  // Southeast Asia (routed to Shopee / Lazada, see lib/affiliate/sea.ts)
  | "SG"
  | "MY"
  | "ID"
  | "TH"
  | "PH"
  | "VN"

const RETAILER_ALIASES: Record<string, string> = {
  amazon: "amazon",
  "amazon.com": "amazon",
  coupang: "coupang",
  "coupang.com": "coupang",
  "link.coupang.com": "coupang",
  official: "official",
  naver: "naver",
  "shopping.naver": "naver",
  naver_shopping: "naver",
  rakuten: "rakuten",
}

function normalizeRetailer(retailer: string): string {
  const key = retailer.toLowerCase().trim()
  return RETAILER_ALIASES[key] ?? key
}

export function getCoupangPartnerId(): string | undefined {
  return process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID?.trim() || undefined
}

/**
 * Coupang Partners deep link:
 * https://link.coupang.com/a/{PARTNER_ID}?itemId=XXX&vendorItemId=XXX
 */
export function buildCoupangAffiliateUrl(baseUrl?: string): string {
  const partnerId = getCoupangPartnerId()
  if (!partnerId) {
    return baseUrl ?? "https://www.coupang.com/"
  }

  const affiliate = new URL(`https://link.coupang.com/a/${partnerId}`)

  if (!baseUrl) {
    return affiliate.toString()
  }

  try {
    const source = new URL(baseUrl)

    if (source.hostname === "link.coupang.com") {
      const pathMatch = source.pathname.match(/^\/a\/([^/]+)/)
      if (pathMatch && pathMatch[1] !== partnerId) {
        source.pathname = `/a/${partnerId}`
      }
      source.searchParams.forEach((value, key) => {
        if (key === "itemId" || key === "vendorItemId") {
          affiliate.searchParams.set(key, value)
        }
      })
      return affiliate.toString()
    }

    const itemId = source.searchParams.get("itemId")
    const vendorItemId = source.searchParams.get("vendorItemId")
    if (itemId) affiliate.searchParams.set("itemId", itemId)
    if (vendorItemId) affiliate.searchParams.set("vendorItemId", vendorItemId)

    return affiliate.toString()
  } catch {
    return affiliate.toString()
  }
}

/**
 * Amazon SubTag (ascsubtag) value for a page path, so Associates reports can
 * attribute orders back to the page the click came from. Amazon accepts
 * letters, digits, hyphen and underscore; anything else is folded to "-".
 */
export function pageSubtag(pathname: string | null | undefined): string | undefined {
  if (!pathname) return undefined
  const cleaned = pathname
    .replace(/^\/+|\/+$/g, "")
    .replace(/\//g, "_")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
  return (cleaned || "home").slice(0, 90)
}

/**
 * Append retailer-specific affiliate tracking parameters.
 */
export function buildAffiliateUrl(
  baseUrl: string,
  retailer: string,
  country: AffiliateCountry = "US",
  subtag?: string
): string {
  const r = normalizeRetailer(retailer)

  if (r === "coupang") {
    return buildCoupangAffiliateUrl(baseUrl)
  }

  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    return baseUrl
  }

  if (r === "amazon") {
    // Keep US links attributable even when the public build-time tag is absent.
    // Tracking tags alone do not guarantee commission or regional eligibility.
    const jpTag = process.env.NEXT_PUBLIC_AMAZON_JP_TAG?.trim()
    const usTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || "furniblog0e-20"
    const tag = country === "JP" && jpTag ? jpTag : usTag
    if (tag) url.searchParams.set("tag", tag)
    if (subtag) url.searchParams.set("ascsubtag", subtag)
    return url.toString()
  }

  url.searchParams.set("utm_source", "furniblog")
  url.searchParams.set("utm_medium", "affiliate")
  return url.toString()
}

async function resolveProductUuid(productId: string): Promise<string | null> {
  if (isUuid(productId)) return productId

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return null
  }

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productId)
      .maybeSingle()
    return data?.id ?? null
  } catch {
    return null
  }
}

/**
 * Server: Supabase affiliate_clicks INSERT
 * Browser: POST /api/affiliate/track
 */
export async function trackAffiliateClick(
  productId: string,
  retailer: string,
  country: AffiliateCountry = "US"
): Promise<void> {
  if (typeof window !== "undefined") {
    // A retailer click is purchase intent, not a completed order or revenue.
    // Keep GA optional and independent of first-party click logging.
    try {
      const analytics = window as Window & {
        gtag?: (command: string, event: string, parameters: Record<string, string>) => void
      }
      analytics.gtag?.("event", "affiliate_click", {
        product_id: productId,
        retailer: normalizeRetailer(retailer),
        page_path: window.location.pathname,
      })
    } catch {
      // Analytics failures must not prevent navigation or first-party logging.
    }
    try {
      await fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, retailer, country }),
        keepalive: true,
      })
    } catch {
      // non-blocking
    }
    return
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return
  }

  const uuid = await resolveProductUuid(productId)
  if (!uuid) return

  try {
    const supabase = createAdminClient()
    await supabase.from("affiliate_clicks").insert({
      product_id: uuid,
      retailer_name: normalizeRetailer(retailer),
      country,
      referrer: null,
    })
  } catch {
    // analytics should not throw
  }
}

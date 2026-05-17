import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"

export type AffiliateCountry = "US" | "KR" | "JP"

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
 * Append retailer-specific affiliate tracking parameters.
 */
export function buildAffiliateUrl(
  baseUrl: string,
  retailer: string,
  country: AffiliateCountry = "US"
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

  if (r === "amazon" && country === "US") {
    const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG
    if (tag) url.searchParams.set("tag", tag)
    return url.toString()
  }

  if (r === "amazon" && country === "JP") {
    const tag = process.env.NEXT_PUBLIC_AMAZON_JP_TAG
    if (tag) url.searchParams.set("tag", tag)
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

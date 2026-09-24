import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"

async function resolveProductUuid(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string
): Promise<string | null> {
  if (isUuid(productId)) return productId

  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("slug", productId)
    .maybeSingle()

  return data?.id ?? null
}

export async function POST(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  let body: { productId?: unknown; retailer?: unknown; placement?: unknown; pagePath?: unknown } | null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const productId = typeof body?.productId === "string" ? body.productId.trim() : ""
  const retailer = typeof body?.retailer === "string" ? body.retailer.trim() : ""
  // Merchant routing defaults are not visitor location. Vercel supplies this
  // geolocation header; absent/unknown locations remain null, never inferred US.
  const geoCountry = request.headers.get("x-vercel-ip-country")?.trim().toUpperCase()
  const country = geoCountry && /^[A-Z]{2}$/.test(geoCountry) && !["XX", "ZZ"].includes(geoCountry)
    ? geoCountry
    : null

  if (!productId || !retailer) {
    return NextResponse.json(
      { error: "productId and retailer are required" },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()
    const uuid = await resolveProductUuid(supabase, productId)

    if (!uuid) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const referrer =
      request.headers.get("referer") ??
      request.headers.get("referrer") ??
      null

    const extended = {
      product_id: uuid,
      retailer_name: retailer.toLowerCase().trim(),
      country,
      referrer,
      page_path: typeof body?.pagePath === "string" && body.pagePath.startsWith("/") ? body.pagePath.slice(0, 512) : null,
      placement: typeof body?.placement === "string" ? body.placement.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 80) : null,
    }
    let { error } = await supabase.from("affiliate_clicks").insert(extended)
    // Migration 057 may be applied after the web deploy; preserve legacy logging meanwhile.
    if (error && /page_path|placement|schema cache/i.test(error.message)) {
      const retry = await supabase.from("affiliate_clicks").insert({ product_id: uuid, retailer_name: retailer.toLowerCase().trim(), country, referrer })
      error = retry.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Track failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

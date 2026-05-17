import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isUuid } from "@/lib/pipeline/queue-mapper"
import type { AffiliateCountry } from "@/lib/affiliate/links"

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

  let body: { productId?: string; retailer?: string; country?: AffiliateCountry }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { productId, retailer } = body
  const country: AffiliateCountry =
    body.country === "KR" || body.country === "JP" ? body.country : "US"

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

    const { error } = await supabase.from("affiliate_clicks").insert({
      product_id: uuid,
      retailer_name: retailer.toLowerCase().trim(),
      country,
      referrer,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Track failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

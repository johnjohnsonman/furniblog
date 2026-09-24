import { NextRequest, NextResponse } from "next/server"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { configurationRequestSchema, configurationSchema, evaluateConfiguration } from "@/lib/recommend/configurations"

export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store" }
const columns = "id,product_id,market_code,status,label,configuration_key,seat_height_min,seat_height_max,seat_depth_min,seat_depth_max,seat_depth_fixed,seat_width,weight_capacity,armrest_floor_height_min,armrest_floor_height_max,source_title,source_url,checked_on,notes"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("product") ?? ""
  const market = (request.nextUrl.searchParams.get("market") ?? "").toUpperCase()
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !/^[A-Z]{2}$/.test(market)) return NextResponse.json({ error: "Product and market required" }, { status: 400, headers })
  try {
    const client = createPublicServerClient()
    const product = await client.from("products").select("id").eq("slug", slug).eq("published", true).maybeSingle()
    if (product.error) throw new Error("Catalog unavailable")
    if (!product.data) return NextResponse.json({ error: "Product unavailable" }, { status: 404, headers })
    const result = await client.from("product_fit_configurations").select(columns).eq("product_id", product.data.id).eq("market_code", market).eq("status", "verified").order("configuration_key").limit(100)
    if (result.error) throw new Error("Configurations unavailable")
    // Invalid records fail closed instead of feeding partially parsed dimensions into fit scoring.
    const configurations = (result.data ?? []).map(row => configurationSchema.parse(row))
    return NextResponse.json({ configurations, market }, { headers })
  } catch { return NextResponse.json({ error: "Configuration data unavailable" }, { status: 503, headers }) }
}

export async function POST(request: NextRequest) {
  const parsed = configurationRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid configuration or body inputs" }, { status: 400, headers })
  try {
    // Anonymous RLS also excludes configurations belonging to unpublished products.
    const result = await createPublicServerClient().from("product_fit_configurations").select(columns)
      .eq("id", parsed.data.configurationId).eq("market_code", parsed.data.market).eq("status", "verified").maybeSingle()
    if (result.error) throw new Error("Configuration unavailable")
    if (!result.data) return NextResponse.json({ error: "No verified configuration for this market" }, { status: 404, headers })
    return NextResponse.json(evaluateConfiguration(result.data, parsed.data), { headers })
  } catch { return NextResponse.json({ error: "Configuration data unavailable" }, { status: 503, headers }) }
}

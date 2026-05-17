import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdmin } from "@/lib/admin/api-auth"

type ClickRow = {
  product_id: string
  retailer_name: string
  country: string | null
  clicked_at: string
  products?: { slug: string; name: string } | { slug: string; name: string }[] | null
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 7)
  const startOfMonth = new Date(now)
  startOfMonth.setDate(now.getDate() - 30)

  const { data, error } = await supabase
    .from("affiliate_clicks")
    .select("product_id, retailer_name, country, clicked_at, products(slug, name)")
    .gte("clicked_at", startOfMonth.toISOString())
    .order("clicked_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as ClickRow[]

  const countSince = (since: Date) =>
    rows.filter((r) => new Date(r.clicked_at) >= since).length

  const productCounts = new Map<
    string,
    { slug: string; name: string; count: number }
  >()
  const retailerCounts = new Map<string, number>()
  const countryCounts = new Map<string, number>()

  for (const row of rows) {
    const product = Array.isArray(row.products)
      ? row.products[0]
      : row.products
    const slug = product?.slug ?? row.product_id
    const name = product?.name ?? slug
    const key = row.product_id
    const existing = productCounts.get(key)
    if (existing) {
      existing.count += 1
    } else {
      productCounts.set(key, { slug, name, count: 1 })
    }

    const retailer = row.retailer_name || "other"
    retailerCounts.set(retailer, (retailerCounts.get(retailer) ?? 0) + 1)

    const country = row.country ?? "Other"
    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1)
  }

  const topProducts = [...productCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return NextResponse.json({
    today: countSince(startOfDay),
    week: countSince(startOfWeek),
    month: countSince(startOfMonth),
    topProducts,
    byRetailer: Object.fromEntries(retailerCounts),
    byCountry: Object.fromEntries(countryCounts),
  })
}

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const supabase = createAdminClient()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const [productsRes, publishedRes, reviewsRes, clicksRes, recentRes] =
      await Promise.all([
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("track", "chair"),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("track", "chair")
          .eq("published", true),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase
          .from("affiliate_clicks")
          .select("*", { count: "exact", head: true })
          .gte("clicked_at", startOfDay.toISOString()),
        supabase
          .from("products")
          .select("slug, name, created_at, published, brands(name)")
          .eq("track", "chair")
          .order("created_at", { ascending: false })
          .limit(5),
      ])

    const recent = (recentRes.data ?? []).map((row) => {
      const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands
      return {
        slug: row.slug,
        name: row.name,
        brand: brand?.name ?? "",
        published: row.published,
        createdAt: row.created_at,
      }
    })

    return NextResponse.json({
      totalProducts: productsRes.count ?? 0,
      publishedProducts: publishedRes.count ?? 0,
      totalReviews: reviewsRes.count ?? 0,
      clicksToday: clicksRes.count ?? 0,
      recentProducts: recent,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stats failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

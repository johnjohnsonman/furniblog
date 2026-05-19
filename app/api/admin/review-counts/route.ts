import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const productId = request.nextUrl.searchParams.get("productId")?.trim()

  try {
    const supabase = createAdminClient()

    if (productId) {
      const { count, error } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ count: count ?? 0 })
    }

    const { data, error } = await supabase.from("reviews").select("product_id")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const id = row.product_id as string
      counts[id] = (counts[id] ?? 0) + 1
    }

    return NextResponse.json(counts)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load counts"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

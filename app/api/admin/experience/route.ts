import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError, isMissingTableError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const status = request.nextUrl.searchParams.get("status") ?? "pending"

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from("experience_reviews")
      .select("*")
      .order("created_at", { ascending: false })

    if (status === "pending" || status === "published") {
      query = query.eq("status", status)
    }

    const { data, error } = await query.limit(500)

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({
          reviews: [],
          counts: { pending: 0, published: 0 },
          needsMigration: true,
        })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: countsData } = await supabase
      .from("experience_reviews")
      .select("status")
      .limit(5000)

    const counts = { pending: 0, published: 0 }
    for (const row of countsData ?? []) {
      const s = (row as { status: string }).status
      if (s === "pending") counts.pending += 1
      else if (s === "published") counts.published += 1
    }

    return NextResponse.json({ reviews: data ?? [], counts })
  } catch (error) {
    return jsonInternalError(error)
  }
}

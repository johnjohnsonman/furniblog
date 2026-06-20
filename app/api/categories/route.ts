import { NextResponse } from "next/server"
import { getCategoryCounts, getSiteStats } from "@/lib/supabase/queries"

// Published chair counts per category, for the header "Chairs" menu. Counts
// change rarely, so cache for an hour.
export const revalidate = 3600

export async function GET() {
  try {
    const [counts, stats] = await Promise.all([
      getCategoryCounts(),
      getSiteStats(),
    ])
    return NextResponse.json({ counts, total: stats.products })
  } catch {
    return NextResponse.json({ counts: {}, total: 0 })
  }
}

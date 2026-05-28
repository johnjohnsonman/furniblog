import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { backfillMissingVideoSummaries } from "@/lib/videos/collect"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: { maxItems?: number } = {}
  try {
    body = (await request.json()) as { maxItems?: number }
  } catch {
    body = {}
  }

  try {
    const supabase = createAdminClient()
    const result = await backfillMissingVideoSummaries({
      supabase,
      maxItems: Math.max(1, Math.min(Number(body.maxItems ?? 50), 200)),
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Summary backfill failed" },
      { status: 500 }
    )
  }
}

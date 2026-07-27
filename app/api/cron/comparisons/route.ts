import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateComparisonDrafts } from "@/lib/comparisons/auto"

export const maxDuration = 300

/**
 * Daily auto-drafting of "A vs B" comparisons. Creates DRAFTS only — an admin
 * reviews + publishes (no auto-publish, to avoid scaled-content penalties).
 * Triggered by Vercel Cron (Authorization: Bearer $CRON_SECRET); also runnable
 * by an admin (cookie / x-admin-secret) with ?count=N.
 */
async function handle(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const isCron = Boolean(cronSecret) && auth === `Bearer ${cronSecret}`
  if (!isCron) {
    const denied = requireAdmin(request)
    if (denied) return denied
  }

  const { searchParams } = new URL(request.url)
  const n = Number(searchParams.get("count"))
  const count = Number.isFinite(n) && n > 0 ? Math.min(n, 6) : 3

  try {
    const supabase = createAdminClient()
    const result = await generateComparisonDrafts(supabase, count)
    return NextResponse.json({ success: true, trigger: isCron ? "cron" : "manual", ...result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Comparison drafting failed" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}
export async function POST(request: NextRequest) {
  return handle(request)
}

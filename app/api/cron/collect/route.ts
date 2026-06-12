import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { runCronCollection } from "@/lib/cron/run"

// Vercel Pro allows up to 300s; this job is time-budgeted to stay under it.
export const maxDuration = 300

/**
 * Scheduled auto-collection (news + videos + reviews) for the least-recently
 * refreshed targets. Triggered by Vercel Cron, which sends
 * `Authorization: Bearer $CRON_SECRET`. Also runnable manually by an admin
 * (cookie or x-admin-secret) for testing.
 */
async function handle(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get("authorization")
  const isCron = Boolean(cronSecret) && auth === `Bearer ${cronSecret}`

  if (!isCron) {
    const denied = requireAdmin(request)
    if (denied) return denied
  }

  // Optional caps for manual/testing runs (kept small to bound API usage).
  const { searchParams } = new URL(request.url)
  const numParam = (key: string): number | undefined => {
    const v = searchParams.get(key)
    if (v === null) return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const options = {
    maxNewsBrands: numParam("maxNewsBrands"),
    maxVideoChairs: numParam("maxVideoChairs"),
    maxReviewChairs: numParam("maxReviewChairs"),
    newsBudgetMs: numParam("newsBudgetMs"),
    videoBudgetMs: numParam("videoBudgetMs"),
    reviewBudgetMs: numParam("reviewBudgetMs"),
  }
  // Drop undefined keys so defaults apply.
  const cleanOptions = Object.fromEntries(
    Object.entries(options).filter(([, v]) => v !== undefined)
  )

  try {
    const supabase = createAdminClient()
    const result = await runCronCollection({ supabase, options: cleanOptions })
    return NextResponse.json({ success: true, trigger: isCron ? "cron" : "manual", ...result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cron collection failed" },
      { status: 500 }
    )
  }
}

// Vercel Cron issues GET requests.
export async function GET(request: NextRequest) {
  return handle(request)
}

// Allow POST too (manual admin trigger).
export async function POST(request: NextRequest) {
  return handle(request)
}

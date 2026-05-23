import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { isMissingTableError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export type PipelineRun = {
  id: string
  chairName: string
  chairSlug: string
  sources: string[]
  collected: number
  processed: number
  saved: number
  failed: number
  createdAt: string
}

type HistoryStats = {
  totalRuns: number
  totalCollected: number
  totalSaved: number
  successRate: number
}

const EMPTY_STATS: HistoryStats = {
  totalRuns: 0,
  totalCollected: 0,
  totalSaved: 0,
  successRate: 0,
}

function emptyHistoryResponse(page: number) {
  return {
    runs: [] as PipelineRun[],
    total: 0,
    page,
    totalPages: 0,
    stats: EMPTY_STATS,
  }
}

function escapeIlike(term: string): string {
  return term.replace(/[%_\\]/g, "")
}

function normalizeSource(source: string | null): string | null {
  if (!source || source === "all") return null
  if (source === "japan") return "japan_community"
  return source
}

function getDateCutoff(dateRange: string | null): string | null {
  if (!dateRange || dateRange === "all") return null
  const now = new Date()
  if (dateRange === "today") {
    now.setUTCHours(0, 0, 0, 0)
    return now.toISOString()
  }
  if (dateRange === "week") {
    now.setDate(now.getDate() - 7)
    return now.toISOString()
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, params: URLSearchParams) {
  let q = query

  const search = params.get("search")?.trim()
  if (search) {
    const term = escapeIlike(search)
    q = q.or(`chair_name.ilike.%${term}%,chair_slug.ilike.%${term}%`)
  }

  const source = normalizeSource(params.get("source"))
  if (source) {
    q = q.contains("sources", [source])
  }

  const hasResults = params.get("hasResults")
  if (hasResults === "true") {
    q = q.gt("collected", 0)
  } else if (hasResults === "false") {
    q = q.eq("collected", 0)
  }

  const dateCutoff = getDateCutoff(params.get("dateRange"))
  if (dateCutoff) {
    q = q.gte("created_at", dateCutoff)
  }

  return q
}

function mapRun(row: {
  id: string
  chair_name: string
  chair_slug: string
  sources: string[] | null
  collected: number
  processed: number
  saved: number
  failed: number
  created_at: string
}): PipelineRun {
  return {
    id: row.id,
    chairName: row.chair_name,
    chairSlug: row.chair_slug,
    sources: row.sources ?? [],
    collected: row.collected,
    processed: row.processed,
    saved: row.saved,
    failed: row.failed,
    createdAt: row.created_at,
  }
}

function computeStats(
  totalRuns: number,
  totalCollected: number,
  totalSaved: number
): HistoryStats {
  const successRate =
    totalCollected > 0
      ? Math.round((totalSaved / totalCollected) * 1000) / 10
      : 0

  return { totalRuns, totalCollected, totalSaved, successRate }
}

const STATS_PAGE_SIZE = 1000

/** Supabase 기본 1000행 제한을 넘어 collected/saved 합계를 누적합니다. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchSumStats(supabase: any, params: URLSearchParams) {
  let totalCollected = 0
  let totalSaved = 0
  let from = 0

  for (;;) {
    const query = applyFilters(
      supabase.from("pipeline_runs").select("collected, saved"),
      params
    )
    const { data, error } = await query.range(from, from + STATS_PAGE_SIZE - 1)
    if (error) throw error

    const rows = (data ?? []) as { collected: number; saved: number }[]
    for (const row of rows) {
      totalCollected += row.collected ?? 0
      totalSaved += row.saved ?? 0
    }

    if (rows.length < STATS_PAGE_SIZE) break
    from += STATS_PAGE_SIZE
  }

  return { totalCollected, totalSaved }
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const params = request.nextUrl.searchParams
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1)
  const limit = Math.min(
    100,
    Math.max(1, parseInt(params.get("limit") ?? "20", 10) || 20)
  )
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    const supabase = createAdminClient()

    const baseQuery = applyFilters(
      supabase.from("pipeline_runs").select("*", { count: "exact" }),
      params
    )

    const [{ data: runs, error, count }, sumResult] = await Promise.all([
      baseQuery.order("created_at", { ascending: false }).range(from, to),
      fetchSumStats(supabase, params).catch((statsErr: Error) => ({
        error: statsErr,
      })),
    ])

    if (error) {
      console.warn("[pipeline/history]", error.message, error.code)
      return NextResponse.json(emptyHistoryResponse(page))
    }

    const total = count ?? 0
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0

    if ("error" in sumResult) {
      const statsError = sumResult.error as { message?: string; code?: string }
      if (isMissingTableError(statsError)) {
        return NextResponse.json({
          runs: (runs ?? []).map(mapRun),
          total,
          page,
          totalPages,
          stats: EMPTY_STATS,
        })
      }
      console.warn(
        "[pipeline/history] stats",
        statsError.message,
        statsError.code
      )
    }

    const { totalCollected, totalSaved } =
      "error" in sumResult
        ? { totalCollected: 0, totalSaved: 0 }
        : sumResult

    const stats = computeStats(total, totalCollected, totalSaved)

    return NextResponse.json({
      runs: (runs ?? []).map(mapRun),
      total,
      page,
      totalPages,
      stats,
    })
  } catch (error) {
    console.error("Pipeline history error:", error)
    return NextResponse.json(emptyHistoryResponse(page))
  }
}

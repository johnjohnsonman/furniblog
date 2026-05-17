import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError, isMissingTableError } from "@/lib/admin/api-response"
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

function computeStats(rows: { collected: number; saved: number }[]): HistoryStats {
  const totalRuns = rows.length
  const totalCollected = rows.reduce((sum, r) => sum + (r.collected ?? 0), 0)
  const totalSaved = rows.reduce((sum, r) => sum + (r.saved ?? 0), 0)
  const successRate =
    totalCollected > 0
      ? Math.round((totalSaved / totalCollected) * 1000) / 10
      : 0

  return { totalRuns, totalCollected, totalSaved, successRate }
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

    const { data: runs, error, count } = await baseQuery
      .order("created_at", { ascending: false })
      .range(from, to)

    if (error) {
      console.warn("[pipeline/history]", error.message, error.code)
      if (isMissingTableError(error)) {
        return NextResponse.json(emptyHistoryResponse(page))
      }
      return NextResponse.json(
        {
          error: error.message,
          ...emptyHistoryResponse(page),
        },
        { status: 500 }
      )
    }

    const total = count ?? 0
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0

    const statsQuery = applyFilters(
      supabase.from("pipeline_runs").select("collected, saved"),
      params
    )

    const { data: statsRows, error: statsError } = await statsQuery

    if (statsError && isMissingTableError(statsError)) {
      return NextResponse.json({
        runs: (runs ?? []).map(mapRun),
        total,
        page,
        totalPages,
        stats: EMPTY_STATS,
      })
    }

    const stats = computeStats(statsRows ?? [])

    return NextResponse.json({
      runs: (runs ?? []).map(mapRun),
      total,
      page,
      totalPages,
      stats,
    })
  } catch (error) {
    console.error("[pipeline/history]", error)
    return jsonInternalError(error)
  }
}

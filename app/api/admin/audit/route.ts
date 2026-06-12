import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { auditBatch, type AuditType } from "@/lib/audit/run"

export const maxDuration = 60

const TYPES: AuditType[] = ["reviews", "videos", "news"]

function isType(v: unknown): v is AuditType {
  return typeof v === "string" && TYPES.includes(v as AuditType)
}

/** GET ?type=reviews&threshold=0.4&limit=200 — stats + flagged (low-score) items. */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  if (!isType(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 })
  }
  const threshold = Math.max(0, Math.min(Number(searchParams.get("threshold") ?? 0.4), 1))
  const limit = Math.max(1, Math.min(Number(searchParams.get("limit") ?? 200), 500))

  try {
    const supabase = createAdminClient()

    const base = () => supabase.from(type).select("id", { count: "exact", head: true })

    const [total, remaining, flagged] = await Promise.all([
      base().then((r) => r.count ?? 0),
      base().is("audited_at", null).then((r) => r.count ?? 0),
      base()
        .not("audited_at", "is", null)
        .lt("audit_score", threshold)
        .then((r) => r.count ?? 0),
    ])

    const select =
      type === "reviews"
        ? "id, summary_ko, source, source_url, audit_score, audit_reason, products(name, brands(name))"
        : type === "videos"
          ? "id, title, youtube_id, audit_score, audit_reason, products(name)"
          : "id, title, url, brand, audit_score, audit_reason"

    const { data, error } = await supabase
      .from(type)
      .select(select)
      .not("audited_at", "is", null)
      .lt("audit_score", threshold)
      .order("audit_score", { ascending: true, nullsFirst: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      type,
      threshold,
      stats: { total, audited: total - remaining, remaining, flagged },
      items: data ?? [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type PostBody = {
  action?: "run" | "delete"
  type?: AuditType
  limit?: number
  ids?: string[]
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: PostBody
  try {
    body = (await request.json()) as PostBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (!isType(body.type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    if (body.action === "delete") {
      const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : []
      if (ids.length === 0) {
        return NextResponse.json({ error: "ids required" }, { status: 400 })
      }
      const { error } = await supabase.from(body.type).delete().in("id", ids)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, deleted: ids.length })
    }

    // default: run a batch
    const result = await auditBatch({
      supabase,
      type: body.type,
      limit: Math.max(1, Math.min(Number(body.limit ?? 25), 100)),
    })
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audit failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

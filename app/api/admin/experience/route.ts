import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

// Korean display labels for the enum-encoded columns.
const SEX_KO: Record<string, string> = { male: "남성", female: "여성" }
const SIT_KO: Record<string, string> = {
  under2: "2시간 미만",
  "2to6": "2~6시간",
  over6: "6시간 이상",
}

type SessionRow = {
  id: string
  created_at: string
  status: string
  source: string
  sex: string | null
  height_band: string | null
  body: string | null
  age_band: string | null
  job: string | null
  sit_hours: string | null
  uses: string[] | null
  pain: string[] | null
  reasons: string[] | null
  comment: string | null
  contact: string | null
  previous_chair: string | null
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const status = request.nextUrl.searchParams.get("status") ?? "pending"

  try {
    const supabase = createAdminClient()

    let query = supabase
      .from("review_sessions")
      .select("*")
      .order("created_at", { ascending: false })

    if (status === "pending" || status === "approved") {
      query = query.eq("status", status)
    }

    const { data: sessions, error } = await query.limit(1000)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (sessions ?? []) as SessionRow[]
    const ids = rows.map((s) => s.id)

    // Pull ranked chairs (with product names) for the listed sessions.
    const rankMap = new Map<string, Record<number, string>>()
    if (ids.length) {
      const { data: ranks } = await supabase
        .from("review_rankings")
        .select("session_id, rank, products(name)")
        .in("session_id", ids)
      for (const r of (ranks ?? []) as unknown as Array<{
        session_id: string
        rank: number
        products: { name: string } | { name: string }[] | null
      }>) {
        const p = r.products
        const name = Array.isArray(p) ? p[0]?.name : p?.name
        if (!name) continue
        const m = rankMap.get(r.session_id) ?? {}
        m[r.rank] = name
        rankMap.set(r.session_id, m)
      }
    }

    const reviews = rows.map((s) => {
      const m = rankMap.get(s.id) ?? {}
      return {
        id: s.id,
        created_at: s.created_at,
        status: s.status,
        source: s.source,
        gender: s.sex ? SEX_KO[s.sex] ?? s.sex : null,
        height: s.height_band ?? null,
        weight_or_body: s.body ?? null,
        age_group: s.age_band ?? null,
        job: s.job ?? null,
        main_purpose: Array.isArray(s.uses) && s.uses.length ? s.uses.join(", ") : null,
        sitting_hours: s.sit_hours ? SIT_KO[s.sit_hours] ?? s.sit_hours : null,
        previous_chair: s.previous_chair ?? null,
        pain_areas: s.pain ?? [],
        standing_desk: null,
        rank1_chair: m[1] ?? null,
        rank2_chair: m[2] ?? null,
        rank3_chair: m[3] ?? null,
        rating: null,
        review_text: s.comment ?? null,
        selection_reasons: s.reasons ?? [],
        purchase_reason: null,
        photo_url: null,
        store_location: null,
        comparing_chairs: null,
        nickname: null,
        phone: s.contact ?? null,
      }
    })

    const [{ count: pending }, { count: approved }] = await Promise.all([
      supabase
        .from("review_sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("review_sessions")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
    ])

    return NextResponse.json({
      reviews,
      counts: { pending: pending ?? 0, approved: approved ?? 0 },
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

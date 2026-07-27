import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateComparisonDraft } from "@/lib/comparisons/generate"
import { loadProductInput } from "@/lib/comparisons/resolve"

export const runtime = "nodejs"
export const maxDuration = 300

type AdminDb = ReturnType<typeof createAdminClient>

const COST_COLS = ["gen_cost_usd", "gen_input_tokens", "gen_output_tokens", "gen_tier"] as const

async function updateEntry(db: AdminDb, id: string, payload: Record<string, unknown>): Promise<void> {
  const { error } = await db.from("comparisons").update(payload).eq("id", id)
  if (!error) return
  // Retry without cost columns if migration hasn't added them (defensive).
  const stripped = { ...payload }
  let had = false
  for (const k of COST_COLS) if (k in stripped) { delete stripped[k]; had = true }
  if (had) await db.from("comparisons").update(stripped).eq("id", id)
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const body = await request.json()
    const aSlug = (body.productASlug as string)?.trim()
    const bSlug = (body.productBSlug as string)?.trim()
    if (!aSlug || !bSlug) {
      return NextResponse.json({ error: "Pick both chairs first." }, { status: 400 })
    }
    if (aSlug === bSlug) {
      return NextResponse.json({ error: "Pick two different chairs." }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: prods } = await supabase.from("products").select("id,slug").in("slug", [aSlug, bSlug])
    const idBySlug = new Map((prods ?? []).map((p) => [p.slug as string, p.id as string]))
    const aId = idBySlug.get(aSlug)
    const bId = idBySlug.get(bSlug)
    if (!aId || !bId) {
      return NextResponse.json({ error: "One of the chairs was not found in the catalog." }, { status: 404 })
    }

    await updateEntry(supabase, id, {
      product_a_id: aId,
      product_b_id: bId,
      gen_status: "generating",
      gen_error: null,
      gen_started_at: new Date().toISOString(),
      gen_cost_usd: null,
      gen_input_tokens: null,
      gen_output_tokens: null,
    })

    after(async () => {
      const db = createAdminClient()
      try {
        const [a, b] = await Promise.all([loadProductInput(db, aId), loadProductInput(db, bId)])
        if (!a || !b) throw new Error("Could not load one of the chairs")

        const { draft, usage } = await generateComparisonDraft(a, b)

        await updateEntry(db, id, {
          title: draft.title || undefined,
          subtitle: draft.subtitle || null,
          excerpt: draft.excerpt || null,
          seo_title: draft.seo_title || null,
          seo_description: draft.seo_description || null,
          tier: draft.tier,
          content_html: draft.content_html,
          gen_status: "done",
          gen_error: null,
          gen_cost_usd: usage.costUsd,
          gen_input_tokens: usage.inputTokens,
          gen_output_tokens: usage.outputTokens,
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        await db
          .from("comparisons")
          .update({ gen_status: "error", gen_error: err instanceof Error ? err.message : String(err) })
          .eq("id", id)
      }
    })

    return NextResponse.json({ status: "generating" })
  } catch (error) {
    return jsonInternalError(error)
  }
}

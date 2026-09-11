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

// Columns from later migrations — stripped + retried if not applied yet.
const OPTIONAL_COLS = ["gen_cost_usd", "gen_input_tokens", "gen_output_tokens", "gen_tier", "faq"] as const

async function updateEntry(db: AdminDb, id: string, version: string | null, payload: Record<string, unknown>): Promise<void> {
  const write = async (values: Record<string, unknown>) => {
    let query = db.from("comparisons").update(values).eq("id", id).eq("status", "draft")
    query = version === null ? query.is("updated_at", null) : query.eq("updated_at", version)
    const result = await query.select("id").maybeSingle()
    if (!result.error && !result.data) throw new Error("Comparison changed; reload before generating again.")
    return result
  }
  const { error } = await write(payload)
  if (!error) return
  if (!["42703", "PGRST204"].includes(error.code)) throw new Error(error.message)
  const stripped = { ...payload }
  let had = false
  for (const k of OPTIONAL_COLS) if (k in stripped) { delete stripped[k]; had = true }
  if (!had) throw new Error(error.message)
  const retry = await write(stripped)
  if (retry.error) throw new Error(retry.error.message)
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const body = await request.json()
    const aSlug = typeof body?.productASlug === "string" ? body.productASlug.trim() : ""
    const bSlug = typeof body?.productBSlug === "string" ? body.productBSlug.trim() : ""
    if (!aSlug || !bSlug) {
      return NextResponse.json({ error: "Pick both chairs first." }, { status: 400 })
    }
    if (aSlug === bSlug) {
      return NextResponse.json({ error: "Pick two different chairs." }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: current, error: readError } = await supabase.from("comparisons")
      .select("status,gen_status,updated_at").eq("id", id).maybeSingle()
    if (readError) throw new Error(readError.message)
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (current.status !== "draft" || current.gen_status === "generating") {
      return NextResponse.json({ error: "Only idle drafts can be generated. Published content is preserved." }, { status: 409 })
    }
    const { data: prods } = await supabase.from("products").select("id,slug").in("slug", [aSlug, bSlug])
    const idBySlug = new Map((prods ?? []).map((p) => [p.slug as string, p.id as string]))
    const aId = idBySlug.get(aSlug)
    const bId = idBySlug.get(bSlug)
    if (!aId || !bId) {
      return NextResponse.json({ error: "One of the chairs was not found in the catalog." }, { status: 404 })
    }

    const version = new Date().toISOString()
    await updateEntry(supabase, id, current.updated_at, {
      product_a_id: aId,
      product_b_id: bId,
      gen_status: "generating",
      gen_error: null,
      gen_started_at: version,
      updated_at: version,
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

        await updateEntry(db, id, version, {
          title: draft.title || undefined,
          subtitle: draft.subtitle || null,
          excerpt: draft.excerpt || null,
          seo_title: draft.seo_title || null,
          seo_description: draft.seo_description || null,
          tier: draft.tier,
          content_html: draft.content_html,
          faq: draft.faq,
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
          .eq("status", "draft")
          .eq("updated_at", version)
      }
    })

    return NextResponse.json({ status: "generating" })
  } catch (error) {
    return jsonInternalError(error)
  }
}

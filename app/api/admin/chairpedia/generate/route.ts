import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateChairpediaDraft, type GenTier } from "@/lib/chairpedia/generate"
import { matchProductId } from "@/lib/chairpedia/match-product"

export const runtime = "nodejs"
export const maxDuration = 300 // background research + long-form writing (~90s)

// Cost-tracking columns (migration 039). If they don't exist yet, the update is
// retried without them so core generation never breaks.
const COST_COLS = [
  "gen_cost_usd",
  "gen_input_tokens",
  "gen_output_tokens",
  "gen_web_searches",
  "gen_tier",
] as const

type AdminDb = ReturnType<typeof createAdminClient>

async function updateEntry(
  db: AdminDb,
  id: string,
  payload: Record<string, unknown>
): Promise<void> {
  const { error } = await db.from("chairpedia").update(payload).eq("id", id)
  if (!error) return
  // Likely the gen_cost_* columns are missing (migration 039 not applied) —
  // strip them and retry so the draft/content still saves.
  const stripped = { ...payload }
  let hadCost = false
  for (const k of COST_COLS) if (k in stripped) { delete stripped[k]; hadCost = true }
  if (hadCost) {
    await db.from("chairpedia").update(stripped).eq("id", id)
  }
}

// Kick off AI generation in the background and return immediately. The editor
// polls GET /api/admin/chairpedia/[id] for gen_status ('generating'|'done'|'error').
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const body = await request.json()
    const id = (body.id as string)?.trim()
    const chairName = (body.chairName as string)?.trim()
    const tier: GenTier = body.tier === "standard" ? "standard" : "premium"
    if (!id) return NextResponse.json({ error: "Missing entry id" }, { status: 400 })
    if (!chairName) return NextResponse.json({ error: "Enter a chair name" }, { status: 400 })

    const supabase = createAdminClient()
    await updateEntry(supabase, id, {
      gen_status: "generating",
      gen_error: null,
      gen_started_at: new Date().toISOString(),
      gen_sources: [],
      gen_cost_usd: null,
      gen_input_tokens: null,
      gen_output_tokens: null,
      gen_web_searches: null,
      gen_tier: tier,
    })

    // Run after the response is sent (bounded by maxDuration). Writes the draft
    // straight into the row so the polling editor picks it up.
    after(async () => {
      const db = createAdminClient()
      try {
        const { draft, usage } = await generateChairpediaDraft(chairName, tier)

        // Auto-link the catalog product (enables the Amazon buy button) when a
        // confident name match exists and the entry isn't already linked.
        let productId: string | undefined
        const { data: cur } = await db
          .from("chairpedia")
          .select("product_id")
          .eq("id", id)
          .maybeSingle()
        if (!cur?.product_id) {
          const match = await matchProductId(db, draft.title || chairName)
          if (match) productId = match.id
        }

        await updateEntry(db, id, {
          title: draft.title || undefined,
          subtitle: draft.subtitle || null,
          excerpt: draft.excerpt || null,
          seo_title: draft.seo_title || null,
          seo_description: draft.seo_description || null,
          origin: draft.origin || null,
          content_html: draft.content_html,
          ...(productId ? { product_id: productId } : {}),
          gen_status: "done",
          gen_error: null,
          gen_sources: draft.sources ?? [],
          gen_cost_usd: usage.costUsd,
          gen_input_tokens: usage.inputTokens,
          gen_output_tokens: usage.outputTokens,
          gen_web_searches: usage.webSearches,
          updated_at: new Date().toISOString(),
        })
      } catch (err) {
        await db
          .from("chairpedia")
          .update({
            gen_status: "error",
            gen_error: err instanceof Error ? err.message : String(err),
          })
          .eq("id", id)
      }
    })

    return NextResponse.json({ status: "generating" })
  } catch (error) {
    return jsonInternalError(error)
  }
}

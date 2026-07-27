import type { SupabaseClient } from "@supabase/supabase-js"
import { suggestMatchups } from "@/lib/comparisons/suggest"
import { loadProductInput } from "@/lib/comparisons/resolve"
import { generateComparisonDraft } from "@/lib/comparisons/generate"

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90)
}

export type AutoDraftResult = {
  created: number
  errors: number
  drafts: { slug: string; title: string }[]
  totalCostUsd: number
}

/**
 * Generate up to `count` NEW comparison DRAFTS from suggested matchups.
 * Always status='draft' — a human reviews + publishes (never auto-publish, to
 * avoid Google's scaled-content penalties). Safe to run from cron.
 */
export async function generateComparisonDrafts(
  supabase: SupabaseClient,
  count = 3
): Promise<AutoDraftResult> {
  const matchups = await suggestMatchups(supabase, count)
  let created = 0
  let errors = 0
  let totalCostUsd = 0
  const drafts: { slug: string; title: string }[] = []

  for (const m of matchups) {
    try {
      const [a, b] = await Promise.all([
        loadProductInput(supabase, m.aId),
        loadProductInput(supabase, m.bId),
      ])
      if (!a || !b) { errors++; continue }

      const { draft, usage } = await generateComparisonDraft(a, b)
      totalCostUsd += usage.costUsd

      const base = slugify(draft.title || `${m.aName} vs ${m.bName}`) || "comparison"
      const slug = `${base}-${Date.now().toString(36)}`
      const title = draft.title || `${m.aName} vs ${m.bName}`

      const row: Record<string, unknown> = {
        slug,
        title,
        subtitle: draft.subtitle || null,
        excerpt: draft.excerpt || null,
        seo_title: draft.seo_title || null,
        seo_description: draft.seo_description || null,
        tier: draft.tier,
        content_html: draft.content_html,
        faq: draft.faq,
        product_a_id: m.aId,
        product_b_id: m.bId,
        status: "draft", // ← never auto-publish
        gen_status: "done",
        gen_cost_usd: usage.costUsd,
        gen_input_tokens: usage.inputTokens,
        gen_output_tokens: usage.outputTokens,
      }
      let { error } = await supabase.from("comparisons").insert(row)
      if (error) {
        // Retry without the `faq` column if migration 042 isn't applied yet.
        const { faq: _faq, ...withoutFaq } = row
        ;({ error } = await supabase.from("comparisons").insert(withoutFaq))
      }
      if (error) { errors++; continue }

      created++
      drafts.push({ slug, title })
    } catch {
      errors++
    }
  }

  return { created, errors, drafts, totalCostUsd }
}

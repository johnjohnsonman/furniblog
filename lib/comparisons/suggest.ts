import type { SupabaseClient } from "@supabase/supabase-js"

export type Matchup = {
  aId: string
  aSlug: string
  aName: string
  bId: string
  bSlug: string
  bName: string
  category: string
  score: number
}

type Prod = { id: string; slug: string; name: string; category: string; price_usd: number | null }

/**
 * Suggest good "A vs B" matchups that don't already have a comparison:
 * same category, comparable price (fair fight), both with real reviews
 * (grounding), ranked by combined review count (popular first). A per-product
 * cap keeps one popular chair from dominating every suggestion.
 */
export async function suggestMatchups(
  supabase: SupabaseClient,
  limit = 10
): Promise<Matchup[]> {
  const { data: prods } = await supabase
    .from("products")
    .select("id, slug, name, category, price_usd")
    .eq("published", true)
    .eq("track", "chair")
  const products = (prods ?? []) as Prod[]

  const { data: revs } = await supabase.from("reviews").select("product_id").limit(5000)
  const reviewCount = new Map<string, number>()
  for (const r of revs ?? []) {
    const id = r.product_id as string
    reviewCount.set(id, (reviewCount.get(id) ?? 0) + 1)
  }

  const { data: comps } = await supabase.from("comparisons").select("product_a_id, product_b_id")
  const pairKey = (x: string, y: string) => [x, y].sort().join("|")
  const existing = new Set<string>()
  for (const c of comps ?? []) {
    if (c.product_a_id && c.product_b_id) existing.add(pairKey(c.product_a_id, c.product_b_id))
  }

  // Only reviewed chairs — the generator needs real review data to be grounded.
  const reviewed = products.filter((p) => (reviewCount.get(p.id) ?? 0) >= 1)
  const byCat = new Map<string, Prod[]>()
  for (const p of reviewed) {
    const arr = byCat.get(p.category) ?? []
    arr.push(p)
    byCat.set(p.category, arr)
  }

  const candidates: Matchup[] = []
  for (const [category, list] of byCat) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        if (existing.has(pairKey(a.id, b.id))) continue
        // Comparable price (skip if one is >2.5× the other).
        if (a.price_usd && b.price_usd) {
          const ratio = Math.max(a.price_usd, b.price_usd) / Math.min(a.price_usd, b.price_usd)
          if (ratio > 2.5) continue
        }
        const score = (reviewCount.get(a.id) ?? 0) + (reviewCount.get(b.id) ?? 0)
        candidates.push({
          aId: a.id, aSlug: a.slug, aName: a.name,
          bId: b.id, bSlug: b.slug, bName: b.name,
          category, score,
        })
      }
    }
  }

  candidates.sort((x, y) => y.score - x.score)

  // Cap each product to ~2 suggestions for variety.
  const used = new Map<string, number>()
  const out: Matchup[] = []
  for (const m of candidates) {
    if ((used.get(m.aId) ?? 0) >= 2 || (used.get(m.bId) ?? 0) >= 2) continue
    out.push(m)
    used.set(m.aId, (used.get(m.aId) ?? 0) + 1)
    used.set(m.bId, (used.get(m.bId) ?? 0) + 1)
    if (out.length >= limit) break
  }
  return out
}

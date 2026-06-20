import type { SupabaseClient } from "@supabase/supabase-js"

export type MatchedProduct = { id: string; slug: string; name: string }

// Words that don't help identify a specific model — ignored when matching.
const STOP = new Set([
  "the", "and", "with", "for", "by", "x", "g", "edition", "ed",
  "chair", "chairs", "office", "task", "gaming", "gamer", "ergonomic",
  "desk", "seat", "seating", "pro", "premium", "new", "series",
])

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

/**
 * Find the catalog product that best matches a chair name. Conservative: only
 * returns a product when a strong share of its identifying tokens appear in the
 * chair name (so we don't link the wrong affiliate product). Returns null if no
 * confident match.
 */
/** Pure matcher against a pre-loaded product list (no DB hit per call). */
export function matchProductInList(
  chairName: string,
  products: MatchedProduct[]
): MatchedProduct | null {
  const nameTokens = new Set(tokens(chairName))
  if (nameTokens.size === 0) return null

  let best: { p: MatchedProduct; score: number; matched: number } | null = null
  for (const p of products) {
    const pt = tokens(p.name)
    if (pt.length === 0) continue
    const matched = pt.filter((t) => nameTokens.has(t)).length
    const score = matched / pt.length // share of the product's tokens present
    if (!best || score > best.score || (score === best.score && matched > best.matched)) {
      best = { p, score, matched }
    }
  }

  // Require a strong match: most of the product's tokens present, >=2 real hits.
  if (best && best.score >= 0.6 && best.matched >= 2) return best.p
  return null
}

export async function matchProductId(
  supabase: SupabaseClient,
  chairName: string
): Promise<MatchedProduct | null> {
  const { data } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("track", "chair")
    .limit(2000)
  return matchProductInList(chairName, (data ?? []) as MatchedProduct[])
}

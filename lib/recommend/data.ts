import { createPublicServerClient } from "@/lib/supabase/public-server"
import { AFFILIATE_LINKS_DATA } from "@/lib/data/affiliate-links"
import { canonicalJob, canonicalPain } from "@/lib/reviews/normalize"
import type { Affinity, Budget, ProductFeature } from "@/lib/recommend/engine"

const MIN_SUPPORT = 3 // need this many picks in a segment before we trust a lift
const ALPHA = 0.02 // smoothing

type RankRow = { rank: number; chair_id: string }
type SessionRow = {
  pain: string[] | null
  job: string | null
  sit_hours: string | null
  review_rankings: RankRow[] | null
}

type ProductRow = {
  id: string
  slug: string
  name: string
  category: string | null
  chair_type: string | null
  price_range: string | null
  price_usd: number | null
  best_for: string | null
  pros: string[] | null
  cons: string[] | null
  rating_overall: number | null
  rating_comfort: number | null
  rating_ergonomics: number | null
  rating_build_quality: number | null
  rating_design: number | null
  rating_value: number | null
  brands: { name: string } | { name: string }[] | null
}

function topChairId(s: SessionRow): string | null {
  const ranks = s.review_rankings ?? []
  const first = ranks.find((r) => r.rank === 1) ?? ranks[0]
  return first?.chair_id ?? null
}

function hasDirectBuy(slug: string): boolean {
  const links = AFFILIATE_LINKS_DATA[slug]
  return Boolean(links?.some((l) => l.url.includes("/dp/")))
}

function editorialScore(p: ProductRow): number | null {
  const vals = [
    p.rating_overall,
    p.rating_comfort,
    p.rating_ergonomics,
    p.rating_build_quality,
    p.rating_design,
    p.rating_value,
  ].filter((v): v is number => typeof v === "number")
  if (vals.length === 0) return null
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length
  // ratings are stored on a 0–10 scale; clamp to 0..1.
  return Math.max(0, Math.min(1, avg / 10))
}

function brandName(b: ProductRow["brands"]): string | null {
  if (!b) return null
  return Array.isArray(b) ? (b[0]?.name ?? null) : b.name
}

/** Build lift tables from segment pick-counts vs global pick-share. */
function buildLift(
  segCounts: Map<string, Map<string, number>>,
  picks: Map<string, number>,
  totalPicks: number
): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {}
  for (const [seg, chairs] of segCounts) {
    const segTotal = [...chairs.values()].reduce((a, b) => a + b, 0)
    if (segTotal === 0) continue
    const table: Record<string, number> = {}
    for (const [chair, c] of chairs) {
      if (c < MIN_SUPPORT) continue
      const pSeg = c / segTotal
      const pGlobal = (picks.get(chair) ?? 0) / totalPicks
      const lift = (pSeg + ALPHA) / (pGlobal + ALPHA)
      table[chair] = Math.max(0.5, Math.min(3, lift))
    }
    out[seg] = table
  }
  return out
}

export async function loadRecommenderData(): Promise<{
  products: ProductFeature[]
  affinity: Affinity
}> {
  const supabase = createPublicServerClient()

  const [{ data: sessions }, { data: products }] = await Promise.all([
    supabase
      .from("review_sessions")
      .select("pain, job, sit_hours, review_rankings(rank, chair_id)")
      .eq("status", "approved")
      .limit(5000),
    supabase
      .from("products")
      .select(
        "id, slug, name, category, chair_type, price_range, price_usd, best_for, pros, cons, rating_overall, rating_comfort, rating_ergonomics, rating_build_quality, rating_design, rating_value, brands(name)"
      )
      .limit(2000),
  ])

  // ---- aggregate review signals ----
  const picks = new Map<string, number>()
  let totalPicks = 0
  const painCounts = new Map<string, Map<string, number>>()
  const jobCounts = new Map<string, Map<string, number>>()
  const sitCounts = new Map<string, Map<string, number>>()

  const bump = (m: Map<string, Map<string, number>>, seg: string, chair: string) => {
    const t = m.get(seg) ?? new Map<string, number>()
    t.set(chair, (t.get(chair) ?? 0) + 1)
    m.set(seg, t)
  }

  for (const s of (sessions ?? []) as SessionRow[]) {
    const chair = topChairId(s)
    if (!chair) continue
    picks.set(chair, (picks.get(chair) ?? 0) + 1)
    totalPicks++
    for (const raw of s.pain ?? []) {
      const pn = canonicalPain(raw)
      if (pn && pn !== "None") bump(painCounts, pn, chair)
    }
    const job = canonicalJob(s.job)
    if (job) bump(jobCounts, job, chair)
    if (s.sit_hours) bump(sitCounts, s.sit_hours, chair)
  }

  totalPicks = Math.max(1, totalPicks)
  const affinity: Affinity = {
    liftPain: buildLift(painCounts, picks, totalPicks),
    liftJob: buildLift(jobCounts, picks, totalPicks),
    liftSit: buildLift(sitCounts, picks, totalPicks),
    picks: Object.fromEntries(picks),
    totalPicks,
  }

  // ---- product features ----
  const features: ProductFeature[] = ((products ?? []) as ProductRow[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: brandName(p.brands),
    category: p.category,
    chairType: p.chair_type,
    priceRange: (p.price_range as Budget | null) ?? null,
    priceUsd: p.price_usd,
    bestFor: p.best_for ?? "",
    pros: Array.isArray(p.pros) ? p.pros : [],
    cons: Array.isArray(p.cons) ? p.cons : [],
    editorial: editorialScore(p),
    hasDirectBuy: hasDirectBuy(p.slug),
    picks: picks.get(p.id) ?? 0,
  }))

  return { products: features, affinity }
}

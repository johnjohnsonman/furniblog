/**
 * Chair recommendation engine (pure scoring + diversity re-ranking).
 *
 * Design goals:
 *  - Answer-fit dominates; global popularity is only a tiny tiebreaker, so the
 *    same few famous chairs don't win every quiz.
 *  - Review signal uses LIFT (how distinctively a chair is picked by people in
 *    your segment) rather than raw counts, so different answers surface
 *    different chairs.
 *  - Editorial (showroom-tested) ratings blend in by confidence, so great but
 *    unreviewed new chairs can still appear.
 *  - MMR re-ranking + brand cap + price-tier guarantee spread the final Top 5
 *    across brands, price tiers, and styles.
 *  - Everything is data-driven: new products/brands/reviews flow in with no
 *    code changes.
 */

export type Budget = "$" | "$$" | "$$$" | "$$$$"
export type UseCase =
  | "office"
  | "executive"
  | "gaming"
  | "study"
  | "standing"
  | "lounge"
export type SitHours = "under2" | "2to6" | "over6"
export type Style = "minimal" | "classic" | "sporty" | "premium" | "ergonomic"

export type QuizAnswers = {
  useCase?: UseCase
  budget?: Budget
  sitHours?: SitHours
  pain?: string[]
  style?: Style
  features?: string[]
  seed?: number
}

export type ProductFeature = {
  id: string
  slug: string
  name: string
  brand: string | null
  category: string | null
  chairType: string | null
  priceRange: Budget | null
  priceUsd: number | null
  bestFor: string
  pros: string[]
  cons: string[]
  /** 0..1 editorial quality from rating_* fields, or null if untested. */
  editorial: number | null
  /** Has a direct Amazon /dp/ product link (high-conversion buyable). */
  hasDirectBuy: boolean
  /** Total #1 picks across experience reviews (popularity). */
  picks: number
}

export type Affinity = {
  liftPain: Record<string, Record<string, number>>
  liftJob: Record<string, Record<string, number>>
  liftSit: Record<string, Record<string, number>>
  picks: Record<string, number>
  totalPicks: number
}

export type RecTag =
  | "best-match"
  | "reviewer-favorite"
  | "best-value"
  | "new-noteworthy"

export type Recommendation = {
  slug: string
  name: string
  brand: string | null
  priceRange: Budget | null
  priceUsd: number | null
  match: number
  why: string[]
  tag: RecTag | null
  picks: number
}

// ---- weights (tunable) ----
const W = {
  use: 2.2,
  budget: 2.0,
  pain: 1.8,
  sit: 0.8,
  style: 0.9,
  feature: 0.7,
  quality: 1.2, // review popularity + editorial, confidence-blended
  buyBase: 1.0,
  buyBudgetBoost: 0.8, // extra when the user is budget-conscious
}
const CONF_K = 20 // #picks for full review confidence
const LOG_CAP = Math.log1p(120) // popularity saturates around ~120 picks
const JITTER = 0.12
const MMR_LAMBDA = 0.72

const TIER: Record<Budget, number> = { $: 1, $$: 2, $$$: 3, $$$$: 4 }

const USE_RELATED: Record<UseCase, string[]> = {
  office: ["office", "study", "executive"],
  study: ["study", "office"],
  executive: ["executive", "office", "lounge"],
  gaming: ["gaming"],
  standing: ["standing", "office"],
  lounge: ["lounge", "executive"],
}

const PAIN_KEYWORDS: Record<string, string[]> = {
  "Lower back": ["lumbar", "lower back", "back support", "posture", "ergonomic", "spine"],
  Neck: ["headrest", "neck", "head support"],
  Shoulders: ["recline", "headrest", "shoulder", "back support"],
  "Legs & lower body": ["seat depth", "waterfall", "leg", "thigh", "circulation"],
  Hips: ["seat", "cushion", "pressure", "hip"],
  Tailbone: ["seat", "cushion", "pressure", "coccyx"],
  Arms: ["armrest", "adjustable arm", "arm"],
}

const STYLE_RULES: Record<
  Style,
  { types?: string[]; keywords?: string[]; premium?: boolean }
> = {
  minimal: { keywords: ["sleek", "minimal", "clean", "modern", "distinctive"] },
  classic: { types: ["Executive"], keywords: ["leather", "classic", "executive"] },
  sporty: { types: ["Gaming"], keywords: ["racing", "gaming", "sport"] },
  premium: { premium: true, keywords: ["premium", "high-end", "flagship"] },
  ergonomic: {
    keywords: ["ergonomic", "adjustable", "support", "posture", "lumbar"],
  },
}

const FEATURE_KEYWORDS: Record<string, string[]> = {
  headrest: ["headrest", "head support"],
  armrest: ["armrest", "adjustable arm", "arms", "4d arm"],
  recline: ["recline", "tilt", "lean"],
  lumbar: ["lumbar", "back support"],
}

function seeded(id: string, seed: number): number {
  let h = (seed >>> 0) || 1
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return (h % 10000) / 10000
}

function hit(text: string, keys: string[]): boolean {
  return keys.some((k) => text.includes(k))
}

/** Map a lift value (≈0.5..3, 1=neutral) into a 0..1 boost. */
function liftScore(lift: number): number {
  return Math.max(0, Math.min(1, (lift - 1) / 1.5))
}

type Fits = {
  use: number
  budget: number
  pain: number
  painLabel: string | null
  sit: number
  style: number
  feature: number
  quality: number
  reviewDriven: boolean
}

function scoreProduct(
  p: ProductFeature,
  a: QuizAnswers,
  aff: Affinity
): { score: number; fits: Fits } {
  const text = `${p.bestFor} ${p.pros.join(" ")} ${p.chairType ?? ""} ${p.name}`.toLowerCase()

  // use
  let use = 1
  if (a.useCase) {
    if (p.category === a.useCase) use = 1
    else if (USE_RELATED[a.useCase].includes(p.category ?? "")) use = 0.55
    else use = 0.15
    if (a.useCase === "gaming" && (p.chairType ?? "").toLowerCase().includes("gaming"))
      use = 1
  }

  // budget
  let budget = 1
  if (a.budget) {
    if (p.priceRange) {
      const d = TIER[p.priceRange] - TIER[a.budget]
      budget = d <= 0 ? 1 : d === 1 ? 0.35 : 0.05
    } else budget = 0.55
  }

  // pain — review lift (distinctive-for-segment) blended with attribute keywords
  let pain = 0.5
  let painLabel: string | null = null
  let reviewDriven = false
  const pains = (a.pain ?? []).filter((x) => x && x !== "None")
  if (pains.length) {
    let best = 0
    for (const pn of pains) {
      const lift = aff.liftPain[pn]?.[p.id] ?? 1
      const ls = liftScore(lift)
      const kw = hit(text, PAIN_KEYWORDS[pn] ?? []) ? 1 : 0
      const s = 0.6 * ls + 0.4 * kw
      if (s > best) {
        best = s
        painLabel = pn
        reviewDriven = ls > 0.15
      }
    }
    pain = best
  }

  // sitting hours
  let sit = 0.5
  if (a.sitHours === "over6") {
    const lift = aff.liftSit["over6"]?.[p.id] ?? 1
    sit =
      0.5 * liftScore(lift) +
      (hit(text, ["long", "all-day", "hours", "ergonomic", "support"]) ? 0.5 : 0)
  }

  // style
  let style = 0.5
  if (a.style) {
    const r = STYLE_RULES[a.style]
    let s = 0
    if (r.keywords && hit(text, r.keywords)) s += 0.6
    if (r.types && r.types.includes(p.chairType ?? "")) s += 0.4
    if (r.premium && p.priceRange && TIER[p.priceRange] >= 3) s += 0.5
    style = Math.min(1, s)
  }

  // features
  let feature = 0.5
  if (a.features?.length) {
    let matched = 0
    for (const f of a.features) if (hit(text, FEATURE_KEYWORDS[f] ?? [f])) matched++
    feature = matched / a.features.length
  }

  // quality = review popularity (capped, log) blended with editorial by confidence
  const pop = Math.min(Math.log1p(p.picks), LOG_CAP) / LOG_CAP
  const conf = Math.min(1, p.picks / CONF_K)
  const editorial = p.editorial ?? 0.3 // neutral-ish for untested
  const quality = pop * conf + editorial * (1 - conf)

  // buyability (budget-sensitive)
  const budgetConscious = a.budget ? TIER[a.budget] <= 2 : false
  const buyWeight = W.buyBase + (budgetConscious ? W.buyBudgetBoost : 0)
  const buy = p.hasDirectBuy ? 1 : 0

  let score =
    W.use * use +
    W.budget * budget +
    W.pain * pain +
    W.sit * sit +
    W.style * style +
    W.feature * feature +
    W.quality * quality +
    buyWeight * buy

  // light rotation so near-ties vary per visit / similar users
  score += (seeded(p.id, a.seed ?? 1) - 0.5) * JITTER

  return {
    score,
    fits: { use, budget, pain, painLabel, sit, style, feature, quality, reviewDriven },
  }
}

function similarity(a: ProductFeature, b: ProductFeature): number {
  let s = 0
  if (a.brand && a.brand === b.brand) s += 1.0
  if (a.priceRange && a.priceRange === b.priceRange) s += 0.5
  if (a.chairType && a.chairType === b.chairType) s += 0.4
  return s
}

function buildWhy(p: ProductFeature, a: QuizAnswers, f: Fits): string[] {
  const why: string[] = []
  if (a.useCase && f.use >= 0.55) why.push(`Great for ${a.useCase} use`)
  if (f.painLabel && f.pain >= 0.4) why.push(`Strong ${f.painLabel.toLowerCase()} support`)
  if (a.sitHours === "over6" && f.sit >= 0.4) why.push("Built for long hours")
  if (a.budget && f.budget >= 1) why.push("Within your budget")
  if (f.reviewDriven) why.push("A favorite among reviewers like you")
  else if (p.editorial != null && p.picks < 5) why.push("Showroom-tested pick")
  if (a.style && f.style >= 0.6) why.push(`Matches your ${a.style} taste`)
  if (why.length === 0 && p.pros[0]) why.push(p.pros[0])
  return why.slice(0, 3)
}

function tagFor(
  p: ProductFeature,
  isTop: boolean,
  editorialNew: boolean
): RecTag | null {
  if (editorialNew && p.editorial != null && p.picks < 5) return "new-noteworthy"
  if (p.picks >= 25) return "reviewer-favorite"
  if (p.hasDirectBuy && p.priceRange && TIER[p.priceRange] <= 2) return "best-value"
  if (isTop) return "best-match"
  return null
}

/** Score, then diversity-rerank into a spread Top N. */
export function recommend(
  products: ProductFeature[],
  affinity: Affinity,
  answers: QuizAnswers,
  topN = 5
): Recommendation[] {
  const scored = products
    .map((p) => ({ p, ...scoreProduct(p, answers, affinity) }))
    .sort((x, y) => y.score - x.score)

  const pool = scored.slice(0, 30)
  const maxScore = pool[0]?.score ?? 1

  // MMR greedy selection with a brand cap of 2.
  const selected: typeof pool = []
  const brandCount = new Map<string, number>()
  while (selected.length < topN && pool.length) {
    let bestIdx = -1
    let bestVal = -Infinity
    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i]
      const brand = cand.p.brand ?? cand.p.id
      if ((brandCount.get(brand) ?? 0) >= 2) continue
      const sim = selected.length
        ? Math.max(...selected.map((s) => similarity(cand.p, s.p)))
        : 0
      const val = MMR_LAMBDA * (cand.score / maxScore) - (1 - MMR_LAMBDA) * sim
      if (val > bestVal) {
        bestVal = val
        bestIdx = i
      }
    }
    if (bestIdx < 0) break
    const picked = pool.splice(bestIdx, 1)[0]
    selected.push(picked)
    const b = picked.p.brand ?? picked.p.id
    brandCount.set(b, (brandCount.get(b) ?? 0) + 1)
  }

  // Guarantee at least one affordable, easy-to-buy option.
  const hasValue = selected.some(
    (s) => s.p.hasDirectBuy && s.p.priceRange && TIER[s.p.priceRange] <= 2
  )
  if (!hasValue) {
    const value = scored.find(
      (s) =>
        s.p.hasDirectBuy &&
        s.p.priceRange &&
        TIER[s.p.priceRange] <= 2 &&
        !selected.includes(s)
    )
    if (value && selected.length) selected[selected.length - 1] = value
  }

  // Diverse SET chosen by MMR; display it in descending match order.
  selected.sort((x, y) => y.score - x.score)

  return selected.map((s, i) => {
    const match = Math.round(70 + 29 * (s.score / maxScore))
    return {
      slug: s.p.slug,
      name: s.p.name,
      brand: s.p.brand,
      priceRange: s.p.priceRange,
      priceUsd: s.p.priceUsd,
      match: Math.max(60, Math.min(99, match)),
      why: buildWhy(s.p, answers, s.fits),
      tag: tagFor(s.p, i === 0, s.p.editorial != null && s.p.picks < 5),
      picks: s.p.picks,
    }
  })
}

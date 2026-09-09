/**
 * Structured data model for the "rich" Chairpedia review layout (the C300 pilot
 * design). Entries that have a RichReview object render the structured template;
 * everything else falls back to the existing content_html renderer.
 *
 * Data-tier discipline (mirrors the C300 handoff, file 06):
 *  - "A" = confirmed on the Amazon listing we link → printed as fact.
 *  - "B" = manufacturer-documented (SIHOO page) → labelled, verify before trust.
 *  - "C" = not confirmed → shown as a sentence, never a number.
 */

export type DataTier = "A" | "B" | "C"

export type QuickFact = { label: string; value: string; note?: string }

export type Check = { n: string; title: string; body: string }

export type DimRow = {
  /** measurement name */
  k: string
  /** manufacturer / documented value (or a "not confirmed" sentence for tier C) */
  v: string
  tier: DataTier
}

export type SpecRow = { k: string; v: string; src?: string }

export type BasisItem = { t: string; src: string }

export type Rival = {
  name: string
  lumbar: string
  arms: string
  standout: string
  /** true for the chair this page is about (highlighted row) */
  isSelf?: boolean
}

export type BuyRow = { k: string; v: string }

export type FaqItem = { q: string; a: string }

export type ImageSlot = {
  /** short brief shown inside the empty placeholder frame */
  brief: string
}

export type RichReview = {
  /** ASIN used to pull product images via the Creators API (empty frame if none/ineligible). */
  asin: string | null
  eyebrow: string
  /** Feature-based hero intro (confirmed copy; not pulled from stale DB fields). */
  heroIntro: string
  verdictOneLiner: string
  verdictNote: string

  heroShotBrief: string
  galleryBriefs: string[]

  quickFacts: QuickFact[]
  checks: Check[]
  dims: DimRow[]
  dimsSourceNote: string

  adjustable: SpecRow[]
  fixed: SpecRow[]

  pros: BasisItem[]
  cons: BasisItem[]

  forWho: string[]
  skipWho: string[]

  rivals: Rival[]

  buy: {
    productTitle: string
    retailerNote: string
    rows: BuyRow[]
    /** Label for the Amazon CTA. Use "Search on Amazon" when the link is a
     *  search (no verified single ASIN). Defaults to "Check price on Amazon". */
    ctaLabel?: string
    /** Optional secondary box (e.g. official store, trial policy). Rendered only
     *  if set; becomes a link when `url` is present. */
    officialStore?: { label: string; note: string; url?: string }
    /** @deprecated use officialStore. Kept for the C300 pilot. */
    sihooTrialNote?: string
    disclaimer: string
  }

  verdict: string[]
  verdictPullQuote: string

  faqs: FaqItem[]

  /** Labelled source lines (what each tier of claim is based on). */
  sources: SpecRow[]

  /** Optional per-product copy overrides (generic defaults are used otherwise). */
  /** Provenance line under "Quick facts". Defaults to the Amazon-listing wording. */
  quickFactsNote?: string
  checksTitle?: string
  checksIntro?: string
  dimsIntro?: string
  forWhoTitle?: string
  sourcesFooter?: string
}

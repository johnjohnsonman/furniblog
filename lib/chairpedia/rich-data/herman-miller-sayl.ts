import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Herman Miller Sayl — research-based buying-guide data layered on the existing
 * Chairpedia deep-dive ("In depth" section). Facts from store.hermanmiller.com,
 * the Amazon listing and published reviews (checked 2026-09-10). Sayl is the
 * affordable, design-forward Herman Miller; the big choices are the back type,
 * the arms and the lumbar. HM's public spec page 404'd, so some dimensions are
 * retailer-sourced and marked as such. No fixed prices.
 */
export const HERMAN_MILLER_SAYL: RichReview = {
  asin: null,
  eyebrow: "Herman Miller · Office chairs · Buying guide",
  heroIntro:
    "The Herman Miller Sayl, designed by Yves Béhar, hangs an unframed \"Y-Tower\" suspension back off a single spine — a suspension-bridge idea that gives it a distinctive open silhouette at the most accessible Herman Miller price. This guide covers the versions, the choices that change how it supports you, and how to buy the right one.",
  verdictOneLiner: "The design-led, entry-price Herman Miller — choose the back and arms with care.",
  verdictNote: "Research-based guide built on our existing Chairpedia deep-dive — not our own lab test.",

  heroShotBrief: "Front, Herman Miller Sayl with suspension back.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from store.hermanmiller.com, the Amazon listing and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Designer", value: "Yves Béhar", note: "\"Y-Tower\" suspension back" },
    { label: "Back options", value: "Suspension / upholstered", note: "Choose at order" },
    { label: "Arms", value: "None / fixed / adjustable", note: "Configuration choice" },
    { label: "Warranty", value: "12 years", note: "Herman Miller-documented" },
    { label: "Weight capacity", value: "≈ 350 lb", note: "Retailer-listed" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Sayl spans a wide price range depending on how it's configured. The listing you click decides how adjustable it actually is — confirm these four.",
  checks: [
    { n: "01", title: "Suspension back or upholstered back", body: "The signature version is the unframed elastomer \"Y-Tower\" suspension back — airy, flexible and the look people buy Sayl for. There's also a fully upholstered back. Confirm which the listing is; they feel quite different." },
    { n: "02", title: "Arms: armless, fixed or fully adjustable", body: "Sayl is sold armless, with fixed arms, or with fully adjustable arms. The cheapest listings are usually armless or fixed. If you want to set arm height and width, confirm the listing says fully adjustable." },
    { n: "03", title: "Adjustable lumbar and seat depth are options, not defaults", body: "An adjustable lumbar (SwingBack/adjustable) and an adjustable seat depth are available but not on every build. If lower-back support matters, buy the version that includes the adjustable lumbar." },
    { n: "04", title: "Don't confuse it with the Sayl Gaming chair", body: "Herman Miller also sells a Sayl Gaming variant with different styling. For a work setup, buy the standard Sayl and pick your colour and base finish." },
  ],

  dims: [
    { k: "Overall", v: "≈ 24.5 in W × 19.75 in D × 34.75–39.25 in H", tier: "C" },
    { k: "Seat height", v: "≈ 16–20.5 in", tier: "C" },
    { k: "Weight capacity", v: "≈ 350 lb", tier: "C" },
    { k: "Back", v: "Unframed \"Y-Tower\" elastomer suspension, or upholstered", tier: "B" },
    { k: "Seat", v: "Upholstered foam", tier: "B" },
    { k: "Recline", v: "Tilt with tension; tilt limiter and forward seat-angle available", tier: "B" },
    { k: "Armrests", v: "Armless, fixed, or fully adjustable (height + width)", tier: "B" },
    { k: "Lumbar", v: "Optional adjustable lumbar (not on every build)", tier: "B" },
    { k: "Warranty", v: "12 years", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: store.hermanmiller.com, the Amazon listing and published reviews (checked 2026-09-10). Herman Miller's public Sayl spec page returned an error on our check, so dimensions and weight capacity are retailer-sourced and marked \"Not confirmed\"; back type, arms, lumbar and the 12-year warranty are Herman Miller-documented.",

  adjustable: [
    { k: "Arms (on adjustable builds)", v: "Height and width.", src: "Herman Miller / listing" },
    { k: "Tilt", v: "Recline tension; tilt limiter and forward seat-angle options.", src: "Herman Miller (documented)" },
    { k: "Lumbar (option)", v: "Adjustable lumbar available on some builds.", src: "Herman Miller (documented)" },
    { k: "Seat depth (option)", v: "Adjustable on some builds.", src: "Herman Miller / listing" },
  ],
  fixed: [
    { k: "Back frame", v: "The suspension back is unframed by design — flex comes from the material, not a mechanism.", src: "Herman Miller (documented)" },
    { k: "Headrest", v: "Not offered on Sayl.", src: "Herman Miller (documented)" },
    { k: "Arms (on cheaper builds)", v: "Armless or fixed — no adjustment.", src: "Listing" },
  ],

  pros: [
    { t: "Distinctive, genuinely different design at the lowest Herman Miller price of entry.", src: "Published reviews (research)" },
    { t: "The unframed suspension back is airy and flexes with you; light and unobtrusive in a room.", src: "Published reviews (research)" },
    { t: "Backed by Herman Miller's 12-year warranty even at the entry price.", src: "Herman Miller (documented)" },
  ],
  cons: [
    { t: "Base versions are lightly adjustable — armless/fixed arms and no adjustable lumbar unless you upgrade.", src: "Herman Miller / listing" },
    { t: "No headrest, and the thin seat suits some bodies better than others, per reviewers.", src: "Published reviews (research)" },
    { t: "Price swings widely with configuration — easy to compare the wrong builds.", src: "Our reading" },
  ],

  forWhoTitle: "Sayl shines for",
  forWho: [
    "Design-minded buyers who want a Herman Miller look without the flagship price",
    "People who like an open, airy suspension back",
    "Smaller rooms where a light, unobtrusive chair suits the space",
  ],
  skipWho: [
    "Want deep, highly configurable ergonomics (look at Aeron or Mirra 2)",
    "Need a headrest or heavy lumbar support",
    "Prefer a plush, deeply padded seat",
  ],

  rivals: [
    { name: "Herman Miller Sayl", lumbar: "Optional adjustable", arms: "None / fixed / adjustable", standout: "Design-led, entry Herman Miller price", isSelf: true },
    { name: "Herman Miller Mirra 2", lumbar: "PostureFit sacral", arms: "Fully adjustable option", standout: "More adjustment, 350 lb, breathable" },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Up to fully adjustable", standout: "Flagship all-mesh, three sizes" },
    { name: "Steelcase Series 1", lumbar: "Adjustable", arms: "4D / height / armless", standout: "Similar price, more adjustable" },
  ],

  buy: {
    productTitle: "Herman Miller Sayl",
    retailerNote: "Amazon search — configuration (back, arms, lumbar, colour) varies by listing",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Herman Miller's own store lists a 30-day return. Check the listing." },
      { k: "Warranty", v: "12 years (Herman Miller). Confirm the current terms on the listing." },
      { k: "What to check", v: "Back type (suspension vs upholstered), arms (armless/fixed/adjustable), whether an adjustable lumbar is included, and colour." },
    ],
    officialStore: {
      label: "Herman Miller (official)",
      note: "Full configurator, colours and finishes at hermanmiller.com. Direct link (not an affiliate link).",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/sayl-chairs/",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and configuration vary by listing — confirm before buying. We link an Amazon search rather than a single product because Sayl is sold in many configurations with no one authoritative listing. The Amazon link is an affiliate link; the Herman Miller link is a direct, non-affiliate link.",
  },

  verdict: [
    "Sayl is the Herman Miller you buy for the design as much as the ergonomics. Yves Béhar's suspension-bridge back hangs an unframed elastomer \"Y-Tower\" off a single spine, giving a light, airy, unmistakable silhouette — and it arrives at the most accessible Herman Miller price with the same 12-year warranty as the flagships.",
    "Just buy it with your eyes open. The cheapest Sayls are armless or fixed-arm with no adjustable lumbar, there's no headrest, and the thin seat suits some bodies better than others. Decide on the back, the arms and whether you need the adjustable lumbar before you compare prices — configured well, it's a lot of Herman Miller design for the money; configured badly, it's a pretty chair that doesn't adjust.",
  ],
  verdictPullQuote:
    "The most affordable way into Herman Miller — as long as you pay for the arms and lumbar you actually need.",

  faqs: [
    { q: "What is the \"Y-Tower\" back?", a: "It's Sayl's unframed elastomer suspension back, hung off a single central spine like a suspension bridge — the design's signature and the reason for its open look." },
    { q: "Which arms should I get?", a: "Sayl comes armless, with fixed arms, or with fully adjustable arms. If you want to set arm height and width, confirm the listing says fully adjustable — cheaper listings often aren't." },
    { q: "Does Sayl have a headrest?", a: "No. There's no headrest option on Sayl." },
    { q: "Is there an adjustable lumbar?", a: "It's available on some builds but not standard on all. If lower-back support matters, buy the version that lists an adjustable lumbar." },
    { q: "Has Furniblog tested this chair?", a: "This guide is built on our research-based Chairpedia deep-dive (below) plus Herman Miller's information and published reviews. We have not run our own instrumented lab test." },
  ],

  sources: [
    { k: "Herman Miller (official)", v: "store.hermanmiller.com Sayl pages, checked 2026-09-10. Basis for back options, arms, lumbar and the 12-year warranty. The public spec page returned an error on our check." },
    { k: "Amazon listings", v: "Herman Miller Sayl listings (various configurations). Basis for arm and lumbar options and retailer-sourced dimensions." },
    { k: "Published reviews", v: "Third-party reviews summarised for comfort and the seat/arm cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications combine Herman Miller documentation with retailer-sourced dimensions (marked \"Not confirmed\") as of the date shown and are not independently verified by Furniblog. Sayl is sold in many configurations — confirm the back, arms, lumbar and colour on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

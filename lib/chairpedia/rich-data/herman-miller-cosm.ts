import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Herman Miller Cosm — research-based buying-guide data layered on the existing
 * Chairpedia deep-dive ("In depth" section). Facts from the hermanmiller.com
 * Cosm spec page, the Amazon listing and published reviews (checked 2026-09-10).
 * Cosm's defining trait is the Auto-Harmonic tilt (no tension knob); the buyer
 * choices are back height and arm type. No fixed prices.
 */
export const HERMAN_MILLER_COSM: RichReview = {
  asin: null,
  eyebrow: "Herman Miller · Office chairs · Buying guide",
  heroIntro:
    "The Herman Miller Cosm is the \"just sit down\" chair — its Auto-Harmonic tilt reads your body weight and sets its own recline resistance, so there's no tension knob to fiddle with. This guide covers the back-height and arm choices that define which Cosm you're actually buying.",
  verdictOneLiner: "Self-adjusting recline with almost no set-up — pick the back height and arms.",
  verdictNote: "Research-based guide built on our existing Chairpedia deep-dive — not our own lab test.",

  heroShotBrief: "Front, Herman Miller Cosm High Back.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from the hermanmiller.com Cosm spec page, the Amazon listing and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Tilt", value: "Auto-Harmonic", note: "Self-adjusting, no knob" },
    { label: "Back heights", value: "Low / Mid / High", note: "Choose at order" },
    { label: "Arms", value: "Fixed / Height-adj / Leaf", note: "Three tiers" },
    { label: "Suspension", value: "Intercept", note: "One-piece seat + back" },
    { label: "Warranty", value: "12 years", note: "Herman Miller-documented" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Cosm looks like one chair but is really a small family. Two choices — back height and arm type — change the price and the fit most, so confirm these.",
  checks: [
    { n: "01", title: "Back height: Low, Mid or High", body: "Cosm comes in three back heights. Low is a compact, lounge-ish profile; Mid is the office default; High gives upper-back and shoulder support for taller sitters or heavy recliners. Confirm which the listing is — they look similar in thumbnails." },
    { n: "02", title: "Arm tier: Fixed, Height-Adjustable or Leaf", body: "Fixed arms are cheapest; Height-Adjustable add up/down; the \"Leaf\" arms are a soft, cradling one-piece arm that many buyers pick for comfort. This choice noticeably changes the price — decide before you compare listings." },
    { n: "03", title: "Understand the Auto-Harmonic tilt", body: "There's no recline-tension knob. The tilt automatically calibrates resistance to your weight, so you just lean back. It's the reason to buy Cosm — but if you like manually locking a chair upright, know that Cosm's recline is meant to stay dynamic." },
    { n: "04", title: "Colour and dipped-in-colour", body: "Cosm comes in Herman Miller's palette (e.g. Glacier, Nightfall, Canyon, Graphite, Mineral), including striking \"dipped-in-colour\" builds where the frame and suspension match. Confirm the colour on the listing." },
  ],

  dims: [
    { k: "Width", v: "≈ 26.7–29.3 in", tier: "B" },
    { k: "Seat", v: "≈ 20.5 in W × 15.9 in D", tier: "B" },
    { k: "Seat height", v: "≈ 14.8–21.4 in (wider range than most)", tier: "B" },
    { k: "Overall height", v: "Low ≈ 34–40.6 in · Mid ≈ 38.9–45.5 in · High ≈ 45–51.6 in", tier: "B" },
    { k: "Weight capacity", v: "≈ 350 lb (retailer-listed; not on the spec extract)", tier: "C" },
    { k: "Recline", v: "Auto-Harmonic tilt — self-adjusting resistance, no tension knob", tier: "B" },
    { k: "Armrests", v: "Fixed, Height-Adjustable, or Leaf (soft cradle); arm height ≈ 7.3–11.7 in", tier: "B" },
    { k: "Suspension", v: "Intercept suspension over a glass-filled polypropylene frame; one-piece seat + back", tier: "B" },
    { k: "Warranty", v: "12-year, 3-shift (per Herman Miller)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: hermanmiller.com Cosm spec page, the Amazon listing and published reviews (checked 2026-09-10). The wide seat-height range reflects the different back-height builds; weight capacity is retailer-sourced and marked \"Not confirmed.\"",

  adjustable: [
    { k: "Seat height", v: "Pneumatic (≈ 14.8–21.4 in across builds).", src: "Herman Miller (documented)" },
    { k: "Arms (Height-Adjustable / Leaf)", v: "Height, on the upgraded arm tiers.", src: "Herman Miller (documented)" },
    { k: "Tilt", v: "Recline itself is dynamic; the resistance auto-calibrates to your weight.", src: "Herman Miller (documented)" },
  ],
  fixed: [
    { k: "Tilt tension", v: "By design there is no manual tension knob — the Auto-Harmonic tilt sets it.", src: "Herman Miller (documented)" },
    { k: "Lumbar", v: "The Intercept suspension is tuned in the shell; there is no separate adjustable lumbar device.", src: "Herman Miller / reviews" },
    { k: "Fixed arms (base tier)", v: "No arm adjustment on the fixed-arm build.", src: "Herman Miller (documented)" },
  ],

  pros: [
    { t: "Near-zero set-up: sit down and recline — the tilt calibrates itself to your weight.", src: "Herman Miller · published reviews" },
    { t: "Breathable, temperature-neutral Intercept suspension with a clean, one-piece look.", src: "Herman Miller (documented)" },
    { t: "Three back heights and the soft \"Leaf\" arms cover very different needs and rooms.", src: "Herman Miller (documented)" },
  ],
  cons: [
    { t: "No manual recline lock or tension — buyers who like fixing a chair upright may miss it.", src: "Published reviews (research)" },
    { t: "No separate adjustable lumbar; support is fixed by the shell, which suits some backs better than others.", src: "Published reviews (research)" },
    { t: "Premium price, and the Leaf arms and High back push it higher.", src: "Our reading" },
  ],

  forWhoTitle: "Cosm shines for",
  forWho: [
    "People who want to sit down and recline without adjusting anything",
    "Shared or hot-desk settings where nobody wants to re-set a chair",
    "Buyers who like a clean one-piece look and a cool suspension seat",
  ],
  skipWho: [
    "Want to manually lock recline or set tilt tension",
    "Need a separate, adjustable lumbar",
    "Are on a tight budget (especially with Leaf arms / High back)",
  ],

  rivals: [
    { name: "Herman Miller Cosm", lumbar: "Fixed in the shell", arms: "Fixed / Height-adj / Leaf", standout: "Auto-Harmonic self-adjusting tilt", isSelf: true },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL (adjustable)", arms: "Up to fully adjustable", standout: "Three sizes, deep adjustability" },
    { name: "Herman Miller Embody", lumbar: "Pixelated support", arms: "Height + width", standout: "Dynamic seat for active sitting" },
    { name: "Humanscale Freedom", lumbar: "Contoured cushion", arms: "Single-bar synchronised", standout: "Weight-sensitive recline, also knob-free" },
  ],

  buy: {
    productTitle: "Herman Miller Cosm",
    retailerNote: "Amazon search — back height (Low/Mid/High), arms and colour vary by listing",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Herman Miller's own store lists a 30-day return. Check the listing." },
      { k: "Warranty", v: "12-year, 3-shift (Herman Miller). Confirm on the listing." },
      { k: "What to check", v: "Back height (Low/Mid/High), arm tier (Fixed/Height-Adjustable/Leaf), and colour." },
    ],
    officialStore: {
      label: "Herman Miller (official)",
      note: "Full configurator, back heights, arm tiers and dipped-in-colour builds at hermanmiller.com. Direct link (not an affiliate link).",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and the exact build (back height, arms, colour) vary by listing — confirm before buying. We link an Amazon search because Cosm is sold in many builds. The Amazon link is an affiliate link; the Herman Miller link is a direct, non-affiliate link.",
  },

  verdict: [
    "Cosm's whole idea is to remove decisions. The Auto-Harmonic tilt senses your weight and sets its own recline resistance, so there's no tension knob and nothing to calibrate — you sit down and lean back. Add the breathable, temperature-neutral Intercept suspension and a clean one-piece shell and you get a chair that's especially good where nobody wants to fuss with settings, including shared and hot desks.",
    "That simplicity is also the limitation. There's no manual recline lock and no separate adjustable lumbar, so people who like fixing a chair bolt-upright or dialling in lower-back support may prefer an Aeron. The two decisions that matter are back height (Low/Mid/High) and arm tier (Fixed/Height-Adjustable/Leaf) — get those right and Cosm is one of the most effortless premium chairs you can buy.",
  ],
  verdictPullQuote:
    "No knobs, no fuss — Cosm sets its own recline; you just pick the back height and arms.",

  faqs: [
    { q: "What is Auto-Harmonic tilt?", a: "Cosm's recline mechanism automatically calibrates its resistance to your body weight, so there's no tension knob — you just lean back and it supports you." },
    { q: "Which back height should I choose?", a: "Low is compact and lounge-like, Mid is the office default, and High adds upper-back and shoulder support for taller sitters or those who recline a lot." },
    { q: "What are the Leaf arms?", a: "A soft, one-piece cradling armrest option, above the Fixed and Height-Adjustable tiers. Many buyers choose them for comfort; they raise the price." },
    { q: "Does Cosm have an adjustable lumbar?", a: "No separate adjustable lumbar — support is built into the Intercept suspension shell. Buyers who want dial-in lumbar often prefer the Aeron." },
    { q: "Has Furniblog tested this chair?", a: "This guide is built on our research-based Chairpedia deep-dive (below) plus Herman Miller's specs and published reviews. We have not run our own instrumented lab test." },
  ],

  sources: [
    { k: "Herman Miller (official)", v: "hermanmiller.com Cosm product and specification pages, checked 2026-09-10. Basis for the Auto-Harmonic tilt, back heights, arm tiers, suspension and warranty." },
    { k: "Amazon listings", v: "Herman Miller Cosm listings (various back heights/arms). Basis for available builds and retailer-sourced capacity." },
    { k: "Published reviews", v: "Third-party reviews summarised for the recline feel and the fixed-lumbar caution; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are Herman Miller's figures plus published reviews as of the date shown and are not independently verified by Furniblog. Cosm is sold in three back heights and three arm tiers — confirm the exact build and colour on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

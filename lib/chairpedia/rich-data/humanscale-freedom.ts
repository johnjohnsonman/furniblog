import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Humanscale Freedom — research-based buying-guide data layered on the existing
 * Chairpedia deep-dive ("In depth" section). Facts from humanscale.com, dealer
 * spec sheets and published reviews (checked 2026-09-10). Freedom's defining
 * trait is Niels Diffrient's weight-sensitive recline with no recline lock; the
 * buyer choices are headrest, arm type and seat foam. No fixed prices.
 */
export const HUMANSCALE_FREEDOM: RichReview = {
  asin: null,
  eyebrow: "Humanscale · Office chairs · Buying guide",
  heroIntro:
    "The Humanscale Freedom, designed by Niels Diffrient, throws out the levers: its weight-sensitive recline balances you automatically, and a single bar adjusts both armrests together. This guide covers the headrest, arm and seat choices and who the near-lever-free approach suits.",
  verdictOneLiner: "Lever-free, self-balancing recline — you pick the headrest, arms and seat foam.",
  verdictNote: "Research-based guide built on our existing Chairpedia deep-dive — not our own lab test.",

  heroShotBrief: "Front, black Humanscale Freedom with headrest.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from humanscale.com, dealer spec sheets and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Designer", value: "Niels Diffrient", note: "Weight-sensitive recline" },
    { label: "Recline lock", value: "None", note: "Self-balancing by design" },
    { label: "Headrest", value: "Optional", note: "Articulating, moves with recline" },
    { label: "Warranty", value: "15 years", note: "On seating components" },
    { label: "Weight capacity", value: "≈ 300 lb", note: "Humanscale-documented" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Freedom deliberately has fewer controls than its rivals — which means the version you choose matters more. Confirm these four.",
  checks: [
    { n: "01", title: "Understand the no-lock recline", body: "There's no recline-tension knob and no recline lock. The chair uses your body weight and a counter-balance to hold any position you lean into — you just recline and it supports you. If you specifically want to lock a chair bolt-upright, this design will feel foreign; that freedom is the whole point." },
    { n: "02", title: "Headrest or no headrest", body: "The headrest is an articulating type that pivots with you as you recline (there's no manual headrest knob). Decide up front — the headrest version is a distinct SKU and changes the chair's height and price." },
    { n: "03", title: "Arms: Standard or Advanced Duron, or armless", body: "A single armrest bar raises and lowers both arms together (a Diffrient signature). Standard Duron arms are the base; Advanced Duron arms add more adjustment. Confirm which the listing has." },
    { n: "04", title: "Seat foam: standard or Gel, plus textile", body: "Freedom is upholstered, not mesh, and offers a standard foam or an upgraded Gel seat, in various textiles or leather. Pick the seat and cover; there's no mesh option here." },
  ],

  dims: [
    { k: "Overall (with headrest)", v: "≈ 26.75 in W × 26 in D × 48.2–53 in H", tier: "C" },
    { k: "Seat", v: "≈ 20 in W × 17.5–19.5 in D (adjustable)", tier: "C" },
    { k: "Seat height", v: "≈ 16–21 in", tier: "C" },
    { k: "Weight capacity", v: "≈ 300 lb", tier: "C" },
    { k: "Recline", v: "Weight-sensitive, self-balancing — no tension knob and no recline lock", tier: "B" },
    { k: "Armrests", v: "Standard or Advanced Duron, or armless; single bar adjusts both together", tier: "B" },
    { k: "Back / seat", v: "Sculpted foam cushions (contoured), upholstered; standard or Gel seat", tier: "B" },
    { k: "Headrest", v: "Optional articulating headrest that pivots with recline (no manual knob)", tier: "B" },
    { k: "Warranty", v: "15 years on seating components; 5 years on upholstery, cushions and arm pads", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: humanscale.com, dealer spec sheets (e.g. btod.com) and published reviews (checked 2026-09-10). Overall/seat dimensions vary with the headrest and gel options and are dealer-sourced (marked \"Not confirmed\"); the recline design, arms, seat options and warranty are Humanscale-documented. Some listings claim a 400 lb capacity; Humanscale's standard figure is ~300 lb.",

  adjustable: [
    { k: "Recline", v: "Self-balancing to body weight — recline to any angle and it holds, no lever.", src: "Humanscale (documented)" },
    { k: "Armrests", v: "A single bar raises/lowers both arms together (Advanced Duron add more).", src: "Humanscale (documented)" },
    { k: "Seat height", v: "Pneumatic (≈ 16–21 in).", src: "Dealer spec sheets" },
    { k: "Seat depth", v: "Adjustable seat pan.", src: "Dealer spec sheets" },
  ],
  fixed: [
    { k: "Recline lock / tension", v: "None by design — the counter-balance replaces the levers.", src: "Humanscale (documented)" },
    { k: "Headrest angle", v: "Articulates automatically with recline; no manual headrest adjustment.", src: "Humanscale (documented)" },
    { k: "Back material", v: "Upholstered foam — there is no mesh version of Freedom.", src: "Humanscale (documented)" },
  ],

  pros: [
    { t: "Near-lever-free: the weight-sensitive recline balances you without tension knobs or locks.", src: "Humanscale · published reviews" },
    { t: "Plush, sculpted foam cushions and an optional Gel seat — a soft, upholstered feel rather than mesh.", src: "Published reviews (research)" },
    { t: "Long 15-year warranty on the seating components; the articulating headrest tracks you as you recline.", src: "Humanscale (documented)" },
  ],
  cons: [
    { t: "The no-lock recline divides people — some want to fix a chair upright and can't.", src: "Published reviews (research)" },
    { t: "Upholstered only; no breathable mesh option for hot sitters.", src: "Humanscale (documented)" },
    { t: "Premium price, and it's largely a dealer purchase with no clean single Amazon listing.", src: "Our reading" },
  ],

  forWhoTitle: "Freedom shines for",
  forWho: [
    "People who hate fiddling with levers and want recline to \"just work\"",
    "Buyers who prefer plush upholstered cushions over mesh",
    "Those who recline often and want a headrest that follows them",
  ],
  skipWho: [
    "Want to lock recline upright or set tilt tension manually",
    "Need a breathable mesh back/seat",
    "Want a simple Amazon purchase with easy returns",
  ],

  rivals: [
    { name: "Humanscale Freedom", lumbar: "Contoured cushion", arms: "Single-bar synchronised", standout: "Weight-sensitive, lock-free recline", isSelf: true },
    { name: "Herman Miller Cosm", lumbar: "Fixed in the shell", arms: "Fixed / height / Leaf", standout: "Also knob-free, but mesh suspension" },
    { name: "Steelcase Leap V2", lumbar: "Adjustable LiveBack", arms: "4D", standout: "Lever-rich, deep recline, upholstered" },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Up to fully adjustable", standout: "All-mesh, three sizes" },
  ],

  buy: {
    productTitle: "Humanscale Freedom",
    retailerNote: "Amazon search — headrest, arm and seat options vary; mostly a dealer purchase",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Depends on the seller/dealer; there's no single authoritative Amazon listing. Check the return policy where you buy." },
      { k: "Warranty", v: "15 years on seating components, 5 years on upholstery/cushions/arm pads (Humanscale). Confirm with your seller." },
      { k: "What to check", v: "Headrest vs no-headrest, arm type (Standard vs Advanced Duron), seat foam (standard vs Gel), and textile/leather." },
    ],
    officialStore: {
      label: "Humanscale (official)",
      note: "Full Freedom range, headrest models and authorized dealers at humanscale.com. Direct link (not an affiliate link).",
      url: "https://www.humanscale.com/products/seating/freedom-chair",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and configuration vary — Freedom is largely a dealer purchase and Amazon listings are third-party. The Amazon search link is an affiliate link; the Humanscale link is a direct, non-affiliate link. Confirm the exact version and seller before buying.",
  },

  verdict: [
    "Freedom is the anti-lever chair. Niels Diffrient's design replaces the tension knob and recline lock with a weight-sensitive counter-balance, so you simply lean back to any angle and it holds you there; a single bar even raises both armrests together. Add plush, sculpted foam cushions, an optional Gel seat, an articulating headrest that follows your recline and a 15-year warranty on the seating components, and it's one of the most genuinely relaxing premium chairs made.",
    "Whether that suits you comes down to temperament and climate. If you like to lock a chair bolt-upright or you run hot and want mesh, Freedom's lock-free, upholstered approach will frustrate you — look at Leap or Aeron. But if you want recline to disappear as a decision and prefer a cushioned seat, few chairs do it better. Just sort out the headrest, arms, seat foam and a reputable seller before you buy.",
  ],
  verdictPullQuote:
    "No recline lock, no tension knob — lean back and Freedom balances you; just choose the headrest, arms and seat.",

  faqs: [
    { q: "Why are there no recline levers?", a: "By design. The weight-sensitive mechanism counter-balances your body, so you recline to any angle and it holds — there's no tension knob and no recline lock." },
    { q: "Do I need the headrest version?", a: "If you recline often and want neck support, yes — the articulating headrest pivots with you. It's a separate SKU that changes the chair's height and price, so decide up front." },
    { q: "Is there a mesh version?", a: "No. Freedom is upholstered foam only, with a standard or upgraded Gel seat. If you want mesh, look at the Aeron or Cosm." },
    { q: "What's the weight capacity?", a: "Humanscale documents about 300 lb. Some third-party listings claim 400 lb; treat 300 lb as the reliable figure and confirm with your seller." },
    { q: "Has Furniblog tested this chair?", a: "This guide is built on our research-based Chairpedia deep-dive (below) plus Humanscale's specs and published reviews. We have not run our own instrumented lab test." },
  ],

  sources: [
    { k: "Humanscale (official)", v: "humanscale.com Freedom pages, checked 2026-09-10. Basis for the recline design, arms, seat options, headrest and warranty." },
    { k: "Dealer spec sheets", v: "Authorized-dealer specifications (e.g. btod.com) for dimensions and capacity; marked \"Not confirmed\" where not on Humanscale's own page." },
    { k: "Published reviews", v: "Third-party reviews summarised for the recline feel and the no-lock/upholstered cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications combine Humanscale documentation with dealer-sourced dimensions (marked \"Not confirmed\") as of the date shown and are not independently verified by Furniblog. Freedom is configured to order and mostly sold via dealers — confirm the version, capacity and seller before buying.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

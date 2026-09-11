import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Herman Miller Mirra 2 — research-based buying-guide data. Facts from the
 * hermanmiller.com Mirra 2 spec page, the Amazon listing and published reviews
 * (checked 2026-09-10). The core choice is the back type (TriFlex polymer vs
 * Butterfly suspension) plus tilt, seat and arm options. No fixed prices.
 */
export const HERMAN_MILLER_MIRRA_2: RichReview = {
  asin: null,
  eyebrow: "Herman Miller · Office chairs · Buying guide",
  heroIntro:
    "The Herman Miller Mirra 2 is the responsive, no-nonsense middle child of the range: a flexible TriFlex or Butterfly back, a breathable AireWeave seat, and a Harmonic 2 tilt that reclines smoothly without drama. This guide covers the back and configuration choices and what to check before buying.",
  verdictOneLiner: "Responsive, breathable and 350 lb-rated — the choice is the back type.",
  verdictNote: "Research-based guide — hands-on lab test not completed.",

  heroShotBrief: "Front, black Herman Miller Mirra 2.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from the hermanmiller.com Mirra 2 spec page, the Amazon listing and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Back options", value: "TriFlex / Butterfly", note: "Polymer or suspension" },
    { label: "Seat", value: "AireWeave", note: "Elastomeric suspension" },
    { label: "Tilt", value: "Harmonic 2", note: "PostureFit sacral support" },
    { label: "Weight capacity", value: "350 lb", note: "Herman Miller-documented" },
    { label: "Warranty", value: "12 years", note: "Full chair" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Mirra 2 is simpler than an Aeron but still has real choices. The back type changes the feel most — confirm these four.",
  checks: [
    { n: "01", title: "TriFlex back vs Butterfly back", body: "The standard TriFlex back is a flexible polymer with a dotted, varying-give pattern — airy and responsive. The Butterfly back adds a thin fabric-and-polymer suspension layer over it for a slightly softer, quieter feel. Both are breathable; confirm which the listing is, as they look and feel a little different." },
    { n: "02", title: "Tilt: standard or with tilt limiter and seat-angle", body: "The Harmonic 2 tilt reclines smoothly; an upgrade adds a tilt limiter and adjustable seat-angle for finer control. If you want to cap or fine-tune recline, buy the version that lists those." },
    { n: "03", title: "Seat depth: fixed or FlexFront", body: "The seat is a breathable AireWeave suspension at a fixed depth, or with the FlexFront option that adjusts seat depth (about 16.25–18 in). Taller sitters usually want FlexFront." },
    { n: "04", title: "Arms and back support", body: "Arms range from fixed to fully adjustable (height, width, depth and pivot); the back support also adjusts for height and depth. Confirm the arm build and colour on the listing." },
  ],

  dims: [
    { k: "Overall", v: "≈ 30 in W × 18.5 in D × 38.75–42.75 in H", tier: "B" },
    { k: "Seat depth", v: "Fixed ≈ 16.25 in, or FlexFront ≈ 16.25–18 in", tier: "B" },
    { k: "Seat height", v: "≈ 16–20.5 in", tier: "B" },
    { k: "Weight capacity", v: "350 lb", tier: "B" },
    { k: "Back", v: "TriFlex polymer, or Butterfly fabric-and-polymer suspension", tier: "B" },
    { k: "Seat", v: "AireWeave elastomeric suspension", tier: "B" },
    { k: "Recline", v: "Harmonic 2 tilt; PostureFit sacral support; Loop spine torsional flex", tier: "B" },
    { k: "Armrests", v: "Fixed to fully adjustable (≈ 5 in vertical, 1 in horizontal, 2 in front-to-back, 20° pivot)", tier: "B" },
    { k: "Back support", v: "Adjusts ≈ 4 in height, 1 in depth", tier: "B" },
    { k: "Warranty", v: "12 years, full chair", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: hermanmiller.com Mirra 2 specification page, the Amazon listing and published reviews (checked 2026-09-10). Figures are Herman Miller-documented; the arm and back-support ranges apply to the adjustable builds.",

  adjustable: [
    { k: "Armrests (adjustable build)", v: "≈ 5 in vertical, 1 in horizontal, 2 in front-to-back, 20° pivot.", src: "Herman Miller (documented)" },
    { k: "Back support", v: "≈ 4 in height, 1 in depth.", src: "Herman Miller (documented)" },
    { k: "Tilt (upgrade)", v: "Tilt limiter and adjustable seat-angle on the upgraded mechanism.", src: "Herman Miller (documented)" },
    { k: "Seat depth (FlexFront)", v: "≈ 16.25–18 in on the FlexFront option.", src: "Herman Miller (documented)" },
    { k: "Seat height", v: "Pneumatic (≈ 16–20.5 in).", src: "Herman Miller (documented)" },
  ],
  fixed: [
    { k: "Seat depth (base)", v: "Fixed ≈ 16.25 in unless you choose FlexFront.", src: "Herman Miller (documented)" },
    { k: "Headrest", v: "Not offered on Mirra 2.", src: "Herman Miller (documented)" },
    { k: "Arms (fixed build)", v: "No adjustment on the fixed-arm option.", src: "Herman Miller (documented)" },
  ],

  pros: [
    { t: "Responsive TriFlex/Butterfly back and breathable AireWeave seat — cool and lively to sit in.", src: "Herman Miller · published reviews" },
    { t: "PostureFit sacral support and a smooth Harmonic 2 tilt, at a 350 lb capacity.", src: "Herman Miller (documented)" },
    { t: "Full 12-year Herman Miller warranty for less than the Aeron/Embody flagships.", src: "Herman Miller (documented)" },
  ],
  cons: [
    { t: "No headrest, and the base build has fixed seat depth and fixed arms.", src: "Herman Miller (documented)" },
    { t: "The suspension seat is firmer/less plush than an upholstered chair, per reviewers.", src: "Published reviews (research)" },
    { t: "Not sold as one clean Amazon product — back/arm configurations vary by listing.", src: "Our reading" },
  ],

  forWhoTitle: "Mirra 2 shines for",
  forWho: [
    "People who want a breathable, responsive Herman Miller under flagship prices",
    "Buyers who like a lively, flexing back rather than a rigid one",
    "Those who need a higher (350 lb) capacity in a mid-range chair",
  ],
  skipWho: [
    "Need a headrest (look at Steelcase Leap or an aftermarket option)",
    "Want a deeply padded, upholstered seat",
    "Won't upgrade to FlexFront/adjustable arms if you need them",
  ],

  rivals: [
    { name: "Herman Miller Mirra 2", lumbar: "PostureFit sacral", arms: "Fixed to fully adjustable", standout: "Breathable, responsive, 350 lb", isSelf: true },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Up to fully adjustable", standout: "All-mesh, three sizes, flagship" },
    { name: "Herman Miller Sayl", lumbar: "Optional adjustable", arms: "None / fixed / adjustable", standout: "Design-led, cheaper entry" },
    { name: "Steelcase Series 1", lumbar: "Adjustable", arms: "4D / height / armless", standout: "Cheaper, easy to buy, headrest option" },
  ],

  buy: {
    productTitle: "Herman Miller Mirra 2",
    retailerNote: "Amazon search — back type (TriFlex/Butterfly), tilt, seat depth and arms vary by listing",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Herman Miller's own store lists a 30-day return. Check the listing." },
      { k: "Warranty", v: "12 years, full chair (Herman Miller). Confirm on the listing." },
      { k: "What to check", v: "Back type (TriFlex vs Butterfly), tilt (standard vs limiter + seat-angle), seat depth (fixed vs FlexFront), arm build and colour." },
    ],
    officialStore: {
      label: "Herman Miller (official)",
      note: "Full configurator, back types, colours and finishes at hermanmiller.com. Direct link (not an affiliate link).",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/mirra-2-chairs/",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and configuration vary by listing — confirm before buying. We link an Amazon search because Mirra 2 is sold in several back and arm configurations. The Amazon link is an affiliate link; the Herman Miller link is a direct, non-affiliate link.",
  },

  verdict: [
    "Mirra 2 is the Herman Miller you buy when you want the engineering without the flagship badge. Its TriFlex (or Butterfly) back flexes with you, the AireWeave seat breathes, PostureFit cradles your sacrum and the Harmonic 2 tilt reclines smoothly — a genuinely responsive, cool-running chair rated to 350 lb and covered by the same 12-year warranty as an Aeron, for less money.",
    "It stays sensible rather than plush. There's no headrest, the base build has fixed seat depth and fixed arms, and the suspension seat is firmer than upholstery. Decide on the back type first, then add FlexFront and adjustable arms if your body needs them. Configured to fit, Mirra 2 is one of the best-value ways to own a real Herman Miller ergonomic chair.",
  ],
  verdictPullQuote:
    "A real Herman Miller for less — pick the back type, add FlexFront and adjustable arms if you need them.",

  faqs: [
    { q: "TriFlex or Butterfly back?", a: "TriFlex is a flexible polymer back with a dotted, varying-give pattern (airy, responsive). Butterfly adds a thin fabric-and-polymer suspension layer for a slightly softer, quieter feel. Both breathe." },
    { q: "Does Mirra 2 have a headrest?", a: "No — there's no headrest option. If you need neck support, look at a Steelcase Leap or an aftermarket solution." },
    { q: "What is FlexFront?", a: "An option that makes the seat depth adjustable (about 16.25–18 in). The base seat is a fixed depth; taller sitters usually want FlexFront." },
    { q: "What's the weight capacity?", a: "350 lb, per Herman Miller. Confirm on the listing you buy from." },
    { q: "Has Furniblog tested this chair?", a: "Not with our own instruments yet. This is a research-based guide from Herman Miller's specs, the Amazon listing and published reviews; the deep-dive below adds context." },
  ],

  sources: [
    { k: "Herman Miller (official)", v: "hermanmiller.com Mirra 2 product and specification pages, checked 2026-09-10. Basis for back types, tilt, seat, arms and warranty." },
    { k: "Amazon listings", v: "Herman Miller Mirra 2 listings (various back/arm builds). Basis for available configurations." },
    { k: "Published reviews", v: "Third-party reviews summarised for the responsive feel and the firm-seat/no-headrest cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are Herman Miller's figures plus published reviews as of the date shown and are not independently verified by Furniblog. Mirra 2 is sold in several back and arm configurations — confirm the back type, tilt, seat depth, arms and colour on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

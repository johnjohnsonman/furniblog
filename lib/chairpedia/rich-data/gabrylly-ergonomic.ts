import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Gabrylly Ergonomic Office Chair (classic high-back, ASIN B07Y8BXBX8) —
 * research-based buying guide data. Facts from the official site, the Amazon
 * listing and published reviews (checked 2026-09-10). Gabrylly now sells a
 * family of variants; this guide covers the classic 280 lb model and warns
 * against cross-contaminated specs from other SKUs. No fixed prices.
 */
export const GABRYLLY_ERGONOMIC: RichReview = {
  asin: "B07Y8BXBX8",
  eyebrow: "Gabrylly · Office chairs · Buying guide",
  heroIntro:
    "The Gabrylly Ergonomic Office Chair is a popular budget mesh chair with a double-layer breathable back, an adjustable headrest and flip-up arms. This guide covers the classic model, its confirmed features and how to avoid buying a different Gabrylly by mistake.",
  verdictOneLiner: "A breathable, well-reviewed budget mesh chair — as long as you get the right variant.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black Gabrylly mesh chair.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from Gabrylly's official site and the Amazon listing (ASIN B07Y8BXBX8).",
  quickFacts: [
    { label: "Model", value: "Classic high-back", note: "280 lb version" },
    { label: "Back / seat", value: "Double-layer mesh", note: "Breathable back + mesh seat" },
    { label: "Armrests", value: "Flip-up", note: "Rotate up to tuck under a desk" },
    { label: "Headrest · lumbar", value: "Adjustable", note: "Headrest + lumbar pad" },
    { label: "Warranty", value: "2 years", note: "Best fit ≈ 5'5\"–6'2\"" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Gabrylly sells several near-identical chairs with different capacities and arms, and their spec text gets mixed up across listings. The main job is buying the right one.",
  checks: [
    { n: "01", title: "Confirm which Gabrylly you're buying", body: "The classic (ASIN B07Y8BXBX8) is 280 lb with flip-up arms and an adjustable headrest. Other variants differ: a compact GY1108, a 350 lb big-and-tall with 3D rotating arms, a 400 lb model, and footrest versions. Numbers like 400 lb or 3D arms belong to those other chairs — match the ASIN to the version you want." },
    { n: "02", title: "Know the arms are flip-up, not height-adjustable", body: "The classic's arms rotate up about 90° to tuck under a desk, which is handy, but reports conflict on whether they adjust for height. Treat them as flip-up only and confirm on the live listing if arm height matters." },
    { n: "03", title: "Check the fit — deep fixed seat", body: "The seat is roughly 19.5 in deep with no slider, and the comfortable fit is about 5'5\"–6'2\". Shorter sitters should confirm the seat isn't too deep; the exact seat-height range isn't reliably published, so read it on the listing." },
    { n: "04", title: "Weigh long-term support", body: "Reviewers note the mesh and lumbar pad can soften over roughly 12–18 months, more so for heavier or taller users. Register the 2-year warranty and set expectations accordingly." },
  ],

  dims: [
    { k: "Weight capacity", v: "280 lb (classic; other variants are 350/400 lb)", tier: "A" },
    { k: "Recline", v: "90–120° with tilt lock (3 positions)", tier: "A" },
    { k: "Armrests", v: "Flip-up (rotate ~90°); height adjustment not confirmed", tier: "C" },
    { k: "Lumbar", v: "Adjustable/removable lumbar pad", tier: "B" },
    { k: "Headrest", v: "Adjustable (height)", tier: "B" },
    { k: "Back / seat", v: "Double-layer breathable mesh; mesh seat", tier: "B" },
    { k: "Seat depth", v: "≈ 19.5 in, fixed (no slider)", tier: "B" },
    { k: "Seat height", v: "Not reliably published for the classic; confirm on the listing", tier: "C" },
    { k: "Warranty", v: "2 years", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: Gabrylly official site, Amazon listing (ASIN B07Y8BXBX8) and published reviews (checked 2026-09-10). Third-party sources mix specs between Gabrylly variants — take exact dimensions from the live listing for the classic.",

  adjustable: [
    { k: "Armrests", v: "Flip up ~90° to tuck under a desk.", src: "Amazon listing (confirmed)" },
    { k: "Lumbar", v: "Height-adjustable/removable pad.", src: "Official (documented)" },
    { k: "Headrest", v: "Height adjustable.", src: "Official (documented)" },
    { k: "Recline", v: "90–120° with a 3-position tilt lock.", src: "Amazon listing (confirmed)" },
    { k: "Seat height", v: "Gas lift; exact range not confirmed for the classic.", src: "Not confirmed" },
  ],
  fixed: [
    { k: "Seat depth", v: "≈ 19.5 in, no depth adjustment.", src: "Published reviews" },
    { k: "Arm height", v: "Flip-up only; height adjustment not confirmed.", src: "Not confirmed" },
  ],

  pros: [
    { t: "Double-layer mesh back that reviewers consistently praise for airflow.", src: "Published reviews (research)" },
    { t: "Full budget feature set — adjustable headrest, lumbar pad, flip-up arms and tilt-lock — at a low price.", src: "Official · published reviews" },
    { t: "Flip-up arms tuck the chair fully under a desk to save space.", src: "Amazon listing (confirmed)" },
  ],
  cons: [
    { t: "Mesh and lumbar support can soften over ~12–18 months, per reviewers.", src: "Published reviews (research)" },
    { t: "Fixed, fairly deep seat with no slider — the most-cited limitation.", src: "Published reviews (research)" },
    { t: "Flip-up arms don't clearly adjust for height, unlike pricier chairs.", src: "Product documentation, our reading" },
  ],

  forWhoTitle: "The Gabrylly suits",
  forWho: [
    "Budget buyers who want a breathable mesh chair with a headrest",
    "Small spaces where flip-up arms let the chair tuck away",
    "Average-to-taller sitters within the 280 lb / ~6'2\" range",
  ],
  skipWho: [
    "Need height-adjustable or 3D/4D armrests",
    "Are shorter and need a shallow/adjustable seat",
    "Weigh over 280 lb (look at the big-and-tall variant instead)",
  ],

  rivals: [
    { name: "Gabrylly Ergonomic (classic)", lumbar: "Adjustable pad", arms: "Flip-up", standout: "Breathable double mesh, budget value", isSelf: true },
    { name: "Ticova Ergonomic", lumbar: "2-axis (height + depth)", arms: "3D", standout: "More arm/lumbar adjustment for a bit more" },
    { name: "Duramont Ergonomic", lumbar: "Adjustable (small range)", arms: "~2D", standout: "High-back mesh, 5-yr warranty" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar, all-mesh" },
  ],

  buy: {
    productTitle: "Gabrylly Ergonomic Office Chair (classic high-back)",
    retailerNote: "Amazon · ASIN B07Y8BXBX8 · 280 lb model",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check the listing." },
      { k: "Warranty", v: "2-year limited. Confirm on the listing you order from." },
      { k: "What to check", v: "The ASIN matches the 280 lb classic (not the 350/400 lb or footrest variants), and the colour." },
    ],
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and which variant a listing is change without notice — confirm on the listing. Affiliate link; commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Gabrylly classic is one of the internet's default budget mesh chairs for good reason: a genuinely breathable double-layer back, an adjustable headrest and lumbar, flip-up arms and a tilt lock, all at a price that undercuts most rivals. For a cool, no-frills chair that tucks under a desk, it delivers.",
    "Two things temper it. First, buy carefully — Gabrylly's family of look-alikes means specs like 400 lb or 3D arms belong to other SKUs, so match the ASIN. Second, it's a budget chair: the arms are flip-up rather than height-adjustable, the seat is deep and fixed, and support can soften within a couple of years. Within its size range and price, though, it remains a sound value pick.",
  ],
  verdictPullQuote:
    "A cool, breathable budget chair that tucks away — just make sure you're buying the classic, not a look-alike.",

  faqs: [
    { q: "Which Gabrylly is this?", a: "The classic high-back (ASIN B07Y8BXBX8), rated 280 lb with flip-up arms and an adjustable headrest. Other Gabrylly variants have different capacities and arms — match the ASIN." },
    { q: "Do the armrests adjust for height?", a: "They flip up to tuck under a desk. Reports conflict on height adjustment for the classic, so treat them as flip-up only and confirm on the listing." },
    { q: "What's the weight capacity and fit?", a: "280 lb, with a comfortable fit around 5'5\"–6'2\". The seat is deep and doesn't adjust." },
    { q: "How long does it last?", a: "Reviewers report the mesh and lumbar can soften over roughly 12–18 months, especially for heavier users. It carries a 2-year warranty." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from the official specs, the Amazon listing and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Gabrylly official / Amazon", v: "Official site and Amazon listing (ASIN B07Y8BXBX8), checked 2026-09-10. Basis for capacity, recline, headrest/lumbar, mesh and warranty." },
    { k: "Published reviews", v: "Third-party reviews summarised for airflow, value and durability notes; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are for the classic Gabrylly (ASIN B07Y8BXBX8) as of the date shown and are not independently verified by Furniblog. Gabrylly's variants share spec language — confirm capacity, arms and dimensions on the exact listing you buy from.",
}

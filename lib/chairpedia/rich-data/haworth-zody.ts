import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Haworth Zody II — research-based buying-guide data layered on the existing
 * Chairpedia deep-dive ("In depth" section). Facts from haworth.com, dealer spec
 * sheets and published reviews (checked 2026-09-10). The key buyer confusion is
 * generation (original Zody vs current Zody II) and the PAL back; this guide
 * covers both. No fixed prices.
 */
export const HAWORTH_ZODY: RichReview = {
  asin: null,
  eyebrow: "Haworth · Office chairs · Buying guide",
  heroIntro:
    "The Haworth Zody was the first chair endorsed by a physical-therapy association, built around its PAL back — Pelvic and Asymmetrical Lumbar support you can dial in for each side of your lower back. This guide covers the current Zody II, how it differs from the original Zody, and what to check.",
  verdictOneLiner: "Asymmetrical, dial-in lumbar support — just confirm which generation you're buying.",
  verdictNote: "Research-based guide built on our existing Chairpedia deep-dive — not our own lab test.",

  heroShotBrief: "Front, Haworth Zody II.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from haworth.com, dealer spec sheets and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Signature", value: "PAL back", note: "Independent L/R lumbar dials" },
    { label: "Generation", value: "Zody II (current)", note: "US store sells \"Zody Office Chair\"" },
    { label: "Tilt", value: "Balanced 3-point", note: "Plus forward tilt" },
    { label: "Weight capacity", value: "< 181 kg (Asia Pacific)", note: "< 150 kg in EMEA" },
    { label: "Warranty", value: "12 years", note: "Haworth Asia Pacific" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The name \"Zody\" covers two generations with different specs. Getting the generation and the lumbar right is the whole game — confirm these four.",
  checks: [
    { n: "01", title: "Zody II vs the US \"Zody Office Chair\"", body: "Haworth publishes Zody II specifications for EMEA and Asia Pacific, with a weight capacity under 150 kg (EMEA) or under 181 kg (Asia Pacific). Haworth's US store sells the \"Zody Office Chair\" without the \"II\" name, listed at 350 lb (325 lb with the forward-tilt option). Both use the PAL back — confirm which model a listing is, because the specs differ." },
    { n: "02", title: "Set the PAL lumbar for each side", body: "PAL stands for Pelvic and Asymmetrical Lumbar: independent left/right dials let you add more support on one side than the other, across several back-stop positions. This is the reason to buy a Zody — take a minute to actually set both dials to your back." },
    { n: "03", title: "Decide on forward tilt and the back type", body: "Forward tilt helps at a keyboard or drafting posture; on the US store's Zody Office Chair it lowers the listed weight rating. Choose the back material to suit you; Haworth lists the Zody II headrest as not yet generally available." },
    { n: "04", title: "Confirm the US buying path", body: "Genuine Zody is sold direct through Haworth's store (with a trial window) or authorized dealers; there's no single authoritative Amazon product page. Confirm seller and warranty before buying." },
  ],

  dims: [
    { k: "Seat height", v: "406–533 mm / 16–21 in (office chair); 445–615 mm / 17.5–24.2 in (dual posture) — Asia Pacific sheet", tier: "B" },
    { k: "Overall height", v: "975–1105 mm (office chair); 995–1165 mm (dual posture) — EMEA sheet", tier: "B" },
    { k: "Weight capacity", v: "Zody II: < 181 kg (Asia Pacific), < 150 kg (EMEA); US store \"Zody Office Chair\": 350 lb (325 lb with forward tilt)", tier: "B" },
    { k: "Tilt", v: "Balanced 3-point tilt: back reclines 24° from upright; 6-position back stop; tilt tension; forward tilt", tier: "B" },
    { k: "Lumbar", v: "PAL — Pelvic + Asymmetrical Lumbar, independent left/right, multiple back stops", tier: "B" },
    { k: "Seat depth", v: "≈ 3 in of adjustment", tier: "B" },
    { k: "Armrests", v: "4D adjustable", tier: "B" },
    { k: "Back / seat", v: "Adaptive mesh or upholstered back; recycled-content textiles available", tier: "B" },
    { k: "Warranty", v: "12 years, 24/7 multiple shift (Haworth Asia Pacific)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: Haworth Zody II product sheets, user guide and regional product pages (Asia Pacific and EMEA, checked 2026-09-26) and published reviews. Haworth's US store sells the \"Zody Office Chair\" without the \"II\" name; its figures (350 lb, 325 lb with forward tilt) are not confirmed as Zody II. Confirm the model on the listing.",

  adjustable: [
    { k: "PAL lumbar", v: "Independent left/right pelvic + lumbar dials, multiple back-stop positions.", src: "Haworth (documented)" },
    { k: "Tilt", v: "Balanced 3-point tilt with tension crank, 6-position back stop and forward tilt.", src: "Haworth (documented)" },
    { k: "Armrests", v: "4D (height, width, depth, pivot).", src: "Haworth (documented)" },
    { k: "Seat depth", v: "≈ 3 in of travel.", src: "Haworth (documented)" },
  ],
  fixed: [
    { k: "Model specs", v: "Capacity and other specs depend on the model (Zody II or the US store's Zody Office Chair) and market.", src: "Haworth (documented)" },
    { k: "Headrest", v: "Not yet generally available (listed as phase 2 in Asia Pacific, coming soon in EMEA).", src: "Haworth (documented)" },
    { k: "Back material", v: "Mesh or upholstered is chosen at order, not adjustable after.", src: "Haworth (documented)" },
  ],

  pros: [
    { t: "The PAL back's independent left/right lumbar is genuinely useful for asymmetric back needs.", src: "Haworth · published reviews" },
    { t: "3-point synchronous tilt plus a forward-tilt option supports both leaning back and keyboard postures.", src: "Haworth (documented)" },
    { t: "Zody II carries a 12-year warranty in Haworth's Asia Pacific terms and uses recycled-content materials.", src: "Haworth (documented)" },
  ],
  cons: [
    { t: "Two live generations with different specs make it easy to buy the wrong Zody.", src: "Our reading" },
    { t: "Reviewers note Zody II's seat is firmer and its recline shallower than the original.", src: "Published reviews (research)" },
    { t: "No single authoritative Amazon listing — mostly a Haworth-store or dealer purchase.", src: "Our reading" },
  ],

  forWhoTitle: "Zody shines for",
  forWho: [
    "People with asymmetric lower-back needs who want independent left/right lumbar",
    "Buyers who want a forward tilt for keyboard or drafting work",
    "Those who value recycled-content materials and a long warranty",
  ],
  skipWho: [
    "Won't check which generation a listing is",
    "Want a plush, deep-recline lounge feel (Zody II is firmer)",
    "Prefer a simple Amazon purchase with easy returns",
  ],

  rivals: [
    { name: "Haworth Zody II", lumbar: "PAL (independent L/R)", arms: "4D", standout: "Asymmetrical lumbar, forward tilt, dual posture option", isSelf: true },
    { name: "Steelcase Leap V2", lumbar: "Adjustable LiveBack", arms: "4D", standout: "Deep natural-glide recline, upholstered" },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Up to fully adjustable", standout: "All-mesh, three sizes" },
    { name: "Steelcase Series 1", lumbar: "Adjustable", arms: "4D / height / armless", standout: "Cheaper, easy to buy" },
  ],

  buy: {
    productTitle: "Haworth Zody II",
    retailerNote: "Amazon search — confirm generation (Zody vs Zody II); mostly a Haworth-store / dealer purchase",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Haworth's own store lists a trial window; dealer/marketplace policies vary. There's no single authoritative Amazon listing — check where you buy." },
      { k: "Warranty", v: "12 years for 24/7 multiple-shift use in Haworth's Asia Pacific warranty; terms vary by market. Confirm the terms for your model and seller." },
      { k: "What to check", v: "Generation (Zody vs Zody II), back type (mesh vs upholstered), forward-tilt option, headrest, and the weight rating for that build." },
    ],
    officialStore: {
      label: "Haworth (official)",
      note: "Zody II specifications and options on Haworth's Asia Pacific site. Direct link (not an affiliate link). Haworth's US store sells the \"Zody Office Chair\".",
      url: "https://www.haworth.com/ap/en/products/office-chairs/zody-ii.html",
    },
    disclaimer:
      "Not verified by Chairpedia: price, seller, stock and — importantly — the generation vary by listing. The Amazon search link is an affiliate link; the Haworth link is a direct, non-affiliate link. Confirm the exact generation, build and seller before buying.",
  },

  verdict: [
    "Zody's claim to fame is its back. PAL — Pelvic and Asymmetrical Lumbar — gives you independent left/right dials so you can add more support to one side of your lower back than the other, which is genuinely useful if your back isn't symmetrical. Add a 3-point synchronous tilt, a forward-tilt option, 4D arms and recycled-content materials, and the current Zody II is a serious ergonomic chair, rated under 181 kg in Haworth's Asia Pacific table.",
    "The one thing to get right is the generation. Haworth's US store sells the \"Zody Office Chair\" (listed at 350 lb, 325 lb with forward tilt) without the \"II\" name, so a \"Zody\" listing can be either — confirm which before you buy. And because it's mostly a Haworth-store or dealer purchase rather than a clean Amazon product, sort out the seller and warranty too. Do that, set both lumbar dials to your back, and it's one of the more thoughtfully supportive chairs in its class.",
  ],
  verdictPullQuote:
    "Independent left/right lumbar is the reason to buy a Zody — just confirm you're getting the generation you think you are.",

  faqs: [
    { q: "What does PAL mean?", a: "Pelvic and Asymmetrical Lumbar: the Zody's back has independent left/right dials so you can tune support separately for each side of your lower back, across several back-stop positions." },
    { q: "Zody or Zody II — which is current?", a: "Zody II is the current model in Haworth's EMEA and Asia Pacific ranges (capacity under 150 kg in EMEA, under 181 kg in Asia Pacific). Haworth's US store sells the \"Zody Office Chair\", listed at 350 lb (325 lb with forward tilt). Confirm which a listing is." },
    { q: "Does it have a forward tilt?", a: "Yes. Haworth lists forward tilt for Zody II, useful for keyboard or drafting postures; dual posture models tilt further forward. On the US store's Zody Office Chair the forward-tilt option lowers the listed weight rating." },
    { q: "Can I buy it on Amazon?", a: "There's no single authoritative Amazon listing. Genuine Zody is mostly sold through Haworth's store (with a trial window) or authorized dealers." },
    { q: "Has Chairpedia tested this chair?", a: "This guide is built on our research-based Chairpedia deep-dive (below) plus Haworth's specs and published reviews. We have not run our own instrumented lab test." },
  ],

  sources: [
    { k: "Haworth (official)", v: "haworth.com Zody II pages, product sheets and user guides (Asia Pacific and EMEA), checked 2026-09-26. Basis for PAL, tilt, arms, seat height and depth, capacity, headrest status and warranty." },
    { k: "Haworth US store", v: "store.haworth.com \"Zody Office Chair\" page, checked 2026-09-26. Its figures are cited only for that US-store model." },
    { k: "Published reviews", v: "Third-party reviews summarised for the seat/recline feel and the generation caution." },
  ],
  sourcesFooter:
    "Specifications are Haworth's figures plus published reviews as of the date shown and are not independently verified by Chairpedia. Capacities differ by market and model name — confirm the model, build and seller on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

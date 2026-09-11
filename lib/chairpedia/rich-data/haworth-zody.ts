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
    { label: "Generation", value: "Zody II (current)", note: "Original Zody still sold" },
    { label: "Tilt", value: "3-point synchro", note: "+5° forward tilt" },
    { label: "Weight capacity", value: "≈ 400 lb (Zody II)", note: "Original ≈ 350 lb" },
    { label: "Warranty", value: "Up to 12 years", note: "Haworth-documented" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The name \"Zody\" covers two generations with different specs. Getting the generation and the lumbar right is the whole game — confirm these four.",
  checks: [
    { n: "01", title: "Zody II vs the original Zody", body: "Zody II is the current flagship (firmer seat, flatter starting tilt, warrantied to about 400 lb). The original Zody is still sold on Haworth's US store and rated to about 350 lb (325 lb with the forward-tilt option). Both carry the PAL back — but confirm which generation a listing is, because the specs differ." },
    { n: "02", title: "Set the PAL lumbar for each side", body: "PAL stands for Pelvic and Asymmetrical Lumbar: independent left/right dials let you add more support on one side than the other, across several back-stop positions. This is the reason to buy a Zody — take a minute to actually set both dials to your back." },
    { n: "03", title: "Decide on forward tilt and the back type", body: "A forward-tilt (about 5°) helps at a keyboard or drafting posture; on the original Zody it lowers the weight rating. Choose the mesh or upholstered back, and the optional headrest, to suit you." },
    { n: "04", title: "Confirm the US buying path", body: "Genuine Zody is sold direct through Haworth's store (with a trial window) or authorized dealers; there's no single authoritative Amazon product page. Confirm seller and warranty before buying." },
  ],

  dims: [
    { k: "Seat height", v: "≈ 16–21 in (standard); ≈ 17.5–24.5 in (dual-posture / sit-stand)", tier: "B" },
    { k: "Overall height", v: "≈ 995–1165 mm", tier: "B" },
    { k: "Weight capacity", v: "Zody II ≈ 400 lb (warrantied); original Zody ≈ 350 lb (325 lb with forward tilt)", tier: "B" },
    { k: "Tilt", v: "3-point synchronous (hip/knee/ankle) with tension; ≈ 5° forward tilt", tier: "B" },
    { k: "Lumbar", v: "PAL — Pelvic + Asymmetrical Lumbar, independent left/right, multiple back stops", tier: "B" },
    { k: "Seat depth", v: "≈ 3 in of adjustment", tier: "B" },
    { k: "Armrests", v: "4D adjustable", tier: "B" },
    { k: "Back / seat", v: "Adaptive mesh or upholstered back; recycled-content textiles available", tier: "B" },
    { k: "Warranty", v: "Up to 12 years (per Haworth)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: haworth.com, dealer spec sheets (e.g. btod.com) and published reviews (checked 2026-09-10). Weight capacity differs by generation — Zody II is warrantied to about 400 lb, the original Zody to about 350 lb (325 lb with forward tilt). Confirm the generation on the listing.",

  adjustable: [
    { k: "PAL lumbar", v: "Independent left/right pelvic + lumbar dials, multiple back-stop positions.", src: "Haworth (documented)" },
    { k: "Tilt", v: "3-point synchronous recline with tension; forward tilt ≈ 5°.", src: "Haworth (documented)" },
    { k: "Armrests", v: "4D (height, width, depth, pivot).", src: "Haworth (documented)" },
    { k: "Seat depth", v: "≈ 3 in of travel.", src: "Haworth (documented)" },
  ],
  fixed: [
    { k: "Generation specs", v: "Seat firmness, starting tilt and capacity are set by which generation (Zody vs Zody II) you buy.", src: "Haworth / dealers" },
    { k: "Headrest", v: "Optional — not fitted unless specified.", src: "Haworth (documented)" },
    { k: "Back material", v: "Mesh or upholstered is chosen at order, not adjustable after.", src: "Haworth (documented)" },
  ],

  pros: [
    { t: "The PAL back's independent left/right lumbar is genuinely useful for asymmetric back needs.", src: "Haworth · published reviews" },
    { t: "3-point synchronous tilt plus a forward-tilt option supports both leaning back and keyboard postures.", src: "Haworth (documented)" },
    { t: "Zody II is warrantied to a high ~400 lb, with recycled-content materials and a long warranty.", src: "Haworth (documented)" },
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
    "Those who value recycled-content materials and a high weight rating (Zody II)",
  ],
  skipWho: [
    "Won't check which generation a listing is",
    "Want a plush, deep-recline lounge feel (Zody II is firmer)",
    "Prefer a simple Amazon purchase with easy returns",
  ],

  rivals: [
    { name: "Haworth Zody II", lumbar: "PAL (independent L/R)", arms: "4D", standout: "Asymmetrical lumbar, ~400 lb, forward tilt", isSelf: true },
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
      { k: "Warranty", v: "Up to 12 years (Haworth). Confirm the terms for your generation and seller." },
      { k: "What to check", v: "Generation (Zody vs Zody II), back type (mesh vs upholstered), forward-tilt option, headrest, and the weight rating for that build." },
    ],
    officialStore: {
      label: "Haworth (official)",
      note: "Zody II specs, colours and store (with a trial window) at haworth.com. Direct link (not an affiliate link).",
      url: "https://www.haworth.com/na/en/products/seating/task/zody-ii.html",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and — importantly — the generation vary by listing. The Amazon search link is an affiliate link; the Haworth link is a direct, non-affiliate link. Confirm the exact generation, build and seller before buying.",
  },

  verdict: [
    "Zody's claim to fame is its back. PAL — Pelvic and Asymmetrical Lumbar — gives you independent left/right dials so you can add more support to one side of your lower back than the other, which is genuinely useful if your back isn't symmetrical. Add a 3-point synchronous tilt, a forward-tilt option, 4D arms and recycled-content materials, and the current Zody II is a serious ergonomic chair warrantied to around 400 lb.",
    "The one thing to get right is the generation. The original Zody is still sold (about 350 lb, 325 with forward tilt) alongside the firmer, flatter-tilting Zody II, so a \"Zody\" listing can be either — confirm which before you buy. And because it's mostly a Haworth-store or dealer purchase rather than a clean Amazon product, sort out the seller and warranty too. Do that, set both lumbar dials to your back, and it's one of the more thoughtfully supportive chairs in its class.",
  ],
  verdictPullQuote:
    "Independent left/right lumbar is the reason to buy a Zody — just confirm you're getting the generation you think you are.",

  faqs: [
    { q: "What does PAL mean?", a: "Pelvic and Asymmetrical Lumbar: the Zody's back has independent left/right dials so you can tune support separately for each side of your lower back, across several back-stop positions." },
    { q: "Zody or Zody II — which is current?", a: "Zody II is the current flagship (firmer seat, flatter starting tilt, ~400 lb). The original Zody is still sold and rated ~350 lb (325 with forward tilt). Confirm which a listing is." },
    { q: "Does it have a forward tilt?", a: "Yes — about 5°, useful for keyboard or drafting postures. On the original Zody the forward-tilt option lowers the weight rating." },
    { q: "Can I buy it on Amazon?", a: "There's no single authoritative Amazon listing. Genuine Zody is mostly sold through Haworth's store (with a trial window) or authorized dealers." },
    { q: "Has Furniblog tested this chair?", a: "This guide is built on our research-based Chairpedia deep-dive (below) plus Haworth's specs and published reviews. We have not run our own instrumented lab test." },
  ],

  sources: [
    { k: "Haworth (official)", v: "haworth.com Zody II product and adjustment pages, checked 2026-09-10. Basis for PAL, tilt, arms, seat depth and warranty." },
    { k: "Dealer spec sheets", v: "Authorized-dealer specifications (e.g. btod.com) for the generation differences and weight ratings." },
    { k: "Published reviews", v: "Third-party reviews summarised for the seat/recline feel and the generation caution; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are Haworth's figures plus dealer sheets and published reviews as of the date shown and are not independently verified by Furniblog. Two Zody generations are sold with different capacities — confirm the generation, build and seller on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

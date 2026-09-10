import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Steelcase Gesture — research-based buying-guide data layered on top of the
 * existing Chairpedia deep-dive (rendered as the "In depth" section). Facts from
 * steelcase.com, the Amazon listing and published reviews (checked 2026-09-10).
 * Gesture is heavily configurable; this guide covers the consistent platform and
 * the choices that actually change the chair. No fixed prices.
 */
export const STEELCASE_GESTURE: RichReview = {
  asin: "B08KL9JMVB",
  eyebrow: "Steelcase · Office chairs · Buying guide",
  heroIntro:
    "The Steelcase Gesture was designed around how people move with modern devices — its 360-degree arms swing and pivot to support you whether you're typing, tilting back with a phone, or leaning into a tablet. This guide covers the platform, the configuration choices that matter, and how to buy the right one.",
  verdictOneLiner: "The most arm-flexible premium task chair — worth configuring carefully.",
  verdictNote: "Research-based guide built on our existing Chairpedia deep-dive — not our own lab test.",

  heroShotBrief: "Front, black Steelcase Gesture.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from steelcase.com, the linked Amazon listing and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Arms", value: "360-degree", note: "Widest arm range in class" },
    { label: "Weight capacity", value: "400 lb", note: "Steelcase-documented" },
    { label: "Recline", value: "3 stops + lock", note: "Core adjustment" },
    { label: "Back options", value: "Shell / Wrapped", note: "Choose at order" },
    { label: "Warranty", value: "Limited lifetime", note: "12-yr multi-shift terms" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Gesture is one chair sold in many configurations. The listing you click may not be the one you pictured — confirm these four.",
  checks: [
    { n: "01", title: "Pick the arm type — this is the whole point", body: "The signature 360-degree arms move up/down, in/out, forward/back and pivot, so they can support your forearms in almost any posture. Gesture is also sold with fixed arms or armless at lower prices. If you're buying Gesture specifically, the 360-degree arms are the reason — confirm the listing has them." },
    { n: "02", title: "Shell back vs Wrapped back", body: "The back comes as an exposed Shell (contract look, slightly cheaper) or a fully upholstered Wrapped back. They sit the same; it's an aesthetics and price choice. Confirm which the listing is." },
    { n: "03", title: "Set the seat depth and recline stops", body: "The seat slides for depth and the recline has three lockable angles plus an upright lock and a tension dial. These are the adjustments that make it fit — dial them in rather than sitting on the defaults." },
    { n: "04", title: "Match the casters to your floor", body: "Steelcase ships carpet or hard-floor casters. Getting the wrong ones makes a premium chair roll badly — confirm the caster type for your floor on the listing." },
  ],

  dims: [
    { k: "Overall", v: "≈ 39.25–44.25 in H × 22.375–34.625 in W × 21–23.625 in D", tier: "B" },
    { k: "Seat height", v: "≈ 16–21 in", tier: "B" },
    { k: "Seat depth", v: "Adjustable ≈ 15.75–18.75 in", tier: "B" },
    { k: "Weight capacity", v: "400 lb", tier: "B" },
    { k: "Recline", v: "Full recline with 3 locking angles, upright lock and tension dial", tier: "B" },
    { k: "Armrests", v: "360-degree arms (up/down, in/out, forward/back, pivot); fixed or armless also sold", tier: "B" },
    { k: "Back", v: "3D LiveBack; Shell or Wrapped upholstery options", tier: "B" },
    { k: "Seat", v: "Contoured foam with flexible perimeter/adaptive bolstering", tier: "B" },
    { k: "Warranty", v: "Limited lifetime frame; 12-year multi-shift parts & labour (per Steelcase terms)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: steelcase.com, the linked Amazon listing (ASIN B08KL9JMVB) and published reviews (checked 2026-09-10). Overall dimensions vary with the arm and back configuration; some retail listings quote larger heights that appear to include packaging — the figures here follow Steelcase.",

  adjustable: [
    { k: "360-degree arms", v: "Height, width, depth and pivot — the arm caps swing to follow your posture.", src: "Steelcase (documented)" },
    { k: "Recline", v: "Three locking angles plus an upright lock and tension dial.", src: "Steelcase (documented)" },
    { k: "Seat depth", v: "Sliding seat pan.", src: "Steelcase (documented)" },
    { k: "Seat height", v: "Pneumatic (≈ 16–21 in).", src: "Steelcase (documented)" },
  ],
  fixed: [
    { k: "Lumbar", v: "The 3D LiveBack flexes with the spine; a separate adjustable lumbar is an add-on, not standard on every build.", src: "Steelcase / reviews" },
    { k: "Headrest", v: "Not offered on Gesture (unlike Steelcase Leap/Series 2).", src: "Steelcase (documented)" },
    { k: "One size", v: "Gesture is a single frame size (no A/B/C sizing).", src: "Steelcase (documented)" },
  ],

  pros: [
    { t: "The 360-degree arms genuinely support laptop, phone and tablet postures that defeat ordinary arms.", src: "Published reviews (research)" },
    { t: "Contract-grade build with a 400 lb capacity and Steelcase's limited-lifetime warranty.", src: "Steelcase (documented)" },
    { t: "The back tracks the spine through recline and the seat edge flexes — comfortable for long, active days.", src: "Published reviews (research)" },
  ],
  cons: [
    { t: "Expensive, and the price climbs quickly with upholstery and back upgrades.", src: "Our reading" },
    { t: "No headrest option — heavy recliners who want neck support should look at Leap or Series 2.", src: "Steelcase (documented)" },
    { t: "Configuration sprawl makes it easy to buy a cheaper fixed-arm build by mistake.", src: "Our reading" },
  ],

  forWhoTitle: "Gesture shines for",
  forWho: [
    "People who switch constantly between keyboard, phone and tablet",
    "Buyers who want the most adjustable arms on the market",
    "Anyone who wants a contract chair rated to 400 lb with a lifetime warranty",
  ],
  skipWho: [
    "Need a headrest (look at Steelcase Leap or Series 2)",
    "Want an all-mesh back (Gesture's back is upholstered)",
    "Are shopping on a tight budget",
  ],

  rivals: [
    { name: "Steelcase Gesture", lumbar: "LiveBack + optional lumbar", arms: "360-degree", standout: "Most flexible arms; 400 lb", isSelf: true },
    { name: "Steelcase Leap V2", lumbar: "Adjustable LiveBack + lumbar", arms: "4D", standout: "Deeper recline, natural glide, headrest option" },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Fixed / adjustable / fully", standout: "All-mesh, three sizes" },
    { name: "Steelcase Series 1", lumbar: "Adjustable", arms: "4D / height / armless", standout: "Much cheaper, similar DNA" },
  ],

  buy: {
    productTitle: "Steelcase Gesture",
    retailerNote: "Amazon · ASIN B08KL9JMVB (Licorice fabric, dark frame, 360-degree arms) — other configs sold separately",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Steelcase's own store lists a 30-day return. Check the listing." },
      { k: "Warranty", v: "Limited lifetime on the frame, 12-year multi-shift on parts and labour (per Steelcase). Confirm on the listing." },
      { k: "What to check", v: "Arm type (360-degree vs fixed), back (Shell vs Wrapped), upholstery grade, and caster type for your floor." },
    ],
    officialStore: {
      label: "Steelcase (official)",
      note: "Full configurator, upholstery grades and dealer network at steelcase.com. Direct link (not an affiliate link).",
      url: "https://www.steelcase.com/products/office-chairs/gesture/",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and the exact configuration vary by listing — confirm before buying. The Amazon link is an affiliate link; the Steelcase link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Gesture's argument is its arms. Where most chairs give you two or three arm adjustments, Gesture's 360-degree arms move in four directions and pivot, so they can actually prop your forearms whether you're typing, reclining with a phone, or hunched over a tablet. Pair that with a spine-tracking LiveBack, a flexible seat edge, a 400 lb rating and Steelcase's lifetime warranty and you have one of the most genuinely ergonomic task chairs sold.",
    "The catches are price and choice. Gesture is expensive and gets more so with upholstery and back upgrades, it has no headrest, and it's sold in enough configurations that it's easy to click a cheaper fixed-arm build by accident. Decide on the arms, the back and the casters first, then buy — and if you want a headrest or all-mesh, look at Leap or Aeron instead.",
  ],
  verdictPullQuote:
    "If your hands are always moving between devices, no chair supports them like Gesture — just configure it deliberately.",

  faqs: [
    { q: "What makes the arms special?", a: "The 360-degree arms adjust up/down, in/out, forward/back and pivot, so the arm caps follow your forearms into postures ordinary arms can't reach — the chair's headline feature." },
    { q: "Does Gesture have a headrest?", a: "No. Gesture is offered without a headrest. If you want neck support, look at the Steelcase Leap or Series 2." },
    { q: "Shell back or Wrapped back?", a: "The Shell back leaves the back's shell exposed (contract look, a little cheaper); the Wrapped back is fully upholstered. They support you the same way — it's aesthetics and price." },
    { q: "What's the weight capacity?", a: "400 lb, per Steelcase. Confirm on the listing you buy from." },
    { q: "Has Furniblog tested this chair?", a: "This guide is built on our research-based Chairpedia deep-dive (below) plus Steelcase's specs and published reviews. We have not run our own instrumented lab test." },
  ],

  sources: [
    { k: "Steelcase (official)", v: "steelcase.com Gesture product and specification pages, checked 2026-09-10. Basis for arms, back options, recline, capacity and warranty." },
    { k: "Amazon listing", v: "Steelcase Gesture — ASIN B08KL9JMVB (Licorice, 360-degree arms). Basis for the linked configuration." },
    { k: "Published reviews", v: "Third-party reviews summarised for comfort and the arm behaviour; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are Steelcase's figures plus the linked listing and published reviews as of the date shown and are not independently verified by Furniblog. Gesture is sold in many configurations — confirm the arms, back, upholstery and casters on the listing you buy from.",
}

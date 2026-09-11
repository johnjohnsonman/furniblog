import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Steelcase Series 1 — research-based buying-guide data. Facts from steelcase.com,
 * the Amazon listing and published reviews (checked 2026-09-10). Series 1 is the
 * affordable, genuinely Amazon-native Steelcase; the choices are back type,
 * arms and colour. Some dimensions are retail-sourced and marked as such. No
 * fixed prices.
 */
export const STEELCASE_SERIES_1: RichReview = {
  asin: "B08M42B334",
  eyebrow: "Steelcase · Office chairs · Buying guide",
  heroIntro:
    "The Steelcase Series 1 brings the brand's contract engineering — a weight-activated recline, adjustable lumbar and a 400 lb capacity — down to an accessible, Amazon-native price. This guide covers the back and arm choices and what to check before you buy.",
  verdictOneLiner: "Contract-grade Steelcase DNA at an accessible price — pick the back and arms.",
  verdictNote: "Research-based guide — hands-on lab test not completed.",

  heroShotBrief: "Front, black Steelcase Series 1.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from steelcase.com, the linked Amazon listing and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Back options", value: "3D Microknit / Air", note: "Softer vs structured" },
    { label: "Arms", value: "4D / height / armless", note: "Configuration choice" },
    { label: "Recline", value: "Weight-activated", note: "+ boost + upright stop" },
    { label: "Weight capacity", value: "400 lb", note: "Steelcase-documented" },
    { label: "Warranty", value: "Limited lifetime", note: "12-yr multi-shift terms" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Series 1 is Steelcase's value chair and comes in a lot of colours and a couple of back and arm types. Confirm these four so you get the one you want.",
  checks: [
    { n: "01", title: "3D Microknit back vs Air back", body: "The 3D Microknit back is a softer knit that gives with you; the Air back is a more structured, airier mesh. Both breathe and support well — it's a feel-and-look choice. Confirm which the listing is." },
    { n: "02", title: "Arms: 4D, height-adjustable or armless", body: "The 4D arms adjust height, width, depth and pivot; there's also a simpler height-adjustable arm and an armless build. The cheapest listings are often armless — if you want full arm control, confirm 4D." },
    { n: "03", title: "Use the weight-activated recline and lumbar", body: "The recline tensions itself to your body weight, with a \"boost\" for a firmer feel and an upright back stop; an adjustable lumbar is standard (a fixed lumbar is offered on the Microknit back). Set the lumbar height and the recline stop to fit." },
    { n: "04", title: "Casters and colour", body: "Series 1 offers hard-floor or soft dual-wheel casters and a wide colour range (many for Microknit, fewer for Air). Match the casters to your floor and confirm the colour." },
  ],

  dims: [
    { k: "Overall height", v: "≈ 36.5–41.25 in", tier: "C" },
    { k: "Seat height", v: "≈ 16.5–21.5 in", tier: "C" },
    { k: "Seat depth", v: "Adjustable (≈ 17.75 in range)", tier: "C" },
    { k: "Weight capacity", v: "400 lb", tier: "B" },
    { k: "Recline", v: "Weight-activated tension with \"boost\" (+20%) and an upright back stop", tier: "B" },
    { k: "Back", v: "3D Microknit or Air back", tier: "B" },
    { k: "Armrests", v: "4D adjustable, height-adjustable, or armless", tier: "B" },
    { k: "Lumbar", v: "Adjustable (standard); fixed lumbar available on the Microknit back", tier: "B" },
    { k: "Warranty", v: "Limited lifetime frame; 12-year multi-shift parts & labour (per Steelcase)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: steelcase.com, the linked Amazon listing (ASIN B08M42B334) and published reviews (checked 2026-09-10). Overall/seat dimensions are retail-sourced (marked \"Not confirmed\"); the recline, back/arm options, 400 lb capacity and warranty are Steelcase-documented.",

  adjustable: [
    { k: "Recline", v: "Weight-activated tension with a \"boost\" and an upright back stop.", src: "Steelcase (documented)" },
    { k: "Armrests (4D build)", v: "Height, width, depth and pivot.", src: "Steelcase (documented)" },
    { k: "Lumbar", v: "Adjustable height standard on most builds.", src: "Steelcase (documented)" },
    { k: "Seat depth", v: "Adjustable seat pan.", src: "Steelcase (documented)" },
    { k: "Seat height", v: "Pneumatic (≈ 16.5–21.5 in).", src: "Retail spec sheets" },
  ],
  fixed: [
    { k: "Arms (armless build)", v: "No arms on the armless option; simpler builds have height-only arms.", src: "Steelcase (documented)" },
    { k: "Lumbar (Microknit fixed option)", v: "A fixed (non-adjustable) lumbar is offered on the 3D Microknit back.", src: "Steelcase (documented)" },
    { k: "Headrest", v: "Not offered on Series 1.", src: "Steelcase (documented)" },
  ],

  pros: [
    { t: "Genuine Steelcase contract engineering — weight-activated recline and 400 lb capacity — at a value price.", src: "Steelcase · published reviews" },
    { t: "Breathable back (Microknit or Air), adjustable lumbar and a limited-lifetime warranty.", src: "Steelcase (documented)" },
    { t: "One of the few premium-brand chairs that's genuinely, routinely sold on Amazon with easy returns.", src: "Our reading" },
  ],
  cons: [
    { t: "No headrest, and the cheapest builds are armless or height-arm only.", src: "Steelcase (documented)" },
    { t: "Materials and adjustment are a step below Gesture/Leap, as expected at the price.", src: "Published reviews (research)" },
    { t: "Colour and back availability differ (more for Microknit than Air) — confirm the exact build.", src: "Our reading" },
  ],

  forWhoTitle: "Series 1 shines for",
  forWho: [
    "Buyers who want real Steelcase engineering on a budget",
    "People who want a premium-brand chair they can actually buy on Amazon",
    "Those who need a 400 lb capacity at a value price",
  ],
  skipWho: [
    "Need a headrest (look at Steelcase Series 2 or Leap)",
    "Want the deepest adjustability (Gesture/Leap)",
    "Buy the armless build expecting adjustable arms",
  ],

  rivals: [
    { name: "Steelcase Series 1", lumbar: "Adjustable", arms: "4D / height / armless", standout: "Contract DNA, value price, Amazon-native", isSelf: true },
    { name: "Steelcase Series 2", lumbar: "Adjustable + air-lumbar", arms: "4D", standout: "Step up; headrest option" },
    { name: "Steelcase Gesture", lumbar: "LiveBack + optional lumbar", arms: "360-degree", standout: "Flagship arms, 400 lb" },
    { name: "Herman Miller Sayl", lumbar: "Optional adjustable", arms: "None / fixed / adjustable", standout: "Design-led entry Herman Miller" },
  ],

  buy: {
    productTitle: "Steelcase Series 1",
    retailerNote: "Amazon · ASIN B08M42B334 — back type, arms and colour vary across listings",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Steelcase's own store lists a 30-day return. Check the listing." },
      { k: "Warranty", v: "Limited lifetime frame, 12-year multi-shift parts and labour (per Steelcase). Confirm on the listing." },
      { k: "What to check", v: "Back type (3D Microknit vs Air), arms (4D/height/armless), lumbar, caster type and colour." },
    ],
    officialStore: {
      label: "Steelcase (official)",
      note: "Full configurator, back types, colours and dealer network at steelcase.com. Direct link (not an affiliate link).",
      url: "https://www.steelcase.com/products/office-chairs/steelcase-series-1/",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and the exact configuration vary by listing — confirm before buying. The Amazon link is an affiliate link; the Steelcase link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "Series 1 is how you get real Steelcase without flagship money. It carries the brand's contract DNA — a weight-activated recline that tensions to your body, an adjustable lumbar, a breathable Microknit or Air back and a 400 lb capacity — under a limited-lifetime warranty, and, unusually for a premium brand, it's genuinely sold on Amazon with normal returns.",
    "The savings show in the details, not the fundamentals: there's no headrest, the cheapest builds are armless or height-arm only, and the materials sit a rung below Gesture and Leap. Pick the back type, buy the 4D arms if you want full control, match the casters to your floor, and Series 1 is one of the best value-to-engineering ratios in the office-chair market.",
  ],
  verdictPullQuote:
    "Real Steelcase engineering at a value price — just buy the arms and back you actually want, and skip it if you need a headrest.",

  faqs: [
    { q: "3D Microknit or Air back?", a: "The 3D Microknit is a softer knit that gives with you; the Air back is a more structured, airier mesh. Both breathe and support — it's a feel-and-look choice." },
    { q: "Which arms should I choose?", a: "The 4D arms adjust height, width, depth and pivot. There's also a height-only arm and an armless build — the cheapest listings are often armless, so confirm 4D if you want full control." },
    { q: "Does Series 1 have a headrest?", a: "No. If you want a headrest, step up to the Steelcase Series 2 or Leap." },
    { q: "Is it really sold on Amazon?", a: "Yes — Series 1 is one of the few premium-brand chairs routinely sold on Amazon. The linked ASIN is one colour/build; confirm the exact one you want." },
    { q: "Has Furniblog tested this chair?", a: "Not with our own instruments yet. This is a research-based guide from Steelcase's specs, the Amazon listing and published reviews; the deep-dive below adds context." },
  ],

  sources: [
    { k: "Steelcase (official)", v: "steelcase.com Series 1 product and specification pages, checked 2026-09-10. Basis for recline, back/arm options, lumbar, capacity and warranty." },
    { k: "Amazon listing", v: "Steelcase Series 1 — ASIN B08M42B334. Basis for the linked product; other colours/builds are sold separately." },
    { k: "Published reviews", v: "Third-party reviews summarised for value and the no-headrest/materials cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications combine Steelcase documentation with retail-sourced dimensions (marked \"Not confirmed\") as of the date shown and are not independently verified by Furniblog. Series 1 is sold in several back, arm and colour configurations — confirm the exact build on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

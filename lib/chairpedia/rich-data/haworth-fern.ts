import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Haworth Fern — research-based buying guide data.
 * Specs from Haworth's official documentation (Wave Suspension, material
 * options incl. Digital Knit, 350 lb capacity (325 lb with forward tilt), optional lumbar/headrest/4D
 * arms, 12-year warranty), checked 2026-09-09. No single Amazon ASIN is
 * verified (listings vary by material and options), so the Amazon link is a
 * search and the official store is the reliable path. No fixed prices.
 */
export const HAWORTH_FERN: RichReview = {
  asin: null,
  eyebrow: "Haworth · Office chairs · Buying guide",
  heroIntro:
    "The Haworth Fern is a task chair built around a patented Wave Suspension back that mimics the spine. It comes in several back materials — including Haworth's signature zero-waste Digital Knit — with optional lumbar and headrest. Choosing the material and options is the main decision before buying. This guide covers its confirmed features, fit and what to check.",
  verdictOneLiner: "A distinctive Wave-Suspension chair — the material and options define your version.",
  verdictNote: "Specs + owner reviews worldwide.",

  heroShotBrief: "Front, black Fern Digital Knit.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from Haworth's official specifications.",
  quickFacts: [
    { label: "Back tech", value: "Wave Suspension", note: "Patented, spine-mimicking" },
    { label: "Materials", value: "Digital Knit / mesh / fabric / leather", note: "Back-material options" },
    { label: "Weight capacity", value: "350 lb", note: "325 lb with forward-tilt option" },
    { label: "Arms", value: "4D (option)", note: "Also fixed, height-adjustable or armless" },
    { label: "Warranty", value: "12 years", note: "Per Haworth" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The Fern is sold in several materials and option levels that change both look and features. Confirm the version before ordering.",
  checks: [
    { n: "01", title: "Pick the back material", body: "The Fern's back comes in Haworth's signature Digital Knit (a zero-waste custom-knit), mesh, coated fabric, leather or woven materials. Digital Knit is the distinctive look; mesh maximises airflow. The material changes both feel and price, so confirm which one a listing is." },
    { n: "02", title: "Headrest depends on the material", body: "An optional headrest is available on the Fern — except on the Fern Digital Knit, which does not offer a headrest. If you want a headrest, choose a non-Digital-Knit back; if you want Digital Knit, plan to go without a headrest." },
    { n: "03", title: "Lumbar is optional", body: "Height-adjustable lumbar support is an option, not standard on every configuration. A cheaper listing may omit it — check whether lumbar is included if you need it." },
    { n: "04", title: "Confirm the exact configuration and condition", body: "The Fern is a premium chair sold new through Haworth and dealers; on Amazon and resale sites the material, options and condition vary. Confirm the material, lumbar/headrest options and whether it is new before you buy." },
  ],

  dims: [
    { k: "Back suspension", v: "Patented Wave Suspension system", tier: "B" },
    { k: "Back materials", v: "Digital Knit / mesh / coated fabric / leather / woven", tier: "B" },
    { k: "Weight capacity", v: "350 lb (325 lb with forward-tilt option)", tier: "B" },
    { k: "Seat height", v: "16.5–21.5 in (≈ 419–546 mm)", tier: "B" },
    { k: "Seat depth", v: "15.5–18.5 in (3 in / ≈ 76 mm of adjustment)", tier: "B" },
    { k: "Arms", v: "Option: 4D (height, width, depth, pivot); fixed, height-adjustable or armless also offered", tier: "B" },
    { k: "Lumbar", v: "Optional height-adjustable lumbar", tier: "B" },
    { k: "Headrest", v: "Optional — but not available on Fern Digital Knit", tier: "B" },
    { k: "Recline", v: "Tilt tension, 5-position back stop, optional 5° forward tilt", tier: "B" },
    { k: "Warranty", v: "12 years", tier: "B" },
  ],
  dimsSourceNote:
    "Source: Haworth official product documentation (checked 2026-09-09). Options (material, lumbar, headrest) change the configuration; confirm on the listing you buy from.",

  adjustable: [
    { k: "Seat height", v: "Pneumatic, 16.5–21.5 in (≈ 419–546 mm).", src: "Haworth (documented)" },
    { k: "Seat depth", v: "3 in (≈ 76 mm) of adjustment, 15.5–18.5 in.", src: "Haworth (documented)" },
    { k: "Lumbar (option)", v: "Height-adjustable when fitted.", src: "Haworth (documented)" },
    { k: "Arms — 4D (option)", v: "Height, width, depth and pivot when the 4D arm option is fitted.", src: "Haworth (documented)" },
    { k: "Recline", v: "Tilt tension, 5-position back stop and optional forward tilt.", src: "Haworth (documented)" },
  ],
  fixed: [
    { k: "Back material", v: "Chosen at purchase; not changed afterward.", src: "Haworth (documented)" },
    { k: "Headrest on Digital Knit", v: "Not available on the Digital Knit version.", src: "Haworth (documented)" },
    { k: "Lumbar (if not fitted)", v: "Optional — absent unless the configuration includes it.", src: "Haworth (documented)" },
  ],

  pros: [
    { t: "Patented Wave Suspension back that flexes across the whole back for even support.", src: "Haworth (documented)" },
    { t: "Signature zero-waste Digital Knit, plus mesh/fabric/leather choices for look and airflow.", src: "Haworth (documented)" },
    { t: "Optional 4D arms, seat-depth and tilt adjustment, with a 12-year warranty.", src: "Haworth (documented)" },
    { t: "Praised in published reviews for distinctive, even back support.", src: "Published reviews (research)" },
  ],
  cons: [
    { t: "No headrest option on the Digital Knit version.", src: "Haworth (documented)" },
    { t: "Lumbar is an option, not standard on every configuration.", src: "Haworth (documented)" },
    { t: "Premium price; configurations and availability vary by material and dealer.", src: "Our reading, product documentation" },
    { t: "350 lb capacity (325 lb with the forward-tilt option) is lower than some rivals (e.g. the Leap's 400 lb).", src: "Haworth (documented)" },
  ],

  forWhoTitle: "The Fern suits",
  forWho: [
    "Buyers drawn to the distinctive Digital Knit look and Wave Suspension support",
    "Those who want a premium chair with seat-depth adjustment and the 4D-arm option",
    "Anyone comparing mesh alternatives to the Aeron who wants a different back feel",
  ],
  skipWho: [
    "Want a headrest with the Digital Knit back (not offered)",
    "Need the highest weight capacity in the class",
    "Want the cheapest possible mesh chair",
  ],

  rivals: [
    { name: "Haworth Fern", lumbar: "Optional height-adjustable", arms: "4D (option)", standout: "Wave Suspension, Digital Knit option", isSelf: true },
    { name: "Herman Miller Aeron (Remastered)", lumbar: "PostureFit SL (option)", arms: "Up to fully adjustable", standout: "All-mesh icon, 3 sizes, 300–400 lb by size" },
    { name: "Steelcase Leap V2", lumbar: "Adjustable height + firmness", arms: "4D", standout: "Upholstered LiveBack, 400 lb" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar at a fraction of the price" },
  ],

  buy: {
    productTitle: "Haworth Fern",
    retailerNote: "Choose the back material and lumbar/headrest options before ordering",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Best path (new)", v: "Haworth sells the Fern new (directly and via dealers) with full material and option choice and the 12-year warranty. Prices vary by configuration." },
      { k: "Amazon", v: "The Amazon link is a search, not one listing — configurations and sellers vary. Confirm the back material, lumbar/headrest options and condition on the listing." },
      { k: "What to check", v: 'The back material (Digital Knit vs mesh/fabric/leather), whether lumbar and headrest are included, and who the seller is.' },
    ],
    officialStore: {
      label: "Haworth (official)",
      note: "New Fern with full material and option choice, 12-year warranty. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://www.haworth.com/na/en/products/seating/task/fern.html",
    },
    disclaimer:
      "Not verified by Chairpedia: price, seller, stock, material and options vary by listing and change without notice — confirm them before buying. The Amazon link is an affiliate search link; the Haworth link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Fern is Haworth's answer to the premium task-chair question, and its patented Wave Suspension back — which flexes across the whole back rather than at a few points — gives it a genuinely different feel from the Aeron or Leap. The signature Digital Knit is a distinctive, zero-waste look, and the chair offers optional 4D arms, seat-depth adjustment and a 12-year warranty.",
    "Because the Fern is configured, the material and options define your chair. The Digital Knit version has no headrest option; lumbar is an option rather than standard; and the 350 lb capacity (325 lb with forward tilt) trails some rivals. Decide on the back material first, then whether you need lumbar and a headrest, and confirm all of it on the listing. Get the configuration right and the Fern is a strong, distinctive premium pick.",
  ],
  verdictPullQuote:
    "A genuinely different back feel — just choose the material and options deliberately, especially if you want a headrest.",

  faqs: [
    { q: "What is the difference between the Fern materials?", a: "The back comes in Digital Knit (a zero-waste custom knit), mesh, coated fabric, leather or woven materials. Digital Knit is the signature look; mesh maximises airflow. The material affects feel and price." },
    { q: "Does the Fern have a headrest?", a: "A headrest is optional on the Fern — except on the Fern Digital Knit, which does not offer one. Choose a non-Digital-Knit back if you want a headrest." },
    { q: "Is lumbar support included?", a: "Height-adjustable lumbar is an option, not standard on every configuration. Check whether a listing includes it if you need lumbar support." },
    { q: "What is the weight capacity?", a: "Haworth warranties the Fern for people up to 350 lb without the forward-tilt option, or 325 lb with it. Confirm on the listing you buy from." },
    { q: "What is this guide based on?", a: "This guide combines manufacturer specifications with owner reviews from around the world. It draws on Haworth's documentation and published reviews." },
  ],

  sources: [
    { k: "Haworth (official)", v: "Fern product pages and specifications, checked 2026-09-09. Basis for Wave Suspension, material options, 350 lb (325 lb with forward tilt) capacity, seat-height/seat-depth adjustment, optional 4D arms, optional lumbar and headrest, and the 12-year warranty." },
    { k: "Published reviews", v: "Third-party reviews summarised for the comfort/support notes." },
  ],

  sourcesFooter:
    "Specifications are Haworth's published figures as of the date shown and are not independently verified by Chairpedia. The Fern is sold in several materials and configurations; always confirm the material, lumbar/headrest options and condition on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

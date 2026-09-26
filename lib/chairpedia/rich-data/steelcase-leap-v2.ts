import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Steelcase Leap V2 — research-based buying guide data.
 * Specs from Steelcase's official documentation (LiveBack, 400 lb capacity,
 * 4D arms, seat-depth and lumbar adjustment, 12-year warranty), checked
 * 2026-09-09. US Amazon links to the black-fabric V2 listing B073G1K465;
 * seller, condition, stock and warranty must be checked on Amazon.
 * Regional routing may use local search results. No fixed prices anywhere.
 */
export const STEELCASE_LEAP_V2: RichReview = {
  asin: null,
  eyebrow: "Steelcase · Office chairs · Buying guide",
  heroIntro:
    "The Steelcase Leap V2 is an upholstered, highly adjustable task chair built around LiveBack — a back that flexes with your spine. It is one of the most adjustable chairs in its class and has a huge refurbished market, so the key questions are version (V1 vs V2) and condition (new vs refurbished). This guide covers its confirmed features, fit and what to check.",
  verdictOneLiner: "One of the most adjustable upholstered chairs — check V2 and new-vs-refurbished.",
  verdictNote: "Specs + owner reviews worldwide.",

  heroShotBrief: "Three-quarter, black Leap V2.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from Steelcase's official specifications.",
  quickFacts: [
    { label: "Version", value: "Leap V2", note: "Current generation; V1 is older" },
    { label: "Back", value: "LiveBack", note: "Flexes with your spine" },
    { label: "Weight capacity", value: "400 lb", note: "Per Steelcase" },
    { label: "Arms", value: "4D", note: "Height, width, depth, pivot" },
    { label: "Warranty", value: "12 years", note: "24/7, parts and labor" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The Leap V2's adjustability is a given; the buying pitfalls are version and condition. Confirm these before ordering.",
  checks: [
    { n: "01", title: "V1 vs V2", body: "The Leap V2 is the current generation. Compared with the older V1 it uses a lighter nylon base, gives taller users better back coverage, and adds 4-way (4D) arms. Both are rated to 400 lb with a 24/7 warranty. If you want the current chair, confirm the listing says V2." },
    { n: "02", title: "New vs refurbished", body: "The Leap V2 has an unusually large refurbished/remanufactured market, often at a much lower price. Refurbished chairs can be excellent value but vary in condition, parts and warranty by seller. Decide whether you want new (full Steelcase warranty) or refurbished, and read exactly what a refurbished listing includes." },
    { n: "03", title: "Check the fit ranges for your body", body: "Seat height adjusts 15.5–20.5 in and seat depth adjusts 3 in (15.75–18.75 in); the seat is 19.25 in wide. Compare these with your desk and body before ordering. The Leap fits a wide range but is not infinitely large." },
    { n: "04", title: "The headrest is an option, not standard", body: "Steelcase's Leap spec guide lists an adjustable headrest option (not on stools or Leap Plus), but the Steelcase online store does not offer it and many listings ship without one; some headrests on resale units are third-party add-ons. Confirm what the listing includes if you want neck support." },
  ],

  dims: [
    { k: "Seat", v: "19.25 in W × 15.75–18.75 in D (seat depth adjusts 3 in)", tier: "B" },
    { k: "Seat height", v: "15.5–20.5 in", tier: "B" },
    { k: "Back size", v: "18 in W × 25 in H", tier: "B" },
    { k: "Overall", v: "24.75 in D × 27 in W × 38.5–43.5 in H", tier: "B" },
    { k: "Arms", v: "4D — height 7–11 in, width, depth, pivot", tier: "B" },
    { k: "Weight capacity", v: "400 lb", tier: "B" },
    { k: "Lumbar", v: "Adjustable lumbar height + firmness (LiveBack)", tier: "B" },
    { k: "Recline", v: "Natural Glide tilt, 5 tilt positions + tension", tier: "B" },
    { k: "Headrest", v: "Optional (spec-guide option; not in Steelcase's online store)", tier: "B" },
    { k: "Warranty", v: "12 years, 24/7, parts and labor", tier: "B" },
  ],
  dimsSourceNote:
    "Source: Steelcase official product documentation (checked 2026-09-09). Refurbished units may differ in fabric, base and parts — confirm on the listing you buy from.",

  adjustable: [
    { k: "Seat height", v: "Pneumatic, 15.5–20.5 in (standard cylinder).", src: "Steelcase (documented)" },
    { k: "Seat depth", v: "Slides 3 in (15.75–18.75 in) to change support depth.", src: "Steelcase (documented)" },
    { k: "Lumbar", v: "Height and firmness, working with the LiveBack.", src: "Steelcase (documented)" },
    { k: "Arms — 4D", v: "Height, width, depth and pivot.", src: "Steelcase (documented)" },
    { k: "Recline", v: "Natural Glide tilt with 5 positions and tension control.", src: "Steelcase (documented)" },
  ],
  fixed: [
    { k: "Back type", v: "Upholstered LiveBack — there is no mesh-back version of the Leap.", src: "Steelcase (documented)" },
    { k: "Headrest", v: "Optional per the Leap spec guide; not offered in Steelcase's online store or on stools/Leap Plus.", src: "Steelcase (documented)" },
    { k: "Refurbished parts", v: "On remanufactured units, fabric/base/parts are set by the refurbisher.", src: "Our reading of the resale market" },
  ],

  pros: [
    { t: "Class-leading adjustability: LiveBack, adjustable lumbar height and firmness, seat depth, 4D arms and a 5-position tilt.", src: "Steelcase (documented)" },
    { t: "High 400 lb capacity and a 12-year, 24/7 warranty on new chairs.", src: "Steelcase (documented)" },
    { t: "Upholstered seat and back that many sitters prefer to mesh for all-day comfort.", src: "Published reviews (research)" },
    { t: "A deep refurbished market makes a premium chair reachable at a lower price.", src: "Our reading of the resale market" },
  ],
  cons: [
    { t: "Upholstered only — less airflow than an all-mesh chair in warm rooms.", src: "Steelcase (documented)" },
    { t: "Headrest is a dealer/spec-guide option only — not offered in Steelcase's online store.", src: "Steelcase (documented)" },
    { t: "New pricing is high; refurbished quality and warranty vary by seller.", src: "Our reading of the resale market" },
    { t: "Older V1 units still circulate — easy to buy the wrong generation if you don't check.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The Leap V2 suits",
  forWho: [
    "Buyers who want maximum adjustability and an upholstered (not mesh) feel",
    "Heavier users — the 400 lb capacity is among the highest in the class",
    "Value hunters open to a reputable refurbished unit",
  ],
  skipWho: [
    "Want an all-mesh, maximum-airflow chair",
    "Need a headrest but plan to buy from Steelcase's online store (it isn't offered there)",
    "Won't check version and condition before buying",
  ],

  rivals: [
    { name: "Steelcase Leap V2", lumbar: "Adjustable height + firmness", arms: "4D", standout: "Upholstered LiveBack, 400 lb, huge refurb market", isSelf: true },
    { name: "Herman Miller Aeron (Remastered)", lumbar: "PostureFit SL (option)", arms: "Up to fully adjustable", standout: "All-mesh icon, 3 sizes" },
    { name: "Haworth Fern", lumbar: "Optional height-adjustable", arms: "4D (option)", standout: "Wave Suspension, headrest option (non-Digital-Knit)" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar at a fraction of the price" },
  ],

  buy: {
    productTitle: "Steelcase Leap V2",
    retailerNote: "Confirm V2 (not V1) and new vs refurbished before ordering",
    ctaLabel: "View on Amazon",
    rows: [
      { k: "Best path (new)", v: "Steelcase sells the new Leap with the full 12-year warranty. Prices vary by fabric and options." },
      { k: "Amazon / resale", v: "The US Amazon link opens the Leap V2 in Black Fabric listing. Regional links may open local search results. Check the selected seller, new or used condition, return terms and warranty before ordering." },
      { k: "What to check", v: 'Says "Leap V2", the condition (new / refurbished / used), the fabric, and who the seller and warranty are.' },
    ],
    officialStore: {
      label: "Steelcase (official)",
      note: "New Leap V2 with the full 12-year warranty. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://www.steelcase.com/products/office-chairs/leap/",
    },
    disclaimer:
      "Amazon links are affiliate links; the Steelcase link is non-affiliate. Prices, sellers, availability and purchase conditions can change. Check the selected offer on Amazon; this guide does not guarantee manufacturer warranty coverage for third-party offers. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Leap V2 is one of the most adjustable task chairs you can buy: LiveBack that flexes with your spine, adjustable lumbar height and firmness, a sliding seat depth, 4D arms and a five-position tilt, all rated to 400 lb with a 12-year, 24/7 warranty on new chairs. If you prefer an upholstered seat and back to mesh, it is a benchmark for dialing in a precise fit.",
    "Two things decide whether you buy well. First, version: the current chair is the V2, and older V1 units still circulate. Second, condition: the Leap has an unusually deep refurbished market that can make it a bargain, but refurbished quality, parts and warranty vary by seller. Confirm both, and the Leap V2 is a chair that rewards the buyer who reads the details.",
  ],
  verdictPullQuote:
    "Maximum adjustability in an upholstered chair — just confirm it's a V2 and know whether it's new or refurbished.",

  faqs: [
    { q: "What's the difference between Leap V1 and V2?", a: "The V2 is the current generation: a lighter nylon base, better back coverage for taller users and 4D arms. Both are rated to 400 lb with a 24/7 warranty. Confirm the listing says V2." },
    { q: "Should I buy new or refurbished?", a: "New comes with Steelcase's full 12-year warranty; refurbished/remanufactured units are cheaper but vary in condition, parts and warranty by seller. Decide which you want and read exactly what a refurbished listing includes." },
    { q: "Does the Leap V2 have a mesh back?", a: "No. The Leap uses an upholstered LiveBack; there is no mesh-back version. If you want mesh, look at the Aeron or Fern." },
    { q: "Is there a headrest?", a: "Yes, as an option: Steelcase's Leap spec guide lists an adjustable headrest (not on stools or Leap Plus). The Steelcase online store does not offer it, so check with a dealer or confirm the listing includes it." },
    { q: "What is this guide based on?", a: "This guide combines manufacturer specifications with owner reviews from around the world. It draws on Steelcase's documentation and published reviews." },
  ],

  sources: [
    { k: "Steelcase (official)", v: "Leap product pages and specifications, checked 2026-09-09. Basis for dimensions, 400 lb capacity, LiveBack, lumbar/seat-depth/4D-arm adjustment, tilt and the 12-year warranty." },
    { k: "Published reviews & resale market", v: "Third-party reviews and refurbished-market listings summarised for the comfort notes and the new-vs-refurbished guidance." },
  ],

  sourcesFooter:
    "Specifications are Steelcase's published figures for the new Leap V2 as of the date shown and are not independently verified by Chairpedia. Refurbished units differ; always confirm version, condition, fabric and warranty on the listing you buy from.",

  related: [
    { label: "Used Leap buying guide: V1 vs V2 identification and inspection", href: "/blog/used-steelcase-leap-buying-guide-v1-vs-v2-identification-and-inspection" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

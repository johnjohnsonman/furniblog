import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Ticova Ergonomic Office Chair — research-based buying guide data.
 * Listing-led evidence for ASIN B08LBJXVSP, reviewed 2026-09-10.
 * Unknown fit ranges and service life are not inferred from review summaries.
 */
export const TICOVA_ERGONOMIC: RichReview = {
  asin: "B08LBJXVSP",
  eyebrow: "Ticova · Office chairs · Buying guide",
  heroIntro:
    "The Ticova Ergonomic Office Chair combines a cushioned seat with adjustable lumbar support, armrests and a headrest. This research-based guide explains which movements are documented and which fit questions remain unresolved for the linked model.",
  verdictOneLiner: "Consider Ticova for documented armrest movements; establish fit and seller terms before ordering.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black Ticova mesh chair.",
  galleryBriefs: [],

  quickFactsNote: "Published descriptions reviewed September 10, 2026. These are not Furniblog measurements or a personal-fit recommendation.",
  quickFacts: [
    { label: "Weight capacity", value: "280 lb", note: "Referenced Amazon safety information; confirm selected item" },
    { label: "Armrests", value: "3D", note: "Height, angle, forward/back documented" },
    { label: "Lumbar", value: "2-axis", note: "Height + depth via knob" },
    { label: "Headrest", value: "Adjustable", note: "Height and angle documented" },
    { label: "Back / seat", value: "Mesh back, foam seat", note: "W-shaped cushion" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Choose the adjustments you need, then check usable dimensions and the terms attached to the selected offer.",
  checks: [
    { n: "01", title: "Check the linked model's recline rating", body: "The linked Amazon listing (B08LBJXVSP) advertises 130° recline. Do not assume a 140° specification from another listing applies to this model. Confirm the selected version before buying." },
    { n: "02", title: "Establish fit with usable measurements", body: "The referenced listing states a 280 lb maximum, not a comfort range. Request floor-to-seat height, usable seat depth and arm spacing for the selected item. We have not established a recommended user-height range." },
    { n: "03", title: "Choose adjustments you will actually use", body: "Arm height, angle and forward/back movement are documented. Decide whether those movements address a limitation at your keyboard or mouse before paying for them. A 3D label cannot establish desk clearance or personal comfort." },
    { n: "04", title: "Verify support rather than assume a service life", body: "We have not established a typical failure rate or lifespan from a representative review sample. Check who handles warranty claims, what parts qualify, and any freight costs. Keep the terms attached to your order." },
  ],

  dims: [
    { k: "Seat height", v: "Not verified for the linked configuration", tier: "C" },
    { k: "Usable seat depth", v: "Not verified; request a model-specific measurement and slider information", tier: "C" },
    { k: "Weight capacity", v: "280 lb", tier: "A" },
    { k: "Recline", v: "130° advertised on the linked Amazon listing (B08LBJXVSP)", tier: "A" },
    { k: "Armrests — 3D", v: "Height, angle and forward/back described in the listing", tier: "A" },
    { k: "Lumbar", v: "Height and depth adjustment described in the listing", tier: "A" },
    { k: "Headrest", v: "Height and angle adjustment described in the listing", tier: "A" },
    { k: "Back / seat", v: "Mesh back and foam cushion", tier: "A" },
    { k: "Warranty eligibility", v: "Confirm with the seller; a separate website's statement is not proof of order coverage", tier: "C" },
  ],
  dimsSourceNote:
    "Available Amazon listing representation reviewed September 10, 2026; not a live offer check. Unverified fit measurements are left unresolved rather than combined from other versions or reviews.",

  adjustable: [
    { k: "Armrests — 3D", v: "Height, angle and forward/back.", src: "Amazon listing description" },
    { k: "Lumbar", v: "Height and depth.", src: "Amazon listing description" },
    { k: "Headrest", v: "Height and angle.", src: "Amazon listing description" },
    { k: "Seat height", v: "Adjustment described; exact range unverified here.", src: "Amazon listing / evidence limit" },
    { k: "Recline", v: "130° advertised recline on ASIN B08LBJXVSP.", src: "Amazon listing" },
  ],
  fixed: [
    { k: "Seat depth", v: "Usable depth and a slider are not verified here.", src: "Evidence limit" },
    { k: "Seat material", v: "Foam cushion (not mesh).", src: "Amazon listing description" },
    { k: "Assembled dimensions", v: "Not reliably published; confirm on the listing.", src: "Not confirmed" },
  ],

  pros: [
    { t: "Documented lumbar height and depth adjustment provides a setting to compare.", src: "Amazon listing" },
    { t: "Arm angle and fore/aft movement are relevant if those movements are missing from your current chair.", src: "Editorial selection criterion" },
    { t: "A cushioned-seat option for buyers who already prefer padding to mesh.", src: "Editorial selection criterion" },
  ],
  cons: [
    { t: "Usable seat dimensions still need checking before a fit decision.", src: "Evidence limit" },
    { t: "We have not measured comfort or established a representative failure rate.", src: "Testing disclosure" },
    { t: "Warranty and return eligibility require seller-specific confirmation.", src: "Purchase check" },
  ],

  forWhoTitle: "The Ticova suits",
  forWho: [
    "Value hunters who still want real lumbar, 3D arms and a headrest",
    "Buyers who specifically need arm angle and forward/back movement",
    "People who will take a few minutes to dial in the adjustments",
  ],
  skipWho: [
    "Need a verified seat-depth slider or a fit measurement the seller cannot provide",
    "Require an independently tested durability recommendation",
    "Weigh more than 280 lb",
  ],

  rivals: [
    { name: "Ticova Ergonomic", lumbar: "2-axis (height + depth)", arms: "3D", standout: "Lots of adjustment for a budget mesh chair", isSelf: true },
    { name: "SIHOO M18", href: "/compare/ticova-ergonomic-vs-sihoo-m18", lumbar: "Height and depth documented", arms: "2D label; check movements", standout: "Compare required adjustments and seller terms" },
  ],

  buy: {
    productTitle: "Ticova Ergonomic Office Chair",
    retailerNote: "Amazon · ASIN B08LBJXVSP",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Check the return window, assembled-chair eligibility and return freight for the offer you select." },
      { k: "Warranty", v: "Ticova.net states one year, but this does not establish coverage for your marketplace order. Confirm the provider and terms with the seller." },
      { k: "What to check", v: "Match ASIN B08LBJXVSP, the advertised 130° recline, colour and headrest to the selected listing." },
    ],
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and the exact recline batch change without notice — confirm on the listing. Affiliate link; commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "Shortlist Ticova if the documented arm movements address a limitation in your current setup. Compare it with the M18 using the movements you need, usable seat measurements and the final delivered price. Neither an adjustment count nor a foam description establishes personal comfort.",
    "Furniblog has not hands-on tested this chair or established a typical service life. We do not recommend it for a universal height range. Resolve critical fit questions and seller support terms before ordering rather than treating a longer feature list as a guarantee.",
  ],
  verdictPullQuote:
    "Pay for adjustments you can use, after establishing fit and support terms.",

  faqs: [
    { q: "Is the recline 130° or 140°?", a: "The linked Amazon listing, ASIN B08LBJXVSP, advertises 130°. A 140° claim from another listing is not confirmed for this model. Check the selected version before ordering." },
    { q: "What's the weight capacity and fit range?", a: "The referenced Amazon safety information states 280 lb. That is not a comfort or fit range. We have not established a universal user-height recommendation; obtain usable dimensions for your selected item." },
    { q: "Are the armrests really 3D?", a: "The referenced listing describes height, angle and forward/back movement. Confirm the range and arm spacing for the selected configuration." },
    { q: "How long is the warranty?", a: "Ticova.net's support page states one year. This is not proof of eligibility for every seller or region. Confirm the warranty provider, covered parts and any shipping charges for your order." },
    { q: "Has Furniblog tested this chair?", a: "No. This guide compares published product descriptions, not our own sitting or durability measurements. No universal comfort or user-height recommendation has been established." },
  ],

  sources: [
    { k: "Ticova.net product description", url: "https://www.ticova.net/product/ticova-ergonomic-office-chair/", v: "Reviewed September 10, 2026; corroborating description, not independent testing or proof of seller warranty eligibility." },
    { k: "Amazon listing", url: "https://www.amazon.com/dp/B08LBJXVSP", v: "ASIN B08LBJXVSP: the retrieved listing title specifies 130-degree recline, 3D arms and adjustable lumbar support. Listing content is not a hands-on measurement." },
    { k: "Ticova installation and support", url: "https://www.ticova.net/installation-guide/", v: "Checked 2026-09-10: states a one-year warranty for ergonomic chairs and directs customers to contact Ticova through Amazon." },
    { k: "Evidence limits", v: "Untraceable height recommendations and typical-lifespan claims are not used. Seller page representations can lag changes; confirm the selected item before buying." },
  ],
  sourcesFooter:
    "This is a research-based guide, not independent testing. Published adjustment descriptions do not establish personal fit or service life. Verify seller terms and model-specific documentation before ordering.",
  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "Best office chairs under $300: verified picks", href: "/blog/best-office-chairs-under-300-verified-picks" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

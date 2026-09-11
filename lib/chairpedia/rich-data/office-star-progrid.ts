import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Office Star ProGrid (Pro-Line II ProGrid Mesh Back Manager's) — research-based
 * buying guide data. "ProGrid" is a family, not one SKU, and the linked ASIN
 * (B00450P182) is an older multi-function ProGrid manager's variant whose exact
 * specs vary by SKU. This guide covers the line's consistent features and marks
 * SKU-specific numbers as not confirmed. Facts from the official 92553 spec
 * sheet, dealers and reviews (checked 2026-09-10). No fixed prices.
 */
export const OFFICE_STAR_PROGRID: RichReview = {
  asin: "B00450P182",
  eyebrow: "Office Star · Office chairs · Buying guide",
  heroIntro:
    "The Office Star ProGrid is a contract-style mesh-back manager's chair line built around a breathable \"ProGrid\" screen back with a built-in lumbar curve and a padded fabric seat. This guide covers what's consistent across the line and — importantly — how to confirm the exact SKU, since specs vary.",
  verdictOneLiner: "A cool, value contract manager's chair — but confirm the exact ProGrid SKU.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black Office Star ProGrid manager's chair.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from the official Office Star 92553 spec sheet and dealers; SKU-specific numbers vary.",
  quickFacts: [
    { label: "Line", value: "Pro-Line II ProGrid", note: "Mesh-back manager's" },
    { label: "Back / seat", value: "ProGrid mesh + fabric seat", note: "Not an all-mesh seat" },
    { label: "Lumbar", value: "Built-in", note: "Contoured, not a separate device" },
    { label: "Headrest", value: "None", note: "Not offered on this line" },
    { label: "Certification", value: "GREENGUARD", note: "Low-emission certified" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "\"ProGrid High Back\" covers several different SKUs. The most important step is confirming which one a listing is — features differ.",
  checks: [
    { n: "01", title: "Confirm the exact ProGrid SKU", body: "Office Star sells many ProGrid variants — the mesh-back-plus-fabric-seat manager's (e.g. 92553), an all-mesh ProGrid seat-and-back (93720), and multi-function/seat-slider variants. The linked listing is an older multi-function ProGrid manager's; its exact specs vary by SKU. Read the model number and feature list on the listing before buying." },
    { n: "02", title: "It's a mesh back with a fabric seat, no headrest", body: "The ProGrid screen back breathes well and has a built-in lumbar curve, but the seat is padded fabric (not mesh) and there is no headrest on this line. If you want an all-mesh seat or a headrest, this isn't it." },
    { n: "03", title: "Confirm the weight capacity", body: "Office Star's official 92553 spec sheet omits a capacity figure; dealers commonly list around 250 lb for ProGrid manager's chairs (some variants ~275 lb). Don't assume — confirm the capacity on the exact listing." },
    { n: "04", title: "Set the tilt tension; expect a firm seat", body: "The chair uses a synchro/multi-function tilt with tension and (on some SKUs) a seat slider and ratchet back height. Reviewers note thin arm padding and a firm, somewhat narrow seat — try the tilt tension and set expectations on cushioning." },
  ],

  dims: [
    { k: "Overall (92553)", v: "≈ 27 in W × 24.75 in D × 36–42 in H (varies by SKU)", tier: "C" },
    { k: "Seat (92553)", v: "≈ 20.25 in W × 19.5 in D", tier: "C" },
    { k: "Seat height (92553)", v: "≈ 19.5–23 in", tier: "C" },
    { k: "Weight capacity", v: "Not on the official 92553 sheet; dealers list ~250 lb (some ~275) — confirm on the listing", tier: "C" },
    { k: "Recline / tilt", v: "Synchro / multi-function tilt with tension (seat slider on some SKUs)", tier: "B" },
    { k: "Armrests", v: "Height-adjustable (some retailer copy says 2-way; width not confirmed)", tier: "C" },
    { k: "Lumbar", v: "Built into the ProGrid mesh back (contoured); back height ratchet on some SKUs", tier: "B" },
    { k: "Headrest", v: "None", tier: "B" },
    { k: "Back / seat", v: "ProGrid breathable screen-mesh back; padded fabric seat", tier: "B" },
    { k: "Warranty", v: "Pro-Line II: lifetime on component parts; 3 years fabric/foam (per manufacturer terms)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: official Office Star 92553 spec sheet, dealers and reviews (checked 2026-09-10). \"ProGrid\" spans several SKUs with different specs, and the linked ASIN (B00450P182) is an older multi-function variant — dimensions and capacity here are the common manager's figures and must be confirmed against the exact listing.",

  adjustable: [
    { k: "Tilt", v: "Synchro/multi-function tilt with tension control.", src: "Official sheet / dealers" },
    { k: "Seat height", v: "Pneumatic (≈ 19.5–23 in on 92553).", src: "Official sheet (92553)" },
    { k: "Armrests", v: "Height-adjustable (width not confirmed).", src: "Official / dealers (varies)" },
    { k: "Seat slider", v: "On some multi-function SKUs (~3.75 in).", src: "Official sheet (varies)" },
    { k: "Back height", v: "Ratchet on some SKUs.", src: "Dealers (varies)" },
  ],
  fixed: [
    { k: "Lumbar", v: "Built into the ProGrid back (contoured), not a separate adjustable device.", src: "Official / dealers" },
    { k: "Headrest", v: "Not offered on this line.", src: "Official (documented)" },
    { k: "Seat material", v: "Padded fabric seat (not mesh).", src: "Official (documented)" },
  ],

  pros: [
    { t: "Breathable ProGrid screen back runs cool versus padded or leather backs.", src: "Published reviews (research)" },
    { t: "Strong ergonomics and build for the price — often framed as punching above ~$200.", src: "Published reviews (research)" },
    { t: "Wide adjustment on manager's SKUs (synchro tilt + tension, seat slider, ratchet back, adjustable arms) and GREENGUARD certification.", src: "Official / dealers (documented)" },
  ],
  cons: [
    { t: "Thin armrest padding and a firm, somewhat narrow seat, per reviewers.", src: "Published reviews (research)" },
    { t: "Built-in lumbar is modest, not deeply adjustable; no headrest.", src: "Official / reviews" },
    { t: "\"ProGrid\" SKU confusion — easy to buy a different variant than intended.", src: "Our reading" },
  ],

  forWhoTitle: "The ProGrid suits",
  forWho: [
    "Buyers who want a cool, contract-grade mesh-back manager's chair on a budget",
    "Offices that value GREENGUARD certification and a lifetime parts warranty",
    "People who prefer a padded seat with a breathable back",
  ],
  skipWho: [
    "Want an all-mesh seat or a headrest",
    "Need a deeply adjustable (separate) lumbar",
    "Won't check the exact SKU before buying",
  ],

  rivals: [
    { name: "Office Star ProGrid", lumbar: "Built-in (contoured)", arms: "Height-adjustable", standout: "Cool mesh back, value contract chair", isSelf: true },
    { name: "HON Ignition 2.0", lumbar: "Optional adjustable", arms: "Optional adjustable", standout: "Configurable, lifetime warranty" },
    { name: "Office Star ProGrid 93720", lumbar: "Built-in", arms: "Width + height", standout: "All-mesh ProGrid seat and back" },
    { name: "SIHOO M18", lumbar: "Adjustable", arms: "2D", standout: "Headrest + cushioned seat, budget" },
  ],

  buy: {
    productTitle: "Office Star ProGrid Mesh Back Manager's Chair",
    retailerNote: "Amazon · ASIN B00450P182 · older multi-function ProGrid variant — confirm the SKU",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check the listing." },
      { k: "Warranty", v: "Pro-Line II: lifetime on component parts, 3 years fabric/foam (per manufacturer). Confirm on the listing." },
      { k: "What to check", v: "The exact ProGrid model number, the weight capacity (often ~250 lb), and that it's the mesh-back manager's you want." },
    ],
    officialStore: {
      label: "Office Star (official)",
      note: "Full Pro-Line II ProGrid range and spec sheets at officestar.net (sold via dealers). Direct link (not an affiliate link).",
      url: "https://www.officestar.net",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and — importantly — the exact ProGrid SKU vary by listing. Confirm the model and its specs before buying. The Amazon link is an affiliate link; the Office Star link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Office Star ProGrid is a dependable value in the contract-chair mould: a breathable ProGrid screen back with a built-in lumbar curve, a padded fabric seat, a synchro/multi-function tilt and GREENGUARD certification, usually at a price that undercuts name-brand contract chairs. Reviewers consistently rate its ergonomics and build well for the money.",
    "The catch is the line itself. \"ProGrid\" spans several SKUs with different features, and the linked listing is an older multi-function variant — so the single most important thing is to confirm the exact model, its capacity (often around 250 lb) and its arm/lumbar details on the listing. There's no headrest and the seat is firm. Buy the right SKU and it's a cool, well-warrantied workhorse.",
  ],
  verdictPullQuote:
    "A cool, value contract chair — as long as you confirm exactly which ProGrid you're buying.",

  faqs: [
    { q: "Which ProGrid is this?", a: "\"ProGrid\" is a family. The linked ASIN (B00450P182) is an older multi-function ProGrid manager's variant; specs vary by SKU, so confirm the model number and features on the listing." },
    { q: "Is the seat mesh?", a: "No. The back is breathable ProGrid mesh; the seat is padded fabric. There's no all-mesh seat on this SKU and no headrest." },
    { q: "What's the weight capacity?", a: "The official 92553 sheet omits it; dealers commonly list ~250 lb (some variants ~275). Confirm on the exact listing." },
    { q: "Does the lumbar adjust?", a: "It's built into the ProGrid back as a contour, not a separate adjustable lumbar device; some SKUs add ratchet back-height." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from Office Star's spec sheet, dealers and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Office Star (official) / dealers", v: "Official 92553 spec sheet and authorized dealers, checked 2026-09-10. Basis for the ProGrid back, fabric seat, tilt, arms and warranty terms." },
    { k: "Amazon listing", v: "Office Star ProGrid — ASIN B00450P182 (older multi-function variant). Basis for the linked product; confirm the exact SKU." },
    { k: "Published reviews", v: "Third-party reviews summarised for airflow, value and the arm/seat cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications reflect the common Office Star ProGrid manager's figures (official 92553 sheet plus dealers) as of the date shown and are not independently verified by Furniblog. The ProGrid line spans several SKUs and the linked ASIN is an older variant — confirm the exact model, capacity and features on the listing you buy from.",
  related: [
    { label: "Office chairs for standing and tall desks: documented picks", href: "/blog/office-chairs-for-standing-desks-and-tall-desks-documented-picks" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

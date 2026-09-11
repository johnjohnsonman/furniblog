import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Branch Ergonomic Chair (base model) — research-based buying guide data.
 * Facts from branchfurniture.com, the Amazon listing and published reviews
 * (checked 2026-09-10). Distinct from the Branch Ergonomic Pro, Verve and
 * Daily. Seat height/depth differ by standard vs tall-cylinder config — flagged.
 * No fixed prices.
 */
export const BRANCH_ERGONOMIC_CHAIR: RichReview = {
  asin: "B0C15B3HN1",
  eyebrow: "Branch · Office chairs · Buying guide",
  heroIntro:
    "The Branch Ergonomic Chair is a double-mesh task chair with eight points of adjustment — 3D arms, adjustable lumbar, a seat-depth slider and tilt tension — sold direct and on Amazon. This guide covers its confirmed features, options and what to check.",
  verdictOneLiner: "Most of a premium chair's adjustability at a mid price — arms are the weak point.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black Branch Ergonomic Chair.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from Branch's official specs and the Amazon listing.",
  quickFacts: [
    { label: "Model", value: "Ergonomic Chair", note: "Base — not the Pro, Verve or Daily" },
    { label: "Back / seat", value: "Double-layer mesh", note: "Foam seat, fabric colours" },
    { label: "Armrests", value: "3D", note: "Height, width/pivot, depth" },
    { label: "Seat depth", value: "Slider", note: "Adjustable seat depth" },
    { label: "Warranty", value: "7 years", note: "Fabrics 3 years" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The Branch line has several chairs and a couple of configuration options. Confirm the model and the numbers that fit your body.",
  checks: [
    { n: "01", title: "Get the base Ergonomic Chair, not the Pro/Verve/Daily", body: "Branch sells the Ergonomic Chair (this one, 8 points, 3D arms), the Ergonomic Chair Pro (5D arms, more adjustment), the Verve (V-shaped executive back) and the Daily (entry, 225 lb). Confirm the listing is the base Ergonomic Chair." },
    { n: "02", title: "The headrest is a paid add-on", body: "No headrest is included; Branch sells one separately as an accessory (2-axis, ~2.25 in of height). Budget for it if you want neck support." },
    { n: "03", title: "Confirm seat height/depth for your body", body: "Sources differ, likely because a taller gas cylinder is an option: seat height is around 17–21 in (higher with the tall cylinder) and the seat-depth slider spans roughly 18–22 in. Check the exact configuration and numbers on the live page before ordering." },
    { n: "04", title: "Know the arms are the common complaint", body: "The 3D arms are the feature reviewers most often criticise — described as hard and prone to slipping from a set position. If armrest feel is a priority, weigh this or consider the Pro's 5D arms." },
  ],

  dims: [
    { k: "Overall", v: "≈ 25 in W × 24 in D × 38–42 in H (higher with tall cylinder)", tier: "B" },
    { k: "Seat height", v: "≈ 17–21 in (varies by standard vs tall cylinder)", tier: "C" },
    { k: "Seat depth", v: "Slider, ≈ 18–22 in (varies by source)", tier: "C" },
    { k: "Weight capacity", v: "275 lb", tier: "B" },
    { k: "Armrests — 3D", v: "Height, width/pivot, depth", tier: "B" },
    { k: "Lumbar", v: "Adjustable, removable (height)", tier: "B" },
    { k: "Headrest", v: "Optional paid add-on (2-axis)", tier: "B" },
    { k: "Recline", v: "Tilt + tilt tension; ~56° max (third-party measurement)", tier: "C" },
    { k: "Back / seat", v: "Double-layer mesh back; foam seat", tier: "B" },
    { k: "Warranty", v: "7 years (parts); fabrics 3 years", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: branchfurniture.com, Amazon listing and published reviews (checked 2026-09-10). Seat height/depth and overall height differ between sources (standard vs optional tall cylinder) — confirm the configuration on the live page. Recline degree is a third-party measurement, not a Branch spec.",

  adjustable: [
    { k: "Armrests — 3D", v: "Height, width/pivot and depth.", src: "Branch (documented)" },
    { k: "Seat depth", v: "Slider to change support depth.", src: "Branch (documented)" },
    { k: "Lumbar", v: "Height-adjustable, removable.", src: "Branch (documented)" },
    { k: "Recline", v: "Tilt with tension control.", src: "Branch (documented)" },
    { k: "Seat height", v: "Gas lift; standard or optional tall cylinder.", src: "Branch (documented)" },
  ],
  fixed: [
    { k: "Headrest", v: "Not included; optional paid accessory.", src: "Branch (documented)" },
    { k: "Back type", v: "Double-mesh back; no upholstered-back option.", src: "Branch (documented)" },
  ],

  pros: [
    { t: "Eight points of adjustment — double mesh, 3D arms, removable lumbar, seat-depth slider, tilt tension — for well under premium prices.", src: "Branch · published reviews" },
    { t: "Smooth, high-quality casters singled out by reviewers.", src: "Published reviews (research)" },
    { t: "Breathable double-layer mesh back and quick (~12 min) assembly.", src: "Published reviews (research)" },
    { t: "Long 7-year parts warranty (fabrics 3 years).", src: "Branch (documented)" },
  ],
  cons: [
    { t: "Armrests are the top complaint — hard and prone to slipping from position.", src: "Published reviews (research)" },
    { t: "Headrest costs extra.", src: "Branch (documented)" },
    { t: "Measured max recline (~56°) is shallower than some rivals.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The Branch suits",
  forWho: [
    "Buyers who want premium-style adjustability (3D arms, seat-depth slider) at a mid price",
    "People who value smooth casters and a breathable mesh back",
    "Anyone happy to buy direct with a long parts warranty",
  ],
  skipWho: [
    "Want the best-in-class armrests (consider the Branch Pro's 5D)",
    "Need an included headrest without paying extra",
    "Want a deep-reclining chair",
  ],

  rivals: [
    { name: "Branch Ergonomic Chair", lumbar: "Adjustable, removable", arms: "3D", standout: "8-point adjustment, 7-yr parts warranty", isSelf: true },
    { name: "Nouhaus Ergo3D", lumbar: "3D adjustable", arms: "4D", standout: "Full mesh with 4D arms, similar price" },
    { name: "Steelcase Leap V2", lumbar: "Adjustable height + firmness", arms: "4D", standout: "Upholstered, huge refurb market" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar, all-mesh, cheaper" },
  ],

  buy: {
    productTitle: "Branch Ergonomic Chair",
    retailerNote: "Amazon · ASIN B0C15B3HN1 · also direct at branchfurniture.com",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Branch also offers its own returns direct. Check the listing." },
      { k: "Warranty", v: "7 years on parts, 3 years on fabrics. Confirm on the listing you order from." },
      { k: "What to check", v: "It's the base Ergonomic Chair (not Pro/Verve/Daily), the seat colour, and whether you want the add-on headrest." },
    ],
    officialStore: {
      label: "Branch (official)",
      note: "Sold direct at branchfurniture.com with all colours and the add-on headrest. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://www.branchfurniture.com/products/ergonomic-chair",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock, colour and configuration change without notice — confirm on the listing. The Amazon link is an affiliate link; the Branch link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Branch Ergonomic Chair is a strong value in the mid-market: a double-mesh back, 3D arms, a removable lumbar and a seat-depth slider give it most of a premium chair's adjustability for well under premium money, and the 7-year parts warranty backs it up. Reviewers also single out its smooth casters and easy assembly.",
    "The recurring knock is the armrests — hard and inclined to slip from a set position — and the headrest is a paid extra. Its measured recline is also on the shallow side. If arm quality is your priority, the step-up Branch Pro (5D arms) is worth comparing; otherwise the base Ergonomic Chair is a well-rounded, long-warrantied pick.",
  ],
  verdictPullQuote:
    "Premium-style adjustability and a long warranty at a mid price — the arms are the compromise.",

  faqs: [
    { q: "Is this the Branch Pro?", a: "No. This is the base Branch Ergonomic Chair (3D arms, 8 points). The Pro adds 5D arms and more adjustment; the Verve and Daily are different chairs." },
    { q: "Does it include a headrest?", a: "No — Branch sells a headrest separately as an accessory." },
    { q: "What's the seat height and depth?", a: "Roughly 17–21 in seat height (higher with the optional tall cylinder) and an 18–22 in seat-depth slider; sources vary, so confirm the configuration on the live page." },
    { q: "What's the weight capacity?", a: "275 lb. Confirm on the listing you order from." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from Branch's specs, the Amazon listing and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Branch (official) / Amazon", v: "branchfurniture.com and the Amazon listing (ASIN B0C15B3HN1), checked 2026-09-10. Basis for the 8-point adjustment, 3D arms, lumbar, seat-depth slider, capacity and warranty." },
    { k: "Published reviews", v: "Third-party reviews (e.g. TechGearLab, Reviewed) summarised for the casters, comfort and armrest cautions and the measured recline; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are for the base Branch Ergonomic Chair as of the date shown and are not independently verified by Furniblog. Seat height/depth vary by cylinder option and the headrest is a separate add-on — confirm the configuration on the listing you buy from.",
  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "Best office chairs under $300: verified picks", href: "/blog/best-office-chairs-under-300-verified-picks" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

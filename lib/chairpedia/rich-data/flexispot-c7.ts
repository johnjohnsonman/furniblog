import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * FlexiSpot C7 (base) — research-based buying guide data.
 * Facts from flexispot.com, the Amazon listing and published reviews (checked
 * 2026-09-10). Base C7 = 3D arms (NOT 4D); C7 Max/Morpher are separate.
 * Seat-height and recline figures conflict between the official table and
 * reviews — flagged. No fixed prices.
 */
export const FLEXISPOT_C7: RichReview = {
  asin: "B0DPQQ2L22",
  eyebrow: "FlexiSpot · Office chairs · Buying guide",
  heroIntro:
    "The FlexiSpot C7 is a mesh-back ergonomic chair whose signature is a self-adaptive dynamic lumbar, backed by a choice of mesh or foam seat, an optional footrest and a long 10-year warranty. This guide covers the base C7, its confirmed features and what to check.",
  verdictOneLiner: "Adaptive lumbar and a 10-year warranty — base C7 has 3D arms, not 4D.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black FlexiSpot C7.",
  galleryBriefs: [],

  quickFactsNote: "Manufacturer-documented features for the base C7. Confirm the selected Amazon configuration.",
  quickFacts: [
    { label: "Model", value: "C7 (base)", note: "Not C7 Max / Morpher / Lite" },
    { label: "Lumbar", value: "Self-adaptive", note: "Dynamic; can be locked" },
    { label: "Armrests", value: "3D", note: "Base C7 (Max is 5D)" },
    { label: "Seat / footrest", value: "Mesh or foam · footrest option", note: "Choose at purchase" },
    { label: "Warranty", value: "10 years", note: "Among the longest here" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The C7 comes in several trims and two seat types. Pick the right one and confirm the fit numbers, which differ between FlexiSpot's page and reviews.",
  checks: [
    { n: "01", title: "Base C7 vs C7 Max / Morpher / Lite", body: "The base C7 has 3D arms and a 2D headrest. The C7 Max adds 5D arms, a 3D headrest, a hybrid seat and deeper recline; the Morpher adds forward tilt and a 380 lb capacity; the Lite is budget. Confirm you're buying the trim you intend (the base C7 is the linked one)." },
    { n: "02", title: "Choose the seat and footrest", body: "The C7 is sold with either a breathable mesh seat or a cushioned foam seat, and with or without a retractable footrest — separate SKUs. Decide seat type and footrest before ordering; capacity is listed as 300 lb in the base C7 specification table; confirm the selected SKU." },
    { n: "03", title: "Confirm the fit numbers", body: "FlexiSpot's current spec table and review articles disagree (seat height ≈ 18.3–21.7 in official vs ≈ 19.9–22.6 in in reviews; recline ≈ 93–110° official vs 90–128° in reviews). Treat the official page as the reference and confirm on the listing for your SKU." },
    { n: "04", title: "Mind the arm/desk clearance", body: "Reviewers note the arms can sit a little high to tuck fully under some desks, and the strong adaptive lumbar can nudge you into a reclined posture. If you sit close and upright, check clearance." },
  ],

  dims: [
    { k: "Seat width", v: "≈ 21 in", tier: "B" },
    { k: "Seat depth", v: "≈ 17–20 in (slider, ~2.4 in)", tier: "B" },
    { k: "Seat height", v: "≈ 18.3–21.7 in (official); reviews cite ≈ 19.9–22.6 in", tier: "C" },
    { k: "Weight capacity", v: "300 lb in the base C7 specification table; confirm the selected SKU", tier: "B" },
    { k: "Recline", v: "≈ 93–110° (official); reviews cite 90–128°, lockable", tier: "C" },
    { k: "Armrests", v: "3D (height, forward/back, swivel) — base C7", tier: "B" },
    { k: "Lumbar", v: "Self-adaptive dynamic; can be locked", tier: "B" },
    { k: "Headrest", v: "Included, 2D (≈ 2.36 in height, ~45° tilt)", tier: "B" },
    { k: "Seat material", v: "Choice of breathable mesh or foam cushion", tier: "B" },
    { k: "Warranty", v: "10 years", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: flexispot.com, Amazon listing (base C7) and published reviews (checked 2026-09-10). Seat-height and recline figures differ between the official table and reviews (likely a spec revision or SKU/region) — the official page is cited and the discrepancy noted.",

  adjustable: [
    { k: "Lumbar", v: "Self-adaptive; responds to posture and can be locked.", src: "FlexiSpot (documented)" },
    { k: "Armrests — 3D", v: "Height, forward/back and swivel.", src: "FlexiSpot (documented)" },
    { k: "Seat depth", v: "Slider, ~2.4 in.", src: "FlexiSpot (documented)" },
    { k: "Headrest", v: "2D — height and tilt.", src: "FlexiSpot (documented)" },
    { k: "Recline", v: "Lockable tilt (range differs by source).", src: "FlexiSpot / reviews (conflict)" },
  ],
  fixed: [
    { k: "Arm tier", v: "Base C7 is 3D — not the Max's 5D.", src: "FlexiSpot (documented)" },
    { k: "Seat type", v: "Chosen at purchase (mesh or foam); not swappable later.", src: "FlexiSpot (documented)" },
  ],

  pros: [
    { t: "Self-adaptive dynamic lumbar is the standout — it responds to posture and can also be locked.", src: "FlexiSpot · published reviews" },
    { t: "Cooling mesh back with a choice of mesh or dense foam seat for all-day comfort.", src: "Published reviews (research)" },
    { t: "Lots of adjustment for the price — 3D arms, 2D headrest, seat-depth slider, lockable recline.", src: "FlexiSpot (documented)" },
    { t: "10-year warranty, among the longest in this group.", src: "FlexiSpot (documented)" },
  ],
  cons: [
    { t: "Base C7 arms are 3D, not 4D — and can sit high for some desks.", src: "FlexiSpot · published reviews" },
    { t: "Official and review spec figures conflict (seat height, recline) — verify your SKU.", src: "FlexiSpot vs reviews" },
    { t: "The strong lumbar can push some users into a reclined rather than upright posture.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The C7 suits",
  forWho: [
    "Buyers who want an adaptive lumbar and a very long warranty",
    "People choosing between a mesh or cushioned seat, optionally with a footrest",
    "Value seekers who want lots of adjustment at a mid price",
  ],
  skipWho: [
    "Need 4D/5D arms (look at the C7 Max)",
    "Sit close to a low desk where high arms won't tuck under",
    "Want a firmly upright-only posture",
  ],

  rivals: [
    { name: "FlexiSpot C7", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar, seat choice, 10-yr warranty", isSelf: true },
    { name: "SIHOO Doro C300", href: "/products/sihoo-doro-c300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "All-mesh, adaptive lumbar, cheaper" },
    { name: "Nouhaus Ergo3D", href: "/products/nouhaus-ergo3d", lumbar: "3D adjustable", arms: "4D", standout: "Full mesh with 4D arms" },
    { name: "Branch Ergonomic Chair", href: "/products/branch-ergonomic-chair", lumbar: "Adjustable, removable", arms: "3D", standout: "Seat-depth slider, 7-yr parts warranty" },
  ],

  buy: {
    productTitle: "FlexiSpot C7 (base)",
    retailerNote: "Amazon · ASIN B0DPQQ2L22 · seat & footrest options are separate SKUs",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check the listing." },
      { k: "Warranty", v: "10 years. Confirm on the listing you order from." },
      { k: "What to check", v: "It's the base C7 (not Max/Morpher/Lite), the seat type (mesh vs foam), and whether the footrest is included." },
    ],
    officialStore: {
      label: "FlexiSpot (official)",
      note: "Sold direct at flexispot.com with all trims, seat types and colours. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://www.flexispot.com/flexispot-best-ergonomic-office-chair-c7",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock, trim and seat/footrest option change without notice — confirm on the listing. The Amazon link is an affiliate link; the FlexiSpot link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The FlexiSpot C7 makes a strong mid-market case built on two things: a self-adaptive lumbar that reviewers consistently praise, and an unusually long 10-year warranty. Add a choice of mesh or foam seat, an optional footrest, 3D arms and a seat-depth slider, and it's a lot of adjustable, breathable chair for the money.",
    "Just buy the right one. The base C7 has 3D arms (the Max is the 5D chair), the fit figures differ between FlexiSpot's page and reviews, and the arms can sit high for close, low desks. Pick your seat type and footrest, confirm the numbers for your SKU, and the C7 is a well-warrantied, comfortable pick.",
  ],
  verdictPullQuote:
    "Adaptive lumbar, seat choice and a 10-year warranty — just don't mistake the base C7's 3D arms for the Max's 5D.",

  faqs: [
    { q: "Does the base C7 have 4D arms?", a: "No — the base C7 has 3D arms. The C7 Max has 5D arms and a 3D headrest." },
    { q: "Mesh or foam seat?", a: "Both are offered as separate SKUs (base C7 specification table lists 300 lb; confirm your SKU), with or without a retractable footrest. Choose before ordering." },
    { q: "What's the recline and seat height?", a: "FlexiSpot's page lists ≈ 93–110° recline and ≈ 18.3–21.7 in seat height; some reviews cite wider ranges. Treat the official page as the reference and confirm your SKU." },
    { q: "Is the lumbar adjustable?", a: "It's a self-adaptive dynamic lumbar that responds to your posture, and it can also be locked." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from FlexiSpot's specs, the Amazon listing and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "FlexiSpot C7 specifications", url: "https://www.flexispot.com/flexispot-best-ergonomic-office-chair-c7", v: "Checked 2026-09-10: the base C7 table lists 3D arms, 300 lb capacity, seat-depth adjustment and a 10-year warranty. This page contains several models; do not apply other tables to the base C7. The Amazon SKU was not independently reverified in this check." },
    { k: "Published reviews", v: "Third-party reviews summarised for comfort, arm-clearance and the conflicting fit figures; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are for the base FlexiSpot C7 as of the date shown and are not independently verified by Furniblog. Seat-height/recline figures differ between the official table and reviews, and trims/seat types vary — confirm the configuration on the listing you buy from.",
}

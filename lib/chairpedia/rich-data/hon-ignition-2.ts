import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * HON Ignition 2.0 — research-based buying guide data.
 * Facts from HON listing text (via search), authorized dealers (Staples,
 * OfficeChairsUSA) and published reviews (checked 2026-09-10). Ignition 2.0 is
 * a highly configurable line, not one SKU — many specs are config-dependent and
 * flagged. Big & Tall is a separate 450 lb model. No fixed prices.
 */
export const HON_IGNITION_2: RichReview = {
  asin: "B07ZGFPQNW",
  eyebrow: "HON · Office chairs · Buying guide",
  heroIntro:
    "The HON Ignition 2.0 is a configurable, contract-grade task chair sold in mesh or upholstered backs with optional adjustable arms, lumbar and headrest, and a full lifetime warranty. This guide covers what's consistent across the line and the options that change what you get.",
  verdictOneLiner: "A durable, configurable contract chair — what you get depends on the options you pick.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black HON Ignition 2.0 mesh task chair.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from HON listing text, authorized dealers and reviews (config-dependent).",
  quickFacts: [
    { label: "Type", value: "Configurable task", note: "Mesh or upholstered back" },
    { label: "Weight capacity", value: "300 lb", note: "Big & Tall model is 450 lb" },
    { label: "Arms", value: "Optional adjustable", note: "Many sold armless" },
    { label: "Lumbar", value: "Optional adjustable", note: "Add-on; thin per reviews" },
    { label: "Warranty", value: "Full lifetime", note: "Textiles may be shorter" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "\"Ignition 2.0\" is a line, not one chair. The single most important step is confirming exactly which configuration a listing is.",
  checks: [
    { n: "01", title: "Confirm the configuration", body: "The Ignition 2.0 is sold in many builds: mesh or upholstered back, mid- or high-back, and armless or with adjustable arms. Arms, adjustable lumbar and a headrest are often paid options — a cheaper listing may be armless with no lumbar. Read exactly what the listing includes." },
    { n: "02", title: "Standard vs Big & Tall", body: "The standard chair is rated 300 lb. There's a separate reinforced Big & Tall model rated 450 lb with a wider seat and different dimensions. If you need the higher capacity, buy that model specifically." },
    { n: "03", title: "Set expectations on the lumbar", body: "When fitted, the adjustable lumbar moves vertically but reviewers describe it as a thin plastic piece rather than a padded support — hit-or-miss by body type. If lumbar support is critical, weigh this." },
    { n: "04", title: "Confirm the fit numbers on your build", body: "Seat height is cited around 17–22 in depending on source and build, and overall dimensions vary by back height. Confirm the seat height and dimensions on the specific listing before ordering." },
  ],

  dims: [
    { k: "Overall (mid-back)", v: "≈ 27 in W × 28.5 in D × 44.5 in H (varies by build)", tier: "C" },
    { k: "Seat", v: "≈ 20 in W × 19 in D (mid-back)", tier: "B" },
    { k: "Seat height", v: "≈ 17–22 in (sources/build vary)", tier: "C" },
    { k: "Weight capacity", v: "300 lb standard · 450 lb Big & Tall", tier: "B" },
    { k: "Recline", v: "Synchro-tilt with tension + tilt lock (~20°, multiple positions)", tier: "B" },
    { k: "Armrests", v: "Optional adjustable (height + width; Big & Tall adds pivot)", tier: "B" },
    { k: "Lumbar", v: "Optional adjustable (vertical); thin per reviewers", tier: "C" },
    { k: "Headrest", v: "None standard; optional on some builds", tier: "B" },
    { k: "Back material", v: "4-way stretch mesh or upholstered", tier: "B" },
    { k: "Warranty", v: "HON full lifetime limited (textiles may be shorter)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: HON listing text (via search — hon.com blocks automated access), authorized dealers (Staples, OfficeChairsUSA) and reviews (checked 2026-09-10). Many specs are configuration-dependent; confirm dimensions, arms, lumbar and warranty terms on the exact listing.",

  adjustable: [
    { k: "Recline", v: "Synchro-tilt with tension and a tilt lock.", src: "HON / dealers (documented)" },
    { k: "Armrests (option)", v: "Height and width; Big & Tall adds pivot.", src: "Dealers (documented)" },
    { k: "Lumbar (option)", v: "Vertical adjustment when fitted.", src: "Dealers / reviews" },
    { k: "Seat height", v: "Pneumatic, ≈ 17–22 in by build.", src: "Dealers (documented)" },
  ],
  fixed: [
    { k: "Arms/lumbar/headrest", v: "Often optional — absent unless the configuration includes them.", src: "HON / dealers" },
    { k: "Capacity", v: "300 lb unless it's the separate Big & Tall (450 lb).", src: "HON / dealers" },
  ],

  pros: [
    { t: "Strong adjustability for the segment when configured with adjustable arms and lumbar.", src: "Published reviews (research)" },
    { t: "Breathable 4-way stretch mesh back that reviewers say stays cool.", src: "Published reviews (research)" },
    { t: "Sturdy, contract-grade build with easy assembly and a full lifetime warranty.", src: "HON · published reviews" },
    { t: "A dedicated Big & Tall model rated to 450 lb.", src: "HON / dealers (documented)" },
  ],
  cons: [
    { t: "The optional lumbar is a thin plastic piece — support is hit-or-miss by body type.", src: "Published reviews (research)" },
    { t: "No standard headrest, and arms/lumbar are often paid add-ons.", src: "HON / dealers" },
    { t: "Configuration complexity makes it easy to buy a more basic build than expected.", src: "Our reading" },
  ],

  forWhoTitle: "The Ignition 2.0 suits",
  forWho: [
    "Buyers who want a durable, contract-grade chair with a lifetime warranty",
    "Offices configuring arms/lumbar to a spec and colour",
    "Heavier users (via the dedicated 450 lb Big & Tall model)",
  ],
  skipWho: [
    "Want a plush, deeply padded lumbar out of the box",
    "Need a headrest included as standard",
    "Prefer a single simple SKU over configuration choices",
  ],

  rivals: [
    { name: "HON Ignition 2.0", lumbar: "Optional adjustable (thin)", arms: "Optional adjustable", standout: "Contract-grade, lifetime warranty, Big & Tall option", isSelf: true },
    { name: "Steelcase Series 2", lumbar: "Adjustable", arms: "4D (option)", standout: "Contract chair, more refined" },
    { name: "Branch Ergonomic Chair", lumbar: "Adjustable, removable", arms: "3D", standout: "More included adjustment for home use" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "All-mesh, adaptive lumbar, cheaper" },
  ],

  buy: {
    productTitle: "HON Ignition 2.0 Task Chair",
    retailerNote: "Amazon · ASIN B07ZGFPQNW · configuration varies by listing",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check the listing." },
      { k: "Warranty", v: "HON full lifetime limited; textile/mesh/foam terms may be shorter. Confirm on the listing." },
      { k: "What to check", v: "Back type (mesh vs upholstered), whether arms and lumbar are included, and standard vs Big & Tall." },
    ],
    officialStore: {
      label: "HON (official)",
      note: "Configure and view specs at hon.com (also sold via authorized dealers). Direct link (not an affiliate link). Check current price at a dealer.",
      url: "https://www.hon.com/chairs/ignition",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and the exact configuration change by listing — confirm before buying. The Amazon link is an affiliate link; the HON link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The HON Ignition 2.0 is a sensible pick when you want a durable, contract-grade chair rather than a feature showcase: a breathable mesh (or upholstered) back, synchro-tilt, and a full lifetime warranty from a major contract brand, with a dedicated 450 lb Big & Tall model for heavier users. Configured with adjustable arms and lumbar, it's genuinely adjustable for the segment.",
    "The catch is that it's a configuration, not a single chair — arms, lumbar and a headrest are often paid options, and the lumbar, when fitted, is thin. Read exactly what a listing includes before buying, and don't assume the cheapest one has the arms or lumbar you want. Get the build right and it's a dependable, long-warrantied workhorse.",
  ],
  verdictPullQuote:
    "A durable, lifetime-warrantied workhorse — just confirm the build, because arms and lumbar are often extra.",

  faqs: [
    { q: "Does the Ignition 2.0 come with adjustable arms and lumbar?", a: "Not always — they're frequently paid options. Some listings are armless with no adjustable lumbar. Confirm exactly what the listing includes." },
    { q: "What's the weight capacity?", a: "300 lb for the standard chair; there's a separate Big & Tall model rated 450 lb." },
    { q: "Is there a headrest?", a: "No headrest is standard; it's an option on some builds." },
    { q: "Mesh or upholstered?", a: "Both are offered. The mesh back is the breathable option; upholstered/fabric and vinyl seats are also available." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from HON's listing text, dealer specs and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "HON / dealers", v: "HON listing text (via search; hon.com blocks automated access) and authorized dealers (Staples, OfficeChairsUSA), checked 2026-09-10. Basis for configurations, capacity, tilt and warranty." },
    { k: "Amazon listing", v: "HON Ignition 2.0 — ASIN B07ZGFPQNW. Basis for the linked build; configuration varies by listing." },
    { k: "Published reviews", v: "Third-party reviews summarised for the mesh, build and lumbar cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are configuration-dependent and combine HON/dealer figures with published reviews as of the date shown; they are not independently verified by Furniblog. Confirm the exact build (back, arms, lumbar, capacity) on the listing you buy from.",
}

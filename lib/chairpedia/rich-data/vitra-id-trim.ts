import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Vitra ID Trim (from the ID Chair Concept family by Antonio Citterio) —
 * research-based buying-guide data. Facts from vitra.com and published reviews
 * (checked 2026-09-10). We feature the ID Trim specifically (slim sandwich-
 * construction back with integrated lumbar). Several fit numbers are not
 * published on Vitra's pages and are marked as such. No fixed prices.
 */
export const VITRA_ID_TRIM: RichReview = {
  asin: null,
  eyebrow: "Vitra · Office chairs · Buying guide",
  heroIntro:
    "The Vitra ID Trim is one member of Antonio Citterio's modular ID Chair Concept — the version with a slim \"sandwich-construction\" back and an integrated lumbar, giving upholstered comfort in a profile almost as thin as mesh. This guide explains the ID family's back types, the ID Trim's options, and how to buy one.",
  verdictOneLiner: "A designer contract chair: pick the back type first, then the mechanism and arms.",
  verdictNote: "Research-based guide — hands-on lab test not completed.",

  heroShotBrief: "Front, Vitra ID Trim with the slim upholstered back.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from vitra.com and published reviews (checked 2026-09-10); several fit numbers are not published by Vitra.",
  quickFacts: [
    { label: "Designer", value: "Antonio Citterio", note: "ID Chair Concept family" },
    { label: "This model", value: "ID Trim", note: "Slim back + integrated lumbar" },
    { label: "Mechanism", value: "FlowMotion / AutoMotion", note: "Synchro or self-adjusting" },
    { label: "Arms", value: "Up to 3D + 360° pads", note: "Range of arm types" },
    { label: "US purchase", value: "Vitra shop / dealer", note: "Not on US Amazon" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "\"ID Chair\" is a family, not one chair. The first decision is the back type; then the mechanism and arms. Confirm these before ordering.",
  checks: [
    { n: "01", title: "Choose the back type — this defines the chair", body: "The ID Chair Concept comes as ID Air (perforated plastic back), ID Mesh (padded mesh back), ID Soft (fully upholstered classic back) and ID Trim (a slim sandwich-construction back with an integrated lumbar). This guide covers the ID Trim; a taller \"ID Trim L\" back is offered for larger users. Make sure the listing is the ID Trim you want." },
    { n: "02", title: "FlowMotion or AutoMotion mechanism", body: "FlowMotion is Vitra's patented synchronised recline that you can adjust while seated; AutoMotion is a self-adjusting mechanism that sets resistance to your weight automatically. Decide whether you want to dial it in or let the chair do it." },
    { n: "03", title: "Arms and base", body: "Arms range up to 3D (height, width, depth) with 360°-rotatable pads, with simpler options in the range; the base and finishes are configurable. Confirm the arm type and finish on your order." },
    { n: "04", title: "Sort out the US buying path and specs", body: "There's no US Amazon product page — genuine ID Trim is bought through Vitra's online shop or authorized dealers. Vitra doesn't publish some fit numbers (seat-height range, weight capacity, warranty) on the product pages, so request the spec sheet from your seller before buying." },
  ],

  dims: [
    { k: "Back", v: "ID Trim: slim sandwich-construction with integrated lumbar; ID Trim L is a higher back", tier: "B" },
    { k: "Mechanism", v: "FlowMotion (patented synchro, adjustable while seated) or self-adjusting AutoMotion", tier: "B" },
    { k: "Armrests", v: "Up to 3D (height/width/depth) with 360°-rotatable pads; simpler arm options in the range", tier: "B" },
    { k: "Durability", v: "Tested to simulate a ~15-year service life", tier: "B" },
    { k: "Seat height", v: "Not published on Vitra's product page", tier: "C" },
    { k: "Weight capacity", v: "Not published on Vitra's product page", tier: "C" },
    { k: "Warranty", v: "Not stated on the product page (varies by market)", tier: "C" },
  ],
  dimsSourceNote:
    "Sources: vitra.com ID Trim / ID Trim L / ID Chair Concept pages and published reviews (checked 2026-09-10). Vitra does not publish the seat-height range, weight capacity or warranty on these pages — request the spec sheet from your seller before treating those as confirmed.",

  adjustable: [
    { k: "FlowMotion mechanism", v: "Patented synchronised recline you can adjust while seated.", src: "Vitra (documented)" },
    { k: "Armrests (3D build)", v: "Height, width and depth, with 360°-rotatable pads.", src: "Vitra (documented)" },
    { k: "Integrated lumbar", v: "Built into the slim ID Trim back.", src: "Vitra (documented)" },
  ],
  fixed: [
    { k: "Back type", v: "Chosen at order (Air / Mesh / Soft / Trim) — not changeable after.", src: "Vitra (documented)" },
    { k: "AutoMotion resistance", v: "Self-adjusts to your weight; no manual tension on that mechanism.", src: "Vitra (documented)" },
    { k: "Published fit numbers", v: "Seat height, capacity and warranty are not on the product page.", src: "Vitra (documented)" },
  ],

  pros: [
    { t: "Antonio Citterio design with a slim, refined silhouette — a genuine design object for the office.", src: "Published reviews (research)" },
    { t: "The sandwich-construction ID Trim back gives upholstered comfort with an integrated lumbar in a near-mesh-thin profile.", src: "Vitra (documented)" },
    { t: "Patented FlowMotion synchro (or self-adjusting AutoMotion) and a design tested to ~15 years of service life.", src: "Vitra (documented)" },
  ],
  cons: [
    { t: "Hard to buy in the US — Vitra shop or authorized dealer only, no Amazon product page.", src: "Our reading" },
    { t: "Vitra doesn't publish seat-height, capacity or warranty on the product pages — you must ask.", src: "Vitra (documented)" },
    { t: "Premium, design-led pricing; the family's option list can be confusing.", src: "Our reading" },
  ],

  forWhoTitle: "ID Trim shines for",
  forWho: [
    "Buyers who want a design-led contract chair with a refined, slim profile",
    "People who like an integrated lumbar and upholstered comfort without a bulky back",
    "Those who'll buy through Vitra's shop or a dealer and can request full specs",
  ],
  skipWho: [
    "Want a simple US Amazon purchase with easy returns",
    "Need published weight-capacity and seat-height numbers up front",
    "Prefer an all-mesh back (consider the ID Mesh instead)",
  ],

  rivals: [
    { name: "Vitra ID Trim", lumbar: "Integrated (in the slim back)", arms: "Up to 3D + 360° pads", standout: "Citterio design; slim sandwich-construction back", isSelf: true },
    { name: "Vitra ID Mesh", lumbar: "Integrated", arms: "Up to 3D", standout: "Same family, padded mesh back" },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Up to fully adjustable", standout: "All-mesh, three sizes, easy US buying" },
    { name: "Steelcase Gesture", lumbar: "LiveBack", arms: "360-degree", standout: "Most flexible arms, US-common" },
  ],

  buy: {
    productTitle: "Vitra ID Trim (ID Chair Concept)",
    retailerNote: "US: Vitra online shop / authorized dealer — no US Amazon product page",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Depends on Vitra's shop or the dealer; there's no Amazon product page. Confirm the return policy before buying." },
      { k: "Warranty", v: "Not stated on Vitra's product page and varies by market — confirm coverage with your seller." },
      { k: "What to check", v: "Back type (ID Trim vs Trim L / other family members), mechanism (FlowMotion vs AutoMotion), arm type, finish, and the full spec sheet." },
    ],
    officialStore: {
      label: "Vitra (official)",
      note: "ID Trim, ID Trim L and the full ID Chair Concept range at vitra.com; US buyers use the Vitra shop or authorized dealers. Direct link (not an affiliate link).",
      url: "https://www.vitra.com/en-us/product/details/id-trim",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock, options and — because Vitra doesn't publish them here — several fit numbers vary. In the US this is a Vitra-shop or dealer purchase. The Amazon search link is an affiliate link and will mostly surface unrelated items; the Vitra link is a direct, non-affiliate link. Confirm the exact model and specs with your seller.",
  },

  verdict: [
    "The ID Trim is the design-object entry to Antonio Citterio's modular ID Chair Concept. Where the family also offers a perforated plastic (ID Air), padded mesh (ID Mesh) and fully upholstered (ID Soft) back, the ID Trim's slim \"sandwich-construction\" back with an integrated lumbar gives upholstered comfort in a profile nearly as thin as mesh — paired with Vitra's patented FlowMotion synchro (or a self-adjusting AutoMotion) and up-to-3D arms with rotating pads, in a chair engineered to a ~15-year service life.",
    "The friction is information and access. Vitra doesn't publish the seat-height range, weight capacity or warranty on these pages, and in the US it's a Vitra-shop or dealer purchase rather than a click-to-buy Amazon product — so request the full spec sheet and confirm the seller before committing. If you want a refined, design-led contract chair and don't mind that process, the ID Trim is distinctive in a way the American flagships aren't; if you want published numbers and easy returns, an Aeron is simpler.",
  ],
  verdictPullQuote:
    "A Citterio design with a slim integrated-lumbar back — decide the back type, then get the full spec sheet from your seller.",

  faqs: [
    { q: "What's the difference between ID Trim, Mesh, Soft and Air?", a: "They're back types in the same ID Chair Concept family: ID Air (perforated plastic), ID Mesh (padded mesh), ID Soft (fully upholstered), and ID Trim (a slim sandwich-construction back with an integrated lumbar). This guide covers the ID Trim." },
    { q: "FlowMotion or AutoMotion?", a: "FlowMotion is Vitra's patented synchronised recline you can adjust while seated; AutoMotion self-adjusts its resistance to your weight. Choose whether you want to dial it in or let the chair do it." },
    { q: "Can I buy it on US Amazon?", a: "Not as a genuine product page. In the US the ID Trim is bought through Vitra's online shop or authorized dealers." },
    { q: "What's the weight capacity and seat-height range?", a: "Vitra doesn't publish those on the ID Trim product pages. Request the spec sheet from your seller before buying." },
    { q: "Has Furniblog tested this chair?", a: "Not with our own instruments. This is a research-based guide from Vitra's pages and published reviews; the deep-dive below adds context." },
  ],

  sources: [
    { k: "Vitra (official)", v: "vitra.com ID Trim, ID Trim L and ID Chair Concept pages, checked 2026-09-10. Basis for back types, mechanism, arms and service-life testing." },
    { k: "Published reviews", v: "Third-party coverage summarised for design and positioning; not first-hand." },
    { k: "Not published", v: "Seat-height range, weight capacity and warranty are not stated on Vitra's product pages — request the spec sheet from your seller." },
  ],
  sourcesFooter:
    "Specifications are Vitra's published information plus reviews as of the date shown and are not independently verified by Furniblog. Vitra does not publish some fit numbers on these pages, and US purchase is via the Vitra shop or dealers — confirm the exact model, specs, warranty and seller before buying.",
}

import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Ticova Ergonomic Office Chair — research-based buying guide data.
 * Specs from the Ticova manual for ASIN B08LBJXVSP (the linked model), the
 * official site and published reviews (checked 2026-09-10). Conflicts flagged:
 * recline 130° vs 140° by listing; warranty 1yr official vs a review's 2yr;
 * seat foam 3 vs 3.5 in. No fixed prices.
 */
export const TICOVA_ERGONOMIC: RichReview = {
  asin: "B08LBJXVSP",
  eyebrow: "Ticova · Office chairs · Buying guide",
  heroIntro:
    "The Ticova Ergonomic Office Chair is a high-back mesh chair that packs two-axis lumbar, genuine 3D armrests and an adjustable, removable headrest into a budget price. This guide covers its confirmed features, fit and what to check before buying.",
  verdictOneLiner: "Two-axis lumbar and 3D arms at a budget price — with durability to watch.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black Ticova mesh chair.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from the Ticova manual (ASIN B08LBJXVSP) and official specs.",
  quickFacts: [
    { label: "Weight capacity", value: "280 lb", note: "Best fit ≈ 5'4\"–6'2\"" },
    { label: "Armrests", value: "3D", note: "Height, 40° rotation, fwd/back" },
    { label: "Lumbar", value: "2-axis", note: "Height + depth via knob" },
    { label: "Headrest", value: "Adjustable", note: "Height + angle; removable" },
    { label: "Back / seat", value: "Mesh back, foam seat", note: "W-shaped cushion" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The Ticova is unusually adjustable for the price; the things to confirm are the recline rating on your listing and whether the size and capacity fit you.",
  checks: [
    { n: "01", title: "Check the linked model's recline rating", body: "The linked Amazon listing (B08LBJXVSP) advertises 130° recline. Do not assume a 140° specification from another listing applies to this model. Confirm the selected version before buying." },
    { n: "02", title: "Confirm the fit range and capacity", body: "The chair is rated to 280 lb and reviewers put the comfortable fit around 5'4\"–6'2\". The seat is roughly 20.5 in deep and does not adjust, so shorter sitters should check it isn't too deep." },
    { n: "03", title: "Use the two-axis lumbar and 3D arms", body: "Unusually for the price, the lumbar adjusts for both height (~1.6 in) and depth (~1.4 in) via a knob, and the arms move in three directions (height ~2.8 in, 40° rotation, forward/back ~2.4 in). If you want a chair you can dial in, this is a strength — set it up rather than leaving defaults." },
    { n: "04", title: "Weigh the durability reports", body: "The most common long-term complaints are the gas cylinder sinking after a year or two and the mesh softening over time. Keep your receipt and register for warranty; note the warranty term differs by source (see below)." },
  ],

  dims: [
    { k: "Seat height", v: "≈ 16.5–20.5 in (gas lift)", tier: "B" },
    { k: "Seat", v: "≈ 20.5 in wide × 20.5 in deep, fixed (no depth slider)", tier: "B" },
    { k: "Weight capacity", v: "280 lb", tier: "A" },
    { k: "Recline", v: "130° advertised on the linked Amazon listing (B08LBJXVSP)", tier: "A" },
    { k: "Armrests — 3D", v: "Height ~2.8 in, 40° rotation, forward/back ~2.4 in", tier: "B" },
    { k: "Lumbar", v: "Adjustable height ~1.6 in and depth ~1.4 in", tier: "B" },
    { k: "Headrest", v: "Adjustable height ~5.1 in and angle to ~135°; removable", tier: "B" },
    { k: "Back / seat", v: "Breathable mesh back; high-density foam seat (≈ 3–3.5 in)", tier: "B" },
    { k: "Warranty", v: "1 year per Ticova support page; confirm seller return terms", tier: "B" },
  ],
  dimsSourceNote:
    "Source: Ticova manual (ASIN B08LBJXVSP), official site and published reviews (checked 2026-09-10). Assembled overall dimensions are not reliably published. Confirm recline and warranty on the listing you buy from.",

  adjustable: [
    { k: "Armrests — 3D", v: "Height, 40° rotation and forward/back.", src: "Ticova manual (documented)" },
    { k: "Lumbar", v: "Height and depth via a backrest knob.", src: "Ticova manual (documented)" },
    { k: "Headrest", v: "Height and angle; fully removable.", src: "Ticova manual (documented)" },
    { k: "Seat height", v: "Gas lift, ≈ 16.5–20.5 in.", src: "Published reviews (research)" },
    { k: "Recline", v: "130° advertised recline on ASIN B08LBJXVSP.", src: "Amazon listing" },
  ],
  fixed: [
    { k: "Seat depth", v: "≈ 20.5 in, no depth adjustment.", src: "Published reviews" },
    { k: "Seat material", v: "Foam cushion (not mesh).", src: "Official / manual" },
    { k: "Assembled dimensions", v: "Not reliably published; confirm on the listing.", src: "Not confirmed" },
  ],

  pros: [
    { t: "Two-axis (height + depth) lumbar adjustment, rare at this budget tier.", src: "Ticova manual · published reviews" },
    { t: "Genuine 3D armrests plus an adjustable, removable headrest for taller users.", src: "Ticova manual (documented)" },
    { t: "Thick high-density foam seat that reviewers praise for long sessions; strong value.", src: "Published reviews (research)" },
  ],
  cons: [
    { t: "Durability reports: gas cylinder can sink and mesh can soften after 1–2 years.", src: "Published reviews (research)" },
    { t: "Seat is deep and non-adjustable — less ideal for shorter sitters.", src: "Published reviews (research)" },
    { t: "Assembly is fiddly and armrest padding is firm, per reviewers.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The Ticova suits",
  forWho: [
    "Value hunters who still want real lumbar, 3D arms and a headrest",
    "Taller sitters (up to ~6'2\") who want adjustable neck support",
    "People who will take a few minutes to dial in the adjustments",
  ],
  skipWho: [
    "Are shorter and need a shallow or depth-adjustable seat",
    "Want long-term, heavy-duty durability above all",
    "Weigh more than 280 lb",
  ],

  rivals: [
    { name: "Ticova Ergonomic", lumbar: "2-axis (height + depth)", arms: "3D", standout: "Lots of adjustment for a budget mesh chair", isSelf: true },
    { name: "Duramont Ergonomic", href: "/products/duramont-ergonomic", lumbar: "Adjustable (small range)", arms: "~2D", standout: "High-back mesh, 5-yr warranty" },
    { name: "Gabrylly Ergonomic", href: "/products/gabrylly-ergonomic", lumbar: "Adjustable pad", arms: "Flip-up", standout: "Breathable double mesh, flip-up arms" },
    { name: "SIHOO Doro C300", href: "/products/sihoo-doro-c300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar, all-mesh" },
  ],

  buy: {
    productTitle: "Ticova Ergonomic Office Chair",
    retailerNote: "Amazon · ASIN B08LBJXVSP",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Ticova also lists a 30-day money-back. Check the listing." },
      { k: "Warranty", v: "Ticova support states 1 year. Confirm eligibility and coverage with the seller." },
      { k: "What to check", v: "Match ASIN B08LBJXVSP, the advertised 130° recline, colour and headrest to the selected listing." },
    ],
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and the exact recline batch change without notice — confirm on the listing. Affiliate link; commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Ticova has earned its popularity by giving budget buyers adjustments they usually have to pay more for: a lumbar that moves in two axes, true 3D armrests, and a removable headrest that actually helps taller sitters. Paired with a thick foam seat, it's one of the more complete sub-premium mesh chairs to set up for a precise fit.",
    "The reservations are about longevity and fit, not features. Reviewers repeatedly flag the gas cylinder sinking and mesh softening over a year or two, and the deep, fixed seat suits average-to-taller frames better than shorter ones. If you're within its size range and value adjustability per dollar, it's a strong pick — just register the warranty and set expectations on durability.",
  ],
  verdictPullQuote:
    "Premium-style adjustability at a budget price — best for average-to-taller sitters who'll actually dial it in.",

  faqs: [
    { q: "Is the recline 130° or 140°?", a: "The linked Amazon listing, ASIN B08LBJXVSP, advertises 130°. A 140° claim from another listing is not confirmed for this model. Check the selected version before ordering." },
    { q: "What's the weight capacity and fit range?", a: "280 lb, with a comfortable fit around 5'4\"–6'2\" per reviewers. The seat is deep and doesn't adjust." },
    { q: "Are the armrests really 3D?", a: "Yes — the manual specifies height, 40° rotation and forward/back movement." },
    { q: "How long is the warranty?", a: "Ticova's installation/support page states a one-year warranty. Return eligibility is separate and should be checked with the seller." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from the Ticova manual, official specs and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Ticova manual / official", v: "Manual for ASIN B08LBJXVSP and ticova.net, checked 2026-09-10. Basis for capacity, 3D arms, 2-axis lumbar, headrest and materials." },
    { k: "Amazon listing", url: "https://www.amazon.com/dp/B08LBJXVSP", v: "ASIN B08LBJXVSP: the retrieved listing title specifies 130-degree recline, 3D arms and adjustable lumbar support. Listing content is not a hands-on measurement." },
    { k: "Ticova installation and support", url: "https://www.ticova.net/installation-guide/", v: "Checked 2026-09-10: states a one-year warranty for ergonomic chairs and directs customers to contact Ticova through Amazon." },
    { k: "Published reviews", v: "Third-party reviews summarised for the value and durability notes; not first-hand." },
  ],
  sourcesFooter:
    "Specifications combine Ticova's manual/official figures with published reviews as of the date shown and are not independently verified by Furniblog. Recline rating and warranty vary by listing — confirm on the one you buy from.",
}

import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Hbada P5 (with footrest) — research-based buying guide data.
 * Listing facts from the Amazon listing title (ASIN B0BWDQX8RH, checked
 * 2026-09-09): "with Footrest", "2D Headrest", "Adjustable Lumbar Support and
 * Height", "Mesh", "Swivel Tilt Function", "Black".
 * Dimensions/capacity documented by Hbada / retailers. No fixed prices.
 * Note: Hbada's US site now features the newer P2; the P5 remains listed on
 * Amazon and on Hbada's Canadian store.
 */
export const HBADA_P5: RichReview = {
  asin: "B0BWDQX8RH",
  eyebrow: "Hbada · Office chairs · Buying guide",
  heroIntro:
    "The Hbada P5 is a mesh-back ergonomic chair whose defining feature is a retractable footrest, paired with a 2D adjustable lumbar and a 2D headrest. This guide covers its confirmed features, fit and what to check before buying.",
  verdictOneLiner: "A mesh-back chair with a retractable footrest, 2D lumbar and 2D headrest.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Black P5 with footrest, office setting.",
  galleryBriefs: [],

  quickFacts: [
    { label: "Model", value: "P5 (with footrest)", note: "Black. Also sold in Gray." },
    { label: "Weight capacity", value: "300 lb", note: "Per documented specs" },
    { label: "Footrest", value: "Retractable", note: "Defining feature of this version" },
    { label: "Lumbar · headrest", value: "2D each", note: "Lumbar up/down + in/out; 2D headrest" },
    { label: "Back / seat", value: "Mesh back, cushioned seat", note: "Innerspring/foam seat" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The P5 is sold in footrest and non-footrest versions, and Hbada also sells a newer P2 that looks similar. Confirm you are ordering the exact chair you want.",
  checks: [
    { n: "01", title: "Confirm you are buying the P5 with footrest", body: "The linked listing is the P5 with footrest, in Black (ASIN B0BWDQX8RH). Hbada sells the P5 with and without a footrest, and its US site now leads with a newer P2. Read \"P5\" and \"footrest\" in the title before ordering." },
    { n: "02", title: "The footrest is the reason to pick this chair", body: "If you want the retractable footrest for occasional reclining or short breaks, the P5 is built around it. If you do not need a footrest, a cheaper non-footrest chair may serve you better." },
    { n: "03", title: "Take the capacity and dimensions from the listing", body: "Documented specs put the weight capacity at 300 lb, overall height around 49.4 in and seat depth around 17 in. Confirm these on the listing you order from, and compare the seat height with your desk. A stated maximum is a test rating, not a durability promise for any particular body." },
    { n: "04", title: "Check the return window before buying", body: "An Amazon order follows Amazon's return window, which depends on who the seller is. Check it on the listing before you buy." },
  ],

  dims: [
    { k: "Overall dimensions", v: "27.56 in W × 27.56 in D × 49.41 in H", tier: "B" },
    { k: "Seat depth", v: "~17 in", tier: "B" },
    { k: "Weight capacity", v: "300 lb", tier: "B" },
    { k: "Footrest", v: "Retractable, tucks under the seat", tier: "A" },
    { k: "Lumbar", v: "2D adjustable (up/down and forward/back)", tier: "B" },
    { k: "Headrest", v: "2D adjustable", tier: "A" },
    { k: "Recline", v: "Reclining backrest with tilt (up to ~135° per manufacturer imagery)", tier: "B" },
    { k: "Product weight", v: "~44 lb", tier: "B" },
    { k: "Back / seat", v: "Mesh back; cushioned (innerspring/foam) seat", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: Amazon listing title (ASIN B0BWDQX8RH) for the footrest and 2D headrest; Hbada and retailers for dimensions, capacity and lumbar. \"Not confirmed\" figures should be taken from the listing you buy from.",

  adjustable: [
    { k: "Footrest", v: "Retractable — pull out to recline, tuck away when not needed.", src: "Amazon listing (confirmed)" },
    { k: "Lumbar support", v: "2D — height and forward/back depth.", src: "Hbada specs (documented)" },
    { k: "Headrest", v: "2D adjustable.", src: "Amazon listing (confirmed)" },
    { k: "Height", v: "Gas-lift seat height, with swivel and tilt.", src: "Amazon listing (confirmed)" },
    { k: "Recline", v: "Reclining backrest with tilt lock (angle per manufacturer imagery).", src: "Hbada imagery (documented)" },
  ],
  fixed: [
    { k: "Seat material", v: "Cushioned seat — not a mesh seat.", src: "Hbada specs" },
    { k: "Armrest degrees of freedom", v: "Adjustable arms; exact axes (2D/3D) not confirmed for this listing.", src: "Not confirmed" },
    { k: "Seat depth slider", v: "No published seat-depth adjustment.", src: "Not confirmed" },
  ],

  pros: [
    { t: "Retractable footrest is uncommon at this price and useful for short breaks.", src: "Amazon listing (confirmed)" },
    { t: "2D lumbar and 2D headrest give more tuning than most budget chairs.", src: "Amazon listing · Hbada specs" },
    { t: "Cushioned seat over an innerspring/foam base that some sitters prefer to firm mesh.", src: "Hbada specs · published reviews" },
  ],
  cons: [
    { t: "The seat is cushioned, not mesh — less airflow than a full-mesh chair.", src: "Hbada specs" },
    { t: "Armrest adjustment range is not clearly documented for this listing.", src: "Product documentation, our reading" },
    { t: "Hbada's US site has moved on to a newer model, so long-term parts/support for the P5 are worth checking.", src: "Manufacturer site, our reading" },
  ],

  forWhoTitle: "The P5 suits",
  forWho: [
    "Buyers who specifically want a built-in retractable footrest",
    "Home-office setups that mix focused work with short reclining breaks",
    "Those who prefer a cushioned seat and want 2D lumbar tuning on a budget",
  ],
  skipWho: [
    "Want a breathable full-mesh seat",
    "Don't need a footrest (a cheaper chair will do)",
    "Need documented 4D armrests",
  ],

  rivals: [
    { name: "Hbada P5", lumbar: "2D adjustable", arms: "Adjustable", standout: "Retractable footrest at a budget price", isSelf: true },
    { name: "SIHOO M18", lumbar: "Adjustable (height + depth)", arms: "2D", standout: "Cushioned seat + headrest, cheaper, no footrest" },
    { name: "Nouhaus Ergo3D", lumbar: "3D adjustable", arms: "4D", standout: "Full mesh with 4D arms, step up" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar and full mesh" },
  ],

  buy: {
    productTitle: "Hbada P5 with Footrest — Black",
    retailerNote: "Amazon · ASIN B0BWDQX8RH · footrest version, also sold in Gray",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check it on the listing." },
      { k: "Warranty", v: "Confirm the warranty terms on the listing you order from." },
      { k: "What to check", v: 'Title says "P5", "with Footrest", the colour you want, and who it is sold and shipped by.' },
    ],
    disclaimer:
      'Not verified by Furniblog: price, seller ("sold by"), stock and colour availability change without notice — confirm all of them on the Amazon listing. Affiliate link; commission does not change the price you pay or what this guide says.',
  },

  verdict: [
    "The Hbada P5's pitch is simple: a mesh-back ergonomic chair with a retractable footrest, plus 2D lumbar and a 2D headrest, at a mid-budget price. If a footrest is on your must-have list, the P5 is one of the more affordable ways to get one without dropping to a no-name chair, and the 2D lumbar gives you more back tuning than most chairs at this price.",
    "The trade-offs are a cushioned (not mesh) seat, an armrest range that isn't clearly documented, and the fact that Hbada's US site has already moved on to a newer model — so it's worth confirming current stock, price and support on the listing before buying. If you don't need the footrest, a cheaper chair will do the same job.",
  ],
  verdictPullQuote:
    "Buy it for the footrest and the 2D lumbar; look elsewhere if you want an all-mesh seat.",

  faqs: [
    { q: "Does the P5 come with a footrest?", a: "The linked listing (ASIN B0BWDQX8RH) is the P5 with a retractable footrest. Hbada also sells a version without a footrest — check the title before ordering." },
    { q: "What is the weight capacity?", a: "Documented specs put it at 300 lb. Confirm on the listing you order from." },
    { q: "Is the seat mesh?", a: "The back is mesh; the seat is a cushioned (innerspring/foam) seat, not mesh." },
    { q: "Is the P5 still current?", a: "It remains on Amazon, but Hbada's US site now leads with a newer P2. Check current stock, price and support on the listing." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide built from the Amazon listing, Hbada's documentation and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Amazon listing", v: "Hbada P5 with Footrest, Black — ASIN B0BWDQX8RH. Title checked 2026-09-09. Basis for the footrest, 2D headrest and adjustable lumbar." },
    { k: "Hbada / retailer specs", v: "Hbada product information (incl. the Canadian store) and retailers, read 2026-09-09. Basis for dimensions, 300 lb capacity, lumbar and recline." },
    { k: "Published reviews", v: "Third-party reviews summarised for the Cautions and comfort notes; not first-hand." },
  ],
  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "Best office chairs under $300: verified picks", href: "/blog/best-office-chairs-under-300-verified-picks" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

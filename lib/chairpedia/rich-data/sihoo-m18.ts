import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * SIHOO M18 — research-based buying guide data.
 * Listing facts from the Amazon listing title (ASIN B07GNDDNMW, checked
 * 2026-09-09): "330lbs", "2D Armrests", "Headrest", "Adjustable Lumbar
 * Support", "Tilt Lock", "Mesh Back", "Wide Cushion", "Black".
 * Dimensions/recline documented by SIHOO / major retailers (Best Buy).
 * No fixed prices; live price is on the Amazon button only.
 */
export const SIHOO_M18: RichReview = {
  asin: "B07GNDDNMW",
  eyebrow: "SIHOO · Office chairs · Buying guide",
  heroIntro:
    "The SIHOO M18 is a high-back mesh task chair with an adjustable headrest, adjustable lumbar support and a wide cushioned seat, sold at a budget price. This guide covers its confirmed features, fit and what to check before buying.",
  verdictOneLiner: "A budget mesh-back chair with headrest, adjustable lumbar and a cushioned seat.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front three-quarter, black M18.",
  galleryBriefs: ["Headrest", "Lumbar adjustment"],

  quickFacts: [
    { label: "Model", value: "M18", note: "Black. Also sold in Duck Gray / Blue." },
    { label: "Weight capacity", value: "330 lb", note: "Per the Amazon listing" },
    { label: "Armrests", value: "2D listing label", note: "Height documented; confirm other movements" },
    { label: "Back / seat", value: "Mesh back, cushioned seat", note: "Not a full-mesh seat" },
    { label: "Headrest · lumbar", value: "Adjustable", note: "Both adjustable per listing" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The M18 is a budget chair, so the goal is to confirm the version you receive matches the listing and suits your body. Start here.",
  checks: [
    { n: "01", title: "Confirm the model and colour", body: "The linked listing is the M18 in Black (ASIN B07GNDDNMW). SIHOO sells several similar mesh chairs; read \"M18\" in the title and pick the colour you want (Black, Duck Gray or Blue) before ordering." },
    { n: "02", title: "The seat is cushioned, not mesh", body: "Unlike SIHOO's all-mesh chairs, the M18 pairs a mesh back with a wide fabric-covered cushioned seat. If you specifically want a breathable mesh seat, this is not that chair." },
    { n: "03", title: "Check usable dimensions for the selected model", body: "The listing states a 330 lb capacity. That is not a personal-fit or durability guarantee. Ask for floor-to-seat height, usable seat depth and inside arm spacing for your selected configuration, then compare them with your desk and current chair." },
    { n: "04", title: "Do not infer movements from the 2D label", body: "SIHOO's US page explicitly describes armrest height adjustment. The 2D label alone does not establish width, pivot or forward/back movement during use. Request the selected model's instructions if one of those movements is essential." },
  ],

  dims: [
    { k: "Overall dimensions", v: "Confirm the selected configuration; regional specifications may differ", tier: "C" },
    { k: "Seat height (floor to seat)", v: "Not verified for the linked configuration", tier: "C" },
    { k: "Weight capacity", v: "330 lb", tier: "A" },
    { k: "Recline", v: "Not confirmed for the linked SKU; manufacturer and retailer figures differ", tier: "C" },
    { k: "Seat", v: "Wide W-shaped cushioned seat (documented ~8.5 cm padding)", tier: "B" },
    { k: "Armrests", v: "2D listing label; height adjustment explicitly documented", tier: "B" },
    { k: "Lumbar", v: "Adjustable (height and depth)", tier: "A" },
    { k: "Headrest", v: "Adjustable", tier: "A" },
    { k: "Warranty", v: "3 years (SIHOO)", tier: "B" },
  ],
  dimsSourceNote:
    "Amazon listing and SIHOO US/wholesale pages reviewed September 10, 2026. The retail and wholesale recline figures differ. No universal model dimensions or user-fit range are established here.",

  adjustable: [
    { k: "Seat height", v: "Confirm the adjustment range for the selected configuration.", src: "Range not verified" },
    { k: "Lumbar support", v: "Adjustable for height and depth.", src: "Amazon listing (confirmed)" },
    { k: "Headrest", v: "Adjustable.", src: "Amazon listing (confirmed)" },
    { k: "Armrests", v: "Height documented; other movements require model-specific confirmation.", src: "SIHOO US product page" },
    { k: "Recline", v: "Tilt lock; confirm the maximum angle for the selected SKU.", src: "Manufacturer / retailer figures differ" },
  ],
  fixed: [
    { k: "Seat material", v: "Cushioned fabric seat — not adjustable and not mesh.", src: "Amazon listing" },
    { k: "Armrest depth / pivot", v: "Not verified from the 2D label alone; request the control diagram.", src: "Evidence limit" },
    { k: "Seat depth", v: "No published seat-depth slider.", src: "Not confirmed" },
  ],

  pros: [
    { t: "Headrest, adjustable lumbar and a 330 lb capacity at an entry price point.", src: "Amazon listing (confirmed)" },
    { t: "Cushioned seating for buyers who prefer padding to mesh.", src: "Editorial selection criterion" },
    { t: "A padded-seat option to compare with the all-mesh C300.", src: "Editorial selection criterion" },
  ],
  cons: [
    { t: "Arm movement beyond height adjustment needs confirmation for the selected item.", src: "Source limitation" },
    { t: "Cushioned seat is less breathable than an all-mesh seat.", src: "Product documentation, our reading" },
    { t: "No Furniblog sitting or durability test is available to establish long-term performance.", src: "Testing disclosure" },
  ],

  forWhoTitle: "The M18 suits",
  forWho: [
    "Budget-first buyers who still want a headrest and adjustable lumbar",
    "Home-office setups that prefer a cushioned seat over a firm mesh pan",
    "Buyers who can verify the selected model's fit and return terms before ordering",
  ],
  skipWho: [
    "Want a breathable full-mesh seat",
    "Need a particular arm movement that the seller cannot demonstrate",
    "Require an independently tested recommendation",
  ],

  rivals: [
    { name: "SIHOO M18", lumbar: "Adjustable (height + depth)", arms: "2D", standout: "Budget price with headrest + cushioned seat", isSelf: true },
    { name: "SIHOO Doro C300", href: "/compare/sihoo-m18-vs-sihoo-doro-c300", lumbar: "Adaptive support", arms: "Listing-dependent description", standout: "Compare the mesh-seat alternative" },
    { name: "Ticova Ergonomic", href: "/compare/ticova-ergonomic-vs-sihoo-m18", lumbar: "Height and depth documented", arms: "Three movements documented", standout: "Compare arm positioning and seller terms" },
  ],

  buy: {
    productTitle: "SIHOO M18 — Black",
    retailerNote: "Amazon · ASIN B07GNDDNMW · also sold in Duck Gray / Blue",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check it on the listing." },
      { k: "Warranty", v: "SIHOO documents a 3-year warranty. Confirm on the listing you order from." },
      { k: "What to check", v: 'Title says "M18", the colour you want, "2D Armrests" and "330lbs", plus who it is sold and shipped by.' },
    ],
    disclaimer:
      'Not verified by Furniblog: price, seller ("sold by"), stock and colour availability change without notice — confirm all of them on the Amazon listing. Affiliate link; commission does not change the price you pay or what this guide says.',
  },

  verdict: [
    "Shortlist the M18 if you want a cushioned seat and manually positioned lumbar support. Establish the exact fit and available arm movements before comparing the delivered price. A published load limit does not tell us how comfortable or durable the chair will be for a particular buyer.",
    "Furniblog has not hands-on tested the M18, so we do not rank its comfort or durability against premium chairs. Compare the C300 if you prefer a mesh seat, or Ticova if documented arm angle and forward/back movement matter. Resolve fit and seller terms before treating a higher price as an upgrade.",
  ],
  verdictPullQuote:
    "A lot of ergonomic checkboxes for the money — as long as you want a cushioned seat and can live with 2D arms.",

  faqs: [
    { q: "Does the M18 have a mesh seat?", a: "No. The back is mesh but the seat is a wide fabric-covered cushion. If you want an all-mesh seat, consider a different model." },
    { q: "What is the weight capacity?", a: "The Amazon listing states 330 lb. Confirm it on the listing you order from before buying." },
    { q: "Are the armrests adjustable?", a: "The listing uses a 2D label and SIHOO's US page documents height adjustment. Width, pivot and forward/back adjustment during use are not verified here. Ask for the selected model's control diagram." },
    { q: "Is the M18 recline 126 or 130 degrees?", a: "SIHOO's US page advertises 126 degrees; its wholesale page lists tilt positions reaching 130 degrees. Do not assume either figure covers every configuration. Confirm the item you order." },
    { q: "What colours are available?", a: "Black, Duck Gray and Blue are commonly listed. The link points to Black; switch the colour on the listing if you prefer another." },
    { q: "Has Furniblog tested this chair?", a: "No. This guide compares published listing and manufacturer descriptions. It does not report our own comfort, pressure or durability measurements." },
  ],

  sources: [
    { k: "Amazon listing", url: "https://www.amazon.com/dp/B07GNDDNMW", v: "SIHOO M18, Black — ASIN B07GNDDNMW. Title checked 2026-09-09. Basis for capacity (330 lb), 2D armrests, adjustable lumbar and headrest, mesh back and cushioned seat." },
    { k: "SIHOO M18 manufacturer page", url: "https://wholesale.sihoo.com/products/m18/", v: "Checked 2026-09-10: documents lumbar height/depth adjustment and a cushioned seat. Its recline figures differ from earlier retailer figures; it is a wholesale specification, not confirmation of every Amazon variant." },
    { k: "SIHOO US M18", url: "https://www.sihoo.com/products/m18-ergonomic-chair", v: "Reviewed September 10, 2026. Height-adjustable arms, retail recline and support terms. Manufacturer statements are not a Furniblog comfort test." },
  ],

  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

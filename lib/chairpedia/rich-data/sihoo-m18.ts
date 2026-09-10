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
    { label: "Armrests", value: "2D", note: "Height + width per listing" },
    { label: "Back / seat", value: "Mesh back, cushioned seat", note: "Not a full-mesh seat" },
    { label: "Headrest · lumbar", value: "Adjustable", note: "Both adjustable per listing" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The M18 is a budget chair, so the goal is to confirm the version you receive matches the listing and suits your body. Start here.",
  checks: [
    { n: "01", title: "Confirm the model and colour", body: "The linked listing is the M18 in Black (ASIN B07GNDDNMW). SIHOO sells several similar mesh chairs; read \"M18\" in the title and pick the colour you want (Black, Duck Gray or Blue) before ordering." },
    { n: "02", title: "The seat is cushioned, not mesh", body: "Unlike SIHOO's all-mesh chairs, the M18 pairs a mesh back with a wide fabric-covered cushioned seat. If you specifically want a breathable mesh seat, this is not that chair." },
    { n: "03", title: "Take the weight capacity and dimensions from the listing", body: "The listing states a 330 lb capacity; retailers publish a seat height of roughly 17.3–21.3 in. Confirm both on the listing you order from, and compare the seat height with your desk. A stated maximum is a test rating, not a durability promise for any particular body." },
    { n: "04", title: "Know the armrests are 2D", body: "The armrests adjust for height and width but do not pivot or slide forward/back. If you need 4D arms for tablet or phone postures, look higher up the range." },
  ],

  dims: [
    { k: "Overall dimensions", v: "27.55 in W × 27.56 in D × 49.2 in H", tier: "B" },
    { k: "Seat height (floor to seat)", v: "17.32–21.26 in (gas lift)", tier: "B" },
    { k: "Weight capacity", v: "330 lb", tier: "A" },
    { k: "Recline", v: "Not confirmed for the linked SKU; manufacturer and retailer figures differ", tier: "C" },
    { k: "Seat", v: "Wide W-shaped cushioned seat (documented ~8.5 cm padding)", tier: "B" },
    { k: "Armrests", v: "2D (height and width)", tier: "A" },
    { k: "Lumbar", v: "Adjustable (height and depth)", tier: "A" },
    { k: "Headrest", v: "Adjustable", tier: "A" },
    { k: "Warranty", v: "3 years (SIHOO)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: Amazon listing title (ASIN B07GNDDNMW) for capacity, armrests, lumbar and headrest; SIHOO and major retailers (e.g. Best Buy) for dimensions, recline and warranty. Confirm figures on the listing you buy from.",

  adjustable: [
    { k: "Seat height", v: "Gas lift, roughly 17.3–21.3 in floor-to-seat.", src: "Retailer specs (documented)" },
    { k: "Lumbar support", v: "Adjustable for height and depth.", src: "Amazon listing (confirmed)" },
    { k: "Headrest", v: "Adjustable.", src: "Amazon listing (confirmed)" },
    { k: "Armrests — 2D", v: "Height and width.", src: "Amazon listing (confirmed)" },
    { k: "Recline", v: "Tilt lock; confirm the maximum angle for the selected SKU.", src: "Manufacturer / retailer figures differ" },
  ],
  fixed: [
    { k: "Seat material", v: "Cushioned fabric seat — not adjustable and not mesh.", src: "Amazon listing" },
    { k: "Armrest depth / pivot", v: "2D arms do not slide forward/back or pivot.", src: "Amazon listing" },
    { k: "Seat depth", v: "No published seat-depth slider.", src: "Not confirmed" },
  ],

  pros: [
    { t: "Headrest, adjustable lumbar and a 330 lb capacity at an entry price point.", src: "Amazon listing (confirmed)" },
    { t: "Wide cushioned seat that some sitters prefer over a firm mesh pan.", src: "Amazon listing · published reviews" },
    { t: "Widely reviewed and long-established as a budget pick.", src: "Published reviews (research)" },
  ],
  cons: [
    { t: "2D armrests only — no forward/back or pivot.", src: "Amazon listing" },
    { t: "Cushioned seat is less breathable than an all-mesh seat.", src: "Product documentation, our reading" },
    { t: "Budget build; reviewers note it trails premium chairs on materials and longevity.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The M18 suits",
  forWho: [
    "Budget-first buyers who still want a headrest and adjustable lumbar",
    "Home-office setups that prefer a cushioned seat over a firm mesh pan",
    "Heavier users, within the listed 330 lb capacity (confirm on the listing)",
  ],
  skipWho: [
    "Want a breathable full-mesh seat",
    "Need 4D armrests for tablet/phone postures",
    "Expect premium materials and long-term durability",
  ],

  rivals: [
    { name: "SIHOO M18", lumbar: "Adjustable (height + depth)", arms: "2D", standout: "Budget price with headrest + cushioned seat", isSelf: true },
    { name: "SIHOO Doro C300", href: "/products/sihoo-doro-c300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar and full mesh, a step up" },
    { name: "Hbada P5", href: "/products/hbada-p5", lumbar: "2D adjustable", arms: "Adjustable", standout: "Retractable footrest, mesh back" },
    { name: "Nouhaus Ergo3D", href: "/products/nouhaus-ergo3d", lumbar: "3D adjustable", arms: "4D", standout: "Full mesh with 4D arms" },
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
    "The SIHOO M18 is a sensible budget pick: it puts an adjustable headrest, adjustable lumbar support and a 330 lb-rated frame at a price where many rivals give you a fixed lumbar pad and basic tilt. The wide cushioned seat is the M18's signature — a genuine plus if you dislike sitting on firm mesh, and a limitation if you want maximum airflow.",
    "It is still an entry-level chair. The armrests are 2D, the materials are budget-tier, and published reviews are consistent that it trades some refinement and longevity for its price. If your budget can stretch, SIHOO's own Doro C300 adds adaptive lumbar and a full-mesh build; if it can't, the M18 remains one of the more complete chairs at the bottom of the market.",
  ],
  verdictPullQuote:
    "A lot of ergonomic checkboxes for the money — as long as you want a cushioned seat and can live with 2D arms.",

  faqs: [
    { q: "Does the M18 have a mesh seat?", a: "No. The back is mesh but the seat is a wide fabric-covered cushion. If you want an all-mesh seat, consider a different model." },
    { q: "What is the weight capacity?", a: "The Amazon listing states 330 lb. Confirm it on the listing you order from before buying." },
    { q: "Are the armrests adjustable?", a: "They are 2D — adjustable for height and width, but they do not slide forward/back or pivot." },
    { q: "What colours are available?", a: "Black, Duck Gray and Blue are commonly listed. The link points to Black; switch the colour on the listing if you prefer another." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide built from the Amazon listing, SIHOO's documentation and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Amazon listing", url: "https://www.amazon.com/dp/B07GNDDNMW", v: "SIHOO M18, Black — ASIN B07GNDDNMW. Title checked 2026-09-09. Basis for capacity (330 lb), 2D armrests, adjustable lumbar and headrest, mesh back and cushioned seat." },
    { k: "SIHOO M18 manufacturer page", url: "https://wholesale.sihoo.com/products/m18/", v: "Checked 2026-09-10: documents lumbar height/depth adjustment and a cushioned seat. Its recline figures differ from earlier retailer figures; it is a wholesale specification, not confirmation of every Amazon variant." },
    { k: "Published reviews", v: "Third-party reviews summarised for the Cautions and comfort notes; not first-hand." },
  ],
}

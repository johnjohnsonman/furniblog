import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Herman Miller Aeron (Remastered) — research-based buying guide data.
 * Specs from Herman Miller's official documentation (sizes A/B/C, per-size
 * weight capacity, 8Z Pellicle, PostureFit SL, 12-year warranty), checked
 * 2026-09-09. No single Amazon ASIN is verified (marketplace listings mix
 * Classic, Remastered, sizes, options and used/refurbished stock), so the
 * Amazon link is a search and the official store is the reliable path.
 * No fixed prices anywhere.
 */
export const HERMAN_MILLER_AERON: RichReview = {
  asin: null,
  eyebrow: "Herman Miller · Office chairs · Buying guide",
  heroIntro:
    "The Herman Miller Aeron is an all-mesh icon, sold today as the \"Remastered\" version with 8Z Pellicle mesh and PostureFit SL. It comes in three sizes and several back-support and arm options — so the main task before buying is choosing the right configuration. This guide covers its confirmed features, sizing and what to check.",
  verdictOneLiner: "The mesh benchmark — but only right if you pick the correct size and options.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Three-quarter, black Remastered Aeron.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from Herman Miller's official specifications.",
  quickFacts: [
    { label: "Version", value: "Remastered", note: "Current model; Classic is discontinued" },
    { label: "Sizes", value: "A · B · C", note: "Small / medium / large" },
    { label: "Mesh", value: "8Z Pellicle", note: "Eight tension zones, back and seat" },
    { label: "Lumbar", value: "PostureFit SL", note: "Option; other back supports exist" },
    { label: "Warranty", value: "12 years", note: "24/7 use, no excluded parts" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The Aeron's price and options make configuration the whole game. Confirm four things before ordering.",
  checks: [
    { n: "01", title: "Classic vs Remastered", body: "The chair Herman Miller sells today is the Remastered Aeron (updated in 2016) with 8Z Pellicle mesh, PostureFit SL and a revised tilt. The older Classic is discontinued but still circulates as used/refurbished stock. If you want the current chair, confirm the listing says \"Remastered\"." },
    { n: "02", title: "Pick the right size (A, B or C)", body: "The Aeron does not adjust its frame size — you choose it. Size A is the smallest, B is the standard/most common, and C is the largest. Weight capacity is 300 lb for A and 350 lb for B and C. Use Herman Miller's size chart against your height and weight before ordering; the wrong size is the most common Aeron regret." },
    { n: "03", title: "Choose the back support and arms", body: "Back support is an option: Basic, Adjustable Lumbar, PostureFit, or Adjustable PostureFit SL (the most supportive). Arms range from fixed to height-adjustable to fully adjustable. A cheaper listing is often a more basic configuration — check exactly what it includes." },
    { n: "04", title: "There is no factory headrest; watch condition on marketplaces", body: "Herman Miller does not make an Aeron headrest — any headrest you see is third-party. On Amazon and resale sites, listings mix new, open-box, used and refurbished stock at very different prices and warranties; confirm the exact version, size, options and condition before you buy." },
  ],

  dims: [
    { k: "Sizes", v: "A (small), B (medium), C (large) — frame size is chosen, not adjusted", tier: "B" },
    { k: "Size B dimensions", v: "≈ 27 in W × 16.75 in D × 41 in H; seat height ≈ 20.5 in", tier: "B" },
    { k: "Size C dimensions", v: "≈ 28.25 in W × 18.5 in D × 43 in H", tier: "B" },
    { k: "Weight capacity", v: "Size A: 300 lb · Sizes B & C: 350 lb", tier: "B" },
    { k: "Mesh", v: "8Z Pellicle (eight tension zones) on back and seat", tier: "B" },
    { k: "Back support", v: "Option: Basic / Adjustable Lumbar / PostureFit / Adjustable PostureFit SL", tier: "B" },
    { k: "Arms", v: "Option: fixed, height-adjustable, or fully adjustable", tier: "B" },
    { k: "Tilt", v: "Standard tilt; Tilt Limiter and Seat Angle are options", tier: "B" },
    { k: "Headrest", v: "None from Herman Miller (third-party only)", tier: "B" },
    { k: "Warranty", v: "12 years, 24/7 use, no excluded parts", tier: "B" },
  ],
  dimsSourceNote:
    "Source: Herman Miller official product documentation and size/fit reference (checked 2026-09-09). Exact dimensions vary by size; confirm the size and options on the listing you buy from.",

  adjustable: [
    { k: "Frame size", v: "Chosen at purchase (A/B/C) — not adjustable afterward.", src: "Herman Miller (documented)" },
    { k: "Seat height", v: "Pneumatic lift; range varies by size.", src: "Herman Miller (documented)" },
    { k: "Back support (PostureFit SL)", v: "Sacral + lumbar pads adjust when this option is fitted.", src: "Herman Miller (documented)" },
    { k: "Arms", v: "Height / width / depth / pivot, depending on the arm option chosen.", src: "Herman Miller (documented)" },
    { k: "Tilt", v: "Tilt tension; recline range and forward tilt depend on tilt options.", src: "Herman Miller (documented)" },
  ],
  fixed: [
    { k: "Frame size", v: "Cannot be changed after purchase — buy the right size.", src: "Herman Miller (documented)" },
    { k: "Seat depth", v: "No seat-depth slider; the size determines depth.", src: "Herman Miller (documented)" },
    { k: "Headrest", v: "No factory headrest; only third-party add-ons exist.", src: "Herman Miller (documented)" },
    { k: "Seat cushion", v: "Mesh seat only — there is no padded-seat option.", src: "Herman Miller (documented)" },
  ],

  pros: [
    { t: "All-mesh 8Z Pellicle back and seat with strong airflow and a very long track record.", src: "Herman Miller (documented)" },
    { t: "Three sizes plus PostureFit SL let you fit a wide range of bodies precisely.", src: "Herman Miller (documented)" },
    { t: "12-year, 24/7 warranty with no excluded parts and a deep spare-parts/repair ecosystem.", src: "Herman Miller (documented)" },
    { t: "Consistently rated among the best task chairs in published long-term reviews.", src: "Published reviews (research)" },
  ],
  cons: [
    { t: "Expensive, and a lower price usually means a more basic configuration — check the options.", src: "Product documentation, our reading" },
    { t: "Mesh seat only; no padded-seat option, which some sitters dislike.", src: "Herman Miller (documented)" },
    { t: "No factory headrest — a dealbreaker if you want neck support.", src: "Herman Miller (documented)" },
    { t: "Firm, upright ergonomic feel rather than a plush lounge chair, per published reviews.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The Aeron suits",
  forWho: [
    "Buyers who want a proven all-mesh chair and will choose the correct size and options",
    "Warm rooms and long sittings where breathability matters most",
    "Anyone who values a 12-year warranty and long-term parts availability",
  ],
  skipWho: [
    "Want a padded seat or a plush, reclining-lounge feel",
    "Need a factory headrest",
    "Want a chair that fits everyone out of the box without choosing a size",
  ],

  rivals: [
    { name: "Herman Miller Aeron (Remastered)", lumbar: "PostureFit SL (option)", arms: "Up to fully adjustable (option)", standout: "All-mesh icon, 3 sizes, 12-yr warranty", isSelf: true },
    { name: "Steelcase Leap V2", lumbar: "Adjustable height + firmness", arms: "4D", standout: "Upholstered LiveBack, 400 lb capacity" },
    { name: "Haworth Fern", lumbar: "Optional height-adjustable", arms: "4D", standout: "Wave Suspension, headrest on non-Digital-Knit" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar at a fraction of the price" },
  ],

  buy: {
    productTitle: "Herman Miller Aeron (Remastered)",
    retailerNote: "Choose size A/B/C, back support and arms before ordering",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Best path (new)", v: "The Herman Miller store sells the new Remastered Aeron with full size and option choice and the 12-year warranty. Prices vary by configuration." },
      { k: "Amazon", v: "The Amazon link is a search, not one listing — marketplace stock mixes Classic, Remastered, sizes, options and used/refurbished chairs. Confirm version, size, options and condition on the listing." },
      { k: "What to check", v: 'Says "Remastered", the size you need (A/B/C), the back support and arm option, and whether it is new, open-box or refurbished.' },
    ],
    officialStore: {
      label: "Herman Miller (official)",
      note: "New Remastered Aeron, all sizes and options, 12-year warranty. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://store.hermanmiller.com/office-chairs-aeron?lang=en_US",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock, version, size and options vary by listing and change without notice — confirm them before buying. The Amazon link is an affiliate search link; the Herman Miller link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Remastered Aeron remains the reference all-mesh task chair: eight-zone Pellicle mesh, a well-sorted tilt, PostureFit SL support and a 12-year, 24/7 warranty backed by an unusually deep parts and repair network. For a warm room or a long working day it is hard to beat on airflow and longevity, and published long-term reviews consistently place it at the top of the class.",
    "The catch is that the Aeron is a configured chair, not a one-size product. Its frame size (A/B/C) is fixed at purchase, back support and arms are options, and there is no padded seat or factory headrest. A tempting low price usually signals a basic configuration or used stock. Choose the size and options deliberately — get those right and it is a genuine buy-it-for-a-decade chair; get them wrong and it is an expensive mismatch.",
  ],
  verdictPullQuote:
    "Still the mesh benchmark — provided you buy the right size and options, not just the cheapest listing.",

  faqs: [
    { q: "Is the current Aeron the Classic or the Remastered?", a: "Herman Miller sells the Remastered Aeron (updated in 2016) with 8Z Pellicle mesh and PostureFit SL. The Classic is discontinued but still appears as used/refurbished stock — check the listing." },
    { q: "Which size should I choose?", a: "Size A is smallest, B is standard, C is largest, and the frame size cannot be changed later. Weight capacity is 300 lb for A and 350 lb for B and C. Use Herman Miller's size/fit chart against your height and weight before ordering." },
    { q: "Does the Aeron come with a headrest?", a: "No. Herman Miller does not make an Aeron headrest; any headrest you see is a third-party accessory." },
    { q: "Why are Amazon prices so different?", a: "Amazon listings mix Classic and Remastered, different sizes and options, and new, open-box, used and refurbished stock. The link here is a search — confirm exactly what a listing is before buying." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide built from Herman Miller's documentation and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Herman Miller (official)", v: "Aeron product pages and the size/fit reference, checked 2026-09-09. Basis for sizes, per-size weight capacity, 8Z Pellicle, back-support and arm options, tilt and the 12-year warranty." },
    { k: "Published reviews", v: "Third-party long-term reviews summarised for the comfort/feel notes and the class ranking; not first-hand." },
  ],

  sourcesFooter:
    "Specifications are Herman Miller's published figures as of the date shown and are not independently verified by Furniblog. The Aeron is sold in multiple sizes and configurations; always confirm the exact version, size, options and condition on the listing you buy from.",
}

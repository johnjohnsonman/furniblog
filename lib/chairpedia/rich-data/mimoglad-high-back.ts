import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * MIMOGLAD High Back Office Chair (model OC-5188H, ASIN B09N93L2RQ) —
 * research-based buying guide data. Facts from the OC-5188H manual, the Amazon
 * listing and published reviews (checked 2026-09-10). MIMOGLAD sells several
 * near-identical listings — this is the high-back WITH headrest + flip-up arms.
 * Arms are flip-up only (no height/width). No fixed prices.
 */
export const MIMOGLAD_HIGH_BACK: RichReview = {
  asin: "B09N93L2RQ",
  eyebrow: "MIMOGLAD · Office chairs · Buying guide",
  heroIntro:
    "The MIMOGLAD High Back (model OC-5188H) is a budget mesh chair with an adjustable headrest, sliding lumbar and flip-up arms, backed by a 5-year warranty. This guide covers its confirmed features, how to pick the right MIMOGLAD, and what to check.",
  verdictOneLiner: "A budget mesh chair with headrest and 5-year warranty — arms are flip-up only.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, MIMOGLAD high-back mesh chair.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from the OC-5188H manual and the Amazon listing (ASIN B09N93L2RQ).",
  quickFacts: [
    { label: "Model", value: "OC-5188H", note: "High-back WITH headrest" },
    { label: "Weight capacity", value: "300 lb", note: "This model" },
    { label: "Armrests", value: "Flip-up", note: "No height/width adjust" },
    { label: "Lumbar · headrest", value: "Adjustable", note: "Slide ~2 in · lift ~1.2 in" },
    { label: "Warranty", value: "5 years", note: "+ 90-day return" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "MIMOGLAD sells many look-alike listings at different capacities and arm types, so the key step is buying this exact one.",
  checks: [
    { n: "01", title: "Confirm it's the OC-5188H with headrest", body: "This guide covers the high-back with headrest and flip-up arms (ASIN B09N93L2RQ, model OC-5188H). A sibling model (5188MM) has no headrest, and other MIMOGLAD listings advertise 3D arms or higher capacities. Match the ASIN/model and the colour you want (Moon Grey, Black, Beige, Green or White)." },
    { n: "02", title: "The arms are flip-up only", body: "Unlike some MIMOGLAD listings that advertise 3D arms, this model's armrests only flip up (about 90°) to tuck under a desk — no height or width adjustment. If you need adjustable arms, this isn't the one." },
    { n: "03", title: "Recline has limited lock positions", body: "The backrest reclines 90–135° but with only two tilt-lock positions rather than free-float tension. It's fine for leaning back occasionally; it's not a deep, infinitely adjustable recline." },
    { n: "04", title: "Check the seat height for your desk", body: "Seat height adjusts up to about 22.8 in (roughly 4 in of travel) and the seat is about 16.5 in deep. Confirm the range suits your desk and legs before ordering." },
  ],

  dims: [
    { k: "Seat", v: "≈ 19.7 in W × 16.5 in D", tier: "B" },
    { k: "Total height (with headrest)", v: "≈ 50.8 in", tier: "B" },
    { k: "Seat height", v: "Up to ≈ 22.8 in (~4 in travel)", tier: "B" },
    { k: "Weight capacity", v: "300 lb", tier: "A" },
    { k: "Recline", v: "90–135° with 2 tilt-lock positions", tier: "B" },
    { k: "Armrests", v: "Flip-up only (no height/width)", tier: "A" },
    { k: "Lumbar", v: "Adjustable, slides vertically ~2 in", tier: "B" },
    { k: "Headrest", v: "Adjustable, lifts ~1.2 in", tier: "B" },
    { k: "Back / seat", v: "Breathable mesh back; cushioned foam seat", tier: "B" },
    { k: "Warranty", v: "5 years + 90-day return", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: OC-5188H manual, Amazon listing (ASIN B09N93L2RQ) and published reviews (checked 2026-09-10). MIMOGLAD's listings share spec language across models — take numbers from this exact listing. SGS/BIFMA passed.",

  adjustable: [
    { k: "Lumbar", v: "Slides vertically ~2 in.", src: "Manual (documented)" },
    { k: "Headrest", v: "Lifts ~1.2 in.", src: "Manual (documented)" },
    { k: "Seat height", v: "Gas lift, up to ~22.8 in.", src: "Manual (documented)" },
    { k: "Recline", v: "90–135° with 2 lock positions.", src: "Manual (documented)" },
    { k: "Armrests", v: "Flip up ~90° to tuck under a desk.", src: "Amazon listing (confirmed)" },
  ],
  fixed: [
    { k: "Arm height/width", v: "Not adjustable — flip-up only.", src: "Amazon listing" },
    { k: "Seat depth", v: "≈ 16.5 in, no depth adjustment.", src: "Manual" },
    { k: "Recline tension", v: "Two lock positions, not free-float.", src: "Manual" },
  ],

  pros: [
    { t: "Breathable mesh back with an upgraded foam seat that reviewers say eases pressure over long sits.", src: "Published reviews (research)" },
    { t: "Genuinely usable sliding lumbar and lifting headrest at a budget price.", src: "Manual · published reviews" },
    { t: "Flip-up arms to tuck under a desk, plus a 5-year warranty — strong value.", src: "Manual (documented)" },
  ],
  cons: [
    { t: "Arms are flip-up only — no height or width adjustment.", src: "Amazon listing" },
    { t: "Recline is limited to two lock positions rather than free-float tension.", src: "Manual" },
    { t: "Easy to buy the wrong MIMOGLAD — many look-alikes with different specs.", src: "Our reading" },
  ],

  forWhoTitle: "The MIMOGLAD suits",
  forWho: [
    "Budget buyers who want a mesh back, headrest and adjustable lumbar",
    "Small spaces where flip-up arms let the chair tuck away",
    "Value seekers who want a long (5-year) warranty",
  ],
  skipWho: [
    "Need height/width-adjustable or 3D arms",
    "Want a deep, free-float recline",
    "Need a depth-adjustable seat",
  ],

  rivals: [
    { name: "MIMOGLAD OC-5188H", lumbar: "Slide (~2 in)", arms: "Flip-up", standout: "Headrest + 5-yr warranty on a budget", isSelf: true },
    { name: "Gabrylly Ergonomic", lumbar: "Adjustable pad", arms: "Flip-up", standout: "Double mesh, similar budget class" },
    { name: "Ticova Ergonomic", lumbar: "2-axis (height + depth)", arms: "3D", standout: "More arm/lumbar adjustment" },
    { name: "SIHOO M18", lumbar: "Adjustable", arms: "2D", standout: "Cushioned seat, headrest, cheaper" },
  ],

  buy: {
    productTitle: "MIMOGLAD High Back (OC-5188H)",
    retailerNote: "Amazon · ASIN B09N93L2RQ · Moon Grey (also Black/Beige/Green/White)",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; MIMOGLAD lists a 90-day return. Check the listing." },
      { k: "Warranty", v: "5 years. Confirm on the listing you order from." },
      { k: "What to check", v: "It's the OC-5188H high-back with headrest (not the 5188MM), and the colour you want." },
    ],
    disclaimer:
      "Not verified by Furniblog: price, seller, stock, colour and which MIMOGLAD a listing is change without notice — confirm on the listing. Affiliate link; commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The MIMOGLAD OC-5188H is a lot of budget chair on paper: a breathable mesh back, an adjustable headrest and a sliding lumbar, plus flip-up arms and a 5-year warranty at a price where many rivals skip one or more of those. For a value pick that still supports your neck and lower back, it's reasonable.",
    "Its limits are the arms and recline. The arms only flip up — no height or width — and the tilt has just two lock positions rather than free-float tension. And because MIMOGLAD floods listings with look-alikes, the real risk is buying a different model by accident. Match the OC-5188H, accept the simple arms, and it's a fair budget buy.",
  ],
  verdictPullQuote:
    "Headrest, sliding lumbar and a 5-year warranty on a budget — just accept flip-up-only arms and buy the right model.",

  faqs: [
    { q: "Which MIMOGLAD is this?", a: "The high-back OC-5188H with headrest and flip-up arms (ASIN B09N93L2RQ). A sibling (5188MM) has no headrest, and other listings advertise 3D arms — match the model." },
    { q: "Do the armrests adjust?", a: "Only by flipping up to tuck under a desk. There's no height or width adjustment on this model." },
    { q: "What's the weight capacity?", a: "300 lb for this model. Confirm on the listing." },
    { q: "How far does it recline?", a: "90–135° with two tilt-lock positions (not free-float tension)." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from the OC-5188H manual, the Amazon listing and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "OC-5188H manual / Amazon", v: "Manual and the Amazon listing (ASIN B09N93L2RQ), checked 2026-09-10. Basis for capacity, flip-up arms, sliding lumbar, headrest and dimensions." },
    { k: "Published reviews", v: "Third-party reviews summarised for the mesh/foam comfort and the arm/recline cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are for the MIMOGLAD OC-5188H (ASIN B09N93L2RQ) as of the date shown and are not independently verified by Furniblog. MIMOGLAD's look-alike listings share spec language — confirm the model, capacity and colour on the exact listing you buy from.",
}

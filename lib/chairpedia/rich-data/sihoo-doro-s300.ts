import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * SIHOO Doro S300 — research-based buying guide data.
 * Facts from the official sihoo.com page, the Amazon listing (ASIN
 * B0DQTRVSHS, Black) and published reviews (checked 2026-09-10). Premium Doro
 * tier; distinct from C300/C300 Pro; no "S300 Pro"/footrest exists. Capacity
 * 330 lb official (some copy says 300). Recline ~135–138° per third parties
 * (not on official page). German Design Award is a manufacturer claim.
 */
export const SIHOO_DORO_S300: RichReview = {
  asin: "B0DQTRVSHS",
  eyebrow: "SIHOO · Office chairs · Buying guide",
  heroIntro:
    "The SIHOO Doro S300 is SIHOO's flagship Doro chair: an all-mesh build with a weight-sensing \"anti-gravity\" recline, 6D armrests and dual dynamic lumbar, positioned as a value alternative to premium chairs. This guide covers its confirmed features, fit and what to check.",
  verdictOneLiner: "A weightless-recline, 6D-arm flagship mesh chair at a value price.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Three-quarter, black S300.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from SIHOO's official specifications (checked 2026-09-10).",
  quickFacts: [
    { label: "Tier", value: "Doro S300", note: "Flagship; not the C300 / C300 Pro" },
    { label: "Recline", value: "Anti-gravity", note: "Weight-sensing, infinite angle" },
    { label: "Armrests", value: "6D", note: "Coordinated, synced to recline" },
    { label: "Lumbar", value: "Dual dynamic", note: "Two self-adaptive pads" },
    { label: "Weight capacity", value: "330 lb", note: "Official figure" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The S300 sits above the C300 and comes in two colours only. Confirm the model and the fit — especially the headrest, which is the main design caveat.",
  checks: [
    { n: "01", title: "S300 vs C300 — and there is no \"S300 Pro\"", body: "The S300 is the premium Doro (6D arms, dual dynamic lumbar, anti-gravity recline). The C300 and C300 Pro are separate, cheaper models. There is no \"S300 Pro\" or footrest version of the S300 — don't be misled by a listing implying one. Colours are Black and White only." },
    { n: "02", title: "The headrest is integrated, not a separate adjustable piece", body: "The S300's headrest is built into the backrest rather than a separately height-adjustable attachment. Reviewers say how well it supports your neck depends on your height. If a fully adjustable headrest matters, try it or weigh this carefully." },
    { n: "03", title: "Take the weight capacity and recline from the listing", body: "SIHOO's official capacity is 330 lb (some retail copy says 300 — use 330 and confirm). The official page doesn't state a firm recline angle; third parties cite roughly 135–138°. Treat the recline figure as approximate and check the listing." },
    { n: "04", title: "Set up the 6D arms and dual lumbar", body: "Much of the S300's value is in adjustment — 6-way arms, adjustable seat depth (≈17.1–18.1 in) and two independently moving lumbar pads. Spend a few minutes dialing these in rather than leaving defaults." },
  ],

  dims: [
    { k: "Overall", v: "28 in W × 28 in D × 42–49 in H", tier: "B" },
    { k: "Seat depth", v: "17.13–18.11 in (adjustable)", tier: "B" },
    { k: "Max hip width", v: "≈ 20.08 in", tier: "B" },
    { k: "Weight capacity", v: "330 lb (some copy says 300; use official 330)", tier: "B" },
    { k: "Armrests", v: "6D coordinated (up/down, left/right, front/back, in/out, tilt-lock, synced recline)", tier: "B" },
    { k: "Lumbar", v: "Dual dynamic self-adaptive pads, adjustable", tier: "B" },
    { k: "Headrest", v: "Integrated into the backrest (not a separate adjustable headrest)", tier: "B" },
    { k: "Recline", v: "Weight-sensing anti-gravity, infinite angle; ~135–138° per third parties", tier: "C" },
    { k: "Back / seat", v: "All-mesh (Italian velvet mesh + DuPont TPEE); aluminium base", tier: "B" },
    { k: "Warranty", v: "3 years + 30-day trial", tier: "B" },
  ],
  dimsSourceNote:
    "Source: SIHOO official product page, Amazon listing (ASIN B0DQTRVSHS) and published reviews (checked 2026-09-10). Exact recline angle is not stated officially (~135–138° per third parties). BIFMA/SGS certified; a German Design Award is claimed by SIHOO (manufacturer claim).",

  adjustable: [
    { k: "Armrests — 6D", v: "Up/down, left/right, front/back, in/out, tilt-lock, synced to recline.", src: "SIHOO (documented)" },
    { k: "Recline", v: "Weight-sensing anti-gravity; smooth infinite-angle.", src: "SIHOO (documented)" },
    { k: "Lumbar", v: "Two independently moving self-adaptive pads.", src: "SIHOO (documented)" },
    { k: "Seat depth", v: "Slider, ≈ 17.1–18.1 in.", src: "SIHOO (documented)" },
    { k: "Seat height", v: "Gas lift (overall 42–49 in).", src: "SIHOO (documented)" },
  ],
  fixed: [
    { k: "Headrest", v: "Integrated; not separately height-adjustable.", src: "SIHOO / reviews" },
    { k: "Colours", v: "Black and White only; no footrest variant.", src: "SIHOO (documented)" },
    { k: "Recline tension", v: "Set by the weight-sensing mechanism (handle-tuned), not a manual dial.", src: "SIHOO (documented)" },
  ],

  pros: [
    { t: "Distinctive weight-sensing \"anti-gravity\" recline that reviewers describe as a genuinely floating feel at this price.", src: "Published reviews (research)" },
    { t: "Deep adjustability — 6D arms, adjustable seat depth and dual dynamic lumbar — rare at the price.", src: "SIHOO · published reviews" },
    { t: "Premium-feeling all-mesh build and aluminium frame; BIFMA/SGS certified.", src: "SIHOO (documented)" },
  ],
  cons: [
    { t: "The integrated headrest's support depends heavily on user height — the recurring complaint.", src: "Published reviews (research)" },
    { t: "Only two colours and no footrest option.", src: "SIHOO (documented)" },
    { t: "Assembly is fiddly per reviewers; exact recline angle isn't officially stated.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The S300 suits",
  forWho: [
    "Buyers who want a premium-feeling recline and lots of adjustment without a four-figure price",
    "People who like an all-mesh, breathable chair with 6-way arms",
    "Those comparing it to premium chairs as a value alternative",
  ],
  skipWho: [
    "Need a fully separate, height-adjustable headrest",
    "Want more than two colours or a footrest",
    "Prefer a firmly upright, non-reclining posture",
  ],

  rivals: [
    { name: "SIHOO Doro S300", lumbar: "Dual dynamic self-adaptive", arms: "6D", standout: "Anti-gravity recline, all-mesh, value flagship", isSelf: true },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Same family, cheaper, 3D arms" },
    { name: "Herman Miller Aeron (Remastered)", lumbar: "PostureFit SL (option)", arms: "Up to fully adjustable", standout: "Mesh icon, 3 sizes, 12-yr warranty" },
    { name: "Nouhaus Ergo3D", lumbar: "3D adjustable", arms: "4D", standout: "Full mesh with 4D arms, cheaper" },
  ],

  buy: {
    productTitle: "SIHOO Doro S300 — Black",
    retailerNote: "Amazon · ASIN B0DQTRVSHS · Black (also White)",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; SIHOO's own store offers a 30-day trial. Check the listing." },
      { k: "Warranty", v: "3 years (SIHOO). Confirm on the listing you order from." },
      { k: "What to check", v: "It's the S300 (not a C300), the colour, and who the item is sold and shipped by." },
    ],
    officialStore: {
      label: "SIHOO official store",
      note: "Sold direct at sihoo.com with a 30-day trial. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://www.sihoo.com/products/sihoo-doro-s300-gravity-defying-ergonomic-chair",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and colour change without notice — confirm on the listing. The Amazon link is an affiliate link; the SIHOO link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Doro S300 is SIHOO reaching for the premium tier, and its signature — a weight-sensing \"anti-gravity\" recline that glides to almost any angle — genuinely stands out at the price, backed by 6D arms, adjustable seat depth, dual dynamic lumbar and an all-mesh, aluminium-framed build. As a value alternative to four-figure chairs, it makes a strong impression.",
    "The one persistent caveat is the headrest: it's integrated into the backrest rather than separately adjustable, so how well it supports your neck depends on your height. Add limited colours and no footrest option, and it's not for everyone — but if you want a floating recline and deep adjustment for the money, the S300 is a distinctive pick.",
  ],
  verdictPullQuote:
    "A floating recline and 6-way arms at a value price — just make sure the integrated headrest fits your height.",

  faqs: [
    { q: "How is the S300 different from the C300?", a: "The S300 is the flagship Doro: 6D arms, dual dynamic lumbar and a weight-sensing anti-gravity recline. The C300/C300 Pro are separate, cheaper models. There is no \"S300 Pro\" or footrest version of the S300." },
    { q: "Does it have an adjustable headrest?", a: "The headrest is integrated into the backrest, not a separate height-adjustable piece — its support depends on your height." },
    { q: "What's the weight capacity?", a: "330 lb per SIHOO (some retail copy says 300). Use the official 330 and confirm on the listing." },
    { q: "How far does it recline?", a: "SIHOO doesn't state a firm angle; third parties cite roughly 135–138°. Treat it as approximate." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from SIHOO's specs and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "SIHOO (official) / Amazon", v: "sihoo.com product page and the Amazon listing (ASIN B0DQTRVSHS), checked 2026-09-10. Basis for the anti-gravity mechanism, 6D arms, dual lumbar, dimensions, capacity and warranty." },
    { k: "Published reviews", v: "Third-party reviews (e.g. TechRadar, Forbes) summarised for the recline feel and the headrest caution; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are SIHOO's published figures as of the date shown and are not independently verified by Furniblog. The recline angle isn't officially stated and a German Design Award is a manufacturer claim — confirm details on the listing you buy from.",
  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "Best office chairs under $300: verified picks", href: "/blog/best-office-chairs-under-300-verified-picks" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

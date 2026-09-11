import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * SIHOO Doro C300 — research-based base-model buying guide.
 * Source of truth: design-handoff file 06 (checked against Amazon ASIN
 * B0C3T865C2 on 2026-09-08). Armrests = 3D (listing), NOT 4D (SIHOO page).
 * No fixed prices anywhere — live price is on the Amazon button only.
 */
export const SIHOO_DORO_C300: RichReview = {
  asin: "B0C3T865C2",
  eyebrow: "SIHOO · Office chairs · Buying guide",
  heroIntro:
    "The SIHOO Doro C300 pairs self-adaptive lumbar support with an all-mesh build and 3D armrests at a mid-range price. This guide covers its confirmed features, fit and what to check before buying.",
  verdictOneLiner: "Self-adaptive lumbar, all-mesh build and 3D armrests at a mid-range price.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Hero: three-quarter front view, black C300, neutral backdrop. Our own photography only.",
  galleryBriefs: [
    "Back view: frame and arm mounts",
    "Right-side controls",
    "3D armrest travel",
    "Headrest and backrest stops",
  ],

  quickFacts: [
    { label: "Model", value: "Doro C300", note: "Base model, Black. Not Pro / Pro V2." },
    { label: "Armrests", value: "3D", note: 'Listing title: "Ultra Soft 3D Armrests"' },
    { label: "Back & seat", value: "Full mesh", note: "Mesh back and mesh seat" },
    { label: "Lumbar", value: "Self-adaptive", note: "Dynamic, no manual dial" },
    { label: "Backrest · headrest", value: "Adjustable", note: "Both adjustable per listing" },
  ],

  checks: [
    { n: "01", title: "Confirm you are buying the base C300", body: "The C300, C300 Pro and C300 Pro V2 are separate chairs sold under near-identical names and photography. The listing we link is the base model in Black (ASIN B0C3T865C2). Read the model name in the title, not the family name." },
    { n: "02", title: "Resolve the armrest description", body: "The reviewed Amazon title says 3D while SIHOO's page says 4D. This does not establish which hardware a seller will ship. Ask for the selected model's adjustment diagram if arm movement is important to your setup." },
    { n: "03", title: "Check how the lumbar support is controlled", body: "Do not infer an independent height or depth lock from an adaptive-support description. If you require a particular support position, ask the seller to identify the relevant controls on the exact model." },
    { n: "04", title: "Take the weight capacity from the listing", body: "SIHOO's page documents 330 lbs. Confirm the capacity for the selected item before ordering. A published maximum is not a promise about long-term durability or personal fit." },
    { n: "05", title: "Know which return terms apply to your order", body: "The 30-day trial applies to orders from SIHOO's official store only. An Amazon order follows Amazon's return window, which depends on who the seller is — check it on the listing before you buy." },
  ],

  dims: [
    { k: "Overall dimensions", v: '28 in W × 28 in D × 42–49 in H', tier: "B" },
    { k: "Seat-to-floor height", v: "Not verified for the linked configuration; do not substitute overall chair height", tier: "C" },
    { k: "Seat depth", v: "17.13–18.11 in (range as published; adjustability on the base model to be confirmed)", tier: "B" },
    { k: "Backrest height", v: "18.11–21.65 in, adjustable", tier: "B" },
    { k: "Weight capacity", v: "Not confirmed for the linked listing — SIHOO documents 330 lb, some sources say 300 lb; check the Amazon listing", tier: "C" },
    { k: "Recline", v: "Up to 130°", tier: "B" },
    { k: "Recline lock stages", v: "Stop count not confirmed for the base model", tier: "C" },
    { k: "Recommended user height", v: "No universal fit range established by Furniblog", tier: "C" },
    { k: "Product weight", v: "50.93 lbs", tier: "B" },
    { k: "Armrest padding", v: "PU-coated", tier: "B" },
    { k: "Warranty", v: "3 years", tier: "B" },
  ],
  dimsSourceNote:
    "Source: SIHOO product page, reviewed September 10, 2026. Manufacturer figures are not our measurements. The reviewed Amazon dimensions differ; do not combine the two into a single specification. Confirm the selected model's drawing.",

  adjustable: [
    { k: "Armrests — 3D", v: "Up/down, forward/back, pivot; synchronised with the backrest on recline.", src: "Amazon listing (confirmed)" },
    { k: "Backrest height", v: "Adjustable; 18.11–21.65 in per SIHOO.", src: "Amazon listing · SIHOO page" },
    { k: "Headrest", v: "Listed as adjustable; verify the movement range for your configuration.", src: "Amazon listing" },
    { k: "Recline", v: "Up to 130°, weight-sensing resistance.", src: "SIHOO page (manufacturer-documented)" },
    { k: "Seat height", v: "Gas lift; seat-to-floor range not published.", src: "Range not confirmed" },
  ],
  fixed: [
    { k: "Lumbar depth and height", v: "Independent locking controls are not verified here; request the model-specific diagram.", src: "Configuration check" },
    { k: "Recline tension", v: "If manual resistance control is essential, ask the seller to demonstrate it on the selected model.", src: "Configuration check; not a tested defect" },
    { k: "Seat depth", v: "A slider is not verified for this base-model listing. A depth range alone does not prove adjustable travel.", src: "Evidence limit" },
    { k: "Armrest lock", v: "Ask for confirmation of locking controls if a fixed arm position is essential.", src: "Configuration check; not a tested defect" },
  ],

  pros: [
    { t: "An adaptive support approach to compare with manually positioned lumbar support.", src: "Editorial selection criterion" },
    { t: "Full-mesh back and seat with a flexible triangular backrest frame, built around airflow through long sittings.", src: "Amazon listing · SIHOO page" },
    { t: "Mesh seating is worth considering if you already prefer it to a padded cushion.", src: "Editorial selection criterion; not a comfort test" },
  ],
  cons: [
    { t: "Conflicting listing descriptions require extra configuration checks before buying.", src: "Source comparison" },
    { t: "Seat-height fit and seat-depth adjustment remain unverified for the linked item.", src: "Evidence limit" },
    { t: "No Furniblog sitting or durability test supports an all-day comfort recommendation.", src: "Testing disclosure" },
  ],

  forWho: [
    "Shoppers who want to compare mesh seating with a padded-seat alternative",
    "Work-from-home setups prioritising breathability and adaptive lumbar over executive leather aesthetics",
    "Multi-tasking workers who shift between typing, video calls, reading and light reclining throughout the day",
  ],
  skipWho: [
    "Need a confirmed seat-height range or seat-depth slider that the seller cannot demonstrate",
    "Prefer manual lumbar depth control",
    "Want armrests that lock firmly",
    "Need an independently tested recommendation rather than a specification-based shortlist",
  ],

  rivals: [
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic (auto-adjusting)", arms: "3D coordinated (synced recline)", standout: "Adaptive lumbar at a mid-tier price", isSelf: true },
    { name: "SIHOO M18", href: "/compare/sihoo-m18-vs-sihoo-doro-c300", lumbar: "See model comparison", arms: "See model comparison", standout: "Compare the padded-seat alternative and adjustment trade-offs" },
  ],

  buy: {
    productTitle: "SIHOO Doro C300 — Black",
    retailerNote: "Amazon · ASIN B0C3T865C2 · base model, not Pro / Pro V2",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check the return window on the Amazon listing. The 30-day trial is offered by SIHOO's official store only and does not apply here." },
      { k: "Warranty", v: "3 years, as documented by SIHOO. Confirm on the listing you order from." },
      { k: "What to check", v: 'Title says "Doro C300" (not Pro), "3D Armrests", colour Black, and who the item is sold and shipped by.' },
    ],
    officialStore: {
      label: "SIHOO official store",
      note: "30-day trial applies to orders from SIHOO's own store only. Not an affiliate link.",
    },
    disclaimer:
      'Not verified by Furniblog: price, seller ("sold by"), stock and colour availability change without notice — confirm all of them on the Amazon listing. Affiliate link; commission does not change the price you pay or what this review says.',
  },

  verdict: [
    "Shortlist the base C300 if its mesh seat and adaptive support approach match what you want to compare. Our recommendation is conditional: resolve the listing discrepancies and establish fit before buying. We have not hands-on tested it, so the current evidence does not justify calling it comfortable for every body type or equal to a more expensive chair.",
    "If you prefer a padded seat, start with the linked M18 comparison. If a particular adjustment is essential, ask the seller to demonstrate it on the exact model. An unanswered fit question is a reason to keep comparing, not to assume that a higher-priced version solves it.",
  ],
  verdictPullQuote:
    "Choose the configuration that fits your requirements, not the longest feature list.",

  faqs: [
    { q: "Is the Doro C300 the same chair as the C300 Pro?", a: "No. They are separate products sold under similar names. This review and the buy link cover the base C300 in Black (ASIN B0C3T865C2). Check the model name in the listing title before ordering." },
    { q: "Are the armrests 3D or 4D?", a: "The reviewed Amazon title says 3D; SIHOO's page says 4D. Confirm the delivered hardware with the seller rather than treating either label as a guarantee." },
    { q: "Does the base C300 have seat-depth adjustment?", a: "We have not verified a slider on the linked configuration. A depth range in a specification table does not establish adjustable travel. Request the correct model's control diagram." },
    { q: "Will it fit me?", a: "SIHOO publishes overall height (42–49 in), backrest height (18.11–21.65 in) and seat depth (17.13–18.11 in), but not a seat-to-floor range or a recommended user height for the base model. Take the seat height from the listing and compare it with your desk. Our own measurements will be added after testing." },
    { q: "Can I set the lumbar support myself?", a: "Do not assume a manual height or depth lock from an adaptive-support description. We have not verified those controls on the linked configuration. Ask the seller to demonstrate them if they are essential to you." },
    { q: "Does the 30-day trial apply to Amazon orders?", a: "No. The 30-day trial is offered by SIHOO's official store only. Amazon orders follow Amazon's return window, which depends on the seller — check it on the listing." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This review is research-based, built from the Amazon listing, SIHOO's documentation and published reviews. When hands-on testing is complete we will add our own measurements, photography and a note of what changed." },
  ],

  sources: [
    { k: "Amazon listing", url: "https://www.amazon.com/dp/B0C3T865C2", v: "Available page representation reviewed September 10, 2026. Model identity and listing-description comparison; not live price or stock." },
    { k: "SIHOO product page", url: "https://www.sihoo.com/products/sihoo-doro-c300-ergonomic-office-chair", v: "Reviewed September 10, 2026. Manufacturer-labelled specifications, not independent testing." },
    { k: "Research limits", v: "Pro/S300 reviews are not used as evidence for the base chair. Untraceable comfort anecdotes and universal fit claims have been removed." },
  ],

  checksTitle: "Check these five things before you buy",
  checksIntro:
    "The Doro name covers several chairs that share photography and spec language. Most disappointment comes from ordering a neighbouring model, so start here.",
  dimsIntro:
    "Manufacturer figures come from SIHOO's official product page; we check them against the Amazon listing before treating them as confirmed. Values we can't confirm for the linked listing are marked as such — take those from the listing you buy from.",
  forWhoTitle: "The C300 shines for",
  sourcesFooter:
    "Manufacturer and seller statements are not independent testing. Available page representations can lag seller changes. Where sources disagree, confirm the selected configuration rather than assuming either description guarantees the delivered hardware.",

  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Duramont Ergonomic Office Chair — research-based buying guide data.
 * Facts from the Amazon listing (ASIN B0797HZ8W1), Duramont's official store
 * and published hands-on reviews (checked 2026-09-10). Spec conflicts flagged:
 * capacity 330 lb (official) vs 350 (one review) -> use 330; one listing
 * advertises "3D" armrests but hands-on tests found ~height + screw-set depth
 * -> not claimed as true 3D; headrest marketed adjustable but reviewers report
 * limited range. No fixed prices.
 */
export const DURAMONT_ERGONOMIC: RichReview = {
  asin: "B0797HZ8W1",
  eyebrow: "Duramont · Office chairs · Buying guide",
  heroIntro:
    "The Duramont Ergonomic Office Chair is a high-back mesh chair with a cushioned seat, adjustable lumbar and headrest, and rollerblade wheels, sold in the mid-budget range. This guide covers its confirmed features, where the marketing and hands-on reviews disagree, and what to check before buying.",
  verdictOneLiner: "A breathable high-back mesh chair for the price — with adjustability that reviewers find limited.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black Duramont mesh chair.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from the manufacturer's specs and the Amazon listing (ASIN B0797HZ8W1).",
  quickFacts: [
    { label: "Model", value: "Ergonomic (mesh)", note: "Black / Grey / Brown. Not the leather executive model." },
    { label: "Weight capacity", value: "330 lb", note: "Manufacturer figure" },
    { label: "Back / seat", value: "Mesh back, cushioned seat", note: "Seat is foam, not mesh" },
    { label: "Wheels", value: "Rollerblade", note: "Blade-style casters" },
    { label: "Warranty", value: "5 years", note: "Per Duramont" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Duramont's marketing and independent reviews disagree on a few adjustments, so confirm the ones that matter to you before ordering.",
  checks: [
    { n: "01", title: "Get the mesh model, not the leather one", body: "Duramont sells two different chairs: this breathable mesh Ergonomic Office Chair (ASIN B0797HZ8W1) and a separate Reclining Leather Executive chair. Make sure the listing is the mesh model, and pick your colour (Black, Grey or Brown)." },
    { n: "02", title: "Don't count on true 3D armrests", body: "One listing advertises \"3D\" armrests, but hands-on reviewers found the arms adjust for height, with forward/back set only by loosening screws (about an inch). Treat the arms as roughly 2D and confirm on the listing if arm movement matters to you." },
    { n: "03", title: "The seat is deep and doesn't adjust", body: "The seat pan is cushioned and on the deep side with no seat-depth slider, and its exact depth isn't published. Shorter sitters should check that their feet reach the floor and their back still meets the lumbar; there's no depth adjustment to compensate." },
    { n: "04", title: "Lumbar and headrest adjust less than the photos suggest", body: "The lumbar is adjustable but reviewers say it moves only a little, and the headrest — marketed as height/angle adjustable — is described in tests as limited or near-fixed. If you need strong lumbar or headrest tuning, weigh this carefully." },
  ],

  dims: [
    { k: "Seat height", v: "≈ 16.5–20.8 in (gas lift)", tier: "B" },
    { k: "Weight capacity", v: "330 lb (one review cites 350; 330 is the manufacturer figure)", tier: "B" },
    { k: "Recline", v: "Tilt lockable at multiple angles (~90–120°); does not lie flat", tier: "B" },
    { k: "Armrests", v: "Height-adjustable; forward/back set by loosening screws. \"3D\" is advertised but not confirmed in hands-on tests", tier: "C" },
    { k: "Lumbar", v: "Adjustable height and depth, but small range per reviewers", tier: "C" },
    { k: "Headrest", v: "Integrated; marketed adjustable, reported limited/near-fixed by reviewers", tier: "C" },
    { k: "Seat depth", v: "Not published; deep seat, no depth adjustment", tier: "C" },
    { k: "Back / seat", v: "Breathable mesh back; cushioned foam seat", tier: "B" },
    { k: "Chair weight", v: "≈ 44.8 lb", tier: "B" },
    { k: "Warranty", v: "5 years", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: Amazon listing (ASIN B0797HZ8W1), Duramont official store and published hands-on reviews (checked 2026-09-10). \"Not confirmed\" rows disagree between marketing and testing — confirm on the listing you buy from.",

  adjustable: [
    { k: "Seat height", v: "Gas lift, ≈ 16.5–20.8 in.", src: "Listing / official (documented)" },
    { k: "Recline", v: "Tilt with tension; lockable at multiple angles.", src: "Published reviews (research)" },
    { k: "Armrest height", v: "Up/down; forward/back only by loosening screws.", src: "Published hands-on reviews" },
    { k: "Lumbar", v: "Height and depth, small range.", src: "Published reviews (research)" },
    { k: "Headrest", v: "Marketed height/angle; limited in tests.", src: "Marketing vs reviews (conflict)" },
  ],
  fixed: [
    { k: "Seat depth", v: "No seat-depth adjustment; deep fixed pan.", src: "Published reviews" },
    { k: "Seat material", v: "Cushioned foam seat — not mesh, not swappable.", src: "Listing" },
    { k: "True 3D arms", v: "Not confirmed; treat as ~2D.", src: "Marketing vs reviews (conflict)" },
  ],

  pros: [
    { t: "Breathable high-back mesh with good torso coverage, praised by reviewers especially for taller users.", src: "Published reviews (research)" },
    { t: "Solid build and easy assembly for a mid-budget chair.", src: "Published reviews (research)" },
    { t: "Recline locks at multiple angles with tension control, not just upright or fully open.", src: "Published reviews (research)" },
    { t: "5-year warranty, longer than many chairs at this price.", src: "Duramont (documented)" },
  ],
  cons: [
    { t: "Real-world adjustability is limited — arms are screw-set for depth, lumbar moves little.", src: "Published hands-on reviews" },
    { t: "Deep, non-adjustable seat can leave shorter sitters without floor contact.", src: "Published reviews (research)" },
    { t: "Headrest is described as limited or near-fixed despite the marketing.", src: "Published reviews (research)" },
    { t: "Some owners report seat-cushion compression after a year or two.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The Duramont suits",
  forWho: [
    "Taller sitters who want a breathable high-back mesh chair on a mid-budget",
    "Buyers who value a long (5-year) warranty at this price",
    "People who set a chair once and don't fuss over fine arm/lumbar tuning",
  ],
  skipWho: [
    "Are shorter and need a shallower or depth-adjustable seat",
    "Need genuine 3D/4D armrests or strong lumbar adjustment",
    "Want a fully adjustable, dialed-in ergonomic fit",
  ],

  rivals: [
    { name: "Duramont Ergonomic", lumbar: "Adjustable (small range)", arms: "~2D (screw-set depth)", standout: "Breathable high-back mesh, 5-yr warranty", isSelf: true },
    { name: "Nouhaus Ergo3D", lumbar: "3D adjustable", arms: "4D", standout: "Full mesh with 4D arms, similar price" },
    { name: "Ticova Ergonomic", lumbar: "Dynamic/adjustable", arms: "Adjustable", standout: "Thick headrest, popular mid-budget mesh" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar, all-mesh" },
  ],

  buy: {
    productTitle: "Duramont Ergonomic Office Chair (Mesh)",
    retailerNote: "Amazon · ASIN B0797HZ8W1 · Black / Grey / Brown",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check it on the listing." },
      { k: "Warranty", v: "Duramont documents a 5-year warranty. Confirm on the listing you order from." },
      { k: "What to check", v: "It's the mesh Ergonomic model (not the leather executive), the colour you want, and the current armrest description." },
    ],
    officialStore: {
      label: "Duramont (official)",
      note: "Also sold direct at duramontchairs.com with colour options. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://duramontchairs.com/products/duramont-ergonomic-office-chair-black",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and colour change without notice — confirm on the listing. The Amazon link is an affiliate link; the Duramont link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The Duramont earns its place as a mid-budget high-back mesh chair: the breathable back covers the torso well, the build is solid for the money, the recline locks at useful angles, and the 5-year warranty is generous at this price. For a taller sitter who wants airflow without spending premium money, it's a reasonable pick.",
    "Where it slips is adjustability. Independent reviewers consistently find the arms stiff (depth set by screws, not a true 3D mechanism), the lumbar's travel small, and the headrest limited despite the marketing — and the deep, non-adjustable seat doesn't suit shorter people. If a precise, dialed-in fit matters, a chair like the Nouhaus Ergo3D (4D arms, 3D lumbar) at a similar price is worth comparing before you decide.",
  ],
  verdictPullQuote:
    "Good airflow and a long warranty for the money — just don't expect the fine adjustability the marketing implies.",

  faqs: [
    { q: "Does the Duramont have 3D armrests?", a: "One listing advertises \"3D\" arms, but hands-on reviews found height adjustment with forward/back set by loosening screws — closer to 2D. Confirm the current arm description on the listing." },
    { q: "What is the weight capacity?", a: "Duramont's figure is 330 lb (one review cites 350; use the manufacturer's 330 and confirm on the listing)." },
    { q: "Is the seat mesh?", a: "No. The back is breathable mesh; the seat is a cushioned foam pan, and it is deep with no depth adjustment." },
    { q: "Is there more than one Duramont chair?", a: "Yes — this mesh Ergonomic model and a separate Reclining Leather Executive chair. This guide covers the mesh model (ASIN B0797HZ8W1)." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide built from the Amazon listing, Duramont's documentation and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Amazon listing", v: "Duramont Ergonomic Office Chair — ASIN B0797HZ8W1. Checked 2026-09-10. Basis for model, capacity, mesh back/cushion seat and rollerblade wheels." },
    { k: "Duramont official store", v: "duramontchairs.com product page, checked 2026-09-10. Basis for colour options and the 5-year warranty." },
    { k: "Published hands-on reviews", v: "Third-party tests (e.g. TechGearLab) summarised for the adjustability cautions and recline notes; not first-hand." },
  ],
  sourcesFooter:
    "Specifications combine Duramont's published figures with independent hands-on reviews as of the date shown and are not independently verified by Furniblog. Where marketing and testing disagree (armrests, headrest), the item is marked not confirmed — check the listing you buy from.",
  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "Best office chairs under $300: verified picks", href: "/blog/best-office-chairs-under-300-verified-picks" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

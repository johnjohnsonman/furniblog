import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * SIDIZ T50 (TNB500) — research-based buying guide data.
 * Facts from SIDIZ America, the Amazon listing and published reviews (checked
 * 2026-09-10). Headrest is SKU-dependent (H-suffix includes it). Arms are 3D
 * (not 4D). Capacity 275 lb official (some reviews say 300). Warranty 3 yr
 * reliable (one outlier says 5). No fixed prices.
 */
export const SIDIZ_T50: RichReview = {
  asin: "B083FBN9BH",
  eyebrow: "SIDIZ · Office chairs · Buying guide",
  heroIntro:
    "The SIDIZ T50 is a Korean-designed mesh-back chair that packs 3D arms, two-way lumbar, seat-depth and forward-tilt adjustment into a sub-$400 price. This guide covers its confirmed features, which version to buy, and what to check.",
  verdictOneLiner: "Feature-dense sub-$400 ergonomics — arms are 3D and the headrest is a version choice.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black SIDIZ T50.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from SIDIZ America, the Amazon listing and published specs (checked 2026-09-10).",
  quickFacts: [
    { label: "Model", value: "T50 (TNB500)", note: "Below the T80" },
    { label: "Armrests", value: "3D", note: "Not 4D" },
    { label: "Lumbar", value: "2-way", note: "Height + depth" },
    { label: "Seat", value: "Depth-adjust + forward tilt", note: "Rare at the price" },
    { label: "Weight capacity", value: "275 lb", note: "Official figure" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The T50 is unusually adjustable for the price; the key decisions are the headrest version and confirming the fit numbers, which vary by source.",
  checks: [
    { n: "01", title: "Pick the headrest version", body: "The headrest is not universal: the H-suffix model (e.g. TNB500HLDA) includes an adjustable headrest, while the LDA model has none. Amazon titles reflect this — if you want neck support, buy the headrest version and confirm it on the listing." },
    { n: "02", title: "T50 vs T80", body: "The T50 is the standard model. The step-up T80 adds a synchronous auto-tilt mechanism, wider lumbar, thicker padding and a depth-adjustable headrest. If those matter, compare the T80 before buying." },
    { n: "03", title: "Use the seat-depth and forward-tilt adjustments", body: "The T50 offers seat-depth adjustment and a forward-tilt (seat slope) that are usually found on pricier chairs, plus a 2-way (height + depth) lumbar and 3D arms. Set these up for your body — they're the reason to choose it." },
    { n: "04", title: "Confirm the fit numbers and mind the casters", body: "Seat height (≈ 17–21.5 in) and seat depth ranges differ slightly by source; confirm on the listing. Reviewers also note it rolls fast on hard floors — consider a mat if that bothers you." },
  ],

  dims: [
    { k: "Seat width", v: "≈ 18.5–19.9 in", tier: "B" },
    { k: "Seat height", v: "≈ 17–21.5 in (sources vary)", tier: "C" },
    { k: "Seat depth", v: "Adjustable, ≈ 18.3–21.6 in (sources vary)", tier: "C" },
    { k: "Weight capacity", v: "275 lb (some reviews say 300; use official 275)", tier: "B" },
    { k: "Recline", v: "5-position lockable tilt ≈ 90–115°, with tension", tier: "B" },
    { k: "Armrests", v: "3D (height, pivot/angle, forward/back)", tier: "A" },
    { k: "Lumbar", v: "2-way (height + depth)", tier: "B" },
    { k: "Headrest", v: "Included only on H-suffix models (height + angle)", tier: "B" },
    { k: "Extras", v: "Forward-tilt (seat slope) adjustment", tier: "B" },
    { k: "Back / seat", v: "Ventilated mesh back; fabric-cushion seat (washable cover on some)", tier: "B" },
    { k: "Warranty", v: "3 years + 30-day money-back", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: SIDIZ America, Amazon listings and published reviews (checked 2026-09-10). Seat height/depth ranges differ slightly between sources; headrest and colour are SKU-dependent. GREENGUARD/BIFMA certified. Confirm the version on the listing.",

  adjustable: [
    { k: "Armrests — 3D", v: "Height, pivot/angle and forward/back.", src: "SIDIZ / listing (documented)" },
    { k: "Lumbar", v: "Height and depth.", src: "SIDIZ (documented)" },
    { k: "Seat depth", v: "Adjustable slider.", src: "SIDIZ (documented)" },
    { k: "Forward tilt", v: "Seat-slope adjustment.", src: "SIDIZ (documented)" },
    { k: "Recline", v: "5-position lockable tilt with tension.", src: "SIDIZ (documented)" },
  ],
  fixed: [
    { k: "Headrest (LDA model)", v: "Not included on non-H models.", src: "SIDIZ (documented)" },
    { k: "Arm tier", v: "3D — not the 4D found on some rivals.", src: "SIDIZ (documented)" },
    { k: "Auto-tilt", v: "No synchronous auto-tilt (that's the T80).", src: "SIDIZ (documented)" },
  ],

  pros: [
    { t: "Feature density for the price — 3D arms, 2-way lumbar, seat-depth and forward-tilt adjustment rarely seen sub-$400.", src: "SIDIZ · published reviews" },
    { t: "Wide, usable seat-height range plus forward tilt that mimics pricier chairs.", src: "Published reviews (research)" },
    { t: "Well-regarded sculpted design; GREENGUARD-certified materials.", src: "SIDIZ · published reviews" },
  ],
  cons: [
    { t: "Secondary parts (arms, headrest, knobs/levers) and thin (~2.5 in) seat padding can feel cheap, per reviewers.", src: "Published reviews (research)" },
    { t: "Rolls fast on hard floors and doesn't recline deeply.", src: "Published reviews (research)" },
    { t: "Headrest is a version choice, not standard — easy to buy the no-headrest SKU by mistake.", src: "SIDIZ (documented)" },
  ],

  forWhoTitle: "The T50 suits",
  forWho: [
    "Buyers who want lots of real adjustment (seat depth, forward tilt, 2-way lumbar) under $400",
    "People who like a mesh back and a clean, modern design",
    "Those who'll pick the right headrest version for their needs",
  ],
  skipWho: [
    "Want a synchronous auto-tilt or thicker padding (look at the T80)",
    "Need 4D arms",
    "Want a deep recline for napping",
  ],

  rivals: [
    { name: "SIDIZ T50", lumbar: "2-way (height + depth)", arms: "3D", standout: "Seat-depth + forward tilt sub-$400", isSelf: true },
    { name: "Ticova Ergonomic", lumbar: "2-axis (height + depth)", arms: "3D", standout: "Similar adjustment, cheaper" },
    { name: "Branch Ergonomic Chair", lumbar: "Adjustable, removable", arms: "3D", standout: "Seat-depth slider, 7-yr warranty" },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "All-mesh, adaptive lumbar" },
  ],

  buy: {
    productTitle: "SIDIZ T50",
    retailerNote: "Amazon · ASIN B083FBN9BH · headrest is a version (H-suffix) choice",
    ctaLabel: "Check price on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; SIDIZ lists a 30-day money-back. Check the listing." },
      { k: "Warranty", v: "3 years (one outlier source says 5). Confirm current US terms on the listing." },
      { k: "What to check", v: "Whether the version includes a headrest (H-suffix), the colour, and the seat-height/depth ranges." },
    ],
    officialStore: {
      label: "SIDIZ (official)",
      note: "Sold direct at sidiz.com (SIDIZ America) with all versions and colours. Direct link (not an affiliate link). Check current price on the site.",
      url: "https://www.sidiz.com/collections/t50",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock, colour and whether a version includes a headrest change without notice — confirm on the listing. The Amazon link is an affiliate link; the SIDIZ link is a direct, non-affiliate link. Commission does not change the price you pay or what this guide says.",
  },

  verdict: [
    "The SIDIZ T50 punches above its price on adjustment: 3D arms, a two-way lumbar, an adjustable seat depth and a forward tilt — a combination usually reserved for pricier chairs — wrapped in a clean, award-cited design with GREENGUARD-certified materials. For a sub-$400 chair you can genuinely dial in, it's one of the stronger options.",
    "Where it shows its price is in the details: reviewers find the arms, headrest, knobs and thin seat padding a bit cheap, it rolls fast on hard floors, and it doesn't recline deeply. Also decide up front whether you want the headrest version, since it's a separate SKU. Accept those trade-offs and the T50 is a lot of adjustable chair for the money.",
  ],
  verdictPullQuote:
    "Seat-depth and forward-tilt adjustment under $400 — just pick the right headrest version and expect budget-grade knobs.",

  faqs: [
    { q: "Does the T50 include a headrest?", a: "Only on the H-suffix version (e.g. TNB500HLDA). The LDA version has no headrest — check the listing before buying." },
    { q: "Are the arms 3D or 4D?", a: "3D — height, pivot/angle and forward/back. The T80 is the step-up model." },
    { q: "What's the weight capacity?", a: "275 lb per SIDIZ (some reviews say 300). Use the official 275 and confirm on the listing." },
    { q: "How is it different from the T80?", a: "The T80 adds a synchronous auto-tilt mechanism, wider lumbar, thicker padding and a depth-adjustable headrest." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide from SIDIZ's specs, the Amazon listing and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "SIDIZ (official) / Amazon", v: "SIDIZ America and the Amazon listing (ASIN B083FBN9BH), checked 2026-09-10. Basis for 3D arms, 2-way lumbar, seat-depth/forward-tilt, capacity and warranty." },
    { k: "Published reviews", v: "Third-party reviews (e.g. ChairsFX, Ergonomic Trends) summarised for value and the build-quality cautions; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are SIDIZ's figures plus published reviews as of the date shown and are not independently verified by Furniblog. Seat height/depth ranges and the headrest are version/source-dependent — confirm on the listing you buy from.",
}

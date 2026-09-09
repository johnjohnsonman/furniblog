import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * SIHOO Doro C300 — verified structured review data.
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
    { n: "02", title: "The Amazon listing describes 3D armrests", body: 'The Amazon listing title says "Ultra Soft 3D Armrests", while SIHOO\'s own product page describes them as 4D. We follow the listing, because that is the chair you receive. The armrests move up/down, forward/back and pivot, and shift with the backrest when you recline.' },
    { n: "03", title: "Decide whether automatic lumbar support suits you", body: "The lumbar support is self-adaptive: it stays in place when you sit upright and moves with you as you recline. There is no dial to set a fixed depth or height. If you rely on a specific lumbar position, a chair with manual lumbar adjustment is the safer choice." },
    { n: "04", title: "Take the weight capacity from the listing", body: "SIHOO's page documents 330 lbs. We could not reliably read a capacity figure from the Amazon listing, so confirm it there before ordering. A stated maximum is a test rating, not a promise about long-term durability for any particular body." },
    { n: "05", title: "Know which return terms apply to your order", body: "The 30-day trial applies to orders from SIHOO's official store only. An Amazon order follows Amazon's return window, which depends on who the seller is — check it on the listing before you buy." },
  ],

  dims: [
    { k: "Overall dimensions", v: '28 in W × 28 in D × 42–49 in H', tier: "B" },
    { k: "Seat-to-floor height", v: "Not published for the base C300; only overall height is given", tier: "C" },
    { k: "Seat depth", v: "17.13–18.11 in (range as published; adjustability on the base model to be confirmed)", tier: "B" },
    { k: "Backrest height", v: "18.11–21.65 in, adjustable", tier: "B" },
    { k: "Weight capacity", v: "Not confirmed for the linked listing — SIHOO documents 330 lb, some sources say 300 lb; check the Amazon listing", tier: "C" },
    { k: "Recline", v: "Up to 130°", tier: "B" },
    { k: "Recline lock stages", v: "Stop count not confirmed for the base model", tier: "C" },
    { k: "Recommended user height", v: "Not confirmed; published ranges appear to describe the Pro", tier: "C" },
    { k: "Product weight", v: "50.93 lbs", tier: "B" },
    { k: "Armrest padding", v: "PU-coated", tier: "B" },
    { k: "Warranty", v: "3 years", tier: "B" },
  ],
  dimsSourceNote:
    'Source: SIHOO official product page (fetched 2026-09-08). "Not confirmed" rows have no value we can stand behind for the base C300; take those figures from the listing you buy from.',

  adjustable: [
    { k: "Armrests — 3D", v: "Up/down, forward/back, pivot; synchronised with the backrest on recline.", src: "Amazon listing (confirmed)" },
    { k: "Backrest height", v: "Adjustable; 18.11–21.65 in per SIHOO.", src: "Amazon listing · SIHOO page" },
    { k: "Headrest", v: "Adjustable for height, reach and tilt.", src: "Amazon listing (confirmed)" },
    { k: "Recline", v: "Up to 130°, weight-sensing resistance.", src: "SIHOO page (manufacturer-documented)" },
    { k: "Seat height", v: "Gas lift; seat-to-floor range not published.", src: "Range not confirmed" },
  ],
  fixed: [
    { k: "Lumbar depth and height", v: "Self-adaptive only; no manual setting.", src: "Amazon listing · SIHOO page" },
    { k: "Recline tension", v: "Set by the weight-sensing mechanism; no manual tension control.", src: "Published reviews (research)" },
    { k: "Seat depth", v: "Adjustability on the base C300 is not confirmed; the Pro adds a depth slider.", src: "Existing review copy (research)" },
    { k: "Armrest lock", v: "Reviewers report the armrests shift without a locking position.", src: "Published reviews (research)" },
  ],

  pros: [
    { t: "Self-adaptive lumbar support that keeps contact with the lower back while reclining — rare at this tier.", src: "Amazon listing · SIHOO page" },
    { t: "Full-mesh back and seat with a flexible triangular backrest frame, built around airflow through long sittings.", src: "Amazon listing · SIHOO page" },
    { t: "Arms mount to the frame rather than the seat, giving a distinctive rear silhouette and a stable feel per reviewers.", src: "Published reviews (research)" },
  ],
  cons: [
    { t: "Armrests lack a locking mechanism and can shift under pressure.", src: "Published reviews (research)" },
    { t: "Headrest sits low for sitters above about 6 ft.", src: "Published reviews (research)" },
    { t: "Recline tension cannot be adjusted manually; the weight-sensing system decides.", src: "Published reviews (research)" },
    { t: "Lumbar cannot be set to a fixed depth — a real constraint for some back conditions.", src: "Product documentation, our reading" },
  ],

  forWho: [
    "Budget-conscious professionals seeking premium-class ergonomics without the four-figure price tag",
    "Work-from-home setups prioritising breathability and adaptive lumbar over executive leather aesthetics",
    "Multi-tasking workers who shift between typing, video calls, reading and light reclining throughout the day",
  ],
  skipWho: [
    "Exceed 6′3″ or have a wider hip profile: the seat pan and maximum height may not suit taller or wider users",
    "Prefer manual lumbar depth control",
    "Want armrests that lock firmly",
    "Need a plush, lounge-style feel: the firm mesh prioritises posture over sink-in softness",
  ],

  rivals: [
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic (auto-adjusting)", arms: "3D coordinated (synced recline)", standout: "Adaptive lumbar at a mid-tier price", isSelf: true },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL (manual, dual-pad)", arms: "Fully adjustable", standout: "Iconic design, 12-year warranty, three sizes" },
    { name: "Steelcase Gesture", lumbar: "Adjustable LiveBack", arms: "360° arm movement", standout: "Best-in-class armrests, supports tablet/phone postures" },
    { name: "Autonomous ErgoChair Pro", lumbar: "Adjustable mesh lumbar", arms: "3D", standout: "Footrest included, direct-to-consumer value" },
    { name: "SIHOO M18", lumbar: "Fixed lumbar pad", arms: "2D", standout: "Entry-level ergonomics, budget pick" },
  ],

  buy: {
    productTitle: "SIHOO Doro C300 — Black",
    retailerNote: "Amazon · ASIN B0C3T865C2 · base model, not Pro / Pro V2",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check the return window on the Amazon listing. The 30-day trial is offered by SIHOO's official store only and does not apply here." },
      { k: "Warranty", v: "3 years, as documented by SIHOO. Confirm on the listing you order from." },
      { k: "What to check", v: 'Title says "Doro C300" (not Pro), "3D Armrests", colour Black, and who the item is sold and shipped by.' },
    ],
    sihooTrialNote: "30-day trial applies to orders from SIHOO's own store only. Not an affiliate link.",
    disclaimer:
      'Not verified by Furniblog: price, seller ("sold by"), stock and colour availability change without notice — confirm all of them on the Amazon listing. Affiliate link; commission does not change the price you pay or what this review says.',
  },

  verdict: [
    "The SIHOO Doro C300 is a legitimately impressive feat of value engineering. It delivers genuinely adaptive lumbar support—something usually reserved for chairs costing far more—alongside credible build quality and a design that feels more considered than most mid-tier mesh chairs. The self-adjusting lumbar system works; the all-mesh construction breathes beautifully; and the kudu-inspired aesthetic avoids the plasticky anonymity of budget competitors. For professionals spending 6–9 hours a day seated, especially those working from home on a budget, the C300 offers a compelling blend of biomechanics and affordability.",
    "That said, it is not flawless. Reviewers report that the armrests lack a locking mechanism, the headrest can click audibly during adjustment, and taller or wider users may find the fit constraining. The automatic lumbar—while effective—cannot be manually depth-adjusted, which some purists will miss. But these are quibbles in the context of what the C300 achieves: bringing premium-tier ergonomic thinking to a tier where most chairs still rely on fixed lumbar pads and basic tilt mechanisms.",
  ],
  verdictPullQuote:
    "A chair that adapts rather than resists—proof that smart engineering can democratize ergonomics without sacrificing integrity.",

  faqs: [
    { q: "Is the Doro C300 the same chair as the C300 Pro?", a: "No. They are separate products sold under similar names. This review and the buy link cover the base C300 in Black (ASIN B0C3T865C2). Check the model name in the listing title before ordering." },
    { q: "Are the armrests 3D or 4D?", a: "The Amazon listing we link says 3D. SIHOO's own product page says 4D. We follow the listing, since that describes the chair you receive." },
    { q: "Will it fit me?", a: "SIHOO publishes overall height (42–49 in), backrest height (18.11–21.65 in) and seat depth (17.13–18.11 in), but not a seat-to-floor range or a recommended user height for the base model. Take the seat height from the listing and compare it with your desk. Our own measurements will be added after testing." },
    { q: "Can I set the lumbar support myself?", a: "Not to a fixed position. The lumbar support is self-adaptive and moves with you as you recline. If you need a locked lumbar height and depth, look at chairs with manual lumbar adjustment." },
    { q: "Does the 30-day trial apply to Amazon orders?", a: "No. The 30-day trial is offered by SIHOO's official store only. Amazon orders follow Amazon's return window, which depends on the seller — check it on the listing." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This review is research-based, built from the Amazon listing, SIHOO's documentation and published reviews. When hands-on testing is complete we will add our own measurements, photography and a note of what changed." },
  ],

  sources: [
    { k: "Amazon listing", v: "SIHOO Doro C300, Black — ASIN B0C3T865C2. Checked 2026-09-08. Basis for all listing-confirmed facts (model, 3D armrests, mesh, lumbar, adjustable backrest and headrest)." },
    { k: "SIHOO official product page", v: "Fetched 2026-09-08. Basis for manufacturer-documented dimensions, capacity, recline, weight, warranty and the 30-day store trial." },
    { k: "Published reviews", v: "Third-party reviews summarised in the existing research copy. Basis for the Cautions and the sitting-experience notes; not first-hand." },
  ],
}

/** Registry: slug → rich review data. Add entries here as they are built out. */
export const RICH_REVIEWS: Record<string, RichReview> = {
  "sihoo-doro-c300-advanced-ergonomic-office-chair-review": SIHOO_DORO_C300,
}

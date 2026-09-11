import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Okamura Contessa II (a.k.a. Contessa Seconda) — research-based buying-guide
 * data layered on the existing Chairpedia deep-dive ("In depth" section). Facts
 * from okamura.com, the Amazon.co.jp listing and published reviews (checked
 * 2026-09-10). The chair is heavily optioned (seat/back material, headrest,
 * arms, lumbar); this guide covers those choices and the US buying reality. No
 * fixed prices.
 */
export const OKAMURA_CONTESSA_II: RichReview = {
  asin: null,
  eyebrow: "Okamura · Office chairs · Buying guide",
  heroIntro:
    "The Okamura Contessa II — sold in some markets as the Contessa Seconda — is Japan's answer to the Western \"big three,\" a Giugiaro-styled executive task chair with fingertip \"Smart Operation\" controls at the armrest ends. This guide covers the many options that define each Contessa II and how to buy one in the US.",
  verdictOneLiner: "A Giugiaro-designed Japanese flagship — the options define the chair.",
  verdictNote: "Research-based guide built on our existing Chairpedia deep-dive — not our own lab test.",

  heroShotBrief: "Front, black Okamura Contessa II mesh.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from okamura.com, the Amazon.co.jp listing and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Also called", value: "Contessa Seconda", note: "Same chair (\"Seconda\" = II)" },
    { label: "Controls", value: "Smart Operation", note: "Levers at the armrest tips" },
    { label: "Seat / back", value: "Mesh or cushion", note: "Leather back option" },
    { label: "Weight capacity", value: "≈ 300 lb", note: "Okamura-documented" },
    { label: "US purchase", value: "Dealer / import", note: "Not on US Amazon" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Contessa II is built to order from a menu of options, and in the US it's mostly a dealer or import purchase. Confirm these before committing.",
  checks: [
    { n: "01", title: "Contessa II and Contessa Seconda are the same chair", body: "\"Seconda\" is simply Italian for \"II\"; Japanese listings often read \"Contessa II Seconda.\" Don't pay a premium thinking Seconda is a different, higher model — it isn't." },
    { n: "02", title: "Choose the seat and back material", body: "The back is a Kyoto Nishijin-weave mesh; the seat can be mesh, fabric or leather, and a full leather back is offered. The cushion seat uses a \"Multiple Density Cushion\" (three foam densities). Confirm the exact material combination you're buying." },
    { n: "03", title: "Headrest, arms and lumbar are options", body: "The headrest can be adjustable (height/depth/angle), a fixed large type, or omitted; arms can be 4D adjustable or fixed; and a height-adjustable lumbar (about 60 mm of travel) is an add-on. These change both fit and price — spec them deliberately." },
    { n: "04", title: "Sort out the US buying path first", body: "There's no US Amazon product page; genuine Contessa II in the US comes through Okamura's authorized dealers or import retailers, with the Amazon.co.jp listing being Japan-only. Confirm seller, voltage-free (it's mechanical), warranty coverage and shipping before you buy." },
  ],

  dims: [
    { k: "Seat height", v: "≈ 435–545 mm (17.1–21.5 in)", tier: "B" },
    { k: "Overall height", v: "≈ 994–1104 mm", tier: "B" },
    { k: "Weight capacity", v: "≈ 300 lb (136 kg)", tier: "B" },
    { k: "Back", v: "Kyoto Nishijin-weave mesh (leather back optional)", tier: "B" },
    { k: "Seat", v: "Mesh, fabric or leather; cushion uses a 3-density \"Multiple Density Cushion\"", tier: "B" },
    { k: "Recline", v: "Smooth reclining with free-flow or multiple lockable positions", tier: "B" },
    { k: "Seat depth", v: "Adjustable (sliding seat)", tier: "B" },
    { k: "Armrests", v: "4D adjustable or fixed; regular or leather arm pads", tier: "B" },
    { k: "Lumbar", v: "Optional height-adjustable, ≈ 60 mm travel", tier: "B" },
    { k: "Headrest", v: "Adjustable, fixed large, or none", tier: "B" },
    { k: "Warranty", v: "Not published on the product page (varies by market)", tier: "C" },
  ],
  dimsSourceNote:
    "Sources: okamura.com, the Amazon.co.jp listing and published reviews (checked 2026-09-10). Warranty terms are not stated on Okamura's product page and vary by market — treat as \"Not confirmed\" and check with your seller.",

  adjustable: [
    { k: "Smart Operation controls", v: "Recline and height levers sit at the ends of the armrests for fingertip use.", src: "Okamura (documented)" },
    { k: "Seat depth", v: "Sliding seat.", src: "Okamura (documented)" },
    { k: "Armrests (4D build)", v: "Height, width, depth and angle.", src: "Okamura (documented)" },
    { k: "Lumbar (option)", v: "Height-adjustable, ≈ 60 mm travel.", src: "Okamura (documented)" },
    { k: "Headrest (adjustable build)", v: "Height, depth and angle.", src: "Okamura (documented)" },
  ],
  fixed: [
    { k: "Arms (fixed build)", v: "No adjustment on the fixed-arm option.", src: "Okamura (documented)" },
    { k: "Lumbar (base build)", v: "Not fitted unless you add the adjustable lumbar option.", src: "Okamura (documented)" },
    { k: "Headrest (no-headrest build)", v: "Not fitted unless specified.", src: "Okamura (documented)" },
  ],

  pros: [
    { t: "Giorgetto Giugiaro styling and a Kyoto Nishijin-weave mesh back — a genuinely distinctive flagship.", src: "Published reviews (research)" },
    { t: "\"Smart Operation\" puts recline and height at your fingertips without reaching under the seat.", src: "Okamura (documented)" },
    { t: "Deep option list — mesh or multi-density cushion, adjustable headrest, 4D arms, retrofit lumbar — lets you tailor fit.", src: "Okamura (documented)" },
  ],
  cons: [
    { t: "Hard to buy in the US — dealer or import only, with the main Amazon listing being Japan-only.", src: "Our reading" },
    { t: "Warranty terms aren't published on the product page and vary by market.", src: "Okamura (documented)" },
    { t: "Fully optioned (adjustable headrest, 4D arms, lumbar, leather) the price rises steeply.", src: "Our reading" },
  ],

  forWhoTitle: "Contessa II shines for",
  forWho: [
    "Buyers who want a design-led alternative to the Western flagships",
    "People who value fingertip recline/height controls and a cool mesh back",
    "Those willing to spec seat, back, headrest, arms and lumbar to their body",
  ],
  skipWho: [
    "Want a simple US Amazon purchase with easy returns",
    "Need clearly published US warranty terms up front",
    "Prefer to avoid import/dealer logistics",
  ],

  rivals: [
    { name: "Okamura Contessa II", lumbar: "Optional height-adjustable", arms: "4D or fixed", standout: "Giugiaro design, Smart Operation, Nishijin mesh", isSelf: true },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Up to fully adjustable", standout: "All-mesh, three sizes, easy US buying" },
    { name: "Steelcase Leap V2", lumbar: "Adjustable LiveBack", arms: "4D", standout: "Deep recline, upholstered, US-common" },
    { name: "Okamura Sylphy", lumbar: "Adjustable", arms: "Adjustable", standout: "Okamura's more affordable ergonomic mesh chair" },
  ],

  buy: {
    productTitle: "Okamura Contessa II (Contessa Seconda)",
    retailerNote: "US: authorized dealer / import — no US Amazon product page (Amazon.co.jp is Japan-only)",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Depends entirely on the dealer/importer; the Amazon.co.jp listing is Japan-only. Confirm the return policy with your seller before buying." },
      { k: "Warranty", v: "Not published on Okamura's product page and varies by market — confirm coverage with your seller." },
      { k: "What to check", v: "Seat/back material, headrest type, arm type (4D vs fixed), lumbar option, and the US seller's shipping and support." },
    ],
    officialStore: {
      label: "Okamura (official)",
      note: "Full Contessa II option list and specifications at okamura.com. Direct link (not an affiliate link); US buyers purchase through authorized dealers.",
      url: "https://www.okamura.com/products/contessa-ii/",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock, options and warranty vary widely — and in the US this is a dealer/import purchase. The Amazon search link is an affiliate link and will mostly surface parts or Japan-market listings; the Okamura link is a direct, non-affiliate link. Confirm the exact chair and seller before buying.",
  },

  verdict: [
    "The Contessa II — Contessa Seconda in some markets — is Okamura's flagship and Japan's most credible rival to the Western big three. Giorgetto Giugiaro's styling, the Kyoto Nishijin-weave mesh back and the \"Smart Operation\" controls at the armrest tips give it a character none of the American chairs share, and the option list (mesh or multi-density cushion, adjustable headrest, 4D arms, a retrofit lumbar) lets you tailor it closely.",
    "The friction is buying one in the US. There's no US Amazon product page — genuine chairs come through authorized dealers or importers, warranty terms aren't published on the product page, and a fully optioned build gets expensive. If you want a distinctive, superbly built flagship and don't mind dealer logistics, the Contessa II earns its place; if you want a click-to-buy chair with easy returns, an Aeron or Leap is simpler.",
  ],
  verdictPullQuote:
    "Japan's flagship answer to the big three — spec it carefully and sort out the US dealer path first.",

  faqs: [
    { q: "Is Contessa Seconda different from Contessa II?", a: "No — \"Seconda\" is Italian for \"II.\" Japanese listings often read \"Contessa II Seconda.\" It's the same chair; don't pay extra thinking otherwise." },
    { q: "Can I buy it on US Amazon?", a: "Not as a genuine, straightforward product page. In the US it's an authorized-dealer or import purchase; the Amazon.co.jp listing is Japan-only." },
    { q: "What's \"Smart Operation\"?", a: "Okamura's control layout that places the recline and height levers at the ends of the armrests, so you adjust the chair at your fingertips instead of reaching underneath." },
    { q: "Mesh or cushion seat?", a: "Both are offered. The mesh seat runs cool; the cushion seat uses a three-density \"Multiple Density Cushion.\" A leather back is also available. Confirm the combination on your order." },
    { q: "Has Furniblog tested this chair?", a: "This guide is built on our research-based Chairpedia deep-dive (below) plus Okamura's specs and published reviews. We have not run our own instrumented lab test." },
  ],

  sources: [
    { k: "Okamura (official)", v: "okamura.com Contessa II product and option pages, checked 2026-09-10. Basis for materials, Smart Operation, seat depth, arms, lumbar, headrest and capacity." },
    { k: "Amazon.co.jp listing", v: "Contessa II / Seconda (Japan-market). Basis for confirming the name equivalence and configurations; not a US purchase path." },
    { k: "Published reviews", v: "Third-party reviews summarised for design, comfort and value; not first-hand." },
  ],
  sourcesFooter:
    "Specifications are Okamura's figures plus published reviews as of the date shown and are not independently verified by Furniblog. Warranty and US availability vary by seller — confirm the exact options, seller and coverage before buying.",
  related: [
    { label: "Contessa vs Contessa Seconda: how to tell them apart (used-buying guide)", href: "/blog/okamura-contessa-vs-contessa-seconda-identification-and-used-buying-guide" },
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

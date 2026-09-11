import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Nouhaus Ergo3D — research-based buying guide data.
 * Listing facts from the Amazon listing title (ASIN B07L4ZQMDX, checked
 * 2026-09-09): "4D Adjustable Armrest", "Adjustable Headrest", "Lumbar
 * Support", "Mesh High Back", "Black". Dimensions/recline documented by
 * Nouhaus / retailers. Weight capacity differs by source (see below).
 * No fixed prices; live price is on the Amazon button only.
 */
export const NOUHAUS_ERGO3D: RichReview = {
  asin: "B07L4ZQMDX",
  eyebrow: "Nouhaus · Office chairs · Buying guide",
  heroIntro:
    "The Nouhaus Ergo3D is a full-mesh high-back chair with 4D armrests, a 3D adjustable lumbar and rollerblade-style casters. This guide covers its confirmed features, fit and what to check before buying.",
  verdictOneLiner: "Full-mesh high-back with 4D armrests, 3D lumbar and blade casters.",
  verdictNote: "Research-based guide — hands-on testing not yet completed.",

  heroShotBrief: "Front, black Ergo3D.",
  galleryBriefs: ["Side profile", "Back / lumbar"],

  quickFacts: [
    { label: "Model", value: "Ergo3D", note: "Black. Also Silver Gray / Blue / Black Coffee." },
    { label: "Armrests", value: "4D", note: "Height, width, depth, pivot per listing" },
    { label: "Lumbar", value: "3D adjustable", note: "Per manufacturer" },
    { label: "Back & seat", value: "Full mesh", note: "Breathable mesh throughout" },
    { label: "Casters", value: "Rollerblade-style", note: "Dual-wheel blade casters" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "The Ergo3D is sold in several colours and its stated weight capacity varies by source. Confirm the version and the numbers that matter for your body.",
  checks: [
    { n: "01", title: "Confirm the model and colour", body: "The linked listing is the Ergo3D in Black (ASIN B07L4ZQMDX). Nouhaus sells it in Silver Gray, Brilliant Blue and Black Coffee too, and offers a larger \"Ergo3DL\". Read \"Ergo3D\" and the colour in the title before ordering." },
    { n: "02", title: "Take the weight capacity from the listing", body: "Sources disagree: Nouhaus's site cites up to 330 lb, while the user manual lists a 85–275 lb range. Treat capacity as unconfirmed and read it on the listing you order from. A stated maximum is a test rating, not a durability promise for any particular body." },
    { n: "03", title: "Check the seat depth and hip width if you are taller or broader", body: "Documented seat depth is about 16.3 in with a maximum hip width near 19.7 in. If you are taller or broader, confirm these fit you before ordering — the seat is on the shallower side." },
    { n: "04", title: "Know the return window", body: "An Amazon order follows Amazon's return window, which depends on who the seller is. Check it on the listing before you buy." },
  ],

  dims: [
    { k: "Overall dimensions", v: "27.95 in W × 27.16 in D × 44.09–49.01 in H", tier: "B" },
    { k: "Seat depth", v: "~16.3 in", tier: "B" },
    { k: "Max hip width", v: "~19.7 in", tier: "B" },
    { k: "Weight capacity", v: "Not confirmed — Nouhaus cites up to 330 lb; the manual lists 85–275 lb. Check the listing.", tier: "C" },
    { k: "Armrests", v: "4D (height, width, depth, pivot)", tier: "A" },
    { k: "Lumbar", v: "3D adjustable", tier: "B" },
    { k: "Headrest", v: "Adjustable", tier: "A" },
    { k: "Recline", v: "Up to 135°, adjustable/lockable", tier: "B" },
    { k: "Back / seat", v: "Full breathable mesh", tier: "A" },
    { k: "Base / casters", v: "Aluminium base, rollerblade-style dual casters", tier: "B" },
    { k: "Product weight", v: "~46 lb", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: Amazon listing title (ASIN B07L4ZQMDX) for 4D armrests, headrest and full mesh; Nouhaus / retailers for dimensions and recline. Weight capacity conflicts between sources and is marked as not confirmed — take it from the listing you buy from.",

  adjustable: [
    { k: "Armrests — 4D", v: "Height, width, depth and pivot.", src: "Amazon listing (confirmed)" },
    { k: "Lumbar support", v: "3D adjustable.", src: "Nouhaus specs (documented)" },
    { k: "Headrest", v: "Adjustable.", src: "Amazon listing (confirmed)" },
    { k: "Recline", v: "Up to 135°, adjustable and lockable.", src: "Nouhaus specs (documented)" },
    { k: "Seat height", v: "Gas lift (overall height ~44–49 in).", src: "Retailer specs (documented)" },
  ],
  fixed: [
    { k: "Seat depth", v: "~16.3 in; no published seat-depth slider.", src: "Retailer specs" },
    { k: "Weight capacity", v: "Conflicting figures across sources — confirm on the listing.", src: "Not confirmed" },
  ],

  pros: [
    { t: "Full-mesh back and seat with 4D armrests — a feature set usually seen higher up the price range.", src: "Amazon listing (confirmed)" },
    { t: "3D adjustable lumbar and up-to-135° lockable recline for tuning support and angle.", src: "Nouhaus specs (documented)" },
    { t: "Rollerblade-style dual casters, widely praised in published reviews for smooth rolling.", src: "Published reviews (research)" },
  ],
  cons: [
    { t: "Stated weight capacity conflicts between the manufacturer and the manual — verify before buying.", src: "Manufacturer + manual, our reading" },
    { t: "Seat depth is on the shallow side (~16.3 in), which taller users should check.", src: "Retailer specs" },
    { t: "Assembly and long-term durability draw mixed notes in published reviews.", src: "Published reviews (research)" },
  ],

  forWhoTitle: "The Ergo3D suits",
  forWho: [
    "Buyers who want full mesh and 4D armrests without a premium price",
    "Warm rooms or long sittings where breathability matters",
    "Setups that value smooth rollerblade-style casters",
  ],
  skipWho: [
    "Are tall and need a deeper seat than ~16.3 in",
    "Need a firmly documented high weight capacity (figures conflict)",
    "Prefer a cushioned seat over firm mesh",
  ],

  rivals: [
    { name: "Nouhaus Ergo3D", lumbar: "3D adjustable", arms: "4D", standout: "Full mesh + 4D arms + blade casters", isSelf: true },
    { name: "SIHOO Doro C300", lumbar: "Self-adaptive dynamic", arms: "3D", standout: "Adaptive lumbar, full mesh" },
    { name: "Hbada P5", lumbar: "2D adjustable", arms: "Adjustable", standout: "Retractable footrest, cheaper" },
    { name: "SIHOO M18", lumbar: "Adjustable (height + depth)", arms: "2D", standout: "Cushioned seat, entry budget" },
  ],

  buy: {
    productTitle: "Nouhaus Ergo3D — Black",
    retailerNote: "Amazon · ASIN B07L4ZQMDX · also in Silver Gray / Blue / Black Coffee",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller — check it on the listing." },
      { k: "Warranty", v: "Confirm the warranty terms on the listing you order from." },
      { k: "What to check", v: 'Title says "Ergo3D", the colour you want, "4D", and who it is sold and shipped by. Confirm the weight capacity there too.' },
    ],
    disclaimer:
      'Not verified by Furniblog: price, seller ("sold by"), stock, capacity and colour availability change without notice — confirm all of them on the Amazon listing. Affiliate link; commission does not change the price you pay or what this guide says.',
  },

  verdict: [
    "The Nouhaus Ergo3D packs a full-mesh build, 4D armrests, a 3D adjustable lumbar and rollerblade-style casters into a mid-range price — a specification list that usually costs more. For a warm room or a long working day, the all-mesh design and adjustable arms make it an easy chair to recommend on paper.",
    "The catches are worth heeding: the stated weight capacity conflicts between Nouhaus and its own manual, the seat is fairly shallow at about 16.3 in, and published reviews are mixed on assembly and longevity. Confirm the capacity and seat fit on the listing before buying. If those numbers work for your body, it's one of the better-equipped mesh chairs at its price.",
  ],
  verdictPullQuote:
    "A lot of adjustability and airflow for the money — just verify the weight capacity and seat depth for your body first.",

  faqs: [
    { q: "What is the weight capacity?", a: "It depends on the source: Nouhaus cites up to 330 lb, while the user manual lists 85–275 lb. Treat it as unconfirmed and check the figure on the listing you order from." },
    { q: "Are the armrests really 4D?", a: "The Amazon listing describes 4D armrests — adjustable for height, width, depth and pivot." },
    { q: "Is it full mesh?", a: "Yes — both the high back and the seat are breathable mesh." },
    { q: "Will it fit a taller person?", a: "Seat depth is about 16.3 in, which is on the shallow side. Overall height runs roughly 44–49 in. Taller users should confirm the seat depth and height on the listing." },
    { q: "Has Furniblog tested this chair?", a: "Not yet. This is a research-based guide built from the Amazon listing, Nouhaus's documentation and published reviews. We will add our own measurements and photography after hands-on testing." },
  ],

  sources: [
    { k: "Amazon listing", v: "Nouhaus Ergo3D, Black — ASIN B07L4ZQMDX. Title checked 2026-09-09. Basis for 4D armrests, adjustable headrest and full mesh." },
    { k: "Nouhaus / retailer specs", v: "Nouhaus product information and retailers, read 2026-09-09. Basis for dimensions, seat depth, 135° recline and 3D lumbar. Weight capacity conflicts between sources." },
    { k: "Published reviews", v: "Third-party reviews summarised for the Cautions and rolling/comfort notes; not first-hand." },
  ],
  related: [
    { label: "How to read an Amazon office chair listing before you trust it", href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" },
    { label: "Best office chairs under $300: verified picks", href: "/blog/best-office-chairs-under-300-verified-picks" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

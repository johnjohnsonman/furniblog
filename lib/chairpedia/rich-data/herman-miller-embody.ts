import type { RichReview } from "@/lib/chairpedia/rich-types"

/**
 * Herman Miller Embody (standard office version) — research-based buying-guide
 * data. Facts from store.hermanmiller.com, dealer spec sheets and published
 * reviews (checked 2026-09-10). Distinguishes the Logitech G Embody gaming
 * variant. Some dimensions are dealer-sourced and marked as such. No fixed
 * prices.
 */
export const HERMAN_MILLER_EMBODY: RichReview = {
  asin: null,
  eyebrow: "Herman Miller · Office chairs · Buying guide",
  heroIntro:
    "The Herman Miller Embody was designed around health rather than looks: a \"pixelated\" support matrix of hundreds of moving pixels distributes your weight and keeps you moving through the day, and a central spine mimics the human backbone. This guide covers the standard office Embody, how it differs from the Logitech G gaming edition, and what to check.",
  verdictOneLiner: "A health-first chair built for active sitting — one adaptive size, few but deliberate choices.",
  verdictNote: "Research-based guide — hands-on lab test not completed.",

  heroShotBrief: "Front, black Herman Miller Embody.",
  galleryBriefs: [],

  quickFactsNote: "Confirmed from store.hermanmiller.com, dealer spec sheets and published reviews (checked 2026-09-10).",
  quickFacts: [
    { label: "Support", value: "Pixelated matrix", note: "Four support layers" },
    { label: "Sizing", value: "One adaptive size", note: "No A/B/C sizes" },
    { label: "Arms", value: "Adjustable or armless", note: "Height + width" },
    { label: "Weight capacity", value: "300 lb", note: "Herman Miller-documented" },
    { label: "Warranty", value: "12 years", note: "3-shift" },
  ],

  checksTitle: "Check these before you buy",
  checksIntro:
    "Embody has fewer configuration traps than most premium chairs, but a few choices — and the gaming vs standard question — still matter.",
  checks: [
    { n: "01", title: "Standard Embody vs Logitech G gaming Embody", body: "The Logitech G Embody shares the same frame, adjustments, 300 lb capacity and 12-year warranty as the standard chair, but adds copper-infused cooling foam and thicker upper-back padding for forward-leaning postures, in a limited set of dark colourways. For a work setup either works; buy the standard Embody for the full textile/colour range, or the gaming edition if you want the cooling seat and lean-forward padding." },
    { n: "02", title: "Set the BackFit and seat depth", body: "The BackFit adjustment changes the spine's curve to match yours, and the seat depth adjusts. These, plus the tilt limiter, are what make Embody fit — take a minute to set them rather than sitting on the defaults." },
    { n: "03", title: "Arms: adjustable or armless", body: "Embody's arms adjust for height and width, or you can buy it armless. There aren't multiple arm tiers to confuse you — just confirm the listing has arms if you want them." },
    { n: "04", title: "Textile, base and casters", body: "Choose the textile (e.g. Rhythm or Balance), the frame/base finish, and carpet vs hard-floor casters. Embody is one adaptive size, so there's no size chart to worry about — fit comes from the adjustments." },
  ],

  dims: [
    { k: "Overall width", v: "≈ 29.5 in", tier: "C" },
    { k: "Seat", v: "≈ 21.25 in W × 15–18 in D (adjustable depth)", tier: "C" },
    { k: "Seat height", v: "≈ 16–20.5 in", tier: "C" },
    { k: "Weight capacity", v: "300 lb", tier: "B" },
    { k: "Support", v: "\"Pixelated support\" — four layers over a dynamic pixel matrix; central spine", tier: "B" },
    { k: "Recline", v: "BackFit adjustment + tilt with a tilt limiter", tier: "B" },
    { k: "Armrests", v: "Height- and width-adjustable, or armless", tier: "B" },
    { k: "Sizing", v: "One adaptive size (no A/B/C)", tier: "B" },
    { k: "Warranty", v: "12-year, 3-shift (per Herman Miller)", tier: "B" },
  ],
  dimsSourceNote:
    "Sources: store.hermanmiller.com, dealer spec sheets (e.g. btod.com) and published reviews (checked 2026-09-10). Overall/seat dimensions vary slightly by base and configuration and are dealer-sourced (marked \"Not confirmed\"); the support system, adjustments, 300 lb capacity and 12-year warranty are Herman Miller-documented.",

  adjustable: [
    { k: "BackFit", v: "Adjusts the spine's curvature to match your back.", src: "Herman Miller (documented)" },
    { k: "Tilt", v: "Recline with a tilt limiter.", src: "Herman Miller (documented)" },
    { k: "Seat depth", v: "Adjustable seat pan.", src: "Herman Miller (documented)" },
    { k: "Arms", v: "Height and width (on the arm build).", src: "Herman Miller (documented)" },
    { k: "Seat height", v: "Pneumatic (≈ 16–20.5 in).", src: "Dealer spec sheets" },
  ],
  fixed: [
    { k: "Size", v: "One adaptive size — fit comes from adjustment, not a size chart.", src: "Herman Miller (documented)" },
    { k: "Lumbar", v: "No separate lumbar dial — the pixelated matrix and BackFit shape support instead.", src: "Herman Miller / reviews" },
    { k: "Headrest", v: "Not offered on Embody.", src: "Herman Miller (documented)" },
  ],

  pros: [
    { t: "The pixelated support matrix distributes weight and encourages micro-movement — built for active, all-day sitting.", src: "Herman Miller · published reviews" },
    { t: "One adaptive size fits a wide range of bodies without a size chart; strong for shared desks.", src: "Published reviews (research)" },
    { t: "300 lb capacity and Herman Miller's 12-year, 3-shift warranty; the gaming edition shares the same core.", src: "Herman Miller (documented)" },
  ],
  cons: [
    { t: "No headrest and no separate lumbar dial — support is by design, not by knob.", src: "Herman Miller / reviews" },
    { t: "The seat runs firmer and warmer than a mesh chair for some sitters, per reviewers.", src: "Published reviews (research)" },
    { t: "Premium price; not sold as a single clean Amazon product, so configurations vary by listing.", src: "Our reading" },
  ],

  forWhoTitle: "Embody shines for",
  forWho: [
    "People who sit long hours and want a chair that keeps them moving",
    "Buyers who want one adaptive size rather than choosing A/B/C",
    "Those (including gamers) who lean forward and want dynamic back support",
  ],
  skipWho: [
    "Need a headrest or a separate adjustable lumbar",
    "Want a cool, airy all-mesh seat",
    "Are shopping on a budget",
  ],

  rivals: [
    { name: "Herman Miller Embody", lumbar: "Pixelated matrix + BackFit", arms: "Height + width / armless", standout: "Active-sitting support, one adaptive size", isSelf: true },
    { name: "Herman Miller Aeron", lumbar: "PostureFit SL", arms: "Up to fully adjustable", standout: "All-mesh, three sizes" },
    { name: "Steelcase Leap V2", lumbar: "Adjustable LiveBack", arms: "4D", standout: "Deep recline, upholstered, headrest option" },
    { name: "Herman Miller Mirra 2", lumbar: "PostureFit sacral", arms: "Fully adjustable option", standout: "Breathable, 350 lb, cheaper" },
  ],

  buy: {
    productTitle: "Herman Miller Embody",
    retailerNote: "Amazon search — standard vs Logitech G gaming edition, arms and textile vary by listing",
    ctaLabel: "Search on Amazon",
    rows: [
      { k: "Returns", v: "Amazon's return window applies and depends on the seller; Herman Miller's own store lists a 30-day return. Check the listing." },
      { k: "Warranty", v: "12-year, 3-shift (Herman Miller), on the standard and gaming editions. Confirm on the listing." },
      { k: "What to check", v: "Standard vs Logitech G edition, arms vs armless, textile/colour, and caster type for your floor." },
    ],
    officialStore: {
      label: "Herman Miller (official)",
      note: "Full configurator, textiles and finishes at hermanmiller.com. Direct link (not an affiliate link).",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/embody-chairs/",
    },
    disclaimer:
      "Not verified by Furniblog: price, seller, stock and whether a listing is the standard or gaming edition vary — confirm before buying. We link an Amazon search because Embody is sold in several configurations. The Amazon link is an affiliate link; the Herman Miller link is a direct, non-affiliate link.",
  },

  verdict: [
    "Embody is the health argument made into a chair. Instead of a lumbar dial and a size chart, it uses a \"pixelated\" matrix of hundreds of moving support points and a backbone-like central spine to distribute your weight and keep you subtly moving — the case being that motion, not rigidity, is what long sitting needs. One adaptive size, a BackFit curve you match to your spine, an adjustable seat depth and a 300 lb, 12-year-warrantied build round it out.",
    "It asks you to accept its philosophy. There's no headrest and no separate lumbar knob, and the seat is firmer and warmer than mesh, so if you want a headrest, dial-in lumbar or an airy seat, the Aeron is the better Herman Miller. The gaming Logitech G edition is the same chassis with cooling foam and lean-forward padding — pick that if you sit forward and run warm. For active, all-day sitting in one size, few chairs are as considered.",
  ],
  verdictPullQuote:
    "Built to keep you moving, not locked in place — one adaptive size, no headrest, and a gaming twin that shares its bones.",

  faqs: [
    { q: "How is the gaming Embody different?", a: "The Logitech G Embody uses the same frame, adjustments, 300 lb capacity and 12-year warranty, but adds copper-infused cooling foam and thicker upper-back padding for forward-leaning postures, in limited dark colourways." },
    { q: "What is \"pixelated support\"?", a: "Embody's seat and back use a matrix of hundreds of small support points (\"pixels\") over four layers, which flex individually to distribute weight and encourage micro-movement." },
    { q: "Does Embody come in sizes?", a: "No — it's a single adaptive size. Fit comes from the BackFit, seat-depth and arm adjustments rather than an A/B/C size chart." },
    { q: "Is there a headrest or adjustable lumbar?", a: "No headrest, and no separate lumbar dial — support is shaped by the pixelated matrix and the BackFit curve. If you want those, look at the Aeron or a Steelcase Leap." },
    { q: "Has Furniblog tested this chair?", a: "Not with our own instruments yet. This is a research-based guide from Herman Miller's specs, dealer sheets and published reviews; the deep-dive below adds context." },
  ],

  sources: [
    { k: "Herman Miller (official)", v: "store.hermanmiller.com Embody pages, checked 2026-09-10. Basis for the support system, adjustments, capacity and warranty." },
    { k: "Dealer spec sheets", v: "Authorized-dealer specifications (e.g. btod.com) for dimensions; marked \"Not confirmed\" where not on Herman Miller's own page." },
    { k: "Logitech G / published reviews", v: "logitechg.com and third-party reviews for the gaming-edition differences and comfort notes; not first-hand." },
  ],
  sourcesFooter:
    "Specifications combine Herman Miller documentation with dealer-sourced dimensions (marked \"Not confirmed\") as of the date shown and are not independently verified by Furniblog. Embody is sold in standard and Logitech G gaming editions and several configurations — confirm the edition, arms, textile and casters on the listing you buy from.",
  related: [
    { label: "Aeron alternatives by budget: documented trade-offs", href: "/blog/herman-miller-aeron-alternatives-by-budget" },
    { label: "Refurbished vs remanufactured vs open-box vs used, explained", href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs" },
    { label: "Will that chair fit your desk? Seat height and armrest clearance", href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" },
    { label: "What returning a chair actually costs, by store", href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" },
  ],
}

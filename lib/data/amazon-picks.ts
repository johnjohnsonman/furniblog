// Curated office chairs that are actually buyable on Amazon, with direct
// product (ASIN) links. These are the conversion-focused "money" picks — unlike
// the premium showroom chairs (Aeron etc.) that Amazon only carries as
// third-party/used listings. ASINs verified June 2026; refresh periodically.
//
// No hardcoded prices: Amazon prices change constantly and their policy
// discourages showing stale prices outside the Product Advertising API. We show
// a rough tier instead and let "Check price on Amazon" do the rest.

export type AmazonPickTier = "Budget" | "Mid-range" | "Premium"

export type AmazonPick = {
  /** Amazon ASIN — used to build the direct affiliate link. */
  asin: string
  name: string
  brand: string
  tier: AmazonPickTier
  category: "Office" | "Gaming" | "Big & Tall"
  /** One-line editorial summary. */
  blurb: string
  bestFor: string
  pros: string[]
}

export const AMAZON_PICKS: AmazonPick[] = [
  {
    asin: "B0C3T865C2",
    name: "SIHOO Doro C300",
    brand: "SIHOO",
    tier: "Budget",
    category: "Office",
    blurb:
      "The default budget-ergonomic recommendation: adaptive dynamic lumbar, weight-sensing recline and 3D armrests at a price that undercuts the big brands.",
    bestFor: "Best all-round ergonomic chair under most budgets",
    pros: [
      "Self-adjusting (weight-sensing) recline",
      "Dynamic lumbar that follows your back",
      "Breathable full-mesh back",
    ],
  },
  {
    asin: "B07L4ZQMDX",
    name: "NOUHAUS Ergo3D",
    brand: "Nouhaus",
    tier: "Mid-range",
    category: "Office",
    blurb:
      "A perennial Amazon best-seller — full mesh with an adjustable headrest, 4D armrests and smooth blade wheels, hitting the comfort-per-dollar sweet spot.",
    bestFor: "Mesh + headrest without breaking $300",
    pros: ["4D adjustable armrests", "Adjustable headrest", "Rolling blade wheels (carpet & hard floor)"],
  },
  {
    asin: "B0BWDQX8RH",
    name: "Hbada P5",
    brand: "Hbada",
    tier: "Budget",
    category: "Office",
    blurb:
      "Comfort-first budget pick with an S-shaped spine-contouring backrest, adjustable lumbar and a tuck-away footrest for quick breaks.",
    bestFor: "Budget comfort with a footrest",
    pros: ["S-shaped ergonomic backrest", "Retractable footrest", "Adjustable lumbar + 2D headrest"],
  },
  {
    asin: "B0DPQQ2L22",
    name: "FLEXISPOT C7",
    brand: "Flexispot",
    tier: "Mid-range",
    category: "Office",
    blurb:
      "A premium-feeling mid-ranger: dynamic lumbar, 3D armrests and a properly tuned recline-and-tilt — frequently cross-shopped against chairs twice its price.",
    bestFor: "Premium feel under $350",
    pros: ["Dynamic lumbar support", "3D armrests", "Smooth recline & tilt"],
  },
  {
    asin: "B08LBJXVSP",
    name: "Ticova Ergonomic",
    brand: "Ticova",
    tier: "Budget",
    category: "Office",
    blurb:
      "High-back budget chair known for a thick, supportive seat cushion plus metal 3D armrests and a rotatable headrest — comfort that punches above its price.",
    bestFor: "Thick-cushion comfort on a budget",
    pros: ["Thick molded-foam seat", "Metal 3D armrests", "Rotatable headrest, 130° recline"],
  },
  {
    asin: "B08M42B334",
    name: "Steelcase Series 1",
    brand: "Steelcase",
    tier: "Premium",
    category: "Office",
    blurb:
      "The brand-name pick that's genuinely on Amazon. Steelcase's LiveBack flexes with your spine — real contract-grade ergonomics without the Aeron price tag.",
    bestFor: "A name-brand ergonomic investment",
    pros: ["LiveBack spine-tracking", "Weight-activated recline", "Contract-grade build & warranty"],
  },
  {
    asin: "B0CPH72BMN",
    name: "Razer Iskur V2",
    brand: "Razer",
    tier: "Premium",
    category: "Gaming",
    blurb:
      "The gaming chair that takes ergonomics seriously: a fully adjustable lumbar curve, 4D armrests and a reactive seat tilt for long sessions, work or play.",
    bestFor: "Gaming + all-day ergonomics",
    pros: ["Adjustable lumbar curve (not just a pillow)", "4D armrests", "Reactive seat tilt, 152° recline"],
  },
]

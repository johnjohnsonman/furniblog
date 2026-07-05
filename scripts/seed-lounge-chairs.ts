/**
 * Catalog expansion: add iconic DESIGN LOUNGE chairs (Eames Lounge, Womb,
 * Barcelona, Egg, Swan, etc.). All brands already exist in the catalog, so no
 * new brands are created. Facts (designer, launch year, origin) are
 * web-verified design-history canon — no invented specs.
 *
 * The designers table is currently empty, so designer_id is left null and the
 * designer is named in the description + launch_year is set.
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run seed:lounge            # DRY RUN — lists products to add
 *   npm run seed:lounge -- --apply # upsert products
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { defineChair, priceRangeFromUsd } from "./seed/helpers"

config({ path: resolve(__dirname, "../.env.local") })

type LoungeSeed = {
  slug: string
  name: string
  brand: string // brand slug (must already exist)
  country: string
  designer: string
  launchYear: number
  priceUsd: number
  description: string
  pros: string[]
  cons: string[]
}

/**
 * Iconic lounge chairs. Brands (herman-miller, knoll, fritz-hansen, vitra,
 * poltrona-frau) already exist in the catalog.
 */
const PRODUCTS: LoungeSeed[] = [
  {
    slug: "herman-miller-eames-lounge-chair",
    name: "Herman Miller Eames Lounge Chair and Ottoman",
    brand: "herman-miller",
    country: "US",
    designer: "Charles and Ray Eames",
    launchYear: 1956,
    priceUsd: 6495,
    description:
      "The Eames Lounge Chair and Ottoman, designed by Charles and Ray Eames in 1956 and made by Herman Miller, pairs molded plywood shells with leather cushions. It is one of the most recognized lounge chairs of the 20th century and sits in the permanent collection of the Museum of Modern Art.",
    pros: ["Iconic mid-century design", "Premium leather and molded plywood", "Authentic licensed production"],
    cons: ["Very expensive", "Not an ergonomic task chair"],
  },
  {
    slug: "herman-miller-nelson-coconut-chair",
    name: "Herman Miller Nelson Coconut Chair",
    brand: "herman-miller",
    country: "US",
    designer: "George Nelson",
    launchYear: 1955,
    priceUsd: 2495,
    description:
      "Designed by George Nelson in 1955, the Coconut Chair takes its shape from a piece of coconut shell, giving the sitter freedom of movement on a triangular upholstered shell with thin steel legs. Made by Herman Miller.",
    pros: ["Sculptural mid-century shape", "Comfortable wide shell", "Statement lounge piece"],
    cons: ["Large footprint", "Premium price"],
  },
  {
    slug: "knoll-womb-chair",
    name: "Knoll Womb Chair",
    brand: "knoll",
    country: "US",
    designer: "Eero Saarinen",
    launchYear: 1948,
    priceUsd: 4900,
    description:
      "Eero Saarinen designed the Womb Chair in 1948 at Florence Knoll's request for 'a chair that was like a basket full of pillows.' Its molded fiberglass shell and foam upholstery let the sitter curl up in multiple positions. A Knoll classic, often paired with its matching ottoman.",
    pros: ["Enveloping, relaxed seating", "Timeless Saarinen design", "Multiple comfortable positions"],
    cons: ["Expensive", "Ottoman sold separately"],
  },
  {
    slug: "knoll-barcelona-chair",
    name: "Knoll Barcelona Chair",
    brand: "knoll",
    country: "US",
    designer: "Ludwig Mies van der Rohe and Lilly Reich",
    launchYear: 1929,
    priceUsd: 6800,
    description:
      "Designed by Ludwig Mies van der Rohe with Lilly Reich for the 1929 Barcelona International Exposition, the Barcelona Chair features a polished stainless-steel frame and hand-tufted leather cushions. Knoll has produced it under license since 1953.",
    pros: ["Modernist icon", "Hand-tufted leather", "Licensed Knoll production"],
    cons: ["Very firm seating", "Heavy", "High price"],
  },
  {
    slug: "knoll-platner-lounge-chair",
    name: "Knoll Platner Lounge Chair",
    brand: "knoll",
    country: "US",
    designer: "Warren Platner",
    launchYear: 1966,
    priceUsd: 5800,
    description:
      "Warren Platner's 1966 lounge chair is built from hundreds of curved steel rods welded to a vertical frame, creating a shimmering, sculptural base. Part of the Platner Collection for Knoll.",
    pros: ["Distinctive wire-rod sculpture", "Decorative and functional", "Knoll Collection icon"],
    cons: ["Expensive", "Cushion comfort is secondary to looks"],
  },
  {
    slug: "knoll-bertoia-diamond-chair",
    name: "Knoll Bertoia Diamond Chair",
    brand: "knoll",
    country: "US",
    designer: "Harry Bertoia",
    launchYear: 1952,
    priceUsd: 1400,
    description:
      "Harry Bertoia's 1952 Diamond Chair is made from a welded lattice of steel wire bent into a diamond-shaped seat. 'If you look at these chairs, they are mainly made of air,' Bertoia said. Produced by Knoll, with optional seat pads.",
    pros: ["Airy sculptural form", "Indoor/outdoor versions", "More affordable design icon"],
    cons: ["Firm without seat pad", "Wire frame not for long sitting"],
  },
  {
    slug: "fritz-hansen-egg-chair",
    name: "Fritz Hansen Egg Chair",
    brand: "fritz-hansen",
    country: "Denmark",
    designer: "Arne Jacobsen",
    launchYear: 1958,
    priceUsd: 11000,
    description:
      "Arne Jacobsen designed the Egg in 1958 for the SAS Royal Hotel in Copenhagen. Its enveloping shell was sculpted in clay before being realized as a foam-over-fiberglass form on a swivel base. Made by Fritz Hansen (Republic of Fritz Hansen).",
    pros: ["Cocooning privacy", "Swivels and tilts", "Danish design landmark"],
    cons: ["Among the most expensive lounge chairs", "Large footprint"],
  },
  {
    slug: "fritz-hansen-swan-chair",
    name: "Fritz Hansen Swan Chair",
    brand: "fritz-hansen",
    country: "Denmark",
    designer: "Arne Jacobsen",
    launchYear: 1958,
    priceUsd: 5200,
    description:
      "A companion to the Egg, Arne Jacobsen's 1958 Swan Chair was also created for the SAS Royal Hotel. Its curved, armrest-less shell sits on a four-star aluminum swivel base. Made by Fritz Hansen.",
    pros: ["Compact organic shape", "Swivel base", "Wide upholstery range"],
    cons: ["No headrest", "Premium price"],
  },
  {
    slug: "vitra-grand-repos",
    name: "Vitra Grand Repos",
    brand: "vitra",
    country: "Germany",
    designer: "Antonio Citterio",
    launchYear: 2011,
    priceUsd: 8200,
    description:
      "Antonio Citterio's Grand Repos (2011) is a modern reclining lounge chair for Vitra with a weight-activated mechanism that smoothly follows the sitter from upright to fully reclined. Typically paired with the Ottoman.",
    pros: ["Smooth weight-activated recline", "Modern luxury lounge", "Lockable positions"],
    cons: ["Expensive", "Ottoman sold separately"],
  },
  {
    slug: "poltrona-frau-vanity-fair-xc",
    name: "Poltrona Frau Vanity Fair XC",
    brand: "poltrona-frau",
    country: "Italy",
    designer: "Renzo Frau",
    launchYear: 1930,
    priceUsd: 7500,
    description:
      "The Vanity Fair (originally '904') traces back to Renzo Frau's 1930s armchair and is upholstered in Poltrona Frau's signature hand-finished Pelle Frau leather, with visible hand-stitching and a hand-tufted seat. The XC is the contemporary edition.",
    pros: ["Hand-finished Italian leather", "Deep, soft comfort", "Heirloom craftsmanship"],
    cons: ["Very expensive", "Heavy classic profile"],
  },
]

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const brandIdCache = new Map<string, string>()
async function resolveBrandId(supabase: SupabaseClient, slug: string): Promise<string | null> {
  if (brandIdCache.has(slug)) return brandIdCache.get(slug)!
  const { data } = await supabase.from("brands").select("id").eq("slug", slug).maybeSingle()
  if (!data?.id) return null
  brandIdCache.set(slug, data.id as string)
  return data.id as string
}

function toRow(p: LoungeSeed, brandId: string) {
  const specs = defineChair({
    slug: p.slug,
    name: p.name,
    nameEn: p.name,
    brand: p.brand,
    category: "lounge",
    descriptionEn: p.description,
    priceUsd: p.priceUsd,
    priceKrw: 0,
    pros: p.pros,
    cons: p.cons,
    bestFor: "Reading, relaxing, and statement seating",
    seoTitle: `${p.name} Review`,
    seoDescription: `Where to buy the ${p.name}.`,
  }).chairSpecs
  return {
    slug: p.slug,
    name: p.name,
    brand_id: brandId,
    category: "lounge",
    track: "chair" as const,
    chair_type: "lounge",
    country: p.country,
    launch_year: p.launchYear,
    price_usd: Math.round(p.priceUsd),
    price_range: priceRangeFromUsd(p.priceUsd),
    images: [] as string[],
    description_ko: p.description,
    description_en: p.description,
    best_for: "Reading, relaxing, and statement seating",
    pros: p.pros,
    cons: p.cons,
    chair_specs: specs,
    seo_title: `${p.name} Review`.slice(0, 60),
    seo_description: `Design, designer (${p.designer}, ${p.launchYear}), and where to buy the ${p.name}.`.slice(0, 155),
    available_in_korea: false,
    try_at_chairpark: false,
    published: true,
    updated_at: new Date().toISOString(),
  }
}

async function main() {
  const apply = process.argv.includes("--apply")
  const supabase = admin()

  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .in("slug", PRODUCTS.map((p) => p.slug))
  const existingSlugs = new Set((existing ?? []).map((p) => p.slug))

  console.log("═".repeat(60))
  console.log(apply ? "  APPLY MODE — changes WILL be written" : "  DRY RUN — no changes written")
  console.log("═".repeat(60))
  console.log(`\n➕ ICONIC LOUNGE CHAIRS (${PRODUCTS.length}):`)
  for (const p of PRODUCTS) {
    console.log(
      `   ${existingSlugs.has(p.slug) ? "↻ (exists, will update)" : "•"} ${p.name}  [${p.brand}, ${p.designer} ${p.launchYear}, $${p.priceUsd}]`
    )
  }

  if (!apply) {
    console.log(`\nDRY RUN complete. Re-run with "--apply" to write.`)
    return
  }

  let ok = 0,
    failed = 0
  for (const p of PRODUCTS) {
    const brandId = await resolveBrandId(supabase, p.brand)
    if (!brandId) {
      console.log(`   ❌ ${p.name} — brand not found: ${p.brand}`)
      failed++
      continue
    }
    const { error } = await supabase.from("products").upsert(toRow(p, brandId), { onConflict: "slug" })
    if (error) {
      console.log(`   ❌ ${p.name} — ${error.message}`)
      failed++
      continue
    }
    console.log(`   ✅ ${p.name} → ${p.slug}`)
    ok++
  }
  console.log(`\n✅ Seeded ${ok}/${PRODUCTS.length} lounge chairs${failed ? `, ${failed} failed` : ""}.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

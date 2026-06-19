/**
 * Catalog expansion: famous EXECUTIVE chairs from prestige design brands that
 * were missing. Every entry is a real, web-research-verified product (model name,
 * brand, designer) — no invented chairs. Seed prices are research-informed
 * approximations; run `npm run verify:catalog -- --names <new names>` afterward
 * to lock the exact current USD street price via web research.
 *
 * Brands here ALL already exist in the catalog (no new brands created).
 *
 * Usage:
 *   npm run seed:executive             # DRY RUN — lists products to add
 *   npm run seed:executive -- --apply  # upsert products
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { defineChair } from "./seed/helpers"

config({ path: resolve(__dirname, "../.env.local") })

type ProductSeed = {
  slug: string
  name: string
  brand: string // existing brand slug
  priceUsd: number
  description: string
}

// Price bands consistent with scripts/verify-catalog.ts (NOT the seed helper's
// priceRangeFromUsd, which uses different thresholds).
function priceTier(u: number): "$" | "$$" | "$$$" | "$$$$" {
  return u < 300 ? "$" : u < 800 ? "$$" : u < 1600 ? "$$$" : "$$$$"
}

const PRODUCTS: ProductSeed[] = [
  // Knoll — Charles Pollock & Eero Saarinen icons
  {
    slug: "knoll-pollock-executive",
    name: "Knoll Pollock Executive Chair",
    brand: "knoll",
    priceUsd: 2800,
    description:
      "Charles Pollock's 1965 icon: a single die-cast aluminum rim wraps the upholstery in one continuous line. Still produced by Knoll and held in design collections worldwide.",
  },
  {
    slug: "knoll-saarinen-executive",
    name: "Knoll Saarinen Executive Chair",
    brand: "knoll",
    priceUsd: 2300,
    description:
      "Eero Saarinen's sculpted mid-century executive and conference chair with a continuous molded shell, offered armless or with arms on a swivel base.",
  },
  // Herman Miller — Eames executive line
  {
    slug: "herman-miller-eames-executive",
    name: "Herman Miller Eames Executive Chair",
    brand: "herman-miller",
    priceUsd: 5600,
    description:
      "The 'Time-Life' chair Charles & Ray Eames designed in 1960 for the lobby of New York's Time-Life Building: deep, plush leather cushions on a polished cast-aluminum base.",
  },
  {
    slug: "herman-miller-eames-soft-pad-executive",
    name: "Herman Miller Eames Soft Pad Executive Chair",
    brand: "herman-miller",
    priceUsd: 4500,
    description:
      "The tall-back Eames Soft Pad Group chair: plush leather pads on the polished Aluminum Group frame — the boardroom executive of the Eames office line.",
  },
  // Vitra — Antonio Citterio flagship
  {
    slug: "vitra-grand-executive",
    name: "Vitra Grand Executive",
    brand: "vitra",
    priceUsd: 5500,
    description:
      "Antonio Citterio's flagship leather executive chair for Vitra: a refined high-back with hand-finished leather and a polished die-cast aluminum base.",
  },
  // Poltrona Frau — Jean-Marie Massaud, Pelle Frau leather
  {
    slug: "poltrona-frau-downtown",
    name: "Poltrona Frau Downtown",
    brand: "poltrona-frau",
    priceUsd: 3800,
    description:
      "Jean-Marie Massaud's flagship office chair in Pelle Frau leather with hand-stitched detailing — one of Poltrona Frau's most iconic executive seats, offered President to Visitor.",
  },
  {
    slug: "poltrona-frau-archibald",
    name: "Poltrona Frau Archibald Executive",
    brand: "poltrona-frau",
    priceUsd: 3500,
    description:
      "Jean-Marie Massaud's Archibald executive chair, upholstered in supple Pelle Frau leather with the line's signature soft, wrinkled surface and tall back.",
  },
  // Okamura — Japanese premium executive
  {
    slug: "okamura-legender",
    name: "Okamura Legender",
    brand: "okamura",
    priceUsd: 2800,
    description:
      "Okamura's flagship executive chair: soft full-grain leather over a refined high-back frame, positioned as the brand's top management seating.",
  },
  {
    slug: "okamura-duke",
    name: "Okamura Duke",
    brand: "okamura",
    priceUsd: 1800,
    description:
      "Okamura's executive chair pairing leather comfort with the brand's Active Back ergonomics and Smart Operation controls; available in high- and extra-high-back sizes.",
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

function toRow(p: ProductSeed, brandId: string) {
  const chair = defineChair({
    slug: p.slug,
    name: p.name,
    nameEn: p.name,
    brand: p.brand,
    category: "executive",
    descriptionEn: p.description,
    priceUsd: p.priceUsd,
    priceKrw: 0,
    pros: ["Iconic design pedigree", "Premium leather build"],
    cons: ["Premium price", "Availability varies by region"],
    bestFor: "Executive offices and boardrooms",
    seoTitle: `${p.name} Review`,
    seoDescription: `Specs, design story, reviews and where to buy the ${p.name}.`,
  })
  return {
    slug: chair.slug,
    name: chair.nameEn,
    brand_id: brandId,
    category: "executive" as const,
    track: "chair" as const,
    price_usd: Math.round(p.priceUsd),
    price_range: priceTier(p.priceUsd),
    images: [] as string[],
    description_ko: chair.descriptionEn,
    description_en: chair.descriptionEn,
    best_for: chair.bestFor,
    pros: chair.pros,
    cons: chair.cons,
    chair_specs: chair.chairSpecs,
    seo_title: chair.seoTitle.slice(0, 60),
    seo_description: chair.seoDescription.slice(0, 155),
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
  console.log(`\n➕ EXECUTIVE PRODUCTS (${PRODUCTS.length}):`)
  for (const p of PRODUCTS) {
    console.log(
      `   ${existingSlugs.has(p.slug) ? "↻ (exists, will update)" : "•"} ${p.name}  [${p.brand}, $${p.priceUsd}]`
    )
  }

  if (!apply) {
    console.log(`\nDRY RUN complete. Re-run with "--apply" to write.`)
    return
  }

  let ok = 0, failed = 0
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
  console.log(`\n✅ Seeded ${ok}/${PRODUCTS.length} products${failed ? `, ${failed} failed` : ""}.`)
  console.log(`\nNext: lock exact prices via web research:`)
  console.log(`  npm run verify:catalog -- --names <(printf '%s\\n' ${PRODUCTS.map((p) => `"${p.name}"`).join(" ")}) --apply`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

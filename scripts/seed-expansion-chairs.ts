/**
 * Catalog expansion: add popular US/Amazon OFFICE chairs that were missing,
 * with priority on the HNI family (HON additions, Allsteel) and major US brands.
 * OFFICE/EXECUTIVE chairs only — no gaming/lounge/saddle/kneeling.
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run seed:expansion            # DRY RUN — lists brands/products to add
 *   npm run seed:expansion -- --apply # upsert brands + products
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { defineChair, priceRangeFromUsd } from "./seed/helpers"

config({ path: resolve(__dirname, "../.env.local") })

type BrandSeed = {
  slug: string
  name: string
  country: string
  tier: "ultra_premium" | "premium" | "mid_range"
  founded_year: number
  website_url?: string
}

type ProductSeed = {
  slug: string
  name: string
  brand: string // brand slug
  category: "office" | "executive"
  priceUsd: number
  description?: string
}

/** New brands (HON & SIHOO already exist — not re-added). */
const NEW_BRANDS: BrandSeed[] = [
  { slug: "allsteel", name: "Allsteel", country: "US", tier: "premium", founded_year: 1912, website_url: "https://www.allsteeloffice.com" },
  { slug: "x-chair", name: "X-Chair", country: "US", tier: "premium", founded_year: 2014, website_url: "https://www.xchair.com" },
  { slug: "uplift", name: "UPLIFT Desk", country: "US", tier: "mid_range", founded_year: 2014, website_url: "https://www.upliftdesk.com" },
  { slug: "flash-furniture", name: "Flash Furniture", country: "US", tier: "mid_range", founded_year: 1999 },
  { slug: "office-star", name: "Office Star", country: "US", tier: "mid_range", founded_year: 1995 },
  { slug: "boss-office", name: "Boss Office Products", country: "US", tier: "mid_range", founded_year: 1989 },
  { slug: "la-z-boy", name: "La-Z-Boy", country: "US", tier: "mid_range", founded_year: 1927 },
]

const PRODUCTS: ProductSeed[] = [
  // HNI family — HON (brand already exists)
  { slug: "hon-wave", name: "HON Wave", brand: "hon", category: "office", priceUsd: 300, description: "High-volume mesh task chair; a perennial Amazon office-chair best-seller." },
  { slug: "hon-nucleus", name: "HON Nucleus", brand: "hon", category: "office", priceUsd: 420, description: "HON's modern flagship with a knit-mesh 'recharged' back." },
  { slug: "hon-convergence", name: "HON Convergence", brand: "hon", category: "office", priceUsd: 520, description: "Contemporary task chair with seat-edge angle adjustment." },
  // HNI family — Allsteel (new)
  { slug: "allsteel-acuity", name: "Allsteel Acuity", brand: "allsteel", category: "office", priceUsd: 900, description: "Allsteel's auto-adjusting ergonomic flagship; an Aeron/Leap competitor." },
  { slug: "allsteel-mimeo", name: "Allsteel Mimeo", brand: "allsteel", category: "office", priceUsd: 600, description: "High-volume contract mesh task chair." },
  // X-Chair (new)
  { slug: "x-chair-x1", name: "X-Chair X1", brand: "x-chair", category: "office", priceUsd: 700, description: "X-Chair's entry ergonomic with Dynamic Variable Lumbar." },
  { slug: "x-chair-x2", name: "X-Chair X2", brand: "x-chair", category: "office", priceUsd: 850, description: "K-Sport mesh upgrade of the X-Chair line." },
  { slug: "x-chair-x3", name: "X-Chair X3", brand: "x-chair", category: "office", priceUsd: 950, description: "ATR mesh with advanced tilt; X-Chair's popular mid-tier." },
  { slug: "x-chair-x4", name: "X-Chair X4", brand: "x-chair", category: "executive", priceUsd: 1100, description: "Leather executive flagship with heat/massage options." },
  // UPLIFT Desk (new)
  { slug: "uplift-vert", name: "UPLIFT Vert", brand: "uplift", category: "office", priceUsd: 430, description: "Value ergonomic chair from the popular standing-desk brand." },
  { slug: "uplift-pursuit", name: "UPLIFT Pursuit", brand: "uplift", category: "office", priceUsd: 500, description: "Mid-range ergonomic task chair, Amazon-available." },
  { slug: "uplift-envoke", name: "UPLIFT Envoke", brand: "uplift", category: "office", priceUsd: 700, description: "UPLIFT's premium fully-adjustable ergonomic chair." },
  // La-Z-Boy office (new)
  { slug: "la-z-boy-trafford", name: "La-Z-Boy Trafford", brand: "la-z-boy", category: "executive", priceUsd: 400, description: "Big & Tall bonded-leather executive chair with AIR lumbar." },
  { slug: "la-z-boy-delano", name: "La-Z-Boy Delano", brand: "la-z-boy", category: "executive", priceUsd: 350, description: "Big & Tall executive chair; popular home-office leather seating." },
  { slug: "la-z-boy-bellamy", name: "La-Z-Boy Bellamy", brand: "la-z-boy", category: "executive", priceUsd: 300, description: "Bonded-leather executive chair for home offices." },
  // Office Star (new)
  { slug: "office-star-ventilated-managers", name: "Office Star Ventilated Manager's Chair", brand: "office-star", category: "office", priceUsd: 130, description: "Breathable mesh manager's chair; a top Amazon office-chair seller." },
  { slug: "office-star-progrid", name: "Office Star ProGrid", brand: "office-star", category: "office", priceUsd: 200, description: "ProGrid back task chair; strong value ergonomic." },
  // Boss Office Products (new) — distinct from UK 'Boss Design'
  { slug: "boss-office-b991", name: "Boss Office Products B991 Executive Chair", brand: "boss-office", category: "executive", priceUsd: 200, description: "LeatherPlus executive chair; high-volume Amazon budget executive." },
  // Flash Furniture (new)
  { slug: "flash-furniture-mid-back-mesh", name: "Flash Furniture Mid-Back Mesh Task Chair", brand: "flash-furniture", category: "office", priceUsd: 90, description: "One of Amazon's highest-volume budget mesh task chairs." },
  // SIHOO additional (brand exists)
  { slug: "sihoo-doro-s300", name: "SIHOO Doro S300", brand: "sihoo", category: "office", priceUsd: 700, description: "SIHOO's anti-gravity recline flagship; German Design Award winner." },
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
    category: p.category,
    descriptionEn: p.description ?? `${p.name} ergonomic office chair.`,
    priceUsd: p.priceUsd,
    priceKrw: 0,
    pros: ["Solid ergonomic value"],
    cons: ["Availability varies by region"],
    bestFor: "Daily desk work",
    seoTitle: `${p.name} Review`,
    seoDescription: `Specs, reviews, and where to buy the ${p.name}.`,
  })
  return {
    slug: chair.slug,
    name: chair.nameEn,
    brand_id: brandId,
    category: chair.category,
    track: "chair" as const,
    price_usd: Math.round(chair.priceUsd),
    price_range: priceRangeFromUsd(chair.priceUsd),
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

  // Which product slugs already exist (so dry-run can flag overwrites).
  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .in("slug", PRODUCTS.map((p) => p.slug))
  const existingSlugs = new Set((existing ?? []).map((p) => p.slug))

  console.log("═".repeat(60))
  console.log(apply ? "  APPLY MODE — changes WILL be written" : "  DRY RUN — no changes written")
  console.log("═".repeat(60))
  console.log(`\n➕ NEW BRANDS (${NEW_BRANDS.length}): ${NEW_BRANDS.map((b) => b.slug).join(", ")}`)
  console.log(`\n➕ PRODUCTS (${PRODUCTS.length}) — OFFICE/EXECUTIVE only:`)
  for (const p of PRODUCTS) {
    console.log(`   ${existingSlugs.has(p.slug) ? "↻ (exists, will update)" : "•"} ${p.name}  [${p.category}, $${p.priceUsd}]`)
  }

  if (!apply) {
    console.log(`\nDRY RUN complete. Re-run with "--apply" to write.`)
    return
  }

  // Upsert new brands.
  const brandRows = NEW_BRANDS.map((b) => ({
    slug: b.slug,
    name: b.name,
    country: b.country,
    tier: b.tier,
    founded_year: b.founded_year,
    website_url: b.website_url ?? null,
    description_ko: "",
    updated_at: new Date().toISOString(),
  }))
  const { error: bErr } = await supabase.from("brands").upsert(brandRows, { onConflict: "slug" })
  if (bErr) throw new Error(`brand upsert failed: ${bErr.message}`)
  console.log(`\n✅ Upserted ${brandRows.length} brands.`)

  // Upsert products.
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
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

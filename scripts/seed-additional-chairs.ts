/**
 * Seed additional brands + products into Supabase.
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: npm run seed:additional
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
  description_ko?: string
}

type ProductSeed = {
  slug: string
  name: string
  brand: string
  category: string
  priceUsd?: number
  priceKrw?: number
  description?: string
}

const ADDITIONAL_BRANDS: BrandSeed[] = [
  {
    slug: "fursys",
    name: "Fursys",
    country: "KR",
    tier: "premium",
    founded_year: 1984,
    website_url: "https://www.fursys.com",
    description_ko:
      "국내 1위 사무용 가구 브랜드. 팀, 슬림, 아리아 시리즈 유명.",
  },
  { slug: "hon", name: "HON", country: "US", tier: "mid_range", founded_year: 1944 },
  { slug: "sihoo", name: "Sihoo", country: "CN", tier: "mid_range", founded_year: 2008 },
  { slug: "hinomi", name: "Hinomi", country: "SG", tier: "mid_range", founded_year: 2019 },
  { slug: "ergohuman", name: "Ergohuman", country: "IT", tier: "premium", founded_year: 2002 },
  { slug: "dxracer", name: "DXRacer", country: "CN", tier: "mid_range", founded_year: 2001 },
  { slug: "la-z-boy", name: "La-Z-Boy", country: "US", tier: "mid_range", founded_year: 1927 },
  { slug: "eurotech", name: "Eurotech", country: "US", tier: "mid_range", founded_year: 1985 },
  { slug: "amazon-basics", name: "Amazon Basics", country: "US", tier: "mid_range", founded_year: 2009 },
  { slug: "realspace", name: "Realspace", country: "US", tier: "mid_range", founded_year: 2000 },
  { slug: "serta", name: "Serta", country: "US", tier: "mid_range", founded_year: 1931 },
  { slug: "logicfox", name: "LogicFox", country: "CN", tier: "mid_range", founded_year: 2018 },
  { slug: "zuowe", name: "Zuowe", country: "CN", tier: "mid_range", founded_year: 2015 },
]

const ADDITIONAL_PRODUCTS: ProductSeed[] = [
  { slug: "fursys-tim", name: "Fursys Tim", brand: "fursys", category: "office", priceKrw: 890000, description: "국내 대표 프리미엄 의자 브랜드 퍼시스의 팀 시리즈. 요추지지 탁월." },
  { slug: "fursys-tim-m70", name: "Fursys Tim M70", brand: "fursys", category: "office", priceKrw: 1200000, description: "퍼시스 팀 시리즈 중 고급형. 메쉬 백 + 가죽 시트." },
  { slug: "fursys-slim", name: "Fursys Slim", brand: "fursys", category: "office", priceKrw: 650000, description: "퍼시스 슬림 시리즈. 슬림한 디자인과 가성비." },
  { slug: "fursys-allin", name: "Fursys Allin", brand: "fursys", category: "office", priceKrw: 980000, description: "퍼시스 올인 시리즈. 올인원 기능성 의자." },
  { slug: "fursys-aria", name: "Fursys Aria", brand: "fursys", category: "office", priceKrw: 750000, description: "퍼시스 아리아. 여성 체형에 최적화된 의자." },
  { slug: "global-concorde", name: "Global Concorde Presidential", brand: "global", category: "executive", priceUsd: 1200 },
  { slug: "global-accord", name: "Global Accord", brand: "global", category: "office", priceUsd: 650 },
  { slug: "global-sora", name: "Global Sora", brand: "global", category: "office", priceUsd: 550 },
  { slug: "branch-ergonomic-chair", name: "Branch Ergonomic Chair", brand: "branch", category: "office", priceUsd: 329, description: "Best value ergonomic chair under $400. Lumbar support, 4D armrests." },
  { slug: "branch-chair-v2", name: "Branch Chair V2", brand: "branch", category: "office", priceUsd: 429, description: "Upgraded Branch chair with better lumbar and mesh back." },
  { slug: "flexispot-oc3", name: "FlexiSpot OC3", brand: "flexispot", category: "office", priceUsd: 299 },
  { slug: "flexispot-bs9pro", name: "FlexiSpot BS9 Pro", brand: "flexispot", category: "gaming", priceUsd: 399 },
  { slug: "hon-ignition-2", name: "HON Ignition 2.0", brand: "hon", category: "office", priceUsd: 499, description: "Popular mid-range office chair. Good lumbar support for the price." },
  { slug: "hon-nucleus", name: "HON Nucleus", brand: "hon", category: "office", priceUsd: 399 },
  { slug: "hon-volt", name: "HON Volt", brand: "hon", category: "office", priceUsd: 279 },
  { slug: "sihoo-doro-s300", name: "Sihoo Doro S300", brand: "sihoo", category: "office", priceUsd: 599, description: "Chinese ergonomic brand gaining popularity. Anti-gravity armrests." },
  { slug: "sihoo-m90d", name: "Sihoo M90D", brand: "sihoo", category: "office", priceUsd: 399 },
  { slug: "sihoo-m57", name: "Sihoo M57", brand: "sihoo", category: "office", priceUsd: 249 },
  { slug: "hinomi-h1-pro", name: "Hinomi H1 Pro", brand: "hinomi", category: "office", priceUsd: 549, description: "Singapore ergonomic brand. 4D lumbar support, popular in Asia." },
  { slug: "hinomi-x1", name: "Hinomi X1", brand: "hinomi", category: "office", priceUsd: 699 },
  { slug: "logicfox-ergonomic-pro", name: "LogicFox Ergonomic Pro", brand: "logicfox", category: "office", priceUsd: 479 },
  { slug: "zuowe-ergonomic", name: "Zuowe Ergonomic Chair", brand: "zuowe", category: "office", priceUsd: 349 },
  { slug: "realspace-magellan", name: "Realspace Magellan", brand: "realspace", category: "executive", priceUsd: 279, description: "Office Depot budget executive chair. Popular for home offices." },
  { slug: "eurotech-ergohuman-me7erg", name: "Eurotech Ergohuman ME7ERG", brand: "eurotech", category: "office", priceUsd: 699, description: "Ergohuman series. Full mesh, highly adjustable lumbar." },
  { slug: "ergohuman-elite", name: "Ergohuman Elite", brand: "ergohuman", category: "office", priceUsd: 799, description: "Italian ergonomic design. Popular alternative to Herman Miller." },
  { slug: "ergohuman-plus", name: "Ergohuman Plus", brand: "ergohuman", category: "office", priceUsd: 999 },
  { slug: "serta-air-health-comfort", name: "Serta Air Health & Comfort", brand: "serta", category: "executive", priceUsd: 399 },
  { slug: "amazon-basics-mid-back-mesh", name: "Amazon Basics Mid-Back Mesh", brand: "amazon-basics", category: "office", priceUsd: 99, description: "Budget mesh office chair. Most reviewed chair on Amazon." },
  { slug: "la-z-boy-air-executive", name: "La-Z-Boy Air Executive", brand: "la-z-boy", category: "executive", priceUsd: 499, description: "Recliner brand ergonomic office chair. Popular in North America." },
  { slug: "la-z-boy-trafford", name: "La-Z-Boy Trafford", brand: "la-z-boy", category: "executive", priceUsd: 399 },
  { slug: "dxracer-formula-series", name: "DXRacer Formula Series", brand: "dxracer", category: "gaming", priceUsd: 299 },
  { slug: "dxracer-master-series", name: "DXRacer Master Series", brand: "dxracer", category: "gaming", priceUsd: 499 },
  { slug: "corsair-tc100-relaxed", name: "Corsair TC100 Relaxed", brand: "corsair", category: "gaming", priceUsd: 249 },
  { slug: "corsair-tc200-leatherette", name: "Corsair TC200", brand: "corsair", category: "gaming", priceUsd: 299 },
]

const KOREA_BRANDS = new Set(["fursys"])

const brandIdCache = new Map<string, string>()

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function toHardcoded(product: ProductSeed) {
  const priceUsd =
    product.priceUsd ?? (product.priceKrw ? Math.round(product.priceKrw / 1350) : 299)
  const priceKrw = product.priceKrw ?? 0
  const desc = product.description ?? `${product.name} ergonomic office chair.`

  return defineChair({
    slug: product.slug,
    name: product.name,
    nameEn: product.name,
    brand: product.brand,
    category: product.category,
    descriptionEn: desc,
    priceUsd,
    priceKrw,
    pros: ["Solid ergonomic value"],
    cons: ["Availability varies by region"],
    bestFor: "Daily desk work",
    seoTitle: `${product.name} Review`,
    seoDescription: `In-depth review and specs for ${product.name}.`,
  })
}

async function upsertBrands(supabase: SupabaseClient) {
  const rows = ADDITIONAL_BRANDS.map((b) => ({
    slug: b.slug,
    name: b.name,
    country: b.country,
    tier: b.tier,
    founded_year: b.founded_year,
    website_url: b.website_url ?? null,
    description_ko: b.description_ko ?? "",
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from("brands").upsert(rows, { onConflict: "slug" })
  if (error) throw new Error(`Brand upsert failed: ${error.message}`)

  console.log(`Upserted ${rows.length} brands`)
}

async function resolveBrandId(
  supabase: SupabaseClient,
  brandSlug: string
): Promise<string | null> {
  const cached = brandIdCache.get(brandSlug)
  if (cached) return cached

  const { data, error } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", brandSlug)
    .maybeSingle()

  if (error) throw new Error(`Brand lookup (${brandSlug}): ${error.message}`)
  if (!data?.id) return null

  brandIdCache.set(brandSlug, data.id as string)
  return data.id as string
}

async function upsertProduct(
  supabase: SupabaseClient,
  product: ProductSeed,
  brandId: string
) {
  const chair = toHardcoded(product)

  const row = {
    slug: chair.slug,
    name: chair.nameEn,
    brand_id: brandId,
    category: chair.category,
    track: "chair" as const,
    chair_type: chair.chairType ?? null,
    price_usd: Math.round(chair.priceUsd),
    price_krw: chair.priceKrw > 0 ? Math.round(chair.priceKrw) : null,
    price_range: priceRangeFromUsd(chair.priceUsd),
    thumbnail_url: null,
    images: [] as string[],
    description_ko: chair.descriptionEn,
    description_en: chair.descriptionEn,
    best_for: chair.bestFor,
    pros: chair.pros,
    cons: chair.cons,
    chair_specs: chair.chairSpecs,
    seo_title: chair.seoTitle.slice(0, 60),
    seo_description: chair.seoDescription.slice(0, 155),
    available_in_korea: KOREA_BRANDS.has(product.brand) || chair.priceKrw > 0,
    try_at_chairpark: false,
    published: true,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("products").upsert(row, { onConflict: "slug" })
  if (error) throw new Error(error.message)
}

async function main() {
  const supabase = createSupabaseAdmin()
  const total = ADDITIONAL_PRODUCTS.length

  console.log("═".repeat(56))
  console.log(`  Furniblog additional seeder — ${total} products`)
  console.log("═".repeat(56))

  await upsertBrands(supabase)

  let ok = 0
  let failed = 0

  for (let i = 0; i < ADDITIONAL_PRODUCTS.length; i++) {
    const product = ADDITIONAL_PRODUCTS[i]
    const label = `[${i + 1}/${total}] ${product.name}`

    try {
      const brandId = await resolveBrandId(supabase, product.brand)
      if (!brandId) {
        console.log(`❌ ${label} — brand not found: ${product.brand}`)
        failed += 1
        continue
      }

      await upsertProduct(supabase, product, brandId)
      console.log(`✅ ${label} → ${product.slug}`)
      ok += 1
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`❌ ${label} — ${msg}`)
      failed += 1
    }
  }

  console.log("\n" + "═".repeat(56))
  console.log(`  Seeded: ${ok}/${total} products`)
  if (failed > 0) console.log(`  Failed: ${failed}`)
  console.log("═".repeat(56) + "\n")

  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

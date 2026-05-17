/**
 * Seed premium chairs from hardcoded specs → Supabase (no external APIs).
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: pnpm seed:all-chairs
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { ALL_BRANDS } from "./seed/brands"
import { HARD_CODED_CHAIRS, HARD_CODED_BY_SLUG } from "./seed/chairs"
import { priceRangeFromUsd } from "./seed/helpers"
import type { ChairSeedInput, HardcodedChair } from "./seed/types"

config({ path: resolve(__dirname, "../.env.local") })

// ── Chair catalog (order preserved for logging) ─────────────────────────────

const ALL_CHAIRS: ChairSeedInput[] = [
  { name: "Herman Miller Aeron B", brand: "herman-miller", category: "office" },
  { name: "Herman Miller Aeron C", brand: "herman-miller", category: "office" },
  { name: "Herman Miller Embody", brand: "herman-miller", category: "office" },
  { name: "Herman Miller Cosm High Back", brand: "herman-miller", category: "office" },
  { name: "Herman Miller Cosm Low Back", brand: "herman-miller", category: "office" },
  { name: "Herman Miller Sayl", brand: "herman-miller", category: "office" },
  { name: "Herman Miller Mirra 2", brand: "herman-miller", category: "office" },
  { name: "Herman Miller Lino", brand: "herman-miller", category: "office" },
  { name: "Steelcase Leap V2", brand: "steelcase", category: "office" },
  { name: "Steelcase Gesture", brand: "steelcase", category: "office" },
  { name: "Steelcase Think V2", brand: "steelcase", category: "office" },
  { name: "Steelcase Amia", brand: "steelcase", category: "office" },
  { name: "Steelcase Series 1", brand: "steelcase", category: "office" },
  { name: "Steelcase Series 2", brand: "steelcase", category: "office" },
  { name: "Steelcase Karman", brand: "steelcase", category: "office" },
  { name: "Steelcase Coalesse SW_1", brand: "steelcase", category: "lounge" },
  { name: "Okamura Contessa II", brand: "okamura", category: "executive" },
  { name: "Okamura Sylphy", brand: "okamura", category: "office" },
  { name: "Okamura Legno", brand: "okamura", category: "executive" },
  { name: "Okamura Baron", brand: "okamura", category: "office" },
  { name: "Okamura Sabrina", brand: "okamura", category: "office" },
  { name: "Okamura Portone", brand: "okamura", category: "executive" },
  { name: "Okamura Cronos", brand: "okamura", category: "office" },
  { name: "Humanscale Freedom", brand: "humanscale", category: "executive" },
  { name: "Humanscale World One", brand: "humanscale", category: "office" },
  { name: "Humanscale Liberty", brand: "humanscale", category: "office" },
  { name: "Humanscale Diffrient Smart", brand: "humanscale", category: "office" },
  { name: "Humanscale Diffrient World", brand: "humanscale", category: "office" },
  { name: "HÅG Capisco", brand: "hag-flokk", category: "standing" },
  { name: "HÅG Capisco Puls", brand: "hag-flokk", category: "standing" },
  { name: "HÅG SoFi", brand: "hag-flokk", category: "office" },
  { name: "HÅG Tion", brand: "hag-flokk", category: "office" },
  { name: "Flokk RH Logic 400", brand: "hag-flokk", category: "office" },
  { name: "Flokk RH Mereo", brand: "hag-flokk", category: "office" },
  { name: "Wilkhahn ON", brand: "wilkhahn", category: "office" },
  { name: "Wilkhahn AT", brand: "wilkhahn", category: "office" },
  { name: "Wilkhahn FS", brand: "wilkhahn", category: "conference" },
  { name: "Wilkhahn Modus", brand: "wilkhahn", category: "conference" },
  { name: "Vitra ID Chair Concept", brand: "vitra", category: "office" },
  { name: "Vitra ID Soft", brand: "vitra", category: "office" },
  { name: "Vitra ID Trim", brand: "vitra", category: "office" },
  { name: "Vitra Pacific Chair", brand: "vitra", category: "office" },
  { name: "Vitra Eames Aluminium Group", brand: "vitra", category: "executive" },
  { name: "Vitra Physix", brand: "vitra", category: "office" },
  { name: "Knoll ReGeneration", brand: "knoll", category: "office" },
  { name: "Knoll Life Chair", brand: "knoll", category: "office" },
  { name: "Knoll Chadwick", brand: "knoll", category: "office" },
  { name: "Knoll RPM Executive", brand: "knoll", category: "executive" },
  { name: "Haworth Fern", brand: "haworth", category: "office" },
  { name: "Haworth Soji", brand: "haworth", category: "office" },
  { name: "Haworth Very Task", brand: "haworth", category: "office" },
  { name: "Haworth Comforto 59", brand: "haworth", category: "office" },
  { name: "Sedus Open Up", brand: "sedus", category: "office" },
  { name: "Sedus Se:do", brand: "sedus", category: "office" },
  { name: "Sedus Net:work", brand: "sedus", category: "office" },
  { name: "Sedus Black Dot", brand: "sedus", category: "office" },
  { name: "Kokuyo Ing", brand: "kokuyo", category: "office" },
  { name: "Kokuyo Ing Cloud", brand: "kokuyo", category: "office" },
  { name: "Kokuyo CRG", brand: "kokuyo", category: "office" },
  { name: "Kokuyo Duora", brand: "kokuyo", category: "office" },
  { name: "Itoki ACT2", brand: "itoki", category: "office" },
  { name: "Itoki Leala", brand: "itoki", category: "office" },
  { name: "Itoki Spina", brand: "itoki", category: "office" },
  { name: "Itoki Karuga", brand: "itoki", category: "executive" },
  { name: "Uchida Finora", brand: "uchida", category: "office" },
  { name: "Uchida Viella", brand: "uchida", category: "executive" },
  { name: "Global Concorde Presidential", brand: "global", category: "executive" },
  { name: "Global Accord", brand: "global", category: "office" },
  { name: "Global Sora", brand: "global", category: "office" },
  { name: "König+Neurath Okay.2", brand: "konig-neurath", category: "office" },
  { name: "König+Neurath Teo", brand: "konig-neurath", category: "office" },
  { name: "Interstuhl Silver 262S", brand: "interstuhl", category: "office" },
  { name: "Interstuhl Every E3", brand: "interstuhl", category: "office" },
  { name: "Interstuhl Pure Active", brand: "interstuhl", category: "office" },
  { name: "Girsberger Enjoy", brand: "girsberger", category: "office" },
  { name: "Girsberger Impulse", brand: "girsberger", category: "office" },
  { name: "Kastel Kefir", brand: "kastel", category: "office" },
  { name: "Kastel Kruna", brand: "kastel", category: "executive" },
  { name: "Secretlab Titan Evo 2022", brand: "secretlab", category: "gaming" },
  { name: "Secretlab Omega", brand: "secretlab", category: "gaming" },
  { name: "Herman Miller x Logitech Embody Gaming", brand: "herman-miller", category: "gaming" },
  { name: "Steelcase x Respawn Gaming Chair", brand: "steelcase", category: "gaming" },
  { name: "Noblechairs Hero", brand: "noblechairs", category: "gaming" },
  { name: "Noblechairs Epic", brand: "noblechairs", category: "gaming" },
  { name: "AndaSeat Kaiser 3", brand: "andaseat", category: "gaming" },
  { name: "Corsair TC100 Relaxed", brand: "corsair", category: "gaming" },
  { name: "Razer Iskur V2", brand: "razer", category: "gaming" },
  { name: "Poltrona Frau Dora", brand: "poltrona-frau", category: "executive" },
  { name: "Walter Knoll Leadchair", brand: "walter-knoll", category: "executive" },
  { name: "Girsberger Diagon", brand: "girsberger", category: "executive" },
  { name: "Boss Design Mera", brand: "boss-design", category: "executive" },
  { name: "Steelcase Coalesse Exponents", brand: "steelcase", category: "conference" },
  { name: "Wilkhahn Graph", brand: "wilkhahn", category: "conference" },
  { name: "Vitra Physix Conference", brand: "vitra", category: "conference" },
  { name: "Haworth Comforto 29", brand: "haworth", category: "conference" },
  { name: "Autonomous ErgoChair Pro", brand: "autonomous", category: "study" },
  { name: "FlexiSpot OC3", brand: "flexispot", category: "study" },
  { name: "Branch Ergonomic Chair", brand: "branch", category: "study" },
  { name: "Sidiz T50", brand: "sidiz", category: "study" },
  { name: "Sidiz T80", brand: "sidiz", category: "office" },
  { name: "Varier Variable Balans", brand: "varier", category: "standing" },
  { name: "Varier Thatsit Balans", brand: "varier", category: "standing" },
  { name: "Saddle Salli Swing", brand: "salli", category: "standing" },
  { name: "Bambach Saddle Seat", brand: "bambach", category: "standing" },
]

const KOREA_BRANDS = new Set([
  "okamura",
  "kokuyo",
  "itoki",
  "uchida",
  "sidiz",
])
const CHAIRPARK_BRANDS = new Set([
  "herman-miller",
  "steelcase",
  "humanscale",
  "okamura",
  "kokuyo",
  "haworth",
  "hag-flokk",
  "vitra",
])

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

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`
}

function resolveHardcoded(seed: ChairSeedInput): HardcodedChair | undefined {
  return HARD_CODED_CHAIRS.find(
    (c) => c.brand === seed.brand && c.name === seed.name
  )
}

async function upsertBrands(supabase: SupabaseClient): Promise<void> {
  console.log(`\nUpserting ${ALL_BRANDS.length} brands...\n`)

  const rows = ALL_BRANDS.map((b) => ({
    slug: b.slug,
    name: b.name,
    country: b.country,
    tier: b.tier,
    founded_year: b.founded_year,
    description_ko: "",
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from("brands").upsert(rows, { onConflict: "slug" })
  if (error) {
    if (error.message.includes("permission denied")) {
      throw new Error(
        `Brand upsert failed: ${error.message}\n` +
          "→ Run lib/supabase/migrations/002_service_role_grants.sql in Supabase SQL Editor,\n" +
          "  or use the Legacy service_role key (eyJ...) in SUPABASE_SERVICE_ROLE_KEY."
      )
    }
    throw new Error(`Brand upsert failed: ${error.message}`)
  }

  for (const b of ALL_BRANDS) {
    console.log(`  ✓ ${b.name} (${b.slug})`)
  }
  console.log()
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
  chair: HardcodedChair,
  brandId: string
): Promise<void> {
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
    available_in_korea:
      KOREA_BRANDS.has(chair.brand) || chair.priceKrw > 0,
    try_at_chairpark: CHAIRPARK_BRANDS.has(chair.brand),
    published: true,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("products").upsert(row, { onConflict: "slug" })
  if (error) throw new Error(error.message)
}

async function main() {
  const supabase = createSupabaseAdmin()
  const total = ALL_CHAIRS.length

  console.log("═".repeat(56))
  console.log(`  Furniblog hardcoded seeder — ${total} chairs`)
  console.log(`  Hardcoded specs loaded: ${HARD_CODED_CHAIRS.length}`)
  console.log("═".repeat(56))

  if (HARD_CODED_CHAIRS.length !== HARD_CODED_BY_SLUG.size) {
    console.error("Duplicate slugs in hardcoded data!")
    process.exit(1)
  }

  await upsertBrands(supabase)

  let ok = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < ALL_CHAIRS.length; i++) {
    const seed = ALL_CHAIRS[i]
    const label = `[${i + 1}/${total}] ${seed.name}`
    const chair = resolveHardcoded(seed)

    if (!chair) {
      console.log(`❌ ${label} — no hardcoded spec (add to scripts/seed/chairs/)`)
      skipped += 1
      continue
    }

    try {
      const brandId = await resolveBrandId(supabase, seed.brand)
      if (!brandId) {
        console.log(`❌ ${label} — brand not found: ${seed.brand}`)
        skipped += 1
        continue
      }

      await upsertProduct(supabase, chair, brandId)
      console.log(`✅ ${label} — ${formatUsd(chair.priceUsd)} → ${chair.slug}`)
      ok += 1
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`❌ ${label} — ${msg}`)
      failed += 1
    }
  }

  const brandCount = new Set(ALL_CHAIRS.map((c) => c.brand)).size

  console.log("\n" + "═".repeat(56))
  console.log(`  Seeded: ${ok}/${total} chairs across ${brandCount} brands`)
  if (failed > 0) console.log(`  Failed: ${failed}`)
  if (skipped > 0) console.log(`  Skipped: ${skipped}`)
  console.log("═".repeat(56) + "\n")

  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

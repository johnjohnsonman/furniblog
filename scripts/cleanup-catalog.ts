/**
 * Catalog cleanup: remove phantom (non-existent) chairs and fix mislabeled ones.
 *
 * Based on web verification of every chair in the catalog. Deleting a product
 * cascades to its reviews/affiliate_links/product_images (ON DELETE CASCADE).
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run cleanup:catalog            # DRY RUN — shows what would change
 *   npm run cleanup:catalog -- --apply # actually delete + update
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

config({ path: resolve(__dirname, "../.env.local") })

/** Products that do not exist as real products (hallucinated/misnamed/not a chair). */
const DELETE_SLUGS: string[] = [
  "itoki-karuga", // no such Itoki model
  "itoki-leala", // no such Itoki model (real one is Leonis)
  "okamura-cronos", // no such Okamura model
  "okamura-legno", // no such Okamura model (real one is Legender)
  "uchida-viella", // no such Uchida model
  "sedus-network", // no such Sedus model (real: black dot net / se:motion net)
  "girsberger-enjoy", // not in Girsberger catalog ("Enjoy" is Interstuhl tagline)
  "girsberger-impulse", // not in Girsberger catalog
  "konig-neurath-teo", // not in König+Neurath catalog
  "kastel-kefir", // not in Kastel catalog
  "steelcase-coalesse-exponents", // Exponents is a storage/cart line, not a chair
  "steelcase-respawn-gaming", // RESPAWN is not a Steelcase brand; also out of office scope
]

/** Real chairs that are mislabeled — fix name (and brand where wrong). Slug kept to preserve links. */
type Fix = { slug: string; newName: string; newBrandSlug?: string; reason: string }
const FIXES: Fix[] = [
  { slug: "uchida-finora", newName: "Okamura Finora", newBrandSlug: "okamura", reason: "Finora is an Okamura chair, not Uchida" },
  { slug: "boss-design-mera", newName: "Klöber Mera", newBrandSlug: "klober", reason: "Mera is a Klöber chair, not Boss Design" },
  { slug: "poltrona-frau-dora", newName: "Poltrona Frau Isadora", reason: "real model is Isadora" },
  { slug: "knoll-rpm-executive", newName: "Knoll RPM", reason: "no 'Executive' variant; model is just RPM" },
  { slug: "interstuhl-every-e3", newName: "Interstuhl EVERYis1", reason: "Every line is branded EVERYis1" },
]

function admin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function brandId(supabase: SupabaseClient, slug: string): Promise<string> {
  const { data, error } = await supabase.from("brands").select("id").eq("slug", slug).maybeSingle()
  if (error) throw new Error(`brand lookup ${slug}: ${error.message}`)
  if (!data?.id) throw new Error(`brand not found: ${slug}`)
  return data.id as string
}

async function main() {
  const apply = process.argv.includes("--apply")
  const supabase = admin()

  // Resolve which delete targets actually exist.
  const { data: existing } = await supabase
    .from("products")
    .select("slug, name")
    .in("slug", DELETE_SLUGS)
  const existingSlugs = new Set((existing ?? []).map((p) => p.slug))

  console.log("═".repeat(60))
  console.log(apply ? "  APPLY MODE — changes WILL be written" : "  DRY RUN — no changes written")
  console.log("═".repeat(60))

  console.log(`\n🗑️  DELETE (${existingSlugs.size}/${DELETE_SLUGS.length} found):`)
  for (const slug of DELETE_SLUGS) {
    console.log(`   ${existingSlugs.has(slug) ? "•" : "– (already gone)"} ${slug}`)
  }

  console.log(`\n✏️  FIX (${FIXES.length}):`)
  for (const f of FIXES) {
    console.log(`   • ${f.slug} → name "${f.newName}"${f.newBrandSlug ? `, brand=${f.newBrandSlug}` : ""}  (${f.reason})`)
  }

  if (!apply) {
    console.log(`\nDRY RUN complete. Re-run with "--apply" to execute.`)
    return
  }

  // --- Apply deletes (cascade removes dependent reviews/links/images) ---
  if (existingSlugs.size > 0) {
    const { error } = await supabase.from("products").delete().in("slug", [...existingSlugs])
    if (error) throw new Error(`delete failed: ${error.message}`)
    console.log(`\n✅ Deleted ${existingSlugs.size} products.`)
  }

  // --- Apply fixes ---
  let fixed = 0
  for (const f of FIXES) {
    const patch: Record<string, unknown> = { name: f.newName, updated_at: new Date().toISOString() }
    if (f.newBrandSlug) patch.brand_id = await brandId(supabase, f.newBrandSlug)
    const { error, count } = await supabase
      .from("products")
      .update(patch, { count: "exact" })
      .eq("slug", f.slug)
    if (error) {
      console.log(`   ❌ ${f.slug}: ${error.message}`)
      continue
    }
    if ((count ?? 0) > 0) fixed++
    console.log(`   ✅ ${f.slug} → "${f.newName}"`)
  }
  console.log(`\n✅ Fixed ${fixed}/${FIXES.length} products.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

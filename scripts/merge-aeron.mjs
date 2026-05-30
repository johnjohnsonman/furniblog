import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

function loadEnv() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) process.env[m[1]] = m[2]
  }
}
loadEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const CANONICAL = "58820425-adb6-43d7-8bda-d427b34c22aa" // Size B
const MERGE = ["d9fda46c-3bcb-4968-a54c-72ef15d9d409"] // Size C

// table -> FK column referencing products(id) (review_rankings handled separately)
const FK_TABLES = [
  ["reviews", "product_id"],
  ["affiliate_links", "product_id"],
  ["affiliate_clicks", "product_id"],
  ["content_queue", "item_id"],
  ["pipeline_runs", "product_id"],
  ["gallery_images", "product_id"],
  ["videos", "chair_id"],
  ["product_images", "product_id"],
]

function die(msg) {
  console.error("ABORT:", msg)
  process.exit(1)
}

async function mergeReviewRankings(fromId) {
  // unique (session_id, chair_id): drop "from" rankings whose session already has a canonical ranking,
  // then repoint the rest to canonical.
  const { data: canonicalRows, error: cErr } = await supabase
    .from("review_rankings")
    .select("session_id")
    .eq("chair_id", CANONICAL)
  if (cErr) die(`review_rankings read canonical: ${cErr.message}`)
  const canonicalSessions = new Set((canonicalRows ?? []).map((r) => r.session_id))

  const { data: fromRows, error: fErr } = await supabase
    .from("review_rankings")
    .select("id, session_id")
    .eq("chair_id", fromId)
  if (fErr) die(`review_rankings read from: ${fErr.message}`)

  const conflictIds = []
  const moveIds = []
  for (const r of fromRows ?? []) {
    if (canonicalSessions.has(r.session_id)) conflictIds.push(r.id)
    else moveIds.push(r.id)
  }

  let deleted = 0
  let moved = 0
  if (conflictIds.length > 0) {
    const { error } = await supabase
      .from("review_rankings")
      .delete()
      .in("id", conflictIds)
    if (error) die(`review_rankings delete conflicts: ${error.message}`)
    deleted = conflictIds.length
  }
  if (moveIds.length > 0) {
    const { error } = await supabase
      .from("review_rankings")
      .update({ chair_id: CANONICAL })
      .in("id", moveIds)
    if (error) die(`review_rankings move: ${error.message}`)
    moved = moveIds.length
  }
  console.log(
    `  review_rankings.chair_id: moved ${moved}, deleted ${deleted} (conflict)`
  )
}

async function repoint(table, column, fromId) {
  const { count: before } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, fromId)

  const { error } = await supabase
    .from(table)
    .update({ [column]: CANONICAL })
    .eq(column, fromId)
  if (error) die(`${table}.${column} update: ${error.message}`)
  console.log(`  ${table}.${column}: moved ${before ?? 0}`)
}

async function main() {
  // Guard: both rows must exist
  const { data: existing, error } = await supabase
    .from("products")
    .select("id, name, slug")
    .in("id", [CANONICAL, ...MERGE])
  if (error) die(error.message)
  const ids = new Set((existing ?? []).map((r) => r.id))
  if (!ids.has(CANONICAL)) die("canonical row not found")
  for (const m of MERGE) if (!ids.has(m)) console.log(`(note) merge row ${m} already gone`)

  for (const fromId of MERGE) {
    if (!ids.has(fromId)) continue
    console.log(`\n--- Merging ${fromId} -> ${CANONICAL} ---`)
    await mergeReviewRankings(fromId)
    for (const [table, column] of FK_TABLES) {
      await repoint(table, column, fromId)
    }
  }

  // Canonical name/slug
  console.log(`\n--- Updating canonical name/slug ---`)
  const { error: updErr } = await supabase
    .from("products")
    .update({ name: "Herman Miller Aeron", slug: "herman-miller-aeron" })
    .eq("id", CANONICAL)
  if (updErr) die(`canonical update: ${updErr.message}`)
  console.log("  name='Herman Miller Aeron', slug='herman-miller-aeron'")

  // Delete merge rows
  for (const fromId of MERGE) {
    if (!ids.has(fromId)) continue
    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .eq("id", fromId)
    if (delErr) die(`delete ${fromId}: ${delErr.message}`)
    console.log(`  deleted product ${fromId}`)
  }

  // Verify
  console.log(`\n=== Verification ===`)
  const { count: reviewCount } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("product_id", CANONICAL)
  const { count: videoCount } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("chair_id", CANONICAL)
  const { data: prod } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("id", CANONICAL)
    .maybeSingle()
  const { data: leftovers } = await supabase
    .from("products")
    .select("id, name, slug")
    .ilike("name", "Herman Miller Aeron%")

  console.log(`  reviews where product_id=canonical: ${reviewCount} (expect 65)`)
  console.log(`  videos where chair_id=canonical:    ${videoCount} (expect 6)`)
  console.log(`  canonical: ${prod?.name} / ${prod?.slug}`)
  console.log(`  Aeron rows now: ${(leftovers ?? []).length}`)
  for (const r of leftovers ?? []) console.log(`    - ${r.name} (${r.slug})`)
}

main()

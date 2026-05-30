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

// table -> FK column referencing products(id)
const FK_TABLES = [
  ["reviews", "product_id"],
  ["affiliate_links", "product_id"],
  ["affiliate_clicks", "product_id"],
  ["content_queue", "item_id"],
  ["pipeline_runs", "product_id"],
  ["gallery_images", "product_id"],
  ["videos", "chair_id"],
  ["product_images", "product_id"],
  ["review_rankings", "chair_id"],
]

async function countRefs(table, column, productId) {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, productId)
  if (error) return `ERR(${error.message})`
  return count ?? 0
}

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, created_at")
    .ilike("name", "Herman Miller Aeron%")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Failed to query products:", error.message)
    process.exit(1)
  }

  console.log(`\n=== Herman Miller Aeron variants found: ${products.length} ===\n`)

  for (const p of products) {
    console.log(`- id:         ${p.id}`)
    console.log(`  name:       ${p.name}`)
    console.log(`  slug:       ${p.slug}`)
    console.log(`  created_at: ${p.created_at}`)
    for (const [table, column] of FK_TABLES) {
      const c = await countRefs(table, column, p.id)
      console.log(`  ${table}.${column}: ${c}`)
    }
    console.log("")
  }
}

main()

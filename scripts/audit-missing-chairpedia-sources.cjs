const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })

const slugs = [
  "branch-ergonomic-chair", "duramont-ergonomic-office-chair", "flexispot-c7-office-chair",
  "gabrylly-ergonomic-office-chair", "herman-miller-embody-gaming-chair",
  "hon-ignition-2-office-chair", "mimoglad-high-back-office-chair",
  "nouhaus-ergo3d-ergonomic-office-chair", "sidiz-t50-office-chair",
]

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await s.from("chairpedia").select("id,slug,title,content_html,gen_sources,status,product_id,updated_at,products(slug,name,description_en,best_for,pros,cons)").in("slug", slugs)
  if (error) throw error
  console.log(JSON.stringify({ expected: slugs.length, found: data.length, rows: data.map((row) => ({ ...row, content_html: undefined, contentWords: (row.content_html || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length, contentPreview: (row.content_html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500) })) }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

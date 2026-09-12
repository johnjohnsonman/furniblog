const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })

const slugs = [
  "andaseat-kaiser-3", "hbada-p5", "office-star-progrid", "sihoo-doro-s300",
  "allsteel-acuity", "sidiz-t80", "x-chair-x3", "duorest-alpha",
  "furmax-gaming", "modway-articulate", "ergohuman-classic", "hon-wave",
]

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: products, error } = await s.from("products").select("id,slug,name,category,chair_type,country,price_usd,description_en,best_for,pros,cons,chair_specs,thumbnail_url,brands(name,slug,website_url)").in("slug", slugs)
  if (error) throw error
  const ids = products.map((row) => row.id)
  const [{ data: chairpedia }, { data: comparisons }] = await Promise.all([
    s.from("chairpedia").select("id,slug,title,status,product_id,gen_sources,updated_at").in("product_id", ids),
    s.from("comparisons").select("id,slug,title,status,product_a_id,product_b_id,updated_at").or(`product_a_id.in.(${ids.join(",")}),product_b_id.in.(${ids.join(",")})`),
  ])
  const byId = new Map(products.map((row) => [row.id, row.slug]))
  const result = {
    cohortCount: products.length,
    publishedGuides: (chairpedia || []).filter((c) => c.status === "published").length,
    publishedComparisonsTouchingCohort: (comparisons || []).filter((c) => c.status === "published").length,
    missingChairpedia: products.filter((p) => !(chairpedia || []).some((c) => c.product_id === p.id && c.status === "published")).map((p) => p.slug),
    missingComparisons: products.filter((p) => !(comparisons || []).some((c) => c.status === "published" && (c.product_a_id === p.id || c.product_b_id === p.id))).map((p) => p.slug),
    guidesMissingSources: (chairpedia || []).filter((c) => c.status === "published" && !(c.gen_sources || []).length).map((c) => c.slug),
  }
  if (process.argv.includes("--details")) {
    result.products = products.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug))
    result.chairpedia = chairpedia || []
    result.comparisons = (comparisons || []).map((row) => ({ ...row, productA: byId.get(row.product_a_id), productB: byId.get(row.product_b_id) }))
  }
  console.log(JSON.stringify(result, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

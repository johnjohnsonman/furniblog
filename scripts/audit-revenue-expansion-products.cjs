const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })
const source = fs.readFileSync(path.resolve(__dirname, "../lib/growth/revenue-priorities.ts"), "utf8")
const block = source.match(/REVENUE_EXPANSION_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/)
const slugs = [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
const risky = /best[- ]sell|best-in-class|industry-leading|unmatched|ultimate|perfect|exceptional|revolutionary|game[- ]chang|most comfortable|maximum comfort|premium comfort|superior comfort|comfort-per-dollar|chairs twice its price|everyone|guarantee|wildly popular|Amazon favorite|highest-volume|top Amazon office-chair seller|healthy micro-movements|lower-back relief|award winner/i
const words = (value) => (value || "").trim().split(/\s+/).filter(Boolean).length

async function main() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const [{ data, error }, { data: chairpedia }, { data: comparisons }] = await Promise.all([
    client.from("products").select("id,slug,name,description_en,description_ko,best_for,pros,cons").in("slug", slugs),
    client.from("chairpedia").select("product_id").eq("status", "published"),
    client.from("comparisons").select("product_a_id,product_b_id").eq("status", "published"),
  ])
  if (error) throw error
  const cp = new Set((chairpedia || []).map((row) => row.product_id))
  const compared = new Set((comparisons || []).flatMap((row) => [row.product_a_id, row.product_b_id]).filter(Boolean))
  const rows = data || []
  console.log(JSON.stringify({
    cohortCount: slugs.length,
    found: rows.length,
    under30Words: rows.filter((row) => words(row.description_en || row.description_ko) < 30).map((row) => row.slug),
    unsynchronized: rows.filter((row) => row.description_en !== row.description_ko).map((row) => row.slug),
    riskyDescriptions: rows.filter((row) => risky.test(row.description_en || row.description_ko || "")).map((row) => row.slug),
    riskyDecisionFields: rows.filter((row) => risky.test([row.best_for, ...(row.pros || []), ...(row.cons || [])].filter(Boolean).join(" "))).map((row) => ({ slug: row.slug, bestFor: row.best_for, pros: row.pros, cons: row.cons })),
    withChairpedia: rows.filter((row) => cp.has(row.id)).length,
    withComparisons: rows.filter((row) => compared.has(row.id)).length,
    missingBestFor: rows.filter((row) => !row.best_for).map((row) => row.slug),
  }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

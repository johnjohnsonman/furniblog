const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })

function quotedValues(source, pattern) {
  const block = source.match(pattern)
  if (!block) throw new Error("Could not parse source list")
  return [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
}

async function main() {
  const root = path.resolve(__dirname, "..")
  const prioritySource = fs.readFileSync(path.join(root, "lib/growth/revenue-priorities.ts"), "utf8")
  const existing = new Set(quotedValues(prioritySource, /REVENUE_PRIORITY_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/))
  for (const slug of quotedValues(prioritySource, /REVENUE_EXPANSION_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/)) existing.add(slug)
  const affiliateSource = fs.readFileSync(path.join(root, "lib/data/affiliate-links-data.ts"), "utf8")
  const directAmazon = new Set()
  let currentSlug = null
  for (const line of affiliateSource.split(/\r?\n/)) {
    const key = line.match(/^\s*"([^"]+)"\s*:\s*\[/)
    if (key) currentSlug = key[1]
    if (currentSlug && /amazon\.com\/dp\/[A-Z0-9]{10}/i.test(line)) {
      directAmazon.add(currentSlug)
      currentSlug = null
    }
  }

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const [{ data: products, error }, { data: chairpedia }, { data: comparisons }, { data: reviews }] = await Promise.all([
    client.from("products").select("id,slug,name,description_en,description_ko,best_for,pros,cons,rating_overall,review_count,updated_at").eq("published", true).eq("track", "chair"),
    client.from("chairpedia").select("product_id").eq("status", "published"),
    client.from("comparisons").select("product_a_id,product_b_id").eq("status", "published"),
    client.from("reviews").select("product_id").limit(5000),
  ])
  if (error) throw error

  const chairpediaIds = new Set((chairpedia || []).map((row) => row.product_id).filter(Boolean))
  const comparisonCounts = new Map()
  for (const row of comparisons || []) {
    for (const id of [row.product_a_id, row.product_b_id]) {
      if (id) comparisonCounts.set(id, (comparisonCounts.get(id) || 0) + 1)
    }
  }
  const reviewCounts = new Map()
  for (const row of reviews || []) reviewCounts.set(row.product_id, (reviewCounts.get(row.product_id) || 0) + 1)
  const words = (value) => (value || "").trim().split(/\s+/).filter(Boolean).length

  const candidates = products
    .filter((row) => !existing.has(row.slug) && directAmazon.has(row.slug))
    .map((row) => {
      const reviewCount = reviewCounts.get(row.id) || Number(row.review_count) || 0
      const comparisonCount = comparisonCounts.get(row.id) || 0
      const hasChairpedia = chairpediaIds.has(row.id)
      const descriptionWords = words(row.description_en || row.description_ko)
      const score = 100 + Math.min(reviewCount, 20) * 3 + Math.min(comparisonCount, 4) * 12 + (hasChairpedia ? 30 : 0) + (descriptionWords < 30 ? 15 : 0) + (row.best_for ? 5 : 0)
      return { slug: row.slug, name: row.name, score, reviewCount, comparisonCount, hasChairpedia, descriptionWords }
    })
    .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount || a.slug.localeCompare(b.slug))

  const selected = candidates.slice(0, 40)
  console.log(JSON.stringify({ selectedCount: selected.length, eligibleCount: candidates.length, selected }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

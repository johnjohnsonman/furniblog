const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })

const source = fs.readFileSync(path.resolve(__dirname, "../lib/growth/revenue-priorities.ts"), "utf8")
const block = source.match(/REVENUE_PRIORITY_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/)
const slugs = [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
const words = (value) => (value || "").trim().split(/\s+/).filter(Boolean).length

async function main() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await client
    .from("products")
    .select("id,slug,name,category,description_en,description_ko,best_for,pros,cons,chair_specs,brands(name,website_url)")
    .in("slug", slugs)
  if (error) throw error

  const bySlug = new Map(data.map((row) => [row.slug, row]))
  const rows = slugs.map((slug) => {
    const row = bySlug.get(slug)
    if (!row) return { slug, missing: true }
    return {
      slug,
      name: row.name,
      category: row.category,
      descriptionWords: words(row.description_en || row.description_ko),
      description: row.description_en || row.description_ko,
      bestFor: row.best_for,
      pros: row.pros || [],
      cons: row.cons || [],
      specKeys: Object.keys(row.chair_specs || {}),
      brand: Array.isArray(row.brands) ? row.brands[0] : row.brands,
    }
  })
  const hype = /best[- ]seller|best-in-class|industry-leading|comfort-per-dollar|chairs twice its price|maximum comfort/i
  console.log(JSON.stringify({
    priorityCount: slugs.length,
    found: rows.filter((row) => !row.missing).length,
    under30Words: rows.filter((row) => !row.missing && row.descriptionWords < 30).length,
    missingBestFor: rows.filter((row) => !row.missing && !row.bestFor).length,
    hypeDescriptions: rows.filter((row) => !row.missing && hype.test(row.description)).map((row) => row.slug),
    rows,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

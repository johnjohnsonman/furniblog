const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")
const { load } = require("cheerio")
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })

const checks = {
  firstPersonTest: /\b(?:we|our team|furniblog)\s+(?:tested|sat in|used|reviewed hands-on|found during testing)\b/i,
  medicalPromise: /\b(?:cures?|prevents?|eliminates?)\s+(?:back|neck|shoulder)\s+pain\b/i,
  unsupportedPopularity: /\b(?:best-selling|most popular|thousands of reviewers|universally loved)\b/i,
  reviewVoice: /\breviewers?\s+(?:say|praise|love|report|note|mention|found|like)\b/i,
}

async function main() {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: guides, error } = await s.from("chairpedia")
    .select("id,slug,title,product_id,content_html,gen_sources,products(slug,name)")
    .eq("status", "published").order("slug")
  if (error) throw error
  const findings = []
  for (const guide of guides) {
    const text = load(guide.content_html || "", null, false).text().replace(/\s+/g, " ").trim()
    for (const [kind, pattern] of Object.entries(checks)) {
      const match = text.match(pattern)
      if (match) findings.push({ slug: guide.slug, kind, match: match[0], context: text.slice(Math.max(0, match.index - 80), match.index + match[0].length + 120) })
    }
  }
  const byProduct = new Map()
  for (const guide of guides) if (guide.product_id) byProduct.set(guide.product_id, [...(byProduct.get(guide.product_id) || []), guide])
  const duplicateProducts = [...byProduct.values()].filter(rows => rows.length > 1).map(rows => rows.map(row => ({ slug: row.slug, product: row.products })))
  console.log(JSON.stringify({ published: guides.length, findings, duplicateProducts }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })

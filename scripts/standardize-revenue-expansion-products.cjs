const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })
const apply = process.argv.includes("--apply")
const source = fs.readFileSync(path.resolve(__dirname, "../lib/growth/revenue-priorities.ts"), "utf8")
const block = source.match(/REVENUE_EXPANSION_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/)
const slugs = [...block[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])

const replacements = [
  [/a perennial Amazon office-chair best-seller/gi, "an office chair sold on Amazon"],
  [/one of the best-selling racing-style gaming chairs on Amazon/gi, "a racing-style gaming chair sold on Amazon"],
  [/a perennial budget best-seller/gi, "a budget-oriented model"],
  [/a long-time Amazon favorite/gi, "an office chair sold on Amazon"],
  [/one of Amazon's highest-volume budget mesh task chairs/gi, "a budget mesh task chair sold on Amazon"],
  [/a top Amazon office-chair seller/gi, "an office chair sold on Amazon"],
  [/a wildly popular entry-level gaming chair/gi, "an entry-level gaming chair"],
  [/X-Chair's popular mid-tier/gi, "a mid-tier X-Chair model"],
  [/popular home-office leather seating/gi, "home-office leather seating"],
  [/a popular pick for home offices on a budget/gi, "positioned for budget home offices"],
  [/SIHOO's anti-gravity recline flagship; German Design Award winner/gi, "SIHOO task chair with a recline mechanism and split lumbar support"],
  [/Allsteel's auto-adjusting ergonomic flagship; an Aeron\/Leap competitor/gi, "Allsteel task chair with an automatic weight-activated recline"],
  [/HON's modern flagship/gi, "HON task chair"],
  [/encouraging healthy micro-movements all day/gi, "designed to permit movement while seated"],
  [/built for posture and lower-back relief/gi, "with adjustable back support"],
  [/built for all-day comfort/gi, "designed for extended desk or gaming sessions"],
  [/UPLIFT's premium fully-adjustable ergonomic chair/gi, "UPLIFT ergonomic chair with multiple adjustment controls"],
  [/strong value ergonomic/gi, "with basic ergonomic adjustments"],
  [/is billed as the world's first dynamic ergonomic chair/gi, "is marketed as a dynamic ergonomic chair"],
  [/plus a spinal-stretch mode/gi, "plus an additional recline mode"],
]
const tailStart = /This page brings together|Use the specifications/
const bestForOverrides = {
  "gtracing-gaming": "Budget-oriented racing-style gaming chair",
  "gtplayer-gaming-footrest": "Budget gaming setup requiring a pull-out footrest",
  "bestoffice-breathable-mid-back": "Basic mesh task seating for a compact budget workspace",
  "homall-executive": "Budget high-back seating with padded executive styling",
}

function neutralLead(row) {
  const stored = row.description_en || row.description_ko || ""
  let lead = stored.split(tailStart)[0].trim()
  for (const [pattern, replacement] of replacements) lead = lead.replace(pattern, replacement)
  lead = lead.replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1")
  if (!lead) lead = `${row.name} is listed as an office chair with configuration details that may vary by seller.`
  if (!/[.!?]$/.test(lead)) lead += "."
  return lead.charAt(0).toUpperCase() + lead.slice(1)
}

function standardDescription(row) {
  return `${neutralLead(row)} This page brings together available specifications, published review summaries and linked comparisons for ${row.name}. Confirm the exact model, seller, condition, warranty and return terms before buying.`
}

async function main() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await client.from("products").select("id,slug,name,description_en,description_ko,best_for,updated_at").in("slug", slugs)
  if (error) throw error
  const bySlug = new Map(data.map((row) => [row.slug, row]))
  const missing = slugs.filter((slug) => !bySlug.has(slug))
  if (missing.length) throw new Error(`Missing expansion products: ${missing.join(", ")}`)
  const changes = slugs.map((slug) => {
    const row = bySlug.get(slug)
    return { row, next: standardDescription(row), nextBestFor: bestForOverrides[row.slug] || row.best_for }
  }).filter(({ row, next, nextBestFor }) => next !== row.description_en || next !== row.description_ko || nextBestFor !== row.best_for)

  console.log(JSON.stringify({ mode: apply ? "apply" : "audit", cohortCount: slugs.length, changes: changes.length, preview: changes.map(({ row, next }) => ({ slug: row.slug, before: row.description_en || row.description_ko, after: next })) }, null, 2))
  if (!apply || !changes.length) return

  const backupDir = path.resolve(__dirname, "backups")
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `revenue-expansion-descriptions-${Date.now()}.json`)
  fs.writeFileSync(backupFile, JSON.stringify(changes.map(({ row }) => row), null, 2), { flag: "wx" })
  for (const { row, next, nextBestFor } of changes) {
    const { error: updateError } = await client.from("products").update({ description_en: next, description_ko: next, best_for: nextBestFor, updated_at: new Date().toISOString() }).eq("id", row.id)
    if (updateError) throw new Error(`${row.slug}: ${updateError.message}`)
  }
  console.log(JSON.stringify({ updated: changes.length, backupFile }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })

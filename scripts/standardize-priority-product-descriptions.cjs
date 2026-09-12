const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@supabase/supabase-js")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })
const apply = process.argv.includes("--apply")

const prioritySource = fs.readFileSync(path.resolve(__dirname, "../lib/growth/revenue-priorities.ts"), "utf8")
const priorityBlock = prioritySource.match(/REVENUE_PRIORITY_SLUGS\s*=\s*\[([\s\S]*?)\]\s*as const/)
const slugs = [...priorityBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])

const hypePatterns = [
  [/\bthe default budget-ergonomic recommendation\b/gi, "a budget-oriented ergonomic chair"],
  [/\ba perennial Amazon best-seller and one of the most affordable\b/gi, "a budget-oriented"],
  [/\ba long-running Amazon best-seller:\s*/gi, ""],
  [/\ban Amazon mainstay:\s*/gi, ""],
  [/\ba best-selling\b/gi, "a"],
  [/\bindustry-leading\b/gi, "documented"],
  [/\bbest-in-class\b/gi, "wide-ranging"],
  [/\bcomfort that punches above its price\b/gi, "with several adjustable components"],
  [/\bfrequently cross-shopped against chairs twice its price\b/gi, "positioned for mid-range comparison"],
  [/\ba worldwide ergonomic favorite\b/gi, "designed for adjustable task seating"],
  [/\bmaximum comfort\b/gi, "fewer manual controls"],
  [/\bsized for medium builds\.\s*/gi, ""],
  [/\bdeliver exceptional ventilation\b/gi, "are designed to maintain airflow"],
  [/\bOne of the most researched task chairs ever made\.?/gi, ""],
  [/\bLiveBack technology mimics spine movement\b/gi, "LiveBack is designed to flex with back movement"],
  [/\bNatural Glide recline keeps eyes aligned with screen\b/gi, "Natural Glide is designed for reclined desk work"],
  [/\bat a price that undercuts the big brands\b/gi, ""],
  [/\bUpgraded Series line with more padding and adjustment than Series 1\b/gi, "Series 2 adds padding and adjustment options beyond Series 1"],
  [/\bat competitive pricing\b/gi, "in a direct-to-consumer package"],
  [/\bHighly configurable at a lower price than Aeron\b/gi, "Available with multiple configuration options"],
  [/\baffordable Steelcase entry with solid build quality and\b/gi, "Steelcase task chair with"],
  [/\bbuilt for full workdays in a sleek package\b/gi, "in a design-focused package"],
  [/\bPopular ergonomic chair\b/gi, "Ergonomic chair"],
  [/\bStrong domestic reviews\.?/gi, ""],
  [/\bhitting the comfort-per-dollar sweet spot\b/gi, "with a broad feature set"],
  [/\bA fully loaded mid-range\b/gi, "A mid-range"],
  [/\bsmooth rollerblade wheels\b/gi, "rollerblade-style wheels"],
  [/\ba multi-year warranty for the price\b/gi, "seller-specific warranty terms"],
  [/\bThe original active-sitting stool from Germany:\s*/gi, "A spring-mounted active-sitting stool that uses"],
  [/\bto keep your core engaged while you work\b/gi, "to permit movement while seated"],
  [/\bOriginal kneeling chair promoting open hip angle and active sitting since the 1970s\b/gi, "Kneeling chair designed around an open hip angle and seated movement"],
  [/\bWinner of the Best of NeoCon Gold award for task chairs\.?/gi, ""],
]

const leadOverrides = {
  "herman-miller-aeron": "Pellicle mesh task chair with PostureFit SL support and zoned suspension designed to maintain airflow during desk work.",
  "steelcase-leap-v2": "Task chair with LiveBack, adjustable lumbar support, seat-depth adjustment and Natural Glide recline for changing desk postures.",
  "steelcase-gesture": "Task chair with highly adjustable arms and a back-and-seat interface designed for movement across keyboard, tablet and phone use.",
  "autonomous-ergochair-pro": "Direct-to-consumer ergonomic chair with adjustable lumbar support, a headrest, mesh back and multiple seat and arm adjustments.",
  "humanscale-freedom": "Task chair with a weight-sensitive recline and armrests that move with the back, designed around fewer manual controls.",
  "sihoo-m18": "Budget-oriented mesh office chair with an adjustable headrest and lumbar support; verify capacity and adjustment details on the exact listing.",
  "flexispot-c7": "Mid-range ergonomic chair with dynamic lumbar support, adjustable armrests and recline-and-tilt controls that vary by configuration.",
  "sidiz-t50": "Ergonomic task chair offered in configurations with a headrest, adjustable lumbar support and multiple seat controls.",
  "knoll-generation": "Task chair designed by Formway with a flexible back and seat edge intended to support movement across different seated postures.",
  "aeris-swopper": "Spring-mounted active-sitting stool with a seat designed to move in multiple directions while the user remains seated.",
}

function cleanSentence(value) {
  let result = (value || "").trim()
  for (const [pattern, replacement] of hypePatterns) result = result.replace(pattern, replacement)
  result = result.replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1")
  if (result && !/[.!?]$/.test(result)) result += "."
  return result.charAt(0).toUpperCase() + result.slice(1)
}

function standardDescription(row) {
  const stored = row.description_en || row.description_ko || ""
  const originalLead = stored.split(/This page brings together|Use the specifications/)[0].trim()
  const lead = leadOverrides[row.slug] || cleanSentence(originalLead)
  const decision = `This page brings together available specifications, published review summaries and linked comparisons for ${row.name}.`
  const check = "Confirm the exact model, seller, condition, warranty and return terms before buying."
  return `${lead} ${decision} ${check}`.trim()
}

async function main() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data, error } = await client
    .from("products")
    .select("id,slug,name,description_en,description_ko,updated_at")
    .in("slug", slugs)
  if (error) throw error

  const bySlug = new Map(data.map((row) => [row.slug, row]))
  const changes = slugs.map((slug) => {
    const row = bySlug.get(slug)
    if (!row) throw new Error(`Missing priority product: ${slug}`)
    return { row, next: standardDescription(row) }
  }).filter(({ row, next }) => next !== row.description_en)

  console.log(JSON.stringify({
    mode: apply ? "apply" : "audit",
    priorityCount: slugs.length,
    changes: changes.length,
    preview: changes.map(({ row, next }) => ({ slug: row.slug, before: row.description_en || row.description_ko, after: next })),
  }, null, 2))
  if (!apply || changes.length === 0) return

  const backupDir = path.resolve(__dirname, "backups")
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `priority-product-descriptions-${Date.now()}.json`)
  fs.writeFileSync(backupFile, JSON.stringify(changes.map(({ row }) => row), null, 2), { flag: "wx" })

  for (const { row, next } of changes) {
    const { error: updateError } = await client
      .from("products")
      .update({ description_en: next, updated_at: new Date().toISOString() })
      .eq("id", row.id)
    if (updateError) throw new Error(`${row.slug}: ${updateError.message}`)
  }
  console.log(JSON.stringify({ updated: changes.length, backupFile }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

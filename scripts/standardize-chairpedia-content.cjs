const fs = require("node:fs")
const path = require("node:path")
const { load } = require("cheerio")
const { createClient } = require("@supabase/supabase-js")

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local"), quiet: true })

const apply = process.argv.includes("--apply")
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function normalizeHeading(text) {
  if (/sitting experience/i.test(text)) return "Comfort signals from published sources"
  if (/what it.*feels like/i.test(text)) return "Comfort signals from published sources"
  if (/comfort experience/i.test(text)) return "Comfort signals from published sources"
  return null
}

function standardizeHtml(html) {
  const $ = load(html || "", null, false)
  const changedHeadings = []

  $("h2,h3").each((_, element) => {
    const current = $(element).text().trim()
    const replacement = normalizeHeading(current)
    if (!replacement) return
    $(element).text(replacement)
    changedHeadings.push({ from: current, to: replacement })
  })

  if (changedHeadings.length && !$("[data-furniblog-research-note]").length) {
    const note = [
      '<p data-furniblog-research-note="true"><strong>Research note:</strong> ',
      "The comfort observations below summarize manufacturer documentation and published sources. ",
      "They are not presented as a hands-on Furniblog test unless explicitly identified as such.</p>",
    ].join("")
    const firstHeading = $("h2,h3").first()
    if (firstHeading.length) firstHeading.before(note)
    else $.root().prepend(note)
  }

  return { html: $.html(), changedHeadings }
}

async function main() {
  const { data, error } = await supabase
    .from("chairpedia")
    .select("id,slug,title,content_html,gen_sources,updated_at")
    .eq("status", "published")
    .order("slug")
  if (error) throw error

  const candidates = data
    .map((row) => ({ row, result: standardizeHtml(row.content_html) }))
    .filter(({ result }) => result.changedHeadings.length > 0)

  const sourceMissing = data.filter((row) => !(row.gen_sources || []).length)
  console.log(JSON.stringify({
    mode: apply ? "apply" : "audit",
    published: data.length,
    headingCandidates: candidates.length,
    sourceMissing: sourceMissing.length,
    candidates: candidates.map(({ row, result }) => ({ slug: row.slug, headings: result.changedHeadings })),
    sourceMissingSlugs: sourceMissing.map((row) => row.slug),
  }, null, 2))

  if (!apply || candidates.length === 0) return

  const backupDir = path.resolve(__dirname, "backups")
  fs.mkdirSync(backupDir, { recursive: true })
  const backupFile = path.join(backupDir, `chairpedia-standardize-${Date.now()}.json`)
  fs.writeFileSync(backupFile, JSON.stringify(candidates.map(({ row }) => row), null, 2), { flag: "wx" })

  for (const { row, result } of candidates) {
    const { error: updateError } = await supabase
      .from("chairpedia")
      .update({ content_html: result.html, updated_at: new Date().toISOString() })
      .eq("id", row.id)
    if (updateError) throw new Error(`${row.slug}: ${updateError.message}`)
  }
  console.log(JSON.stringify({ updated: candidates.length, backupFile }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

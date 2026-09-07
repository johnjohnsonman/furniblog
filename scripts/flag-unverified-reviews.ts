import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"
import { mkdirSync, writeFileSync, readFileSync } from "fs"

// P1-3 review exclusion tool. Reversible: sets reviews.excluded=true; never
// deletes. Requires migration 043 (excluded / exclude_reason / excluded_at).
//
// Usage:
//   (default)                 dry-run: report the candidate pattern count only.
//   --apply --ids=ID1,ID2     exclude a SMALL, human-confirmed set of ids. Writes
//                             a backup (prior values + run id) before changing.
//   --reason="..."            reason recorded on excluded rows.
//   --restore=<backup.json>   revert ONLY the rows changed by that run.
//
// NOTE: this does NOT bulk-exclude the 292 pattern candidates. "overall=3 +
// empty pros/cons" is a REVIEW CANDIDATE pattern, not a confirmed mis-link.
// Confirm mis-links from the source first, then pass their ids to --apply.

const args = process.argv.slice(2)
const has = (f: string) => args.includes(f)
const val = (f: string) => { const a = args.find((x) => x.startsWith(f + "=")); return a ? a.slice(f.length + 1) : null }

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function ensureColumn() {
  const { error } = await db.from("reviews").select("id,excluded").limit(1)
  if (error) { console.error("Run migration 043 first —", error.message); process.exit(1) }
}

async function restore(file: string) {
  await ensureColumn()
  const backup = JSON.parse(readFileSync(file, "utf8")) as { runId: string; rows: { id: string; excluded: boolean; exclude_reason: string | null; excluded_at: string | null }[] }
  for (const r of backup.rows) {
    const { error } = await db.from("reviews").update({ excluded: r.excluded, exclude_reason: r.exclude_reason, excluded_at: r.excluded_at }).eq("id", r.id)
    if (error) { console.error("restore error", r.id, error.message); process.exit(1) }
  }
  console.log(`Restored ${backup.rows.length} rows to their pre-run values (run ${backup.runId}).`)
}

async function dryRunReport() {
  // Count the candidate pattern (overall=3 + pros & cons empty), site-wide.
  let overall3 = 0, candidate = 0, from = 0
  for (;;) {
    const { data, error } = await db.from("reviews").select("id,pros,cons").filter("scores->>overall", "eq", "3").range(from, from + 999)
    if (error) { console.error(error.message); process.exit(1) }
    const rows = data ?? []
    for (const r of rows) {
      overall3++
      const pe = !r.pros || (r.pros as unknown[]).length === 0
      const ce = !r.cons || (r.cons as unknown[]).length === 0
      if (pe && ce) candidate++
    }
    if (rows.length < 1000) break
    from += 1000
  }
  console.log(`SITE-WIDE candidate pattern (overall=3 + empty pros/cons): ${candidate} of ${overall3} overall=3 rows.`)
  console.log("These are CANDIDATES, not confirmed. Confirm from source, then: --apply --ids=ID1,ID2 --reason=\"...\"")
}

async function apply(ids: string[], reason: string) {
  await ensureColumn()
  if (ids.length === 0) { console.error("No --ids provided."); process.exit(1) }
  const runId = new Date().toISOString().replace(/[:.]/g, "-")
  // Preserve prior values for exactly these ids.
  const { data: prior, error: pErr } = await db.from("reviews").select("id,excluded,exclude_reason,excluded_at").in("id", ids)
  if (pErr) { console.error(pErr.message); process.exit(1) }
  mkdirSync("scripts/backups", { recursive: true })
  const file = `scripts/backups/exclude-${runId}.json`
  writeFileSync(file, JSON.stringify({ runId, reason, ids, rows: prior ?? [] }, null, 2))
  console.log(`Backup written: ${file} (${(prior ?? []).length} rows).`)
  const { data: updated, error } = await db
    .from("reviews")
    .update({ excluded: true, exclude_reason: reason, excluded_at: new Date().toISOString() })
    .in("id", ids)
    .select("id")
  if (error) { console.error(error.message); process.exit(1) }
  console.log(`Excluded ${updated?.length ?? 0} / ${ids.length} requested (run ${runId}).`)
  console.log(`Restore this run: -- --restore=${file}`)
}

async function main() {
  const restoreFile = val("--restore")
  if (restoreFile) return restore(restoreFile)
  if (has("--apply")) {
    const ids = (val("--ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    const reason = val("--reason") ?? "confirmed mis-link (source-verified)"
    return apply(ids, reason)
  }
  return dryRunReport()
}
main().catch((e) => { console.error(e); process.exit(1) })

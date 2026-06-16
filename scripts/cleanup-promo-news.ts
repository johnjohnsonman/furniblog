/**
 * Remove existing promotional / deal / shopping news rows.
 *
 * Going forward, the relevance filter (lib/news/relevance.ts) rejects
 * promotional articles at collection time. This script cleans up the ones that
 * were stored before that filter existed.
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   npm run clean:promo-news            # DRY RUN — lists what would be deleted
 *   npm run clean:promo-news -- --apply # actually delete the matched rows
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

config({ path: resolve(__dirname, "../.env.local") })

/** Case-insensitive promo signals matched against title + summary. */
const PROMO_PATTERNS: RegExp[] = [
  /\bdeals?\b/i,
  /\bdiscount(s|ed)?\b/i,
  /\bcoupons?\b/i,
  /\bpromo(tion|tional|s)?\b/i,
  /\bclearance\b/i,
  /\bbargains?\b/i,
  /\bvouchers?\b/i,
  /\bon sale\b/i,
  /\bbest (deals|prices|discounts)\b/i,
  /\bprice drop(s|ped)?\b/i,
  /\blowest price\b/i,
  /\bcheapest\b/i,
  /\d{1,3}%\s*off/i,
  /\bsave (\$|up to|\d)/i,
  /\bblack friday\b/i,
  /\bcyber monday\b/i,
  /\bprime day\b/i,
  /\b(memorial|labor|presidents?)[\s’']*day (sale|deals?)\b/i,
]

function isPromotional(title: string, summary: string): RegExp | null {
  const haystack = `${title} ${summary}`
  for (const pattern of PROMO_PATTERNS) {
    if (pattern.test(haystack)) return pattern
  }
  return null
}

async function main() {
  const apply = process.argv.includes("--apply")
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from("news")
    .select("id, title, summary, source_name, url")
    .limit(10000)

  if (error) {
    console.error("news fetch error:", error.message)
    process.exit(1)
  }

  const rows = data ?? []
  const matched = rows
    .map((row) => {
      const hit = isPromotional(row.title ?? "", row.summary ?? "")
      return hit ? { row, pattern: hit.source } : null
    })
    .filter((x): x is { row: (typeof rows)[number]; pattern: string } => x !== null)

  console.log(`Scanned ${rows.length} news rows.`)
  console.log(`Matched ${matched.length} promotional rows.\n`)

  for (const { row, pattern } of matched) {
    console.log(`  [${pattern}]  ${row.title}`)
    console.log(`            ${row.source_name ?? "?"} — ${row.url}`)
  }

  if (matched.length === 0) {
    console.log("\nNothing to clean up.")
    return
  }

  if (!apply) {
    console.log(
      `\nDRY RUN — no rows deleted. Re-run with "--apply" to delete these ${matched.length} rows.`
    )
    return
  }

  const ids = matched.map(({ row }) => row.id)
  // Delete in chunks to stay within request limits.
  let deleted = 0
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100)
    const { error: delError } = await supabase.from("news").delete().in("id", chunk)
    if (delError) {
      console.error("delete error:", delError.message)
      process.exit(1)
    }
    deleted += chunk.length
  }

  console.log(`\nDeleted ${deleted} promotional news rows.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

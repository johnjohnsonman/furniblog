import { config } from "dotenv"
config({ path: ".env.local" })
import { createClient } from "@supabase/supabase-js"

// P1-3: mark the UNVERIFIED CANDIDATE set — rows matching the error-path pattern
// (overall=3 with empty pros AND cons). This is a CANDIDATE pattern, NOT a
// confirmed mis-link: a normal review can also be 3/empty. Confirmed mis-links
// are established separately by re-running the relevance gate (a re-verify pass);
// only those should carry a "confirmed" reason. Reversible: sets excluded=true;
// nothing is deleted. Run with `-- --apply` to write.
//
// ORDER: apply the public/aggregation filters FIRST (so hidden == not shown AND
// not counted), verify on a small set, THEN expand. Requires migration 043.

const APPLY = process.argv.includes("--apply")
const REASON = "unverified-candidate: overall=3 + empty pros/cons (pattern only — NOT confirmed mislink)"

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify the migration ran.
  const probe = await supabase.from("reviews").select("id,excluded").limit(1)
  if (probe.error) {
    console.error("Cannot read reviews.excluded — run migration 043 first:", probe.error.message)
    process.exit(1)
  }

  // Pull all overall=3 rows (paged past the 1000-row cap) and keep the ones
  // with BOTH pros and cons empty — the exact error-path signature.
  const targets: string[] = []
  let from = 0
  const PAGE = 1000
  for (;;) {
    const { data, error } = await supabase
      .from("reviews")
      .select("id,pros,cons,excluded")
      .filter("scores->>overall", "eq", "3")
      .range(from, from + PAGE - 1)
    if (error) { console.error(error.message); process.exit(1) }
    const rows = data ?? []
    for (const r of rows) {
      const prosEmpty = !r.pros || (r.pros as unknown[]).length === 0
      const consEmpty = !r.cons || (r.cons as unknown[]).length === 0
      if (prosEmpty && consEmpty && !r.excluded) targets.push(r.id as string)
    }
    if (rows.length < PAGE) break
    from += PAGE
  }

  console.log(`Matched ${targets.length} error-path reviews (overall=3, pros+cons empty, not yet excluded).`)
  if (!APPLY) {
    console.log("DRY RUN — re-run with `-- --apply` to set excluded=true (reversible).")
    return
  }

  let done = 0
  for (let i = 0; i < targets.length; i += 200) {
    const batch = targets.slice(i, i + 200)
    const { error } = await supabase
      .from("reviews")
      .update({ excluded: true, exclude_reason: REASON, excluded_at: new Date().toISOString() })
      .in("id", batch)
    if (error) { console.error(error.message); process.exit(1) }
    done += batch.length
    console.log(`  excluded ${done}/${targets.length}`)
  }
  console.log("Done. To restore: set excluded=false where exclude_reason =", JSON.stringify(REASON))
}

main().catch((e) => { console.error(e); process.exit(1) })

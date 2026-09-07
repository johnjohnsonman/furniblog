import type { PostgrestError } from "@supabase/supabase-js"

// P1-3: public review reads must hide rows flagged reviews.excluded = true.
// These helpers make that safe even before migration 043 is applied (the column
// may not exist yet) — the query is retried without the filter on a
// missing-column error. Admin reads deliberately do NOT use this (they see all).

export function isMissingExcludedColumn(err: PostgrestError | null | undefined): boolean {
  if (!err) return false
  const m = `${err.message ?? ""} ${err.details ?? ""} ${err.hint ?? ""}`
  return /excluded/i.test(m) && /(does not exist|could not find|schema cache)/i.test(m)
}

/**
 * Run a review query with the public `excluded = false` filter, transparently
 * falling back if the column doesn't exist yet. `run(applyFilter)` builds and
 * awaits the query, adding `.eq("excluded", false)` when applyFilter is true.
 */
export async function runPublicReviewQuery<R extends { error: PostgrestError | null }>(
  run: (applyFilter: boolean) => PromiseLike<R>
): Promise<R> {
  const withFilter = await run(true)
  if (withFilter.error && isMissingExcludedColumn(withFilter.error)) {
    return run(false)
  }
  return withFilter
}

/** JS-side guard for rows fetched with `select("*")` (safe both pre/post-043). */
export function notExcluded<T extends { excluded?: boolean | null }>(row: T): boolean {
  return !row.excluded
}

// Cached one-time check for whether migration 043 (reviews.excluded) is applied,
// for incremental query builders where strip-and-retry is awkward. Probes once
// per process; safe before 043 (returns false → no filter added).
let excludedColumnProbe: Promise<boolean> | null = null
export function reviewsSupportExclusion(
  supabase: { from: (t: string) => { select: (c: string) => { limit: (n: number) => PromiseLike<{ error: PostgrestError | null }> } } }
): Promise<boolean> {
  if (!excludedColumnProbe) {
    excludedColumnProbe = Promise.resolve(
      supabase.from("reviews").select("excluded").limit(1)
    )
      .then((r) => !r.error)
      .catch(() => false)
  }
  return excludedColumnProbe
}

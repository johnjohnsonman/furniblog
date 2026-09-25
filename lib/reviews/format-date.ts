/**
 * Visitor-facing review date: month and year only (e.g. "Sep 2026").
 * The zone is pinned to UTC so server and browser render the same text
 * (these dates are server-rendered, so a mismatch breaks hydration).
 */
export function formatReviewMonth(value: string | null | undefined): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" })
}

const SITE_NAME_ONLY = new Set([
  "\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc",
  "\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc \uac24\ub7ec\ub9ac",
  "dcinside",
  "dc inside",
])

// Automatic publication needs explicit evidence, not fallback title/rating values.
export function collectedAnalysisFailure(value: unknown, title: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Invalid analysis"
  const result = value as Record<string, unknown>
  if (typeof result.confidence !== "number" || !Number.isFinite(result.confidence) ||
      result.confidence < 0.4 || result.confidence > 1) return "Insufficient product relevance"
  if (typeof result.summary !== "string" || !result.summary.trim()) return "Missing analysis summary"
  const normalize = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase()
  if (normalize(result.summary) === normalize(title)) return "Source title is not a review summary"
  if (typeof result.overall !== "number" || !Number.isFinite(result.overall) ||
      result.overall < 1 || result.overall > 5) return "Missing or invalid rating"
  for (const field of ["pros", "cons"]) {
    if (!Array.isArray(result[field]) ||
        !(result[field] as unknown[]).every(point => typeof point === "string" && point.trim().length > 0)) {
      return "Invalid review points"
    }
  }
  return null
}

// For collected external reviews only; not a minimum length or language rule.
export function collectionFailureReason(
  summary: string | null | undefined,
  sourceUrl: string | null | undefined
): string | null {
  const normalized = (summary ?? "").trim().replace(/\s+/g, " ").toLowerCase()
  if (!normalized) return "Collected review has no summary"
  if (SITE_NAME_ONLY.has(normalized)) return "Collected site name instead of review text"

  try {
    const url = new URL(sourceUrl ?? "")
    if (!["http:", "https:"].includes(url.protocol)) return "Invalid review source URL"
    const host = url.hostname.toLowerCase()
    if ((host === "dcinside.com" || host.endsWith(".dcinside.com")) && url.pathname === "/") {
      return "DC Inside homepage is not an individual review source"
    }
  } catch {
    return "Collected review has no valid source URL"
  }
  return null
}

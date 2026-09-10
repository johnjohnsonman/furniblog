const SITE_NAME_ONLY = new Set([
  "\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc",
  "\ub514\uc2dc\uc778\uc0ac\uc774\ub4dc \uac24\ub7ec\ub9ac",
  "dcinside",
  "dc inside",
])

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

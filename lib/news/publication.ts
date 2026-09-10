/** Structural safeguards only; an editor must still verify the original source. */
export function newsPublicationError(input: {
  reviewed?: unknown
  url?: unknown
  title?: unknown
  summary?: unknown
  whyItMatters?: unknown
}): string | null {
  if (input.reviewed !== true) return "Confirm that you checked the original source and edited the summary and context."
  try {
    const url = new URL(typeof input.url === "string" ? input.url : "")
    if (!["http:", "https:"].includes(url.protocol)) throw new Error()
  } catch {
    return "A valid source URL is required."
  }
  for (const [label, value] of [["Title", input.title], ["Summary", input.summary], ["Why it matters", input.whyItMatters]]) {
    if (typeof value !== "string" || !value.trim()) return `${label} is required.`
  }
  if ((input.summary as string).trim() === (input.whyItMatters as string).trim()) {
    return "Why it matters must add context beyond the summary."
  }
  return null
}

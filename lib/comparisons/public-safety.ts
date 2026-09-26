const UNSOURCED_CLAIM_PATTERNS = [
  /\$\s?\d/,
  /\b\d+(?:\.\d+)?\s?(?:inches|inch|in\.?|lb|lbs|kg|cm)\b/i,
  /\b\d+[- ]year warranty\b/i,
  /\b(?:clear winner|wins? (?:overall|what)|best choice|should buy)\b/i,
]

const HEALTH_TERMS = /\b(?:back pain|pain relief|clinically|medical)\b/i
/** A sentence that denies or limits a health effect ("does not demonstrate pain relief"). */
const HEALTH_DISCLAIMER = /\b(?:does not|do not|doesn't|don't|did not|didn't|is not|isn't|are not|aren't|has not|have not|hasn't|haven't|cannot|can't|not an?|no evidence|makes no|without claiming|not intended|not designed)\b/i

/**
 * Official figures quoted verbatim (source checked); removed before the checks
 * so a sourced number does not hide the page.
 */
const SOURCED_FIGURES = [
  // store.steelcase.com Karman specifications list "29 lbs" (checked 2026-09-26).
  // The same sentence corrects an earlier wrong figure ("rather than 5 kg").
  "Steelcase publishes a Karman weight of 29 lb (approximately 13.2 kg), rather than 5 kg",
]

function hasHealthClaim(text: string): boolean {
  return text.split(/(?<=[.!?])\s+/).some((sentence) => HEALTH_TERMS.test(sentence) && !HEALTH_DISCLAIMER.test(sentence))
}

export function comparisonNeedsSourceReview(...values: Array<string | null | undefined>): boolean {
  let text = values.filter(Boolean).join(" ")
  for (const figure of SOURCED_FIGURES) text = text.split(figure).join(" ")
  return UNSOURCED_CLAIM_PATTERNS.some((pattern) => pattern.test(text)) || hasHealthClaim(text.replace(/<[^>]+>/g, " "))
}

export function neutralComparisonSummary(a?: string | null, b?: string | null): string {
  const names = [a, b].filter(Boolean)
  return names.length === 2
    ? `Compare ${names[0]} and ${names[1]}. Confirm each model, configuration and source before deciding.`
    : "Compare the linked chair models and verify their exact configurations before deciding."
}

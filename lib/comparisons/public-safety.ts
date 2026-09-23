const UNSOURCED_CLAIM_PATTERNS = [
  /\$\s?\d/,
  /\b\d+(?:\.\d+)?\s?(?:inches|inch|in\.?|lb|lbs|kg|cm)\b/i,
  /\b\d+[- ]year warranty\b/i,
  /\b(?:back pain|pain relief|clinically|medical)\b/i,
  /\b(?:clear winner|wins? (?:overall|what)|best choice|should buy)\b/i,
]

export function comparisonNeedsSourceReview(...values: Array<string | null | undefined>): boolean {
  const text = values.filter(Boolean).join(" ")
  return UNSOURCED_CLAIM_PATTERNS.some((pattern) => pattern.test(text))
}

export function neutralComparisonSummary(a?: string | null, b?: string | null): string {
  const names = [a, b].filter(Boolean)
  return names.length === 2
    ? `Compare ${names[0]} and ${names[1]}. Confirm each model, configuration and source before deciding.`
    : "Compare the linked chair models and verify their exact configurations before deciding."
}

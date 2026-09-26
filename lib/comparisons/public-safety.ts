const UNSOURCED_CLAIM_PATTERNS = [
  /\$\s?\d/,
  /\b\d+(?:\.\d+)?\s?(?:inches|inch|in\.?|lb|lbs|kg|cm)\b/i,
  /\b\d+[- ]year warranty\b/i,
]

const VERDICT_TERMS = /\b(?:clear winner|wins? (?:overall|what)|best choice|should buy)\b/i
/** Section headings such as "Who should buy which" name a section; they are not a verdict. */
const WHO_SHOULD_BUY_HEADING = /<h[2-4][^>]*>\s*who should buy (?:which|each|the [^<]{1,80})[^<]*<\/h[2-4]>/gi

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

function prepare(values: Array<string | null | undefined>): string {
  let text = values.filter(Boolean).join(" ").replace(WHO_SHOULD_BUY_HEADING, " ")
  for (const figure of SOURCED_FIGURES) text = text.split(figure).join(" ")
  return text
}

function hasVerdictOrHealthClaim(text: string): boolean {
  return VERDICT_TERMS.test(text) || hasHealthClaim(text.replace(/<[^>]+>/g, " "))
}

export function comparisonNeedsSourceReview(...values: Array<string | null | undefined>): boolean {
  const text = prepare(values)
  return UNSOURCED_CLAIM_PATTERNS.some((pattern) => pattern.test(text)) || hasVerdictOrHealthClaim(text)
}

const NUMBER = /\d+(?:\.\d+)?/g
const UNIT_FIGURE = /(\d+(?:\.\d+)?(?:\s?(?:[–-]|to)\s?\d+(?:\.\d+)?)?)\s?(?:inches|inch|in\b\.?|lb\b|lbs\b|kg\b|cm\b|mm\b|°|degrees?\b)/gi
const PRICE_FIGURE = /\$\s?(\d[\d,]*(?:\.\d+)?)/g
/** Year counts tied to a warranty; ownership spans ("5-6 years of use") are not spec claims. */
const YEAR_FIGURE = /\b(\d+)[- ]years?\b(?=[^.]{0,30}warrant)|warrant[^.]{0,30}?\b(\d+)[- ]years?\b/gi
const RATING_FIGURE = /\b\d(?:\.\d)?\s?\/\s?5\b|\(\d+ reviews?\)/i

/**
 * Comparison between two chairs in the official spec ledger: public when every
 * measurement, price and year figure matches the ledger or the price source
 * (`allowed` holds those numbers as strings) and no verdict or health claim
 * remains. Ratings and review counts are never allowed.
 */
export function ledgerComparisonNeedsSourceReview(allowed: Set<string>, ...values: Array<string | null | undefined>): boolean {
  const text = prepare(values).replace(/<[^>]+>/g, " ")
  if (hasVerdictOrHealthClaim(text) || RATING_FIGURE.test(text)) return true
  const ok = (figure: string) => (figure.replace(/,/g, "").match(NUMBER) ?? []).every((n) => allowed.has(n))
  for (const m of text.matchAll(UNIT_FIGURE)) if (!ok(m[1])) return true
  for (const m of text.matchAll(PRICE_FIGURE)) if (!ok(m[1])) return true
  for (const m of text.matchAll(YEAR_FIGURE)) if (!allowed.has(`${m[1] ?? m[2]}-year`)) return true
  return false
}

export function neutralComparisonSummary(a?: string | null, b?: string | null): string {
  const names = [a, b].filter(Boolean)
  return names.length === 2
    ? `Compare ${names[0]} and ${names[1]}. Confirm each model, configuration and source before deciding.`
    : "Compare the linked chair models and verify their exact configurations before deciding."
}

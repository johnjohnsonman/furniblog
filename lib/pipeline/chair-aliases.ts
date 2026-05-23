/** Common aliases → product slug hints for Claude classification. */
export const CHAIR_ALIAS_HINTS: string[] = [
  "Aeron / Herman Miller Aeron / HM Aeron → herman-miller-aeron",
  "Embody / HM Embody → herman-miller-embody",
  "Cosm / HM Cosm → herman-miller-cosm",
  "Sayl / HM Sayl → herman-miller-sayl",
  "Leap / Steelcase Leap / Leap V2 → steelcase-leap",
  "Gesture / Steelcase Gesture → steelcase-gesture",
  "Think / Steelcase Think → steelcase-think",
  "Contessa / Okamura Contessa → okamura-contessa",
  "Sylphy / Okamura Sylphy → okamura-sylphy",
  "Freedom / Humanscale Freedom → humanscale-freedom",
  "Capisco / HÅG Capisco → hag-capisco",
  "Fern / Haworth Fern → haworth-fern",
  "T50 / Sidiz T50 → sidiz-t50",
  "T80 / Sidiz T80 → sidiz-t80",
]

export function formatAliasHintsForPrompt(): string {
  return CHAIR_ALIAS_HINTS.map((line) => `- ${line}`).join("\n")
}

/**
 * Remove a leading brand name from a product name when present, so a card can
 * show the brand and the model separately without duplication
 * (e.g. brand "Aeris" + name "Aeris 3Dee" → model "3Dee").
 *
 * Falls back to the full name when the name does not start with the brand, or
 * when stripping would leave nothing — keeping it safe for inconsistent names
 * like "Generation by Knoll" or "Anthros Chair".
 */
export function stripBrandPrefix(
  name: string | null | undefined,
  brand: string | null | undefined
): string {
  const fullName = (name ?? "").trim()
  const brandName = (brand ?? "").trim()
  if (!brandName) return fullName

  if (fullName.toLowerCase().startsWith(brandName.toLowerCase())) {
    // Drop the brand and any joining separator/whitespace that follows it.
    const rest = fullName.slice(brandName.length).replace(/^[\s\-–—:·|]+/, "").trim()
    if (rest) return rest
  }

  return fullName
}

import { getOfficialSpecs } from "@/lib/products/official-specs"
import { getPriceProvenance } from "@/lib/products/price-provenance"

const numbersIn = (text: string) => (text.replace(/,/g, "").match(/\d+(?:\.\d+)?/g) ?? [])

/**
 * Figures a comparison may state for two ledger chairs: every number in their
 * official spec values (and our metric conversions), their sourced prices, and
 * warranty year counts as "N-year". Null when either chair is not in the ledger.
 */
export function ledgerPairFigures(slugA?: string | null, slugB?: string | null): Set<string> | null {
  const a = getOfficialSpecs(slugA), b = getOfficialSpecs(slugB)
  if (!a || !b || !slugA || !slugB) return null
  const allowed = new Set<string>()
  for (const specs of [a, b]) {
    for (const [field, values] of Object.entries(specs)) {
      if (!Array.isArray(values)) continue
      for (const v of values) {
        for (const n of numbersIn(`${v.value} ${v.computedMetric ?? ""}`)) allowed.add(n)
        if (field === "warranty") for (const m of `${v.value} ${v.quote ?? ""}`.matchAll(/\b(\d+)[- ]years?\b/gi)) allowed.add(`${m[1]}-year`)
      }
    }
  }
  for (const slug of [slugA, slugB]) {
    const p = getPriceProvenance(slug)
    if (!p) continue
    const amounts = [p.regularMinUsd, p.regularMaxUsd, p.saleMinUsd, p.saleMaxUsd, ...(p.variants ?? []).flatMap((v) => [v.regularMinUsd, v.regularMaxUsd])]
    for (const n of amounts) if (n != null) allowed.add(String(n))
  }
  return allowed
}

import type { ProductFitEvidence, ProductFitTrustSummary } from "@/lib/data/product-fit-evidence"

const coreFields = [
  ["seat_height", "Seat height"],
  ["seat_depth", "Seat depth"],
  ["seat_width", "Seat width"],
  ["weight_capacity", "Weight capacity"],
] as const

export function ProductDataConfidence({ evidence, trust }: {
  evidence: ProductFitEvidence[]
  trust: ProductFitTrustSummary
}) {
  const fields = new Set(evidence.map(item => item.fieldKey))
  const verified = coreFields.filter(([key]) => fields.has(key))
  const evidenceDate = evidence.map(item => item.checkedOn).filter(Boolean).sort().at(-1) ?? null
  const lastChecked = [evidenceDate, trust.lastCheckedOn].filter((value): value is string => Boolean(value)).sort().at(-1) ?? null
  const hasConfiguration = trust.verifiedConfigurations > 0
  // Shown only when there is sourced data; no placeholder or "pending" states.
  if (verified.length === 0 && !hasConfiguration) return null
  const status = verified.length > 0 ? "Source-linked measurements" : "Configuration-specific data"

  return <section className="mt-8 border border-[#171717] bg-[#f5f1e8] p-5" aria-labelledby="data-confidence-title">
    <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">Chairpedia data record</p>
    <h2 id="data-confidence-title" className="mt-1 font-serif text-2xl">{status}</h2>
    {verified.length > 0 && <p className="mt-4 text-sm leading-6"><span className="font-semibold">Source-linked:</span> {verified.map(([, label]) => label).join(", ")}.</p>}
    {hasConfiguration && <p className="mt-2 text-sm leading-6"><span className="font-semibold">Documented configurations:</span> {trust.verifiedConfigurations}{trust.markets.length > 0 ? ` (${trust.markets.join(", ")})` : ""}. Measurements vary by size, option or market, so confirm the exact configuration before buying.</p>}
    {lastChecked && <p className="mt-2 text-xs text-muted-foreground">Sources checked {lastChecked}.</p>}
  </section>
}

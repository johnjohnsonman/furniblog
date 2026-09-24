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
  const pending = coreFields.filter(([key]) => !fields.has(key))
  const evidenceDate = evidence.map(item => item.checkedOn).filter(Boolean).sort().at(-1) ?? null
  const lastChecked = [evidenceDate, trust.lastCheckedOn].filter((value): value is string => Boolean(value)).sort().at(-1) ?? null
  const hasConfiguration = trust.verifiedConfigurations > 0
  const status = hasConfiguration ? "Configuration-specific data" : verified.length >= 2 ? "Source-linked measurements" : "Verification in progress"

  return <section className="mt-8 border border-[#171717] bg-[#f5f1e8] p-5" aria-labelledby="data-confidence-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">Chairpedia data record</p>
        <h2 id="data-confidence-title" className="mt-1 font-serif text-2xl">{status}</h2>
      </div>
      <span className="border border-[#171717] bg-white px-3 py-2 text-xs font-semibold">{verified.length}/4 core fields sourced</span>
    </div>
    <div className="mt-5 grid gap-px border border-[#171717] bg-[#171717] sm:grid-cols-3">
      <div className="bg-white p-4"><p className="text-xs text-muted-foreground">Verified measurements</p><p className="mt-1 text-lg font-semibold">{verified.length}</p></div>
      <div className="bg-white p-4"><p className="text-xs text-muted-foreground">Verified configurations</p><p className="mt-1 text-lg font-semibold">{trust.verifiedConfigurations}</p>{trust.markets.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{trust.markets.join(", ")}</p>}</div>
      <div className="bg-white p-4"><p className="text-xs text-muted-foreground">Last source check</p><p className="mt-1 text-sm font-semibold">{lastChecked ?? "Pending"}</p></div>
    </div>
    {verified.length > 0 && <p className="mt-4 text-sm leading-6"><span className="font-semibold">Source-linked:</span> {verified.map(([, label]) => label).join(", ")}.</p>}
    {pending.length > 0 && <p className="mt-2 text-sm leading-6 text-muted-foreground"><span className="font-semibold text-foreground">Still unverified:</span> {pending.map(([, label]) => label).join(", ")}. Chairpedia does not use unverified catalog placeholders as fit evidence.</p>}
    {hasConfiguration && <p className="mt-2 text-sm leading-6 text-muted-foreground">Measurements vary by size, option or market. Open the fit section and confirm the exact configuration before buying.</p>}
  </section>
}

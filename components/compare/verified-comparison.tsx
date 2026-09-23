import Link from "next/link"
import type { PublicComparisonProduct } from "@/lib/comparisons/resolve"
import { getPilotProduct, getPilotSources, type VerifiedComparisonPilot } from "@/lib/comparisons/verified-pilots"
import { getVerifiedFact, type VerifiedProductFact } from "@/lib/comparisons/verified-products"

function FactValue({ fact, pilot }: { fact: VerifiedProductFact | null; pilot: VerifiedComparisonPilot }) {
  const sources = getPilotSources(pilot)
  if (!fact) return <span className="text-muted-foreground">Official information being checked</span>
  return (
    <span>
      {fact.value}
      {fact.status === "conditional" && <span className="ml-2 inline-block border border-[#b98a4b] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#76501f]">By configuration</span>}
      <span className="ml-1 whitespace-nowrap text-xs text-[#315b8a]">
      {fact.sourceIds.map((id) => {
        const index = sources.findIndex((source) => source.id === id)
        return index >= 0 ? <a key={id} href={`#source-${id}`} className="ml-1 underline underline-offset-2">[{index + 1}]</a> : null
      })}
      </span>
    </span>
  )
}

export function VerifiedComparison({
  pilot,
  productA,
  productB,
}: {
  pilot: VerifiedComparisonPilot
  productA: PublicComparisonProduct | null
  productB: PublicComparisonProduct | null
}) {
  const recordA = getPilotProduct(pilot, "a")
  const recordB = getPilotProduct(pilot, "b")
  const sources = getPilotSources(pilot)
  const productLabel = (product: PublicComparisonProduct) => product.name.toLowerCase().startsWith(product.brand.toLowerCase()) ? product.name : `${product.brand} ${product.name}`
  return (
    <div className="space-y-12">
      <section aria-labelledby="comparison-summary">
        <h2 id="comparison-summary" className="font-serif text-2xl font-medium">Summary</h2>
        <div className="mt-4 space-y-3 leading-7 text-muted-foreground">
          {pilot.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </section>

      <section aria-labelledby="at-a-glance">
        <h2 id="at-a-glance" className="font-serif text-2xl font-medium">Differences at a glance</h2>
        <p className="mt-2 text-sm text-muted-foreground">Statements marked “By configuration” depend on the selected model options.</p>
        <div className="mt-5 overflow-x-auto border border-border" tabIndex={0} aria-label="Scrollable chair comparison table">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-[#f5f1e8]">
                <th scope="col" className="sticky left-0 z-20 w-1/4 bg-[#f5f1e8] p-4 font-medium">Comparison item</th>
                <th scope="col" className="sticky top-0 z-10 bg-[#f5f1e8] p-4 font-medium">{recordA.name}</th>
                <th scope="col" className="sticky top-0 z-10 bg-[#f5f1e8] p-4 font-medium">{recordB.name}</th>
              </tr>
            </thead>
            <tbody>
              {pilot.rows.filter((row) => getVerifiedFact(pilot.productA, row.fact) || getVerifiedFact(pilot.productB, row.fact)).map((row) => (
                <tr key={row.label} className="border-b border-border last:border-b-0">
                  <th scope="row" className="sticky left-0 z-10 bg-white p-4 align-top font-medium">{row.label}</th>
                  <td className="p-4 align-top leading-6"><FactValue fact={getVerifiedFact(pilot.productA, row.fact)} pilot={pilot} /></td>
                  <td className="p-4 align-top leading-6"><FactValue fact={getVerifiedFact(pilot.productB, row.fact)} pilot={pilot} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="conditions-heading">
        <h2 id="conditions-heading" className="font-serif text-2xl font-medium">Which conditions should you examine?</h2>
        <div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-2">
          {pilot.conditions.map((condition) => (
            <div key={condition.title} className="bg-white p-5">
              <h3 className="font-medium">{condition.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{condition.body}{condition.sourceIds.map((id) => {
                const index = sources.findIndex((source) => source.id === id)
                return index >= 0 ? <a key={id} href={`#source-${id}`} className="ml-1 text-xs text-[#315b8a] underline underline-offset-2">[{index + 1}]</a> : null
              })}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="checklist-heading">
        <h2 id="checklist-heading" className="font-serif text-2xl font-medium">What to check in person</h2>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          {["Seat pressure and usable depth", "Back support position", "Recline movement and stops", "Arm spacing and desk clearance", "Seat-height range at your desk", "The exact options on the chair being sold"].map((item) => (
            <li key={item} className="border-t border-border py-3">{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="font-serif text-2xl font-medium">Official sources</h2>
        <ol className="mt-5 space-y-4">
          {sources.map((source, index) => (
            <li key={source.id} id={`source-${source.id}`} className="scroll-mt-24 border-t border-border pt-4 text-sm">
              <p className="font-medium">[{index + 1}] {source.product}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{source.type}</p>
              <a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[#315b8a] underline underline-offset-4">{source.title} ↗</a>
              <p className="mt-1 leading-6 text-muted-foreground">{source.publisher} · Checked {source.checkedOn} · {source.supports}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-serif text-2xl font-medium">Related records</h2>
        <div className="mt-4 grid gap-2">
          {[productA, productB].filter((product): product is PublicComparisonProduct => Boolean(product)).map((product) => (
            <Link key={product.slug} href={`/products/${product.slug}`} className="border-t border-border py-3 text-sm hover:underline">{productLabel(product)} product record →</Link>
          ))}
          {pilot.relatedComparisonSlugs.map((slug) => (
            <Link key={slug} href={`/compare/${slug}`} className="border-t border-border py-3 text-sm hover:underline">Related verified comparison →</Link>
          ))}
        </div>
      </section>
    </div>
  )
}

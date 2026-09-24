import Link from "next/link"
import { ExternalLink } from "lucide-react"
import type { PublicComparisonProduct } from "@/lib/comparisons/resolve"
import { getComparisonVisual } from "@/lib/comparisons/product-visuals"
import { getPilotProduct, getPilotSources, getVerifiedComparisonPilot, type VerifiedComparisonPilot } from "@/lib/comparisons/verified-pilots"
import { getVerifiedFact, type VerifiedProductFact, type VerifiedProductRecord } from "@/lib/comparisons/verified-products"

function SourceLinks({ fact, pilot }: { fact: VerifiedProductFact; pilot: VerifiedComparisonPilot }) {
  const sources = getPilotSources(pilot)
  return <span className="ml-1 inline-flex align-middle text-xs text-[#315b8a]">{fact.sourceIds.map((id) => {
    const index = sources.findIndex((source) => source.id === id)
    if (index < 0) return null
    return <a key={id} href={`#source-${id}`} aria-label={`Source ${index + 1}: ${sources[index].title}`} className="inline-flex min-h-11 min-w-11 items-center justify-center underline underline-offset-2 sm:min-h-0 sm:min-w-0 sm:px-1">[{index + 1}]</a>
  })}</span>
}

function FactValue({ fact, pilot }: { fact: VerifiedProductFact | null; pilot: VerifiedComparisonPilot }) {
  if (!fact) return <span className="text-muted-foreground">Not stated in the reviewed official sources</span>
  return <span>{fact.value}{fact.status === "conditional" && <span className="mt-2 block w-fit rounded-full border border-border bg-[#f5f1e8] px-2.5 py-1 text-[11px] leading-4 text-[#5f584d]">Selected configurations</span>}<SourceLinks fact={fact} pilot={pilot} /></span>
}

function ProductImage({ record, product, compact = false }: { record: VerifiedProductRecord; product: PublicComparisonProduct | null; compact?: boolean }) {
  const visual = getComparisonVisual(record.slug)
  if (!product?.image) return null
  return <div className={compact ? "flex size-24 shrink-0 items-end justify-center overflow-hidden bg-[#f5f1e8] p-2" : "flex aspect-[4/3] items-end justify-center overflow-hidden bg-white p-3 sm:p-4"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.image} alt={product.imageAlt || visual?.alt || `${record.name} product view`} className="h-full w-full object-contain" style={{ objectPosition: visual?.objectPosition, transform: `scale(${compact ? Math.min(visual?.scale ?? 1, 1) : visual?.scale ?? 1})`, transformOrigin: "center bottom" }} />
    </div>
}

function ProductVisual({ record, product }: { record: VerifiedProductRecord; product: PublicComparisonProduct | null }) {
  const visual = getComparisonVisual(record.slug)
  return <Link href={`/products/${record.slug}`} className="group border border-border bg-[#f5f1e8] p-3 transition-colors hover:border-[#8c867c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#315b8a] sm:p-4">
    <ProductImage record={record} product={product} />
    {visual?.configurationNote && <p className="mt-2 text-xs leading-5 text-muted-foreground">{visual.configurationNote}</p>}
    <p className="mt-3 font-serif text-base group-hover:underline sm:text-lg">{record.name}</p>
    <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">{record.modelScope}</p>
  </Link>
}

export function VerifiedComparison({ pilot, productA, productB }: { pilot: VerifiedComparisonPilot; productA: PublicComparisonProduct | null; productB: PublicComparisonProduct | null }) {
  const recordA = getPilotProduct(pilot, "a"), recordB = getPilotProduct(pilot, "b")
  const sources = getPilotSources(pilot)
  const products = [productA, productB].filter((product): product is PublicComparisonProduct => Boolean(product))
  const findProduct = (record: VerifiedProductRecord) => products.find((product) => product.slug === record.slug) ?? null
  const rows = pilot.rows.filter((row) => getVerifiedFact(pilot.productA, row.fact) || getVerifiedFact(pilot.productB, row.fact))
  return <div className="space-y-12">
    <section aria-labelledby="comparison-summary" data-testid="comparison-summary">
      <h2 id="comparison-summary" className="font-serif text-2xl font-medium">Key differences</h2>
      <div className="mt-4 space-y-3 leading-7 text-muted-foreground">{pilot.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>

    <section aria-label="Products in this comparison" className="grid grid-cols-2 gap-3" data-testid="comparison-product-pair">
      <ProductVisual record={recordA} product={findProduct(recordA)} /><ProductVisual record={recordB} product={findProduct(recordB)} />
    </section>

    <section aria-labelledby="at-a-glance">
      <h2 id="at-a-glance" className="font-serif text-2xl font-medium">Differences at a glance</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Option-dependent features are marked &quot;Selected configurations.&quot;</p>
      <div className="mt-5 hidden overflow-x-auto border border-border sm:block" tabIndex={0} aria-label="Scrollable chair comparison table" data-testid="desktop-comparison-table">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm"><thead><tr className="border-b border-border bg-[#f5f1e8]"><th scope="col" className="sticky left-0 z-20 w-1/4 bg-[#f5f1e8] p-4 font-medium">Comparison item</th><th scope="col" className="bg-[#f5f1e8] p-4 font-medium">{recordA.name}</th><th scope="col" className="bg-[#f5f1e8] p-4 font-medium">{recordB.name}</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.label} className="border-b border-border last:border-b-0"><th scope="row" className="sticky left-0 z-10 bg-white p-4 align-top font-medium">{row.label}</th><td className="p-4 align-top leading-6"><FactValue fact={getVerifiedFact(pilot.productA, row.fact)} pilot={pilot} /></td><td className="p-4 align-top leading-6"><FactValue fact={getVerifiedFact(pilot.productB, row.fact)} pilot={pilot} /></td></tr>)}</tbody>
        </table>
      </div>
      <div className="mt-5 space-y-3 sm:hidden" data-testid="mobile-comparison-cards">{rows.map((row) => <article key={row.label} className="border border-border" aria-labelledby={`mobile-row-${row.fact}`}><h3 id={`mobile-row-${row.fact}`} className="bg-[#f5f1e8] px-4 py-3 text-sm font-semibold">{row.label}</h3><dl><div className="border-t border-border px-4 py-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{recordA.name}</dt><dd className="mt-2 text-sm leading-6"><FactValue fact={getVerifiedFact(pilot.productA, row.fact)} pilot={pilot} /></dd></div><div className="border-t border-border px-4 py-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{recordB.name}</dt><dd className="mt-2 text-sm leading-6"><FactValue fact={getVerifiedFact(pilot.productB, row.fact)} pilot={pilot} /></dd></div></dl></article>)}</div>
    </section>

    <section aria-labelledby="conditions-heading"><h2 id="conditions-heading" className="font-serif text-2xl font-medium">How to narrow the choice</h2><div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-2">{pilot.conditions.map((condition, conditionIndex) => { const conditionRecord = conditionIndex === 0 ? recordA : recordB; const conditionProduct = conditionIndex === 0 ? findProduct(recordA) : findProduct(recordB); return <article key={condition.title} className="flex gap-4 bg-white p-4 sm:p-5"><ProductImage record={conditionRecord} product={conditionProduct} compact /><div><h3 className="font-medium">{condition.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{condition.body}{condition.sourceIds.map((id) => { const index = sources.findIndex((source) => source.id === id); return index >= 0 ? <a key={id} href={`#source-${id}`} aria-label={`Source ${index + 1}: ${sources[index].title}`} className="ml-1 inline-flex min-h-11 min-w-11 items-center justify-center text-xs text-[#315b8a] underline underline-offset-2 sm:min-h-0 sm:min-w-0 sm:px-1">[{index + 1}]</a> : null })}</p></div></article> })}</div></section>

    <section aria-labelledby="checklist-heading"><h2 id="checklist-heading" className="font-serif text-2xl font-medium">What to check in person</h2><ul className="mt-4 grid gap-x-8 gap-y-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">{pilot.checkItems.map((item, index) => <li key={item} className="flex gap-3 border-t border-border py-4"><span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-foreground" aria-hidden="true">{index + 1}</span><span>{item}</span></li>)}</ul></section>

    <section aria-labelledby="sources-heading"><h2 id="sources-heading" className="font-serif text-2xl font-medium">Official manufacturer sources</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Each source below supports the numbered statements used in this comparison.</p><ol className="mt-5 grid border-l border-t border-border sm:grid-cols-2">{sources.map((source, index) => <li key={source.id} id={`source-${source.id}`} className="scroll-mt-24 border-b border-r border-border bg-white p-4 text-sm sm:p-5"><div className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">{index + 1}</span><div><p className="font-medium">{source.product}</p><p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{source.type}</p></div></div><a href={source.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1 text-[#315b8a] underline underline-offset-4">{source.title}<ExternalLink className="size-3.5" aria-hidden="true" /></a><p className="mt-1 leading-6 text-muted-foreground">{source.publisher} · Checked {source.checkedOn}</p><p className="mt-2 leading-6 text-muted-foreground">{source.supports}</p></li>)}</ol></section>

    <section aria-labelledby="related-heading"><h2 id="related-heading" className="font-serif text-2xl font-medium">Continue your research</h2><div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-2">{[recordA, recordB].map((record) => { const product = findProduct(record); return <Link key={record.slug} href={`/products/${record.slug}`} className="group flex min-h-28 items-center gap-4 bg-white p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b8a]"><ProductImage record={record} product={product} compact /><span><span className="block text-xs uppercase tracking-wide text-muted-foreground">Product details</span><span className="mt-1 block font-serif text-lg group-hover:underline">{record.name}</span><span className="mt-2 inline-flex items-center gap-1 text-sm text-[#315b8a]">View product <span aria-hidden="true">→</span></span></span></Link> })}</div>{pilot.relatedComparisonSlugs.length > 0 && <div className="mt-6"><h3 className="text-sm font-semibold">Related comparisons</h3><ul className="mt-2 divide-y divide-border border-y border-border">{pilot.relatedComparisonSlugs.map((slug) => { const related = getVerifiedComparisonPilot(slug); return <li key={slug}><Link href={`/compare/${slug}`} className="flex min-h-11 items-center justify-between gap-4 py-3 text-sm hover:underline">{related?.title ?? "Related verified comparison"}<span aria-hidden="true">→</span></Link></li> })}</ul></div>}</section>
  </div>
}

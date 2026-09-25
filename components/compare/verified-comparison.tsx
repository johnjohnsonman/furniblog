import Link from "next/link"
import { getComparisonEditorial } from "@/lib/comparisons/editorial"
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
    return <a key={id} href={`#source-${id}`} aria-label={`Source ${index + 1}: ${sources[index].title}`} className="inline-flex min-h-11 min-w-11 items-center justify-center underline underline-offset-2 sm:min-h-6 sm:min-w-6 sm:px-1">[{index + 1}]</a>
  })}</span>
}

function FactValue({ fact, pilot }: { fact: VerifiedProductFact | null; pilot: VerifiedComparisonPilot }) {
  if (!fact) return <span className="text-muted-foreground">Not stated in the reviewed official sources</span>
  return <span>{fact.value}{fact.status === "conditional" && <span className="mt-2 block w-fit rounded-full border border-border bg-[#f5f1e8] px-2.5 py-1 text-[11px] leading-4 text-[#5f584d]">Selected configurations</span>}<SourceLinks fact={fact} pilot={pilot} /></span>
}

function ProductImage({ record, product, compact = false }: { record: VerifiedProductRecord; product: PublicComparisonProduct | null; compact?: boolean }) {
  const visual = getComparisonVisual(record.slug)
  if (!product?.image) return null
  return <div className={compact ? "flex size-24 shrink-0 items-end justify-center overflow-hidden bg-[#f5f1e8] p-2" : "flex aspect-[4/3] max-h-80 items-end justify-center overflow-hidden bg-white p-3 sm:p-4"}>
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
    <p className="mt-1 text-xs leading-5 text-muted-foreground">{record.modelScope}. {record.market}.</p>
  </Link>
}

export function VerifiedComparison({ pilot, productA, productB }: { pilot: VerifiedComparisonPilot; productA: PublicComparisonProduct | null; productB: PublicComparisonProduct | null }) {
  const recordA = getPilotProduct(pilot, "a"), recordB = getPilotProduct(pilot, "b")
  const editorial = getComparisonEditorial(pilot.productA, pilot.productB)
  const sources = getPilotSources(pilot)
  const products = [productA, productB].filter((product): product is PublicComparisonProduct => Boolean(product))
  const findProduct = (record: VerifiedProductRecord) => products.find((product) => product.slug === record.slug) ?? null
  const rows = pilot.rows.filter((row) => getVerifiedFact(pilot.productA, row.fact) || getVerifiedFact(pilot.productB, row.fact))
  return <div className="space-y-8 sm:space-y-10">
    <section aria-labelledby="comparison-summary" data-testid="comparison-summary">
      <h2 id="comparison-summary" className="font-serif text-2xl font-medium">Key differences</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{[recordA, recordB].map((record, index) => <div key={record.slug} className="border-l-2 border-[#315b8a] bg-[#f5f1e8] p-4"><h3 className="font-semibold">{record.name}</h3><p className="mt-2 text-sm leading-6"><FactValue fact={getVerifiedFact(index === 0 ? pilot.productA : pilot.productB, record.slug === "herman-miller-aeron" ? "fit" : "seat")} pilot={pilot} /></p><p className="mt-2 text-sm leading-6"><FactValue fact={getVerifiedFact(index === 0 ? pilot.productA : pilot.productB, record.slug === "steelcase-gesture" ? "arms" : ["herman-miller-cosm-high-back", "humanscale-freedom"].includes(record.slug) ? "recline" : "back")} pilot={pilot} /></p></div>)}</div>
    </section>

    <section aria-label="Products in this comparison" className="grid grid-cols-2 gap-3" data-testid="comparison-product-pair">
      <ProductVisual record={recordA} product={findProduct(recordA)} /><ProductVisual record={recordB} product={findProduct(recordB)} />
    </section>

    <section aria-labelledby="at-a-glance">
      <h2 id="at-a-glance" className="font-serif text-2xl font-medium">Differences at a glance</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Option-dependent features are marked &quot;Selected configurations.&quot;</p>
      <div className="mt-5 hidden overflow-x-auto border border-border sm:block" tabIndex={0} data-testid="desktop-comparison-table">
        <table aria-labelledby="at-a-glance" className="w-full min-w-[640px] border-collapse text-left text-sm"><thead><tr className="border-b border-border bg-[#f5f1e8]"><th scope="col" className="sticky left-0 z-20 w-1/4 bg-[#f5f1e8] p-4 font-medium">Comparison item</th><th scope="col" className="bg-[#f5f1e8] p-4 font-medium">{recordA.name}</th><th scope="col" className="bg-[#f5f1e8] p-4 font-medium">{recordB.name}</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.label} className="border-b border-border last:border-b-0"><th scope="row" className="sticky left-0 z-10 bg-white p-4 align-top font-medium">{row.label}</th><td className="p-4 align-top leading-6"><FactValue fact={getVerifiedFact(pilot.productA, row.fact)} pilot={pilot} /></td><td className="p-4 align-top leading-6"><FactValue fact={getVerifiedFact(pilot.productB, row.fact)} pilot={pilot} /></td></tr>)}</tbody>
        </table>
      </div>
      <div className="mt-5 space-y-3 sm:hidden" data-testid="mobile-comparison-cards">{rows.map((row) => <article key={row.label} className="border border-border" aria-labelledby={`mobile-row-${row.fact}`}><h3 id={`mobile-row-${row.fact}`} className="bg-[#f5f1e8] px-4 py-3 text-sm font-semibold">{row.label}</h3><dl><div className="border-t border-border px-4 py-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{recordA.name}</dt><dd className="mt-2 text-sm leading-6"><FactValue fact={getVerifiedFact(pilot.productA, row.fact)} pilot={pilot} /></dd></div><div className="border-t border-border px-4 py-4"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{recordB.name}</dt><dd className="mt-2 text-sm leading-6"><FactValue fact={getVerifiedFact(pilot.productB, row.fact)} pilot={pilot} /></dd></div></dl></article>)}</div>
    </section>

    <section aria-labelledby="conditions-heading"><h2 id="conditions-heading" className="font-serif text-2xl font-medium">Before you choose</h2>{editorial ? <div className="mt-4 grid gap-8 lg:grid-cols-3">{editorial.questions.map(note => <article key={note.title}><h3 className="font-semibold leading-6">{note.title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{note.body}<SourceLinks fact={{value: note.body, status: "conditional", sourceIds: note.sourceIds}} pilot={pilot} /></p></article>)}</div> : <div className="mt-4 grid gap-5 sm:grid-cols-2">{pilot.conditions.map(c => <article key={c.title}><h3 className="font-semibold">{c.title}</h3><p className="mt-2 leading-7">{c.body}<SourceLinks fact={{value:c.body,status:"conditional",sourceIds:c.sourceIds}} pilot={pilot}/></p></article>)}</div>}</section>

    <section aria-labelledby="checklist-heading"><h2 id="checklist-heading" className="font-serif text-2xl font-medium">Store or seller checklist</h2>{editorial && <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{editorial.request}</p>}<ul className="mt-4 grid gap-x-8 gap-y-2 text-sm leading-6 text-muted-foreground sm:grid-cols-2">{pilot.checkItems.map((item, index) => <li key={item} className="flex gap-3 border-t border-border py-4"><span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium text-foreground" aria-hidden="true">{index + 1}</span><span>{item}</span></li>)}</ul></section>

    <section aria-labelledby="sources-heading"><h2 id="sources-heading" className="font-serif text-2xl font-medium">Official manufacturer sources</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Each source below supports the numbered statements used in this comparison.</p><ol className="mt-4 grid gap-x-6 lg:grid-cols-2">{sources.map((source, index) => <li key={source.id} id={`source-${source.id}`} className="scroll-mt-24 border-t border-border py-4 text-sm"><div className="flex items-start gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground">{index + 1}</span><div><p className="font-medium">{source.product}</p><p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{source.type}</p></div></div><a href={source.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-[#315b8a] underline underline-offset-4">{source.title}<ExternalLink className="size-3.5" aria-hidden="true" /></a><p className="mt-1 leading-6 text-muted-foreground">{source.publisher} · Source record {source.checkedOn}</p><p className="mt-2 leading-6 text-muted-foreground">{source.supports}</p></li>)}</ol></section>

    <section aria-labelledby="related-heading"><h2 id="related-heading" className="font-serif text-2xl font-medium">Next steps</h2><div className="mt-4 grid gap-6 sm:grid-cols-3"><div><h3 className="text-sm font-semibold">Check the product records</h3>{[recordA, recordB].map(record => <Link key={record.slug} href={`/products/${record.slug}`} className="flex min-h-11 items-center text-sm text-[#315b8a] underline underline-offset-4">{record.name}</Link>)}</div><div><h3 className="text-sm font-semibold">Compare another configuration</h3>{pilot.relatedComparisonSlugs.map(slug => <Link key={slug} href={`/compare/${slug}`} className="flex min-h-11 items-center py-2 text-sm text-[#315b8a] underline underline-offset-4">{getVerifiedComparisonPilot(slug)?.title}</Link>)}</div><div><h3 className="text-sm font-semibold">Prepare for a trial</h3><Link href="/stores" className="flex min-h-11 items-center text-sm text-[#315b8a] underline">Find stores; confirm the exact model</Link><Link href="/chair-fit-calculator" className="flex min-h-11 items-center text-sm text-[#315b8a] underline">Review your fit requirements</Link>{[pilot.productA,pilot.productB].includes("aeron") ? <Link href="/blog/herman-miller-aeron-classic-vs-remastered-identification-guide" className="flex min-h-11 items-center text-sm text-[#315b8a] underline">Identify Aeron Classic or Remastered</Link> : <Link href="/chairpedia" className="flex min-h-11 items-center text-sm text-[#315b8a] underline">Chair guides</Link>}</div></div></section>
  </div>
}

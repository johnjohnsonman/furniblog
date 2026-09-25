import Link from "next/link"
import { VERIFIED_PRODUCTS } from "@/lib/comparisons/verified-products"
import { VERIFIED_COMPARISON_PILOT_SLUGS, getVerifiedComparisonPilot } from "@/lib/comparisons/verified-pilots"
import { VERIFIED_COMPARISON_SOURCES } from "@/lib/comparisons/verified-sources"

/** Source-linked comparison pages for this product (verified pilots). */
export function documentedComparisonLinks(slug: string): Array<{ href: string; label: string }> {
  return VERIFIED_COMPARISON_PILOT_SLUGS.map(getVerifiedComparisonPilot)
    .filter(p => p && (VERIFIED_PRODUCTS[p.productA].slug === slug || VERIFIED_PRODUCTS[p.productB].slug === slug))
    .map(p => ({ href: `/compare/${p!.slug}`, label: p!.title }))
}

/** In the Specs section: facts and their official documents only; comparisons live in Compare. */
export function DocumentedProductResearch({ slug, inSpecs = false }: { slug: string; inSpecs?: boolean }) {
  const record = Object.values(VERIFIED_PRODUCTS).find(p => p.slug === slug)
  if (!record && slug !== "kokuyo-ing-cloud") return null
  if (!record) return <section className="mt-8 border border-border p-5" aria-labelledby="documented-research-title">
    <h2 id="documented-research-title" className="font-serif text-2xl">ingCloud: identify the exact configuration</h2>
    <p className="mt-3 leading-7">KOKUYO describes ingCloud with a triple-gliding mechanism and a 3D hammock mesh back. This is the ingCloud product record; do not transfer specifications from another ing model.</p>
    <p className="mt-3 leading-7">The global English product page lists seat height as 425–495 mm for the illustrated configuration. It does not establish every local-market configuration. Overall width and depth on that page are not seat width and usable seat depth.</p>
    <p className="mt-3 leading-7">Before ordering, ask for the model code, local specification sheet, arm and back configuration, usable seat depth and width, and rated weight capacity. Unconfirmed measurements remain unfilled in the structured fit record.</p>
    <a className="mt-3 inline-flex min-h-11 items-center underline" href="https://www.kokuyo.com/en/furniture/seating/task/ing-cloud/">KOKUYO ingCloud: mechanism, dimensions and specification downloads</a>
    <p><Link className="inline-flex min-h-11 items-center underline" href="/chairpedia/kokuyo-ingcloud">Read the existing ingCloud guide</Link></p>
  </section>
  const comparisons = VERIFIED_COMPARISON_PILOT_SLUGS.map(getVerifiedComparisonPilot).filter(p => p && (VERIFIED_PRODUCTS[p.productA].slug === slug || VERIFIED_PRODUCTS[p.productB].slug === slug))
  return <section className="mt-8 border border-border p-5" aria-labelledby="documented-research-title">
    <h2 id="documented-research-title" className="font-serif text-2xl">Documented model and configuration checks</h2>
    <p className="mt-3 leading-7">{record.modelScope}. {record.market}.</p>
    {!inSpecs && slug === "herman-miller-aeron" && <p className="mt-3 leading-7">Identify Classic or Remastered before using current specifications, then select size A, B or C. The size, cylinder, arm, back-support and tilt options must match the chair being offered. A single set of dimensions cannot describe all Aeron configurations.</p>}
    <dl className="mt-4 space-y-4">{Object.entries(record.facts).map(([key, fact]) => fact && <div key={key}><dt className="font-semibold capitalize">{key}</dt><dd className="mt-1 leading-7">{fact.value} <span>{fact.sourceIds.map(id => <a key={id} className="inline-flex min-h-11 items-center px-2 text-sm underline" href={VERIFIED_COMPARISON_SOURCES[id].url}>{VERIFIED_COMPARISON_SOURCES[id].title}</a>)}</span></dd></div>)}</dl>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">These official documents support the configuration checks above. Confirm measurements for the exact configuration you are buying.</p>
    {!inSpecs && <><h3 className="mt-5 font-semibold">Source-linked comparisons</h3>
    <ul>{comparisons.map(p => p && <li key={p.slug}><Link className="inline-flex min-h-11 items-center underline" href={`/compare/${p.slug}`}>{p.title}</Link></li>)}</ul></>}
    {!inSpecs && slug === "herman-miller-aeron" && <p><Link className="inline-flex min-h-11 items-center underline" href="/blog/herman-miller-aeron-classic-vs-remastered-identification-guide">Classic vs Remastered: identify the actual chair</Link></p>}
  </section>
}

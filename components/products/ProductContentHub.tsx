import Link from "next/link"
import Image from "next/image"
import type { ProductContentHub as Hub } from "@/lib/products/content-hubs"

function LinkCards({ items }: { items: Hub["guides"] }) {
  return <div className="grid gap-px border border-[#171717] bg-[#171717] sm:grid-cols-2">
    {items.map((item) => <Link key={item.href + item.label} href={item.href} className="group bg-white p-5 transition-colors hover:bg-[#f5f1e8]">
      {item.intent && <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">{item.intent}</p>}
      <h3 className="mt-1 font-serif text-xl">{item.label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
      <span className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Open →</span>
    </Link>)}
  </div>
}

export function ProductContentHub({ hub, productName }: { hub: Hub; productName: string }) {
  return <div className="mt-10 space-y-14 border-t border-[#171717] pt-10">
    <section aria-labelledby="buying-checks">
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">Decision path</p>
      <h2 id="buying-checks" className="mt-1 font-serif text-3xl">Know before you buy</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{hub.sourceNote}</p>
      <div className="mt-6"><LinkCards items={hub.buyingChecks} /></div>
    </section>

    {hub.versions.length > 0 && <section aria-labelledby="other-versions">
      <h2 id="other-versions" className="font-serif text-3xl">Other versions</h2>
      <div className="mt-5 grid gap-px border border-[#171717] bg-[#171717] sm:grid-cols-2">
        {hub.versions.map((item) => <Link key={item.href} href={item.href} className="group grid bg-white sm:grid-cols-[160px_1fr]">
          {item.image && <div className="bg-[#f5f1e8] p-3"><Image src={item.image} alt={item.imageAlt ?? item.label} width={1080} height={1080} sizes="160px" className="aspect-square h-full w-full object-contain" /></div>}
          <div className="p-5"><h3 className="font-serif text-xl">{item.label}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p><span className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">View version →</span></div>
        </Link>)}
      </div>
    </section>}

    {hub.quickComparison && <section aria-labelledby="variant-comparison">
      <h2 id="variant-comparison" className="font-serif text-3xl">{hub.quickComparison.title}</h2>
      <div className="mt-5 overflow-x-auto border border-[#171717]" tabIndex={0} aria-label={`${productName} version comparison`}>
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead><tr className="bg-[#f5f1e8]"><th className="p-4">Check</th><th className="p-4">{hub.quickComparison.columns[0]}</th><th className="p-4">{hub.quickComparison.columns[1]}</th></tr></thead>
          <tbody>{hub.quickComparison.rows.map(([key, a, b]) => <tr key={key} className="border-t border-[#171717]"><th className="p-4 font-semibold">{key}</th><td className="p-4">{a}</td><td className="p-4">{b}</td></tr>)}</tbody>
        </table>
      </div>
      <Link href={hub.quickComparison.href} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Read the full version guide →</Link>
    </section>}

    {hub.steps && <section aria-labelledby="choose-version">
      <h2 id="choose-version" className="font-serif text-3xl">Choose the right {productName.replace("Herman Miller ", "")}</h2>
      <div className="mt-5"><LinkCards items={hub.steps} /></div>
    </section>}

    {hub.explainers.map((item) => <section key={item.title} className="grid overflow-hidden border border-[#171717] md:grid-cols-2">
      <figure className="bg-[#eaf3ff] p-5"><Image src={item.image} alt={item.alt} width={1080} height={1080} sizes="(max-width: 768px) 100vw, 50vw" className="aspect-square h-full w-full object-contain" /><figcaption className="mt-3 text-xs leading-5 text-muted-foreground">{item.caption}</figcaption></figure>
      <div className="flex flex-col justify-center border-t border-[#171717] p-6 md:border-l md:border-t-0 lg:p-9"><h2 className="font-serif text-3xl">{item.title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{item.body}</p>{item.href && <Link href={item.href} className="mt-5 text-sm font-semibold underline underline-offset-4">{item.cta ?? "Read more"} →</Link>}</div>
    </section>)}

    <section className="grid gap-8 lg:grid-cols-2">
      <div><h2 className="font-serif text-3xl">Guides by task</h2><div className="mt-5"><LinkCards items={hub.guides} /></div></div>
      <div><h2 className="font-serif text-3xl">Direct comparisons</h2><div className="mt-5"><LinkCards items={hub.comparisons} /></div></div>
    </section>

    <section className="border border-[#171717] bg-[#f5f1e8] p-6">
      <h2 className="font-serif text-2xl">Source basis</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Chairpedia uses these official pages for the product and option claims above. Current price, stock and delivered configuration still need checking on the seller's listing.</p>
      <ul className="mt-4 space-y-3">{hub.officialSources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">{source.label} ↗</a><span className="ml-2 text-sm text-muted-foreground">{source.description}</span></li>)}</ul>
    </section>
  </div>
}

import Link from "next/link"
import Image from "next/image"
import type { ProductContentHub as Hub } from "@/lib/products/content-hubs"

export function LinkCards({ items }: { items: Hub["guides"] }) {
  return <div className="grid gap-px border border-[#171717] bg-[#171717] sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
    {items.map((item) => <Link key={item.href + item.label} href={item.href} className="group bg-white p-5 transition-colors hover:bg-[#f5f1e8]">
      {item.intent && <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">{item.intent}</p>}
      <h3 className="mt-1 font-serif text-xl">{item.label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
      <span className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Open →</span>
    </Link>)}
  </div>
}

/** Overview part: sourced key facts and the hub's source note. */
export function HubKeyFacts({ hub }: { hub: Hub }) {
  return <section aria-labelledby="key-facts" className="border border-[#171717] bg-white p-6">
    <h2 id="key-facts" className="font-serif text-2xl">{hub.edition}</h2>
    <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">{hub.heroFacts.map((fact) => <li key={fact} className="border-l-2 border-[#3157e8] pl-3">{fact}</li>)}</ul>
    <p className="mt-4 text-sm leading-6 text-muted-foreground">{hub.sourceNote}</p>
  </section>
}

export function hubHasVersions(hub: Hub) {
  return hub.versions.length > 0 || Boolean(hub.quickComparison) || hub.explainers.length > 0
}

/** Versions part: other versions, the version table and explainers. */
export function HubVersions({ hub, productName }: { hub: Hub; productName: string }) {
  return <div className="space-y-12">
    {hub.versions.length > 0 && <section aria-labelledby="other-versions">
      <h2 id="other-versions" className="font-serif text-3xl">Other versions</h2>
      <div className="mt-5 grid gap-px border border-[#171717] bg-[#171717] sm:grid-cols-2 sm:[&>*:last-child:nth-child(odd)]:col-span-2">
        {hub.versions.map((item) => <Link key={item.href} href={item.href} className={`group grid bg-white ${item.image ? "sm:grid-cols-[160px_1fr]" : ""}`}>
          {item.image && <div className="bg-[#f5f1e8] p-3"><Image src={item.image} alt={item.imageAlt ?? item.label} width={1080} height={1080} sizes="160px" className="aspect-square h-full w-full object-contain" /></div>}
          <div className="p-5"><h3 className="font-serif text-xl">{item.label}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p><span className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">{item.cta ?? "View version"} →</span></div>
        </Link>)}
      </div>
    </section>}

    {hub.quickComparison && <section aria-labelledby="variant-comparison">
      <h2 id="variant-comparison" className="font-serif text-3xl">{hub.quickComparison.title}</h2>
      <div className="mt-5 overflow-x-auto border border-[#171717]" tabIndex={0} aria-label={`${productName} version comparison`}>
        <table className="w-full border-collapse text-left text-xs sm:min-w-[620px] sm:text-sm">
          <thead><tr className="bg-[#f5f1e8]"><th className="p-3 sm:p-4">Check</th><th className="p-3 sm:p-4">{hub.quickComparison.columns[0]}</th><th className="p-3 sm:p-4">{hub.quickComparison.columns[1]}</th></tr></thead>
          <tbody>{hub.quickComparison.rows.map(([key, a, b]) => <tr key={key} className="border-t border-[#171717]"><th className="p-3 font-semibold sm:p-4">{key}</th><td className="p-3 sm:p-4">{a}</td><td className="p-3 sm:p-4">{b}</td></tr>)}</tbody>
        </table>
      </div>
      <Link href={hub.quickComparison.href} className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">Read the full version guide →</Link>
    </section>}

    {hub.explainers.map((item) => <section key={item.title} className="grid overflow-hidden border border-[#171717] md:grid-cols-2">
      <figure className="bg-[#eaf3ff] p-5"><Image src={item.image} alt={item.alt} width={1080} height={1080} sizes="(max-width: 768px) 100vw, 50vw" className="aspect-square h-full w-full object-contain" /><figcaption className="mt-3 text-xs leading-5 text-muted-foreground">{item.caption}</figcaption></figure>
      <div className="flex flex-col justify-center border-t border-[#171717] p-6 md:border-l md:border-t-0 lg:p-9"><h2 className="font-serif text-3xl">{item.title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{item.body}</p>{item.href && <Link href={item.href} className="mt-5 text-sm font-semibold underline underline-offset-4">{item.cta ?? "Read more"} →</Link>}</div>
    </section>)}
  </div>
}

/** Guides part: the "choose" path first, then the other guide links, each URL once. */
export function hubGuideGroups(hub: Hub) {
  const seen = new Set<string>()
  const take = (items: Hub["guides"]) => items.filter((item) => !seen.has(item.href) && seen.add(item.href))
  const steps = take(hub.steps ?? [])
  const more = take([...hub.buyingChecks, ...hub.guides])
  return { steps, more, hrefs: seen }
}

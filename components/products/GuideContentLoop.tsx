import Link from "next/link"
import { getProductContentHub, guideProductRelations } from "@/lib/products/content-hubs"

export function GuideContentLoop({ slug }: { slug: string }) {
  const relation = guideProductRelations[slug]
  if (!relation) return null
  const hub = getProductContentHub(relation.productSlug)
  if (!hub) {
    if (!relation.productName) return null
    // Product without a hub yet: a single link back to its product page.
    return <aside className="mt-12 border border-[#171717] bg-[#f5f1e8] p-6" aria-label={`${relation.productName} product page`}>
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">{relation.intent} · product page</p>
      <h2 className="mt-1 font-serif text-2xl">Go to the {relation.productName} product page</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Current price with its source, specifications, owner review summaries and comparisons in one place.</p>
      <Link href={`/products/${relation.productSlug}`} className="mt-4 inline-block font-semibold underline underline-offset-4">View {relation.productName} →</Link>
    </aside>
  }
  const title = hub.shortName
  const next = [...hub.guides, ...hub.comparisons].filter((item) => item.href.split("/").pop() !== slug).slice(0, 4)
  return <aside className="mt-12 border border-[#171717] bg-[#f5f1e8] p-6" aria-label={`Continue researching ${title}`}>
    <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">{relation.intent} · content path</p>
    <h2 className="mt-1 font-serif text-2xl">Return to the {title} product hub</h2>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Use the product page to connect this focused guide with version checks, direct comparisons and the next buying step.</p>
    <Link href={`/products/${relation.productSlug}`} className="mt-4 inline-block font-semibold underline underline-offset-4">Explore {title} →</Link>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{next.map((item) => <Link key={item.href} href={item.href} className="border border-[#171717] bg-white p-4 hover:bg-[#eaf3ff]"><span className="text-xs font-bold uppercase tracking-wide text-[#52606d]">{item.intent ?? "Next"}</span><span className="mt-1 block font-serif text-lg">{item.label}</span></Link>)}</div>
  </aside>
}

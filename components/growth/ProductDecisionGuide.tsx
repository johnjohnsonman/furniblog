import Link from "next/link"
import { ArrowRight, Check, MapPin, Search } from "lucide-react"
import type { ProductDecisionGuide as Guide } from "@/lib/growth/product-decision-guides"

export function ProductDecisionGuide({ productName, slug, guide, videoCount, evidenceCount, hasBuyingLink }: { productName: string; slug: string; guide: Guide; videoCount: number; evidenceCount: number; hasBuyingLink: boolean }) {
  const evidencePending = evidenceCount === 0
  const verdict = evidencePending ? `Chairpedia has not yet linked the core fit specifications for ${productName}. Treat this as a catalog record and verify the exact configuration before shortlisting it.` : guide.verdict
  const shortlist = evidencePending ? ["The product and brand record exist", "Core fit measurements are still awaiting source verification", "No fit recommendation is made from missing specifications"] : guide.shortlist
  return <section aria-labelledby="buying-decision-title" className="mt-8 border border-[#171717] bg-[#f5f1e8]">
    <div className="grid lg:grid-cols-[.8fr_1.2fr]">
      <div className="border-b border-[#171717] p-6 lg:border-b-0 lg:border-r lg:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">Chairpedia buying brief</p>
        <h2 id="buying-decision-title" className="mt-3 font-serif text-3xl leading-tight">Is {productName} right for you?</h2>
        <p className="mt-4 text-sm leading-7 text-[#4f4b44]">{verdict}</p>
        <dl className="mt-5 grid grid-cols-3 border border-[#aaa397] text-center text-xs"><div className="p-3"><dt className="text-[#6f695f]">Fit sources</dt><dd className="mt-1 font-semibold">{evidenceCount || "Pending"}</dd></div><div className="border-x border-[#aaa397] p-3"><dt className="text-[#6f695f]">Videos</dt><dd className="mt-1 font-semibold">{videoCount}</dd></div><div className="p-3"><dt className="text-[#6f695f]">Buying link</dt><dd className="mt-1 font-semibold">{hasBuyingLink ? "Available" : "Search only"}</dd></div></dl>
        <Link href={`/chair-fit-calculator?chair=${encodeURIComponent(slug)}`} className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#244f73] px-5 text-sm font-semibold text-white">Check your fit <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid sm:grid-cols-2">
        <div className="border-b border-[#171717] p-6 sm:border-b-0 sm:border-r lg:p-8"><h3 className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-[#2f6a43]" /> {evidencePending ? "What is documented" : "Shortlist it if"}</h3><ul className="mt-4 space-y-3 text-sm leading-6">{shortlist.map(x=><li key={x}>• {x}</li>)}</ul></div>
        <div className="p-6 lg:p-8"><h3 className="flex items-center gap-2 font-semibold"><Search className="h-4 w-4 text-[#8a5a20]" /> Verify before buying</h3><ul className="mt-4 space-y-3 text-sm leading-6">{guide.verify.map(x=><li key={x}>• {x}</li>)}</ul></div>
      </div>
    </div>
    <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#171717] px-6 py-4 text-sm font-medium">
      <a href="#product-research" className="underline underline-offset-4">{videoCount ? `Watch ${videoCount} owner and expert videos` : "Check video research status"}</a>
      <Link href={`/stores?model=${encodeURIComponent(slug)}`} className="inline-flex items-center gap-1 underline underline-offset-4"><MapPin className="h-4 w-4" /> Find places to try it</Link>
      <Link href={`/compare?chair=${encodeURIComponent(slug)}`} className="underline underline-offset-4">Compare alternatives</Link>
    </div>
  </section>
}

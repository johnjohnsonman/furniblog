import Link from "next/link"
import { ArrowRight, Check, MapPin, Search } from "lucide-react"
import type { ProductDecisionGuide as Guide } from "@/lib/growth/product-decision-guides"

export function ProductDecisionGuide({ productName, slug, guide, videoCount, evidenceCount }: { productName: string; slug: string; guide: Guide; videoCount: number; evidenceCount: number; hasBuyingLink: boolean }) {
  const evidencePending = evidenceCount === 0
  // Without sourced fit data we guide to what is documented and what to confirm,
  // rather than listing what is missing.
  const verdict = evidencePending ? `Start with what this page documents for ${productName} — official details, owner review summaries and buying options — then confirm the exact configuration with the checks below before you shortlist it.` : guide.verdict
  return <section aria-labelledby="buying-decision-title" className="mt-8 border border-[#171717] bg-[#f5f1e8]">
    <div className="grid lg:grid-cols-[.8fr_1.2fr]">
      <div className="border-b border-[#171717] p-6 lg:border-b-0 lg:border-r lg:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">Chairpedia buying brief</p>
        <h2 id="buying-decision-title" className="mt-3 font-serif text-3xl leading-tight">Is {productName} right for you?</h2>
        <p className="mt-4 text-sm leading-7 text-[#4f4b44]">{verdict}</p>
        <Link href={`/chair-fit-calculator?chair=${encodeURIComponent(slug)}`} className="mt-6 inline-flex min-h-11 items-center gap-2 bg-[#244f73] px-5 text-sm font-semibold text-white">Check your fit <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className={evidencePending ? "grid" : "grid sm:grid-cols-2"}>
        {!evidencePending && <div className="border-b border-[#171717] p-6 sm:border-b-0 sm:border-r lg:p-8"><h3 className="flex items-center gap-2 font-semibold"><Check className="h-4 w-4 text-[#2f6a43]" /> Shortlist it if</h3><ul className="mt-4 space-y-3 text-sm leading-6">{guide.shortlist.map(x=><li key={x}>• {x}</li>)}</ul></div>}
        <div className="p-6 lg:p-8"><h3 className="flex items-center gap-2 font-semibold"><Search className="h-4 w-4 text-[#8a5a20]" /> Verify before buying</h3><ul className="mt-4 space-y-3 text-sm leading-6">{guide.verify.map(x=><li key={x}>• {x}</li>)}</ul></div>
      </div>
    </div>
    <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#171717] px-6 py-4 text-sm font-medium">
      {videoCount > 0 && <a href="#product-research" className="underline underline-offset-4">{`Watch ${videoCount} owner and expert videos`}</a>}
      <Link href={`/stores?model=${encodeURIComponent(slug)}`} className="inline-flex items-center gap-1 underline underline-offset-4"><MapPin className="h-4 w-4" /> Find places to try it</Link>
      <Link href={`/compare?chair=${encodeURIComponent(slug)}`} className="underline underline-offset-4">Compare alternatives</Link>
    </div>
  </section>
}

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { generateOrganizationSchema } from "@/lib/seo/schemas"

export const metadata: Metadata = { title: "About Chairpedia", description: "Chairpedia documents chairs using source-linked specifications, clearly labeled editorial research and transparent corrections.", alternates: { canonical: "/about" } }

export default function AboutPage() {
  const orgSchema = { ...generateOrganizationSchema(), "@context": "https://schema.org", "@type": "Organization", name: "Chairpedia", url: "https://www.chairpedia.com", description: "A chair reference database that separates manufacturer specifications, editorial research and owner reports.", knowsAbout: ["Office chairs", "Ergonomic seating", "Designer furniture", "Chair research"] }
  return <div className="flex min-h-screen flex-col"><Header />
    <main className="flex-1">
      <div className="border-b border-border"><div className="mx-auto max-w-3xl px-4 py-3"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Link href="/" className="hover:text-foreground">Home</Link><ChevronRight className="h-3 w-3"/><span className="text-foreground">About</span></div></div></div>
      <section className="border-b border-border bg-card"><div className="mx-auto max-w-3xl px-4 py-16 sm:py-20"><p className="text-xs font-medium uppercase tracking-[.18em] text-muted-foreground">Chairpedia</p><h1 className="mt-4 font-serif text-4xl leading-tight">Chair research grounded in identifiable sources.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Chairpedia is building a global reference for chair models, configurations, specifications, comparisons and places to try them.</p></div></section>
      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 text-[17px] leading-8 text-muted-foreground">
        <section><h2 className="font-serif text-2xl text-foreground">What we publish</h2><p className="mt-4">Product records identify the chair, brand and available configuration data. Source-linked fields point to manufacturer documentation or another identifiable source. Comparisons and guides are editorial research and should state when an exact model, market or option still needs confirmation.</p></section>
        <section><h2 className="font-serif text-2xl text-foreground">How evidence is labeled</h2><p className="mt-4">Manufacturer facts, external owner reports, offline experience records and Chairpedia editorial judgments are different forms of evidence. We do not treat a link as proof unless it supports the exact claim and configuration. Unknown values remain unknown.</p></section>
        <section><h2 className="font-serif text-2xl text-foreground">Commercial relationships</h2><p className="mt-4">Chairpedia may earn a commission from qualifying purchases through affiliate links. A commercial link does not turn a seller listing into a verified specification or affect the order of factual evidence. Seller, condition, configuration, price, warranty and return terms must be checked at the destination.</p></section>
        <section><h2 className="font-serif text-2xl text-foreground">Corrections and accountability</h2><p className="mt-4">We preserve publication context, correct unsupported claims and show when verification is incomplete. To report an error or provide a better source, use the contact page.</p><div className="mt-6 flex gap-3"><Link href="/editorial-policy" className="border border-border px-5 py-3 text-sm font-semibold text-foreground">Editorial policy</Link><Link href="/contact" className="bg-foreground px-5 py-3 text-sm font-semibold text-background">Report a correction</Link></div></section>
      </div>
    </main><Footer /><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(orgSchema)}}/>
  </div>
}

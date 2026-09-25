import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { generateOrganizationSchema } from "@/lib/seo/schemas"
import { SITE_AUTHOR_SCHEMA } from "@/lib/seo/author"
import { SITE_URL } from "@/lib/site-config"

export const metadata: Metadata = {
  title: "About Chairpedia: Meet Leo",
  description: "Chairpedia is run by Leo, a businessperson and chair collector. Manufacturer specs, real prices with sources, owner reviews from around the world summarized, and the differences that matter.",
  alternates: { canonical: "/about" },
}

const BRANDS = ["Herman Miller", "Knoll", "Steelcase", "Humanscale", "Haworth", "Vitra", "Wilkhahn", "Walter Knoll", "Okamura", "Itoki", "Kokuyo", "SIHOO"]

function Brands() {
  return (
    <>
      {BRANDS.map((b, i) => (
        <span key={b}>
          <strong className="font-semibold text-foreground">{b}</strong>
          {i < BRANDS.length - 1 ? ", " : ""}
        </span>
      ))}
    </>
  )
}

export default function AboutPage() {
  const schema = [
    { ...generateOrganizationSchema(), "@context": "https://schema.org", "@type": "Organization", name: "Chairpedia", url: SITE_URL },
    { "@context": "https://schema.org", "@type": "AboutPage", url: `${SITE_URL}/about`, name: "Meet Leo", mainEntity: SITE_AUTHOR_SCHEMA },
  ]
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">About</span>
            </div>
          </div>
        </div>

        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
            <p className="text-xs font-medium uppercase tracking-[.18em] text-muted-foreground">About Chairpedia</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight">Meet Leo</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Leo is a businessperson and a chair collector, and by his own admission, a little obsessed.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 text-[17px] leading-8 text-muted-foreground">
          <section className="space-y-6">
            <p>
              Where most people see &ldquo;an office chair,&rdquo; Leo sees tilt mechanisms, seat-depth ranges, mesh tension, and the difference between a chair that supports you and one that merely holds you up. Over the years he has sat in, adjusted, lived with, and argued about more chairs than he can count, from <Brands />, and many more, from design icons to chairs that are rarely sold outside their home markets.
            </p>
            <p>
              His collection has grown well past what any reasonable person needs, and that obsession is what drives Chairpedia: collecting what manufacturers and owners around the world actually say, and making it easy to compare.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground">Why Chairpedia exists</h2>
            <p className="mt-4">
              Buying a great chair is expensive, and most information online is thin: recycled spec sheets, outdated prices, and reviews written by people who never sat in the chair. Chairpedia is Leo&rsquo;s answer to that. Every page aims to do three things:
            </p>
            <ul className="mt-4 list-disc space-y-3 pl-6">
              <li><strong className="font-semibold text-foreground">Show real prices with sources.</strong> We list official prices with the date we checked them, and show local-currency prices for chairs sold only outside the US.</li>
              <li><strong className="font-semibold text-foreground">Summarize what owners say worldwide.</strong> We collect and condense published reviews so you don&rsquo;t have to read hundreds of them.</li>
              <li><strong className="font-semibold text-foreground">Explain the differences that actually matter.</strong> Versions, sizes, and the details that decide whether a chair fits your body and your work.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-foreground">Disclosure</h2>
            <p className="mt-4">
              Leo works in the office furniture industry. Chairpedia may earn a commission when you buy through some links, at no extra cost to you. Neither affects what we write: if a chair has a flaw, we will tell you.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/editorial-policy" className="border border-border px-5 py-3 text-sm font-semibold text-foreground">Editorial policy</Link>
              <Link href="/affiliate-disclosure" className="border border-border px-5 py-3 text-sm font-semibold text-foreground">Affiliate disclosure</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  )
}

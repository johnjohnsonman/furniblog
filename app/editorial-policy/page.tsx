import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "How Chairpedia is written: pages by Leo, official prices with sources and dates, owner reviews summarized from around the world, and clear disclosure of first-hand experience and commercial ties.",
  alternates: { canonical: "/editorial-policy" },
  openGraph: { title: "Editorial Policy | Chairpedia", url: "/editorial-policy" },
}

const H2 = "font-serif text-xl font-medium text-foreground mt-8 mb-4"
const P = "text-muted-foreground leading-relaxed"

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Editorial Policy</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-serif text-3xl font-medium text-foreground">Editorial Policy</h1>

          <div className="mt-8 space-y-6">
            <p className={P}>
              Chairpedia is written by <Link href="/about" className="text-foreground underline">Leo</Link>, a businessperson and chair collector. This page explains how our pages are put together, so you can judge what you are reading.
            </p>

            <h2 className={H2}>Who writes Chairpedia</h2>
            <p className={P}>
              Articles, guides and comparisons are written by Leo and carry his byline, which links to the <Link href="/about" className="text-foreground underline">About</Link> page. AI tools may help with drafting and with summarizing sources; Leo is responsible for what is published.
            </p>

            <h2 className={H2}>Prices</h2>
            <p className={P}>
              We list official prices with their source and the date we checked them. When a range is shown, it covers the configurations the source lists. For chairs sold only outside the US, we show the official local-currency price first, followed by a US-dollar estimate converted at a fixed, dated exchange rate. Where no reliable price is published, we say so instead of estimating one. Prices change, so check the seller before you buy.
            </p>

            <h2 className={H2}>Owner reviews</h2>
            <p className={P}>
              We collect and condense published reviews from owners around the world so you don&rsquo;t have to read hundreds of them. Each summary links back to its original source, and the opinions in it belong to the original author. A summary without a usable original link is labeled as such and is not presented as a verified owner review.
            </p>

            <h2 className={H2}>Leo&rsquo;s own experience</h2>
            <p className={P}>
              Leo owns and rotates through many of the chairs covered here. Where he has lived with a chair himself, the page says so. Otherwise the page combines manufacturer specifications with owner reviews from around the world.
            </p>
            <p className={P}>
              Where we show scores across criteria such as Comfort, Ergonomics, Build Quality, Design, Value and Long-Hour Use, those are editorial assessments drawn from this research and from published reviews, not the results of independent laboratory testing.
            </p>

            <h2 className={H2}>Updates</h2>
            <p className={P}>
              We retain publication dates and only describe an article as updated when its content has been revised. Customer experience records may describe earlier chair versions. We do not display dates on offline customer experience records because their entry dates do not establish when the customer visited or tested the chair. Changing our brand or domain does not make an older review new.
            </p>

            <h2 className={H2}>Corrections</h2>
            <p className={P}>
              If we make an error, we correct it promptly and transparently. If you spot an error in our content, please <Link href="/contact" className="text-foreground underline">contact us</Link>.
            </p>

            <h2 className={H2}>Disclosure</h2>
            <p className={P}>
              Leo works in the office furniture industry. Chairpedia may earn a commission when you buy through some links, at no extra cost to you. Neither affects what we write: if a chair has a flaw, we will tell you. See our <Link href="/affiliate-disclosure" className="text-foreground underline">affiliate disclosure</Link>.
            </p>

            <h2 className={H2}>Sponsored content</h2>
            <p className={P}>
              Any sponsored content is clearly labeled. Sponsored content does not influence our reviews and recommendations.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

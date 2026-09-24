import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Editorial Policy",
  alternates: { canonical: "/editorial-policy" },
  openGraph: { title: "Editorial Policy | Chairpedia", url: "/editorial-policy" },
}

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
            <p className="text-muted-foreground leading-relaxed">
              At Chairpedia, we are committed to providing honest, unbiased, and helpful content to help you make informed furniture purchasing decisions.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Independence</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our editorial work is independent from our advertising and affiliate relationships. Recommendations are based on our research and analysis, not on commission rates or advertising deals.
            </p>

            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">How we evaluate</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our content comes in a few different forms, and we label which one you are reading:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Research-based buying guides.</strong> Most of our chair write-ups are built from manufacturer documentation, published specifications, retailer listings and a wide reading of existing reviews. Where a guide has not been hands-on tested, we say so.</li>
              <li><strong className="text-foreground">Summaries of published reviews.</strong> Many entries condense real, publicly available reviews and videos, with each summary linking back to its original source.</li>
              <li><strong className="text-foreground">First-hand notes.</strong> When we have physically handled a chair, we mark that clearly and describe what we observed.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Where we show scores across criteria such as Comfort, Ergonomics, Build Quality, Design, Value and Long-Hour Use, those are editorial assessments drawn from this research and from published reviews — not the results of independent laboratory testing.
            </p>

            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Summaries &amp; Sources</h2>
            <p className="text-muted-foreground leading-relaxed">
              Review summaries may condense publicly available reviews and videos so you can scan them quickly. AI may assist with drafting. A summary is treated as source-linked only when its original URL is present and accessible; records without a usable original link are labeled as unavailable and are not presented as verified owner reviews. The opinions in a source-linked summary belong to the original author, not to Chairpedia.
            </p>

            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain publication dates and only describe an article as updated when its content has been revised. Customer experience records may describe earlier chair versions. We do not display dates on offline customer experience records because their entry dates do not establish when the customer visited or tested the chair. Changing our brand or domain does not make an older review new.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Corrections</h2>
            <p className="text-muted-foreground leading-relaxed">
              If we make an error, we correct it promptly and transparently. If you spot an error in our content, please <Link href="/contact" className="text-foreground underline">contact us</Link>.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Sponsored Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any sponsored content is clearly labeled. Sponsored content does not influence our independent reviews and recommendations.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

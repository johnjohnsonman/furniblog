import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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
              At Furniblog, we are committed to providing honest, unbiased, and helpful content to help you make informed furniture purchasing decisions.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Independence</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our editorial team operates independently from our business and advertising teams. Product recommendations are based solely on our testing and research, not on advertising relationships or commission rates.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Testing Process</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every product we review is tested by our team of ergonomics experts. We evaluate products across six key criteria: Comfort, Ergonomics, Build Quality, Design, Value, and Long-Hour Use. Each score is based on objective measurements and hands-on testing.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Summaries &amp; Sources</h2>
            <p className="text-muted-foreground leading-relaxed">
              Many review summaries on Furniblog condense real, publicly available reviews and videos so you can scan them quickly. These summaries are produced with AI assistance and reviewed by our team, and every one links back to its original source so you can read it in full. The opinions in a summary belong to the original author, not to Furniblog.
            </p>

            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We regularly update our content to reflect product changes, new releases, and updated pricing. Articles are marked with their last update date.
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

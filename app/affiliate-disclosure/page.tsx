import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Affiliate Disclosure</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-serif text-3xl font-medium text-foreground">Affiliate Disclosure</h1>
          
          <div className="mt-8 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Furniblog is a participant in various affiliate programs, including the Amazon Associates Program. This means we may earn a commission when you purchase products through links on our site, at no additional cost to you.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">How We Earn</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you click on a link to a retailer on our site and make a purchase, we may receive a small commission. This commission helps support our editorial team and allows us to continue providing free, unbiased reviews and recommendations.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Our Affiliate Partners</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Amazon Associates Program</li>
              <li>Direct manufacturer partnerships (Herman Miller, Steelcase, etc.)</li>
              <li>Regional retailers (Coupang, Naver Shopping, Rakuten)</li>
              <li>Chairpark Korea</li>
            </ul>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Editorial Independence</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our affiliate relationships do not influence our editorial content. Products are reviewed and recommended based on their merits, not on commission rates. We maintain strict editorial independence to ensure our recommendations serve your best interests.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Questions?</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about our affiliate relationships, please <Link href="/contact" className="text-foreground underline">contact us</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

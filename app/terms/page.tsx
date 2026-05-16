import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-serif text-3xl font-medium text-foreground">Terms of Service</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="mt-8 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Furniblog, you agree to be bound by these Terms of Service.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Use of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Furniblog provides furniture information, reviews, and comparisons for informational purposes only. We strive for accuracy but cannot guarantee that all information is complete or current.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on Furniblog, including text, images, and design, is owned by Furniblog or its licensors. You may not reproduce, distribute, or create derivative works without permission.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Affiliate Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our site contains affiliate links. When you make a purchase through these links, we may earn a commission. See our <Link href="/affiliate-disclosure" className="text-foreground underline">Affiliate Disclosure</Link> for details.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Furniblog is provided &quot;as is&quot; without warranties of any kind. We are not responsible for any decisions you make based on our content.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these terms? <Link href="/contact" className="text-foreground underline">Contact us</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

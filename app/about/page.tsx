import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">About</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-serif text-3xl font-medium text-foreground">About Furniblog</h1>
          
          <div className="mt-8 prose prose-neutral max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              Furniblog is the global database for premium furniture, office chairs, and iconic designs. Our mission is to help you find the perfect chair through comprehensive specs, honest reviews, and detailed comparisons.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe everyone deserves a comfortable, ergonomic workspace. Our team of furniture experts and ergonomics specialists test and review every product in our database, providing unbiased recommendations based on real-world use.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">How We Review</h2>
            <p className="text-muted-foreground leading-relaxed">
              Each product in our database undergoes extensive testing across six key criteria: Comfort, Ergonomics, Build Quality, Design, Value, and Long-Hour Use. Our scores are based on hands-on testing, user feedback, and expert analysis.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Editorial Independence</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our editorial content is independent of our affiliate partnerships. We recommend products based on merit, not commission rates. Read our <Link href="/editorial-policy" className="text-foreground underline">Editorial Policy</Link> for more details.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

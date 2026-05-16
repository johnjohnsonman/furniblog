import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Privacy Policy</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-serif text-3xl font-medium text-foreground">Privacy Policy</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="mt-8 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy describes how Furniblog collects, uses, and shares information about you when you use our website.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly, such as when you contact us or subscribe to our newsletter. We also automatically collect certain information when you visit our site, including your IP address, browser type, and pages viewed.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">How We Use Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to operate and improve our website, communicate with you, and analyze usage patterns. We may also use information for advertising and marketing purposes.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to collect information about your browsing activities. This includes cookies from third-party services like Google Analytics and advertising partners.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our site includes links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
            </p>
            
            <h2 className="font-serif text-xl font-medium text-foreground mt-8 mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please <Link href="/contact" className="text-foreground underline">contact us</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

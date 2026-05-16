import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Contact</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="font-serif text-3xl font-medium text-foreground">Contact Us</h1>
          
          <div className="mt-8 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Have questions, feedback, or partnership inquiries? We&apos;d love to hear from you.
            </p>
            
            <div className="grid gap-6 sm:grid-cols-2 mt-8">
              <div className="p-6 bg-card rounded-xl border border-border">
                <h2 className="font-medium text-foreground mb-2">General Inquiries</h2>
                <p className="text-sm text-muted-foreground">hello@furniblog.com</p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border">
                <h2 className="font-medium text-foreground mb-2">Partnerships</h2>
                <p className="text-sm text-muted-foreground">partners@furniblog.com</p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border">
                <h2 className="font-medium text-foreground mb-2">Press & Media</h2>
                <p className="text-sm text-muted-foreground">press@furniblog.com</p>
              </div>
              <div className="p-6 bg-card rounded-xl border border-border">
                <h2 className="font-medium text-foreground mb-2">Advertising</h2>
                <p className="text-sm text-muted-foreground">ads@furniblog.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

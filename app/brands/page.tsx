import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { brands } from "@/lib/data"

export default function BrandsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Brands
            </h1>
            <p className="mt-1 text-muted-foreground">
              {brands.length} premium furniture manufacturers
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          {/* Brand Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="group flex items-start gap-4 p-5 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground font-semibold">
                  {brand.logo}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-medium text-foreground">
                      {brand.name}
                    </h2>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {brand.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{brand.country}</span>
                    <span>•</span>
                    <span>Est. {brand.founded}</span>
                    <span>•</span>
                    <span>{brand.productCount} products</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

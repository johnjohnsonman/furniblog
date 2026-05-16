import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { brands, products } from "@/lib/data"

interface BrandPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return brands.map((brand) => ({ id: brand.id }))
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { id } = await params
  const brand = brands.find((b) => b.id === id)
  
  if (!brand) {
    notFound()
  }

  const brandProducts = products.filter((p) => p.brandId === brand.id)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/brands" className="hover:text-foreground transition-colors">Brands</Link>
              <span>/</span>
              <span className="text-foreground">{brand.name}</span>
            </div>
          </div>
        </div>

        {/* Brand Header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-foreground font-bold text-2xl shrink-0">
                {brand.logo}
              </div>
              
              <div>
                <h1 className="font-serif text-3xl font-medium text-foreground">
                  {brand.name}
                </h1>
                
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span>{brand.country}</span>
                  <span>•</span>
                  <span>Est. {brand.founded}</span>
                  <span>•</span>
                  <span>{brand.category}</span>
                </div>
                
                <p className="mt-4 text-muted-foreground max-w-2xl">
                  {brand.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          <h2 className="font-serif text-xl font-medium text-foreground mb-6">
            Products ({brandProducts.length})
          </h2>
          
          {brandProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {brandProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all"
                >
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-muted-foreground">({product.reviewCount})</span>
                    </div>
                    <p className="text-sm font-medium mt-1">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">No products available yet.</p>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All brands
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

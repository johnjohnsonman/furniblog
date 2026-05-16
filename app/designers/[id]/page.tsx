import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { designers, products, brands } from "@/lib/data"

interface DesignerPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return designers.map((designer) => ({ id: designer.id }))
}

export default async function DesignerPage({ params }: DesignerPageProps) {
  const { id } = await params
  const designer = designers.find((d) => d.id === id)
  
  if (!designer) {
    notFound()
  }

  const designerProducts = products.filter((p) => p.designerId === designer.id)
  const associatedBrands = brands.filter((b) => designer.brands.includes(b.name))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-3 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/designers" className="hover:text-foreground transition-colors">Designers</Link>
              <span>/</span>
              <span className="text-foreground">{designer.name}</span>
            </div>
          </div>
        </div>

        {/* Designer Header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 shrink-0 rounded-full overflow-hidden bg-muted">
                <img src={designer.image} alt={designer.name} className="h-full w-full object-cover" />
              </div>
              
              <div>
                <h1 className="font-serif text-3xl font-medium text-foreground">
                  {designer.name}
                </h1>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {designer.country} • b. {designer.born}
                </p>
                
                <p className="mt-4 text-muted-foreground max-w-2xl">
                  {designer.bio}
                </p>

                {/* Notable Works */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {designer.notableWorks.map((work) => (
                    <span key={work} className="px-2 py-1 rounded bg-muted text-sm text-foreground">
                      {work}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
          {/* Associated Brands */}
          {associatedBrands.length > 0 && (
            <div className="mb-10">
              <h2 className="font-serif text-xl font-medium text-foreground mb-4">
                Associated Brands
              </h2>
              <div className="flex flex-wrap gap-3">
                {associatedBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.id}`}
                    className="flex items-center gap-3 px-4 py-3 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground font-semibold text-sm">
                      {brand.logo}
                    </div>
                    <span className="font-medium text-foreground">{brand.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Products by Designer */}
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground mb-4">
              Products ({designerProducts.length})
            </h2>
            
            {designerProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {designerProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all"
                  >
                    <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{product.brand}</p>
                      <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviewCount})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <p className="text-muted-foreground">No products in database.</p>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Link
              href="/designers"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All designers
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, X, ExternalLink, MapPin, Star, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products, bestLists, listProductMap, getAverageScore } from "@/lib/data"
import { buildAffiliateUrl } from "@/lib/affiliate/links"

interface BestListPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return bestLists.map((list) => ({ slug: list.id }))
}

export async function generateMetadata({
  params,
}: BestListPageProps): Promise<Metadata> {
  const { slug } = await params
  const list = bestLists.find((l) => l.id === slug)
  if (!list) return {}
  const description =
    (list as { description?: string }).description ??
    `${list.title} — expert-curated picks with specs, real reviews and prices.`
  return {
    title: list.title,
    description,
    alternates: { canonical: `/best/${slug}` },
    openGraph: { title: list.title, description, url: `/best/${slug}` },
  }
}

export default async function BestListPage({ params }: BestListPageProps) {
  const { slug } = await params
  const list = bestLists.find((l) => l.id === slug)
  
  if (!list) {
    notFound()
  }

  const productIds = listProductMap[slug] || []
  const listProducts = productIds.map(id => products.find(p => p.id === id)).filter(Boolean)

  // Determine winners
  const bestOverall = listProducts[0]
  const bestValue = listProducts.find(p => p?.scores?.value && p.scores.value > 80) || listProducts[1]
  const bestLongHour = listProducts.find(p => p?.scores?.longHourUse && p.scores.longHourUse > 90) || listProducts[0]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/best" className="hover:text-foreground transition-colors">Best Lists</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{list.title}</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="font-serif text-3xl font-medium text-foreground lg:text-4xl">{list.title}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
            Our expert picks for the {list.title.toLowerCase()}, tested and reviewed. Updated for {new Date().getFullYear()}.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()} · {listProducts.length} products reviewed
          </p>
        </div>

        {/* Quick Winners */}
        <div className="border-y border-border bg-card">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {bestOverall && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Best Overall</p>
                  <Link href={`/products/${bestOverall.id}`} className="font-medium text-foreground hover:underline">{bestOverall.name}</Link>
                  <p className="text-sm text-muted-foreground">{bestOverall.price}</p>
                </div>
              )}
              {bestValue && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Best Value</p>
                  <Link href={`/products/${bestValue.id}`} className="font-medium text-foreground hover:underline">{bestValue.name}</Link>
                  <p className="text-sm text-muted-foreground">{bestValue.price}</p>
                </div>
              )}
              {bestLongHour && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Best for Long Hours</p>
                  <Link href={`/products/${bestLongHour.id}`} className="font-medium text-foreground hover:underline">{bestLongHour.name}</Link>
                  <p className="text-sm text-muted-foreground">{bestLongHour.price}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ad Placeholder */}
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">Advertisement</p>
          </div>
        </div>

        {/* Product Rankings */}
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <div className="space-y-8">
            {listProducts.map((product, index) => {
              if (!product) return null
              const score = getAverageScore(product)
              
              return (
                <div key={product.id} className="border border-border rounded-xl overflow-hidden bg-card">
                  <div className="p-6 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                      {/* Rank & Image */}
                      <div className="flex gap-4 lg:flex-col lg:items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background font-bold shrink-0">
                          {index + 1}
                        </div>
                        <div className="h-32 w-32 lg:h-40 lg:w-40 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link href={`/brands/${product.brandId}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                              {product.brand}
                            </Link>
                            <h2 className="font-serif text-xl font-medium text-foreground mt-1">
                              <Link href={`/products/${product.id}`} className="hover:underline">{product.name}</Link>
                            </h2>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-lg font-semibold text-foreground">{product.price}</span>
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{product.description}</p>

                        {product.bestFor && (
                          <p className="mt-2 text-sm">
                            <span className="text-muted-foreground">Best for: </span>
                            <span className="font-medium text-foreground">{product.bestFor}</span>
                          </p>
                        )}

                        {/* Pros & Cons */}
                        <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                          {product.pros && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Pros</p>
                              <ul className="space-y-1">
                                {product.pros.slice(0, 3).map((pro, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <Check className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                                    <span className="text-foreground">{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {product.cons && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Cons</p>
                              <ul className="space-y-1">
                                {product.cons.slice(0, 3).map((con, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <X className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                    <span className="text-foreground">{con}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-2 mt-5">
                          {product.amazonUrl && (
                            <a href={buildAffiliateUrl(product.amazonUrl, "amazon", "US")} target="_blank" rel="sponsored nofollow noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors">
                              View on Amazon <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <Link href={`/products/${product.id}`} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            Full Review
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Affiliate Disclosure */}
          <p className="mt-8 text-xs text-muted-foreground text-center leading-relaxed">
            Furniblog may earn a commission when you purchase through links on this page, at no extra cost to you.
          </p>
        </div>

        {/* Ad Placeholder */}
        <div className="mx-auto max-w-5xl px-4 pb-10">
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">Advertisement</p>
          </div>
        </div>

        {/* Related Lists */}
        <section className="border-t border-border py-14">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="font-serif text-xl font-medium text-foreground mb-6">Related Lists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {bestLists.filter(l => l.id !== slug).slice(0, 3).map((relatedList) => (
                <Link key={relatedList.id} href={`/best/${relatedList.id}`} className="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all">
                  <h3 className="font-medium text-foreground text-sm">{relatedList.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{relatedList.count} products</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

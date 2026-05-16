import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, X, ExternalLink, MapPin, Star, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products, reviews, getAverageScore, getSimilarProducts } from "@/lib/data"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((p) => p.id === id)
  
  if (!product) {
    notFound()
  }

  const productReviews = reviews.filter((r) => r.productId === product.id)
  const similarProducts = getSimilarProducts(product, 3)
  const avgScore = getAverageScore(product)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/brands/${product.brandId}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Header */}
              <div className="flex flex-col gap-8 md:flex-row md:gap-10">
                {/* Image */}
                <div className="aspect-square w-full md:w-80 shrink-0 relative bg-muted rounded-xl overflow-hidden">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  {product.availableInKorea && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-foreground text-background text-xs font-medium rounded-full flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Available in Korea
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={`/brands/${product.brandId}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
                    <span>·</span>
                    <span>{product.category}</span>
                  </div>

                  <h1 className="font-serif text-3xl font-medium text-foreground mt-2">{product.name}</h1>

                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-foreground">{product.rating}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-foreground text-foreground" : "fill-muted text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{product.reviewCount.toLocaleString()} reviews</span>
                    {avgScore && (
                      <span className="px-2 py-0.5 bg-foreground text-background rounded text-sm font-semibold">{avgScore}/100</span>
                    )}
                  </div>

                  <p className="text-2xl font-semibold text-foreground mt-4">{product.price}</p>

                  <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{product.description}</p>

                  {product.bestFor && (
                    <p className="mt-3 text-sm">
                      <span className="text-muted-foreground">Best for: </span>
                      <span className="font-medium text-foreground">{product.bestFor}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Overview */}
              {product.overview && (
                <section className="mt-10 pt-8 border-t border-border">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-4">Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.overview}</p>
                  {product.designer && (
                    <p className="mt-4 text-sm">
                      <span className="text-muted-foreground">Designed by </span>
                      {product.designerId ? (
                        <Link href={`/designers/${product.designerId}`} className="text-foreground font-medium hover:underline">{product.designer}</Link>
                      ) : (
                        <span className="text-foreground font-medium">{product.designer}</span>
                      )}
                    </p>
                  )}
                </section>
              )}

              {/* Specifications */}
              <section className="mt-10 pt-8 border-t border-border">
                <h2 className="font-serif text-xl font-medium text-foreground mb-6">Specifications</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    {product.dimensions && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground text-sm">Dimensions</span>
                        <span className="text-foreground text-sm font-medium">{product.dimensions}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground text-sm">Weight</span>
                        <span className="text-foreground text-sm font-medium">{product.weight}</span>
                      </div>
                    )}
                    {product.warranty && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground text-sm">Warranty</span>
                        <span className="text-foreground text-sm font-medium">{product.warranty}</span>
                      </div>
                    )}
                    {product.year && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground text-sm">Year</span>
                        <span className="text-foreground text-sm font-medium">{product.year}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {product.materials && (
                      <div>
                        <span className="text-muted-foreground text-sm block mb-2">Materials</span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.materials.map((mat) => (
                            <span key={mat} className="px-2 py-1 bg-muted rounded text-xs text-foreground">{mat}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {product.adjustments && product.adjustments.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm block mb-2">Adjustments</span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.adjustments.map((adj) => (
                            <span key={adj} className="px-2 py-1 bg-muted rounded text-xs text-foreground">{adj}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Pros & Cons */}
              {(product.pros || product.cons) && (
                <section className="mt-10 pt-8 border-t border-border">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-6">Pros & Cons</h2>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {product.pros && (
                      <div>
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Pros</h3>
                        <ul className="space-y-2">
                          {product.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                              <span className="text-foreground text-sm">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.cons && (
                      <div>
                        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Cons</h3>
                        <ul className="space-y-2">
                          {product.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                              <span className="text-foreground text-sm">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Review Scores */}
              {product.scores && (
                <section className="mt-10 pt-8 border-t border-border">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-6">Review Scores</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Object.entries(product.scores).map(([key, value]) => (
                      <div key={key} className="p-4 bg-card rounded-lg border border-border">
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Review Summary */}
              {product.reviewSummary && (
                <section className="mt-10 pt-8 border-t border-border">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-4">Review Summary</h2>
                  <div className="p-5 bg-muted/30 rounded-lg border border-border">
                    <p className="text-muted-foreground leading-relaxed">{product.reviewSummary}</p>
                  </div>
                </section>
              )}

              {/* User Reviews */}
              {productReviews.length > 0 && (
                <section className="mt-10 pt-8 border-t border-border">
                  <h2 className="font-serif text-xl font-medium text-foreground mb-6">User Reviews</h2>
                  <div className="space-y-4">
                    {productReviews.map((review) => (
                      <div key={review.id} className="p-4 bg-card rounded-lg border border-border">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-foreground text-foreground" : "fill-muted text-muted"}`} />
                          ))}
                        </div>
                        <h3 className="font-medium text-foreground text-sm">{review.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{review.excerpt}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{review.author} · {new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Compare with Similar */}
              {similarProducts.length > 0 && (
                <section className="mt-10 pt-8 border-t border-border">
                  <div className="flex items-end justify-between mb-6">
                    <h2 className="font-serif text-xl font-medium text-foreground">Compare with Similar</h2>
                    <Link href={`/compare?products=${product.id},${similarProducts.map(p => p.id).join(",")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Compare all
                    </Link>
                  </div>
                  <div className="overflow-x-auto -mx-4 px-4">
                    <table className="w-full border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Product</th>
                          <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Rating</th>
                          <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Score</th>
                          <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground uppercase">Price</th>
                          <th className="text-right py-3 px-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border bg-muted/30">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-semibold text-sm">{product.rating}</td>
                          <td className="py-3 px-3 text-center font-semibold text-sm">{avgScore || "-"}</td>
                          <td className="py-3 px-3 text-center font-medium text-sm">{product.price}</td>
                          <td className="py-3 px-3 text-right text-xs text-muted-foreground">Current</td>
                        </tr>
                        {similarProducts.map((p) => {
                          const pScore = getAverageScore(p)
                          return (
                            <tr key={p.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                              <td className="py-3 px-3">
                                <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground text-sm hover:underline">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                                  </div>
                                </Link>
                              </td>
                              <td className="py-3 px-3 text-center font-semibold text-sm">{p.rating}</td>
                              <td className="py-3 px-3 text-center font-semibold text-sm">{pScore || "-"}</td>
                              <td className="py-3 px-3 text-center font-medium text-sm">{p.price}</td>
                              <td className="py-3 px-3 text-right">
                                {p.officialUrl && (
                                  <a href={p.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors inline-flex items-center gap-1">
                                    Buy <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Ad Placeholder */}
              <div className="mt-10 p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
                <p className="text-xs text-muted-foreground">Advertisement</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-6 space-y-6">
                {/* Quick Stats Card */}
                <div className="p-5 bg-card rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    {avgScore && <span className="text-2xl font-bold text-foreground">{avgScore}/100</span>}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price Range</span>
                      <span className="font-medium text-foreground">{product.priceRange}</span>
                    </div>
                    {product.bestFor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best For</span>
                        <span className="font-medium text-foreground">{product.bestFor}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-medium text-foreground">{product.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand</span>
                      <Link href={`/brands/${product.brandId}`} className="font-medium text-foreground hover:underline">{product.brand}</Link>
                    </div>
                  </div>
                </div>

                {/* Where to Buy */}
                <div className="p-5 bg-card rounded-xl border border-border">
                  <h3 className="font-medium text-foreground mb-4">Where to Buy</h3>
                  <div className="space-y-2">
                    {product.officialUrl && (
                      <a href={product.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center justify-between p-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
                        <span className="font-medium text-sm">Official Website</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {product.amazonUrl && (
                      <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <span className="font-medium text-sm text-foreground">Amazon</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    )}
                    {product.coupangUrl && (
                      <a href={product.coupangUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <span className="font-medium text-sm text-foreground">Coupang</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    )}
                    {product.naverUrl && (
                      <a href={product.naverUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <span className="font-medium text-sm text-foreground">Naver Shopping</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    )}
                    {product.rakutenUrl && (
                      <a href={product.rakutenUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <span className="font-medium text-sm text-foreground">Rakuten</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                    Furniblog may earn a commission when you purchase through some links, at no extra cost to you.
                  </p>
                </div>

                {/* Chairpark CTA */}
                {product.tryAtChairpark && product.chairparkUrl && (
                  <div className="p-5 bg-foreground text-background rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Available in Korea</span>
                    </div>
                    <h3 className="font-serif text-lg font-medium mb-2">Try at Chairpark</h3>
                    <p className="text-sm text-background/70 mb-4">
                      Experience this chair in person at Chairpark showroom before you buy.
                    </p>
                    <a href={product.chairparkUrl} target="_blank" rel="noopener noreferrer" className="block w-full p-3 bg-background text-foreground rounded-lg text-center font-medium text-sm hover:bg-background/90 transition-colors">
                      Book Showroom Visit
                    </a>
                    <a href={product.chairparkUrl} target="_blank" rel="noopener noreferrer" className="block w-full p-3 mt-2 border border-background/30 rounded-lg text-center font-medium text-sm hover:bg-background/10 transition-colors">
                      Request Consultation
                    </a>
                  </div>
                )}

                {/* Compare Button */}
                <Link href={`/compare?products=${product.id}`} className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="font-medium text-sm text-foreground">Add to Compare</span>
                </Link>

                {/* Ad Placeholder */}
                <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
                  <p className="text-xs text-muted-foreground">Advertisement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:hidden z-50">
            <div className="flex gap-3">
              {product.officialUrl && (
                <a href={product.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="flex-1 p-3 bg-foreground text-background rounded-lg text-center font-medium text-sm">
                  Buy Now
                </a>
              )}
              <Link href={`/compare?products=${product.id}`} className="p-3 bg-muted rounded-lg text-foreground font-medium text-sm">
                Compare
              </Link>
            </div>
          </div>

          {/* Bottom padding for mobile sticky footer */}
          <div className="h-20 lg:hidden" />
        </div>
      </main>

      <Footer />
    </div>
  )
}

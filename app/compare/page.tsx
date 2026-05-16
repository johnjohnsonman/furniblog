"use client"

import { Suspense, useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { X, Plus, Check, ExternalLink, MapPin, Trophy, Award, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products, comparisons, getAverageScore } from "@/lib/data"

function ComparePageFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading comparison...</p>
      </main>
      <Footer />
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={<ComparePageFallback />}>
      <ComparePageContent />
    </Suspense>
  )
}

function ComparePageContent() {
  const searchParams = useSearchParams()
  const initialProducts = searchParams.get("products")?.split(",").filter(Boolean) || []
  
  const [selectedIds, setSelectedIds] = useState<string[]>(initialProducts)
  const [showProductPicker, setShowProductPicker] = useState(false)

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.includes(p.id)),
    [selectedIds]
  )

  // Determine winners
  const winners = useMemo(() => {
    if (selectedProducts.length < 2) return null
    
    const sorted = [...selectedProducts]
    const bestOverall = sorted.sort((a, b) => (getAverageScore(b) || 0) - (getAverageScore(a) || 0))[0]
    const bestValue = sorted.sort((a, b) => (b.scores?.value || 0) - (a.scores?.value || 0))[0]
    const bestLongHours = sorted.sort((a, b) => (b.scores?.longHourUse || 0) - (a.scores?.longHourUse || 0))[0]
    
    return { bestOverall, bestValue, bestLongHours }
  }, [selectedProducts])

  const addProduct = (id: string) => {
    if (selectedIds.length < 4 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id])
    }
    setShowProductPicker(false)
  }

  const removeProduct = (id: string) => {
    setSelectedIds(selectedIds.filter((i) => i !== id))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="font-serif text-3xl font-medium text-foreground">Compare Products</h1>
            <p className="mt-1 text-muted-foreground">Select up to 4 products to compare side by side</p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Product Selection */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-8">
            {selectedProducts.map((product) => {
              const score = getAverageScore(product)
              const isWinner = winners?.bestOverall?.id === product.id
              
              return (
                <div key={product.id} className={`relative p-3 bg-card rounded-lg border ${isWinner ? 'border-foreground' : 'border-border'}`}>
                  <button onClick={() => removeProduct(product.id)} className="absolute top-2 right-2 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10">
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                  
                  {isWinner && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-foreground text-background rounded text-xs font-medium flex items-center gap-1 z-10">
                      <Trophy className="h-3 w-3" /> Winner
                    </div>
                  )}
                  
                  <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-2">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                  <h3 className="text-sm font-medium text-foreground truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-medium text-sm">{product.price}</span>
                    {score && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{score}/100</span>}
                  </div>
                </div>
              )
            })}
            
            {selectedIds.length < 4 && (
              <button onClick={() => setShowProductPicker(true)} className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border border-dashed border-border hover:border-foreground/30 hover:bg-muted/50 transition-all min-h-[180px]">
                <Plus className="h-6 w-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Add Product</p>
              </button>
            )}
          </div>

          {/* Winners Section */}
          {winners && selectedProducts.length >= 2 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-8">
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  <Trophy className="h-3.5 w-3.5" /> Best Overall
                </div>
                <Link href={`/products/${winners.bestOverall.id}`} className="font-medium text-foreground hover:underline">{winners.bestOverall.name}</Link>
                <p className="text-sm text-muted-foreground">{winners.bestOverall.price}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  <Award className="h-3.5 w-3.5" /> Best Value
                </div>
                <Link href={`/products/${winners.bestValue.id}`} className="font-medium text-foreground hover:underline">{winners.bestValue.name}</Link>
                <p className="text-sm text-muted-foreground">{winners.bestValue.price}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  <Sparkles className="h-3.5 w-3.5" /> Best for Long Hours
                </div>
                <Link href={`/products/${winners.bestLongHours.id}`} className="font-medium text-foreground hover:underline">{winners.bestLongHours.name}</Link>
                <p className="text-sm text-muted-foreground">{winners.bestLongHours.price}</p>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {selectedProducts.length >= 2 && (
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">Spec</th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} className="text-left p-4 bg-muted/50 text-sm font-medium text-foreground">{product.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">Price</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 font-medium">{product.price}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">Rating</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-muted-foreground text-sm ml-1">({product.reviewCount})</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">Score</td>
                    {selectedProducts.map((product) => {
                      const score = getAverageScore(product)
                      return <td key={product.id} className="p-4 font-semibold">{score ? `${score}/100` : "-"}</td>
                    })}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">Best For</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">{product.bestFor || "-"}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">Type</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">{product.chairType || product.category}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">Warranty</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">{product.warranty || "-"}</td>
                    ))}
                  </tr>
                  
                  {/* Scores Section */}
                  {selectedProducts.some(p => p.scores) && (
                    <>
                      <tr className="border-b border-border bg-muted/30">
                        <td colSpan={selectedProducts.length + 1} className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Scores (out of 100)</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 text-sm text-muted-foreground">Comfort</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="p-4 font-medium">{product.scores?.comfort || "-"}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 text-sm text-muted-foreground">Ergonomics</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="p-4 font-medium">{product.scores?.ergonomics || "-"}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 text-sm text-muted-foreground">Build Quality</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="p-4 font-medium">{product.scores?.buildQuality || "-"}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 text-sm text-muted-foreground">Design</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="p-4 font-medium">{product.scores?.design || "-"}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 text-sm text-muted-foreground">Value</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="p-4 font-medium">{product.scores?.value || "-"}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="p-4 text-sm text-muted-foreground">Long Hour Use</td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className="p-4 font-medium">{product.scores?.longHourUse || "-"}</td>
                        ))}
                      </tr>
                    </>
                  )}

                  <tr className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">In Korea</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">
                        {product.availableInKorea ? <Check className="h-4 w-4 text-green-600" /> : <span className="text-muted-foreground">-</span>}
                      </td>
                    ))}
                  </tr>
                  
                  {/* CTA Row */}
                  <tr>
                    <td className="p-4 text-sm text-muted-foreground">Actions</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">
                        <div className="flex flex-col gap-2">
                          {product.officialUrl && (
                            <a href={product.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-foreground text-background rounded text-xs font-medium hover:bg-foreground/90 transition-colors">
                              Buy Now <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <Link href={`/products/${product.id}`} className="inline-flex items-center justify-center px-3 py-2 border border-border rounded text-xs font-medium hover:bg-muted transition-colors">
                            View Details
                          </Link>
                          {product.tryAtChairpark && (
                            <a href={product.chairparkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-border rounded text-xs font-medium hover:bg-muted transition-colors">
                              <MapPin className="h-3 w-3" /> Try at Chairpark
                            </a>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {selectedProducts.length < 2 && (
            <div className="text-center py-12 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Select at least 2 products to start comparing.</p>
            </div>
          )}

          {/* Affiliate Disclosure */}
          {selectedProducts.length >= 2 && (
            <p className="mt-6 text-xs text-muted-foreground text-center">
              Furniblog may earn a commission when you purchase through links on this page, at no extra cost to you.
            </p>
          )}

          {/* Popular Comparisons */}
          {selectedProducts.length === 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-xl font-medium text-foreground mb-6">Popular Comparisons</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {comparisons.map((comparison) => (
                  <Link key={comparison.id} href={`/compare?products=${comparison.products.map((p) => p.id).join(",")}`} className="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all">
                    <div className="flex items-center justify-center gap-2">
                      {comparison.products.map((product, idx) => (
                        <div key={product.id} className="flex items-center">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          {idx < comparison.products.length - 1 && <span className="mx-2 text-muted-foreground text-xs">vs</span>}
                        </div>
                      ))}
                    </div>
                    <h3 className="mt-3 text-center text-sm font-medium text-foreground">{comparison.title}</h3>
                    <p className="mt-1 text-center text-xs text-muted-foreground">{comparison.views.toLocaleString()} views</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ad Placeholder */}
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">Advertisement</p>
          </div>
        </div>

        {/* Product Picker Modal */}
        {showProductPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-foreground/20" onClick={() => setShowProductPicker(false)} />
            <div className="relative bg-background rounded-lg border border-border shadow-xl w-full max-w-xl max-h-[70vh] overflow-hidden m-4">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-medium text-foreground">Select a Product</h2>
                <button onClick={() => setShowProductPicker(false)} className="p-1 rounded hover:bg-muted">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto max-h-[55vh]">
                <div className="space-y-2">
                  {products.filter((p) => !selectedIds.includes(p.id)).map((product) => {
                    const score = getAverageScore(product)
                    return (
                      <button key={product.id} onClick={() => addProduct(product.id)} className="flex items-center gap-3 p-3 w-full rounded-lg border border-border hover:border-foreground/30 hover:bg-muted/50 transition-all text-left">
                        <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                          <h3 className="font-medium text-foreground truncate">{product.name}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">{product.price}</span>
                          {score && <p className="text-xs text-muted-foreground">{score}/100</p>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

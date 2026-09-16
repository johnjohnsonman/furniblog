import { getCatalogCards, getCatalogReviewCounts } from "@/lib/supabase/catalog-cards"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductsPageContent } from "./products-content"
import { Suspense } from "react"

// Query-string filtering keeps this route dynamic; catalog reads use a short
// shared cache so navigation does not wait on repeated database round trips.
export const revalidate = 60

export const metadata: Metadata = {
  title: "Office & Ergonomic Chairs Database",
  description:
    "Browse premium office, gaming and ergonomic chairs — specs, real reviews, videos and prices, all in one place.",
  alternates: { canonical: "/products" },
}

export default async function ProductsPage() {
  const [products, reviewCounts] = await Promise.all([
    getCatalogCards(),
    getCatalogReviewCounts(),
  ])
  const brands = Array.from(new Map(products.filter(p => p.brandId).map(p => [p.brandId, { id: p.brandId, slug: p.brandId, name: p.brand, productCount: products.filter(item => item.brandId === p.brandId).length }])).values()).sort((a,b) => a.name.localeCompare(b.name))
  const categoryCounts: Record<string, number> = {}
  for (const p of products) categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1
  const stats = {
    products: products.length,
    brands: brands.length,
    reviews: Object.values(reviewCounts).reduce((sum, item) => sum + item.count, 0),
    comparisons: 0,
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <Suspense fallback={<main className="min-h-[60vh]" aria-label="Loading chair catalog" />}>
      <ProductsPageContent
        products={products}
        brands={brands}
        reviewCounts={reviewCounts}
        stats={stats}
        categoryCounts={categoryCounts}
      />
      </Suspense>
      <Footer />
    </div>
  )
}

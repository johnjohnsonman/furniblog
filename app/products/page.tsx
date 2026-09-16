import { getCatalogCards, getCatalogReviewCounts, getCatalogStats } from "@/lib/supabase/catalog-cards"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductsPageContent } from "./products-content"
import { isChairCategory } from "@/lib/chair-categories"

// Read prices/specs fresh from the DB on every request so the catalog grid
// always matches the (force-dynamic) product detail page. Without this the list
// is statically cached at build time and shows stale prices after a DB update.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Office & Ergonomic Chairs Database",
  description:
    "Browse premium office, gaming and ergonomic chairs — specs, real reviews, videos and prices, all in one place.",
  alternates: { canonical: "/products" },
}

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const rawCategory = params.category ?? "All"
  const initialCategory =
    rawCategory === "All" || rawCategory === "all"
      ? "All"
      : isChairCategory(rawCategory.toLowerCase())
        ? rawCategory.toLowerCase()
        : "All"

  const [products, stats, reviewCounts] = await Promise.all([
    getCatalogCards(),
    getCatalogStats(),
    getCatalogReviewCounts(),
  ])
  const brands = Array.from(new Map(products.filter(p => p.brandId).map(p => [p.brandId, { id: p.brandId, slug: p.brandId, name: p.brand, productCount: products.filter(item => item.brandId === p.brandId).length }])).values()).sort((a,b) => a.name.localeCompare(b.name))
  const categoryCounts: Record<string, number> = {}
  for (const p of products) categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <ProductsPageContent
        products={products}
        brands={brands}
        reviewCounts={reviewCounts}
        stats={{ ...stats, products: products.length, brands: brands.length }}
        categoryCounts={categoryCounts}
        initialCategory={initialCategory}
        initialSearch={params.search ?? ""}
      />
      <Footer />
    </div>
  )
}

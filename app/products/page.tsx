import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductsPageContent } from "./products-content"
import { isChairCategory } from "@/lib/chair-categories"
import {
  getProducts,
  getBrandsForProductFilter,
  getSiteStats,
  getReviewCounts,
  getCategoryCounts,
} from "@/lib/supabase/queries"

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

  const [products, brands, stats, categoryCounts] = await Promise.all([
    getProducts(),
    getBrandsForProductFilter(),
    getSiteStats(),
    getCategoryCounts(),
  ])

  const reviewCounts = await getReviewCounts(products.map((p) => p.id))

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <ProductsPageContent
        products={products}
        brands={brands}
        reviewCounts={reviewCounts}
        stats={stats}
        categoryCounts={categoryCounts}
        initialCategory={initialCategory}
        initialSearch={params.search ?? ""}
      />
      <Footer />
    </div>
  )
}

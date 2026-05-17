import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductsPageContent } from "./products-content"
import { isChairCategory } from "@/lib/chair-categories"
import {
  getProducts,
  getBrands,
  getSiteStats,
  getReviewCounts,
} from "@/lib/supabase/queries"

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const rawCategory = params.category ?? "All"
  const initialCategory =
    rawCategory === "All"
      ? "All"
      : isChairCategory(rawCategory.toLowerCase())
        ? rawCategory.toLowerCase()
        : "All"

  const [products, brands, stats] = await Promise.all([
    getProducts(),
    getBrands(),
    getSiteStats(),
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
        initialCategory={initialCategory}
        initialSearch={params.search ?? ""}
      />
      <Footer />
    </div>
  )
}

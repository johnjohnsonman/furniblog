"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { ProductView } from "@/lib/data/mappers"
import type { Brand } from "@/types/brand"
import type { ReviewCountStats } from "@/lib/supabase/queries"
import type { SiteStats } from "@/lib/supabase/queries"
import { ChairCard } from "@/components/chairs/ChairCard"
import { cn } from "@/lib/utils"

const CATEGORY_PILLS = [
  { label: "All", value: "All" },
  { label: "Office", value: "office" },
  { label: "Executive", value: "executive" },
  { label: "Gaming", value: "gaming" },
  { label: "Standing", value: "standing" },
  { label: "Study", value: "study" },
] as const

const SORT_OPTIONS = [
  { label: "Best Rated", value: "rating" },
  { label: "Most Reviews", value: "reviews" },
  { label: "Price ↑", value: "price-low" },
  { label: "Price ↓", value: "price-high" },
] as const

export type ProductsPageContentProps = {
  products: ProductView[]
  brands: Brand[]
  reviewCounts: Record<string, ReviewCountStats>
  stats: SiteStats
  initialCategory?: string
  initialSearch?: string
}

export function ProductsPageContent({
  products,
  brands,
  reviewCounts,
  stats,
  initialCategory = "All",
  initialSearch = "",
}: ProductsPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [searchQuery] = useState(initialSearch)

  const filteredProducts = useMemo(() => {
    let filtered = products

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (selectedBrand !== "All") {
      filtered = filtered.filter((p) => p.brandId === selectedBrand)
    }

    const withStats = filtered.map((p) => {
      const statsForProduct = reviewCounts[p.id]
      return {
        product: p,
        reviewCount: statsForProduct?.count ?? p.reviewCount ?? 0,
        avgScore:
          statsForProduct?.avgScore && statsForProduct.avgScore > 0
            ? statsForProduct.avgScore
            : p.rating,
      }
    })

    switch (sortBy) {
      case "reviews":
        return [...withStats].sort((a, b) => b.reviewCount - a.reviewCount)
      case "price-low": {
        const priceOrder = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
        return [...withStats].sort(
          (a, b) =>
            priceOrder[a.product.priceRange] - priceOrder[b.product.priceRange]
        )
      }
      case "price-high": {
        const priceOrder = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
        return [...withStats].sort(
          (a, b) =>
            priceOrder[b.product.priceRange] - priceOrder[a.product.priceRange]
        )
      }
      case "rating":
      default:
        return [...withStats].sort((a, b) => b.avgScore - a.avgScore)
    }
  }, [
    products,
    reviewCounts,
    selectedCategory,
    selectedBrand,
    sortBy,
    searchQuery,
  ])

  return (
    <main className="flex-1 bg-premium-bg">
      {/* Header */}
      <section className="border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-14">
          <h1 className="font-serif text-[40px] font-medium leading-tight text-premium-text">
            Premium Chair Database
          </h1>
          <p className="mt-3 text-lg text-premium-text-secondary">
            Discover the world&apos;s finest ergonomic seating
          </p>
          <p className="mt-4 text-sm text-premium-text-tertiary">
            {stats.products.toLocaleString()} chairs ·{" "}
            {stats.brands.toLocaleString()} brands ·{" "}
            {stats.reviews.toLocaleString()} reviews
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section className="sticky top-0 z-20 border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_PILLS.map((pill) => {
              const active = selectedCategory === pill.value
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setSelectedCategory(pill.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-premium-accent text-white"
                      : "border border-premium-border bg-white text-premium-text hover:border-premium-border-hover"
                  )}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="appearance-none rounded-sm border border-premium-border bg-white py-2 pl-3 pr-9 text-sm text-premium-text focus:outline-none focus:ring-1 focus:ring-premium-accent"
                aria-label="Brand"
              >
                <option value="All">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-text-tertiary" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-sm border border-premium-border bg-white py-2 pl-3 pr-9 text-sm text-premium-text focus:outline-none focus:ring-1 focus:ring-premium-accent"
                aria-label="Sort"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-text-tertiary" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(({ product, reviewCount, avgScore }) => (
              <ChairCard
                key={product.id}
                product={product}
                reviewCount={reviewCount}
                avgScore={avgScore}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-premium-text-secondary">
              No products found matching your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All")
                setSelectedBrand("All")
              }}
              className="mt-4 text-sm font-medium text-premium-text underline-offset-4 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

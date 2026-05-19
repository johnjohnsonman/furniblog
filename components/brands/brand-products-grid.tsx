"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { ProductView } from "@/lib/data/mappers"
import type { ReviewCountStats } from "@/lib/supabase/queries"
import { ChairCard } from "@/components/chairs/ChairCard"

const SORT_OPTIONS = [
  { label: "Best Rated", value: "rating" },
  { label: "Name A–Z", value: "name" },
  { label: "Price ↑", value: "price-low" },
  { label: "Price ↓", value: "price-high" },
] as const

type BrandProductsGridProps = {
  products: ProductView[]
  reviewCounts: Record<string, ReviewCountStats>
  brandName: string
}

export function BrandProductsGrid({
  products,
  reviewCounts,
  brandName,
}: BrandProductsGridProps) {
  const [sortBy, setSortBy] = useState<string>("rating")

  const sorted = useMemo(() => {
    const withStats = products.map((product) => {
      const stats = reviewCounts[product.id]
      return {
        product,
        reviewCount: stats?.count ?? product.reviewCount ?? 0,
        avgScore:
          stats?.avgScore && stats.avgScore > 0
            ? stats.avgScore
            : product.rating,
      }
    })

    switch (sortBy) {
      case "name":
        return [...withStats].sort((a, b) =>
          a.product.name.localeCompare(b.product.name)
        )
      case "price-low": {
        const order = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
        return [...withStats].sort(
          (a, b) =>
            order[a.product.priceRange] - order[b.product.priceRange]
        )
      }
      case "price-high": {
        const order = { $: 1, $$: 2, $$$: 3, $$$$: 4 }
        return [...withStats].sort(
          (a, b) =>
            order[b.product.priceRange] - order[a.product.priceRange]
        )
      }
      case "rating":
      default:
        return [...withStats].sort((a, b) => b.avgScore - a.avgScore)
    }
  }, [products, reviewCounts, sortBy])

  return (
    <section id="chairs" className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-medium text-foreground md:text-3xl">
          Chairs by {brandName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length}{" "}
          {products.length === 1 ? "chair" : "chairs"} in our database
        </p>
      </div>

      <div className="mb-8 flex justify-end">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none rounded-sm border border-border bg-background py-2 pl-3 pr-9 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/30"
            aria-label="Sort chairs"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map(({ product, reviewCount, avgScore }) => (
            <ChairCard
              key={product.id}
              product={product}
              reviewCount={reviewCount}
              avgScore={avgScore}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">
            No chairs listed for this brand yet.
          </p>
        </div>
      )}
    </section>
  )
}

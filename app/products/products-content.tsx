"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { ProductView } from "@/lib/data/mappers"
import type { Brand } from "@/types/brand"
import type {
  ReviewCountStats,
  SiteStats,
  CategoryCountMap,
} from "@/lib/supabase/queries"
import { PRODUCT_LIST_CATEGORIES } from "@/lib/chair-categories"
import { ChairCard } from "@/components/chairs/ChairCard"
import { cn } from "@/lib/utils"

const SORT_OPTIONS = [
  { label: "Best Rated", value: "rating" },
  { label: "Most Reviews", value: "reviews" },
  { label: "Price ↑", value: "price-low" },
  { label: "Price ↓", value: "price-high" },
  { label: "Newest", value: "newest" },
] as const

export type ProductsPageContentProps = {
  products: ProductView[]
  brands: Brand[]
  reviewCounts: Record<string, ReviewCountStats>
  stats: SiteStats
  categoryCounts: CategoryCountMap
  initialCategory?: string
  initialSearch?: string
}

function resolvePriceUsd(product: ProductView): number | null {
  if (product.priceUsd != null && product.priceUsd > 0) {
    return product.priceUsd
  }
  return null
}

export function ProductsPageContent({
  products,
  brands,
  reviewCounts,
  stats,
  categoryCounts,
  initialCategory = "All",
  initialSearch = "",
}: ProductsPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [searchQuery] = useState(initialSearch)

  const totalChairs = stats.products

  const categoryPills = useMemo(() => {
    return PRODUCT_LIST_CATEGORIES.filter((cat) => {
      if (cat.value === "All") return true
      return (categoryCounts[cat.value] ?? 0) > 0
    }).map((cat) => {
      const count =
        cat.value === "All" ? totalChairs : (categoryCounts[cat.value] ?? 0)
      return {
        ...cat,
        count,
        displayLabel: `${cat.label} (${count})`,
      }
    })
  }, [categoryCounts, totalChairs])

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
      const brandMeta = brands.find(
        (b) => b.id === selectedBrand || b.slug === selectedBrand
      )
      filtered = filtered.filter(
        (p) =>
          p.brandId === selectedBrand ||
          p.brandId === brandMeta?.slug ||
          (brandMeta &&
            p.brand.toLowerCase() === brandMeta.name.toLowerCase())
      )
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
      case "price-low":
        return [...withStats].sort((a, b) => {
          const pa = resolvePriceUsd(a.product)
          const pb = resolvePriceUsd(b.product)
          if (pa == null && pb == null) return 0
          if (pa == null) return 1
          if (pb == null) return -1
          return pa - pb
        })
      case "price-high":
        return [...withStats].sort((a, b) => {
          const pa = resolvePriceUsd(a.product)
          const pb = resolvePriceUsd(b.product)
          if (pa == null && pb == null) return 0
          if (pa == null) return 1
          if (pb == null) return -1
          return pb - pa
        })
      case "newest":
        return [...withStats].sort((a, b) => {
          const da = new Date(a.product.publishedAt ?? 0).getTime()
          const db = new Date(b.product.publishedAt ?? 0).getTime()
          return db - da
        })
      case "rating":
      default:
        return [...withStats].sort((a, b) => b.avgScore - a.avgScore)
    }
  }, [
    products,
    brands,
    reviewCounts,
    selectedCategory,
    selectedBrand,
    sortBy,
    searchQuery,
  ])

  // Pagination over the filtered/sorted list.
  const PAGE_SIZE = 24
  const [page, setPage] = useState(1)
  const gridTopRef = useRef<HTMLDivElement>(null)

  // Reset to page 1 whenever filters/sort/search change.
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, selectedBrand, sortBy, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )
  const firstShown = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const lastShown = Math.min(currentPage * PAGE_SIZE, filteredProducts.length)

  function goToPage(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages))
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main className="flex-1 bg-premium-bg">
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

      <section className="sticky top-0 z-20 border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categoryPills.map((pill) => {
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
                  {pill.displayLabel}
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
                  <option key={b.slug} value={b.slug}>
                    {b.name} ({b.productCount})
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

      <section ref={gridTopRef} className="mx-auto max-w-7xl px-6 py-10">
        {filteredProducts.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-premium-text-tertiary">
              Showing {firstShown.toLocaleString()}–{lastShown.toLocaleString()} of{" "}
              {filteredProducts.length.toLocaleString()} chairs
            </p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map(({ product, reviewCount, avgScore }) => (
                <ChairCard
                  key={product.id}
                  product={product}
                  reviewCount={reviewCount}
                  avgScore={avgScore}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pager
                current={currentPage}
                total={totalPages}
                onGo={goToPage}
              />
            )}
          </>
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

function Pager({
  current,
  total,
  onGo,
}: {
  current: number
  total: number
  onGo: (p: number) => void
}) {
  // Compact window of page numbers around the current page.
  const wanted = new Set([1, total, current - 1, current, current + 1])
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onGo(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
        className="grid h-9 w-9 place-items-center rounded-md border border-premium-border bg-white text-premium-text transition-colors hover:border-premium-border-hover disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1
        return (
          <span key={p} className="flex items-center">
            {gap && <span className="px-1 text-premium-text-tertiary">…</span>}
            <button
              type="button"
              onClick={() => onGo(p)}
              aria-current={p === current ? "page" : undefined}
              className={cn(
                "h-9 min-w-9 rounded-md px-3 text-sm font-medium transition-colors",
                p === current
                  ? "bg-premium-accent text-white"
                  : "border border-premium-border bg-white text-premium-text hover:border-premium-border-hover"
              )}
            >
              {p}
            </button>
          </span>
        )
      })}
      <button
        type="button"
        onClick={() => onGo(current + 1)}
        disabled={current === total}
        aria-label="Next page"
        className="grid h-9 w-9 place-items-center rounded-md border border-premium-border bg-white text-premium-text transition-colors hover:border-premium-border-hover disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}

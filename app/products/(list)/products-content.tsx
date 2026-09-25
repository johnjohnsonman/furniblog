"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import type { ProductCardView } from "@/lib/data/mappers"
import type { Brand } from "@/types/brand"
import type {
  ReviewCountStats,
  SiteStats,
  CategoryCountMap,
} from "@/lib/supabase/queries"
import { PRODUCT_LIST_CATEGORIES } from "@/lib/chair-categories"
import { ChairCard } from "@/components/chairs/ChairCard"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import { PRODUCTS_PAGE_SIZE, productsPageHref } from "@/lib/products/listing-order"

const SORT_OPTIONS = [
  { label: "Most Reviews", value: "reviews" },
  { label: "Brand / Product A–Z", value: "az" },
  { label: "Random", value: "random" },
  { label: "Price ↑", value: "price-low" },
  { label: "Price ↓", value: "price-high" },
  { label: "Newest", value: "newest" },
] as const

export type ProductsPageContentProps = {
  products: ProductCardView[]
  brands: Pick<Brand, "id" | "slug" | "name" | "productCount">[]
  reviewCounts: Record<string, ReviewCountStats>
  stats: SiteStats
  categoryCounts: CategoryCountMap
  initialCategory?: string
  initialSearch?: string
  /** Page requested via ?page=N (server-rendered so crawlers see that page). */
  initialPage?: number
  pageSize?: number
}

/** Stable pseudo-random rank for the visitor-chosen "Random" sort. */
function seededRank(id: string, seed: number): number {
  let h = seed | 0
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 2654435761)
  return (h >>> 0) / 4294967296
}

function resolvePriceUsd(product: ProductCardView): number | null {
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
  initialPage = 1,
  pageSize = PRODUCTS_PAGE_SIZE,
}: ProductsPageContentProps) {
  const params = useSearchParams()
  const requestedCategory = params.get("category") ?? initialCategory
  const resolvedCategory = PRODUCT_LIST_CATEGORIES.some((item) => item.value.toLowerCase() === requestedCategory.toLowerCase())
    ? (PRODUCT_LIST_CATEGORIES.find((item) => item.value.toLowerCase() === requestedCategory.toLowerCase())?.value ?? "All")
    : "All"
  const [selectedCategory, setSelectedCategory] = useState(resolvedCategory)
  const [selectedBrand, setSelectedBrand] = useState("All")
  // Default order comes from the server (most reviewed, then brand/name).
  const [sortBy, setSortBy] = useState<string>("reviews")
  // Random is only an explicit visitor choice; reshuffled each time it is picked.
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [searchQuery, setSearchQuery] = useState(params.get("search") ?? initialSearch)

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
        // Live count from the reviews table; the products.review_count column
        // is stale, so don't fall back to it.
        reviewCount: statsForProduct?.count ?? 0,
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
      case "az":
        return [...withStats].sort((a, b) => `${a.product.brand} ${a.product.name}`.localeCompare(`${b.product.brand} ${b.product.name}`))
      case "random": {
        return [...withStats].sort((a, b) => seededRank(a.product.id, shuffleSeed) - seededRank(b.product.id, shuffleSeed))
      }
      default:
        return withStats
    }
  }, [
    products,
    brands,
    reviewCounts,
    selectedCategory,
    selectedBrand,
    sortBy,
    searchQuery,
    shuffleSeed,
  ])

  // Pagination over the filtered/sorted list. The page lives in ?page=N so each
  // page is a real, crawlable URL; clicks update the URL without a server trip.
  const PAGE_SIZE = pageSize
  const [page, setPage] = useState(initialPage)
  const gridTopRef = useRef<HTMLDivElement>(null)
  const urlPage = Number(params.get("page")) || 1

  // Follow back/forward navigation between listing pages.
  useEffect(() => {
    setPage(urlPage)
  }, [urlPage])

  // Reset to page 1 whenever filters/sort/search change (not on first render).
  const filtersKey = [selectedCategory, selectedBrand, sortBy, searchQuery, shuffleSeed].join("|")
  const lastFiltersKey = useRef(filtersKey)
  useEffect(() => {
    if (lastFiltersKey.current === filtersKey) return
    lastFiltersKey.current = filtersKey
    setPage(1)
    if (params.get("page")) window.history.replaceState(null, "", productsPageHref(1, params))
  }, [filtersKey, params])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )
  const firstShown = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const lastShown = Math.min(currentPage * PAGE_SIZE, filteredProducts.length)

  function goToPage(p: number) {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
    window.history.pushState(null, "", productsPageHref(next, params))
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main className="flex-1 bg-premium-bg">
      <section className="border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-12 md:py-14">
          <h1 className="font-serif text-3xl font-medium leading-tight text-premium-text sm:text-[40px]">
            Premium Chair Database
          </h1>
          <p className="mt-2 text-sm sm:text-lg text-premium-text-secondary">
            Discover the world&apos;s finest ergonomic seating
          </p>
          <p className="mt-4 text-sm text-premium-text-tertiary">
            {stats.products.toLocaleString()} chairs ·{" "}
            {stats.brands.toLocaleString()} brands ·{" "}
            summarized from {stats.reviews.toLocaleString()} reviews worldwide
          </p>
        </div>
      </section>

      <section className="sm:sticky sm:top-14 z-20 border-b border-[#E5E5E5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap">
            {categoryPills.map((pill) => {
              const active = selectedCategory === pill.value
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setSelectedCategory(pill.value)}
                  className={cn(
                    "shrink-0 whitespace-nowrap min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors",
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-premium-text-tertiary" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chairs…"
                aria-label="Search chairs"
                className="w-full rounded-sm border border-premium-border bg-white min-h-11 py-2 pl-9 pr-3 text-base sm:text-sm text-premium-text focus:outline-none focus:ring-1 focus:ring-premium-accent sm:w-56"
              />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full appearance-none rounded-sm border border-premium-border bg-white min-h-11 py-2 pl-3 pr-9 text-base sm:text-sm text-premium-text focus:outline-none focus:ring-1 focus:ring-premium-accent sm:w-auto"
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

            <div className="relative flex-1 sm:flex-none">
              <select
                value={sortBy}
                onChange={(e) => {
                  if (e.target.value === "random") setShuffleSeed(Date.now())
                  setSortBy(e.target.value)
                }}
                className="w-full appearance-none rounded-sm border border-premium-border bg-white min-h-11 py-2 pl-3 pr-9 text-base sm:text-sm text-premium-text focus:outline-none focus:ring-1 focus:ring-premium-accent sm:w-auto"
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

      <section ref={gridTopRef} className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-10">
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
                hrefFor={(p) => productsPageHref(p, params)}
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
                setSearchQuery("")
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
  hrefFor,
}: {
  current: number
  total: number
  onGo: (p: number) => void
  hrefFor: (p: number) => string
}) {
  // Compact window of page numbers around the current page. Real links so
  // crawlers can reach every listing page; clicks stay client-side.
  const wanted = new Set([1, total, current - 1, current, current + 1])
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const go = (p: number) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    onGo(p)
  }
  const arrow = "grid h-11 w-11 place-items-center rounded-md border border-premium-border bg-white text-premium-text transition-colors hover:border-premium-border-hover"

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      {current > 1 ? (
        <a href={hrefFor(current - 1)} onClick={go(current - 1)} rel="prev" aria-label="Previous page" className={arrow}>
          <ChevronLeft className="h-4 w-4" />
        </a>
      ) : (
        <span aria-hidden="true" className={cn(arrow, "opacity-40")}><ChevronLeft className="h-4 w-4" /></span>
      )}
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1
        return (
          <span key={p} className="flex items-center">
            {gap && <span className="px-1 text-premium-text-tertiary">…</span>}
            <a
              href={hrefFor(p)}
              onClick={go(p)}
              aria-current={p === current ? "page" : undefined}
              className={cn(
                "grid h-11 min-w-11 place-items-center rounded-md px-3 text-sm font-medium transition-colors",
                p === current
                  ? "bg-premium-accent text-white"
                  : "border border-premium-border bg-white text-premium-text hover:border-premium-border-hover"
              )}
            >
              {p}
            </a>
          </span>
        )
      })}
      {current < total ? (
        <a href={hrefFor(current + 1)} onClick={go(current + 1)} rel="next" aria-label="Next page" className={arrow}>
          <ChevronRight className="h-4 w-4" />
        </a>
      ) : (
        <span aria-hidden="true" className={cn(arrow, "opacity-40")}><ChevronRight className="h-4 w-4" /></span>
      )}
    </nav>
  )
}

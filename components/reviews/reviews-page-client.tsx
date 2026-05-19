"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import type { Brand } from "@/types/brand"
import type { ReviewFeedItem, ReviewsFeedMeta } from "@/lib/reviews/feed-types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ReviewListItem } from "./review-list-item"
import { ReviewsFeedSkeleton } from "./reviews-feed-skeleton"

const PAGE_SIZE = 20

const CATEGORY_PILLS = [
  { label: "All", value: "all" },
  { label: "Office", value: "office" },
  { label: "Executive", value: "executive" },
  { label: "Gaming", value: "gaming" },
  { label: "Study", value: "study" },
  { label: "Standing", value: "standing" },
] as const

const SOURCE_OPTIONS = [
  { label: "All Sources", value: "all" },
  { label: "Chairpark", value: "chairpark" },
  { label: "Reddit", value: "reddit" },
  { label: "YouTube", value: "youtube" },
  { label: "DC Inside", value: "dcinside" },
  { label: "Naver", value: "naver" },
  { label: "Japan", value: "japan_community" },
  { label: "Review Sites", value: "review_sites" },
  { label: "Hacker News", value: "hackernews" },
  { label: "Trustpilot", value: "trustpilot" },
] as const

const SORT_OPTIONS = [
  { label: "Most Recent", value: "recent" },
  { label: "Highest Rated", value: "rating" },
  { label: "Most Relevant", value: "relevance" },
] as const

const PERIOD_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
] as const

type ReviewsPageClientProps = {
  initialMeta: ReviewsFeedMeta
  brands: Brand[]
}

function buildQueryString(params: {
  search: string
  category: string
  brand: string
  source: string
  sort: string
  period: string
}) {
  const q = new URLSearchParams()
  if (params.search) q.set("search", params.search)
  if (params.category !== "all") q.set("category", params.category)
  if (params.brand !== "all") q.set("brand", params.brand)
  if (params.source !== "all") q.set("source", params.source)
  if (params.sort !== "recent") q.set("sort", params.sort)
  if (params.period !== "all") q.set("period", params.period)
  return q.toString()
}

export function ReviewsPageClient({
  initialMeta,
  brands,
}: ReviewsPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [meta] = useState(initialMeta)
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? ""
  )
  const [reviews, setReviews] = useState<ReviewFeedItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const category = searchParams.get("category") ?? "all"
  const brand = searchParams.get("brand") ?? "all"
  const source = searchParams.get("source") ?? "all"
  const sort = searchParams.get("sort") ?? "recent"
  const period = searchParams.get("period") ?? "all"
  const search = searchParams.get("search") ?? ""

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filterKey = `${search}|${category}|${brand}|${source}|${sort}|${period}`

  const updateUrl = useCallback(
    (next: {
      search?: string
      category?: string
      brand?: string
      source?: string
      sort?: string
      period?: string
    }) => {
      const qs = buildQueryString({
        search: next.search ?? search,
        category: next.category ?? category,
        brand: next.brand ?? brand,
        source: next.source ?? source,
        sort: next.sort ?? sort,
        period: next.period ?? period,
      })
      router.replace(qs ? `/reviews?${qs}` : "/reviews", { scroll: false })
    },
    [router, search, category, brand, source, sort, period]
  )

  const fetchReviews = useCallback(
    async (targetPage: number, append: boolean) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(PAGE_SIZE),
          category,
          brand,
          source,
          sort,
          period,
        })
        if (search) params.set("search", search)

        const res = await fetch(`/api/reviews?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Failed to load reviews")

        const items = (data.reviews ?? []) as ReviewFeedItem[]
        setTotal(data.total ?? 0)
        setReviews((prev) => (append ? [...prev, ...items] : items))
        setPage(targetPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews")
        if (!append) {
          setReviews([])
          setTotal(0)
        }
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [category, brand, source, sort, period, search]
  )

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    setPage(1)
    void fetchReviews(1, false)
  }, [filterKey, fetchReviews])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (searchInput === search) return
      updateUrl({ search: searchInput })
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput, search, updateUrl])

  const visibleCount = reviews.length
  const hasMore = visibleCount < total

  const resultLabel = useMemo(() => {
    if (search) {
      return `${total.toLocaleString()} review${total === 1 ? "" : "s"} matching "${search}"`
    }
    return null
  }, [search, total])

  const sortedBrands = useMemo(
    () => [...brands].sort((a, b) => a.name.localeCompare(b.name)),
    [brands]
  )

  function handleFilterChange(
    key: "category" | "brand" | "source" | "sort" | "period",
    value: string
  ) {
    updateUrl({ [key]: value })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Review Feed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
          Real chair reviews from Reddit, YouTube, forums, and more—search by
          product, feature, or comfort topic.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {meta.reviews.toLocaleString()} reviews · {meta.brands.toLocaleString()}{" "}
          brands · {meta.sources.toLocaleString()} sources
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search reviews... (Aeron, lumbar, etc.)"
          className="h-12 pl-12 text-base rounded-lg border-[#EFEFEF]"
        />
      </div>

      {resultLabel && (
        <p className="mb-3 text-sm font-medium text-foreground">{resultLabel}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {CATEGORY_PILLS.map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => handleFilterChange("category", pill.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === pill.value
                ? "border-foreground bg-foreground text-background"
                : "border-[#EFEFEF] bg-white text-foreground hover:border-neutral-300"
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Select value={brand} onValueChange={(v) => handleFilterChange("brand", v)}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {sortedBrands.map((b) => (
              <SelectItem key={b.slug} value={b.slug}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={(v) => handleFilterChange("source", v)}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => handleFilterChange("sort", v)}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={(v) => handleFilterChange("period", v)}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <ReviewsFeedSkeleton />
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border border-[#EFEFEF] bg-white px-6 py-16 text-center">
          <p className="font-medium text-foreground">
            {search
              ? `No reviews found for "${search}"`
              : "No reviews found"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term or clear filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchInput("")
              router.replace("/reviews", { scroll: false })
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewListItem key={review.id} review={review} />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {visibleCount.toLocaleString()} of{" "}
              {total.toLocaleString()} reviews
            </p>
            {hasMore && (
              <Button
                variant="outline"
                size="lg"
                disabled={loadingMore}
                onClick={() => void fetchReviews(page + 1, true)}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

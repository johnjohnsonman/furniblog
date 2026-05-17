"use client"

import { useEffect, useMemo, useState } from "react"
import type { FeedReview } from "@/lib/data/reviews"
import { getBrandsForCategory } from "@/lib/data/reviews"
import {
  filterReviews,
  getProfileHighlights,
  sortReviews,
  type ReviewFilters,
} from "@/lib/reviews/review-filters"
import { buildFeedRecommendation } from "@/lib/reviews/feed-recommendations"
import {
  getDefaultFilters,
  mergeWithSavedProfile,
  saveProfile,
} from "@/lib/reviews/profile-storage"
import { Button } from "@/components/ui/button"
import { FeedReviewCard } from "./feed-review-card"
import { ReviewsFeedFilters } from "./reviews-feed-filters"
import { SmartRecommendationBanner } from "./smart-recommendation-banner"
import { ReviewsFeedSidebar } from "./reviews-feed-sidebar"

const PAGE_SIZE = 6

interface ReviewsFeedProps {
  reviews: FeedReview[]
}

export function ReviewsFeed({ reviews }: ReviewsFeedProps) {
  const [filters, setFilters] = useState<ReviewFilters>(getDefaultFilters)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setFilters(mergeWithSavedProfile(getDefaultFilters()))
    setProfileLoaded(true)
  }, [])

  const brandsInCategory = useMemo(
    () => getBrandsForCategory(reviews, filters.category),
    [reviews, filters.category]
  )

  const filtered = useMemo(() => {
    const list = filterReviews(reviews, filters)
    return sortReviews(list, filters.sort, filters)
  }, [reviews, filters])

  const recommendation = useMemo(
    () => buildFeedRecommendation(filtered, filters),
    [filtered, filters]
  )

  const sidebarBrandCounts = useMemo(
    () => getBrandsForCategory(reviews, filters.category),
    [reviews, filters.category]
  )

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function resetPagination() {
    setVisibleCount(PAGE_SIZE)
  }

  function handleFiltersChange(next: ReviewFilters) {
    setFilters(next)
    resetPagination()
  }

  function handleClear() {
    setFilters(getDefaultFilters())
    resetPagination()
  }

  function handleSaveProfile() {
    saveProfile(filters)
  }

  function handleSidebarBrand(brandId: string) {
    const next =
      brandId === "all"
        ? []
        : filters.brandIds.includes(brandId)
          ? filters.brandIds.filter((id) => id !== brandId)
          : [brandId]
    handleFiltersChange({ ...filters, brandIds: next })
  }

  if (!profileLoaded) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Review Feed
        </h1>
        <p className="mt-2 text-muted-foreground text-sm max-w-2xl">
          Find reviews from people like you—filter by body type, work habits,
          and health needs across Chairpark, Reddit, YouTube, and more.
        </p>
      </div>

      <ReviewsFeedFilters
        filters={filters}
        onChange={handleFiltersChange}
        matchCount={filtered.length}
        brands={brandsInCategory}
        onClear={handleClear}
        onSaveProfile={handleSaveProfile}
      />

      {recommendation && (
        <div className="mt-6">
          <SmartRecommendationBanner recommendation={recommendation} />
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8 mt-8">
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <ReviewsFeedSidebar
              brandCounts={sidebarBrandCounts}
              activeBrandId={
                filters.brandIds.length === 1 ? filters.brandIds[0] : "all"
              }
              onBrandClick={handleSidebarBrand}
            />
          </div>
        </div>

        <div>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              No reviews match your filters. Try widening height or weight
              ranges, or clear profile filters.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visible.map((review) => (
                  <FeedReviewCard
                    key={review.id}
                    review={review}
                    highlights={getProfileHighlights(review, filters)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  >
                    Load more ({filtered.length - visibleCount} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

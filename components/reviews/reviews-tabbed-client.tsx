"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Brand } from "@/types/brand"
import type { ReviewFeedItem, ReviewsFeedMeta } from "@/lib/reviews/feed-types"
import { ReviewsPageClient } from "@/components/reviews/reviews-page-client"
import { ExperienceReviewsBrowser } from "@/components/reviews/experience-reviews-browser"
import { WriteReviewCTA } from "@/components/reviews/write-review-cta"
import type { ExperienceReviewCard } from "@/components/reviews/experience-reviews-list"

export function ReviewsTabbedClient({
  initialMeta,
  brands,
  experienceItems,
  initialReviews = [],
  initialTotal = 0,
  initialSeed,
}: {
  initialMeta: ReviewsFeedMeta
  brands: Brand[]
  experienceItems: ExperienceReviewCard[]
  initialReviews?: ReviewFeedItem[]
  initialTotal?: number
  initialSeed?: number
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Reviews
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Real, hands-on rankings from people like you — plus web-collected reviews.
        </p>
      </div>

      <div className="mb-8">
        <WriteReviewCTA />
      </div>

      <Tabs defaultValue="experience" className="w-full">
        <TabsList className="mb-5 w-full justify-start">
          <TabsTrigger value="experience">Experience Reviews</TabsTrigger>
          <TabsTrigger value="web">Web Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="experience">
          <ExperienceReviewsBrowser items={experienceItems} />
        </TabsContent>

        <TabsContent value="web">
          <ReviewsPageClient
            initialMeta={initialMeta}
            brands={brands}
            initialReviews={initialReviews}
            initialTotal={initialTotal}
            initialSeed={initialSeed}
            compact
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

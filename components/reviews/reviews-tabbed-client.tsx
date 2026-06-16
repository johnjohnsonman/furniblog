"use client"

import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { Brand } from "@/types/brand"
import type { ReviewsFeedMeta } from "@/lib/reviews/feed-types"
import { Button } from "@/components/ui/button"
import { ReviewsPageClient } from "@/components/reviews/reviews-page-client"
import { ExperienceReviewsBrowser } from "@/components/reviews/experience-reviews-browser"
import type { ExperienceReviewCard } from "@/components/reviews/experience-reviews-list"

export function ReviewsTabbedClient({
  initialMeta,
  brands,
  experienceItems,
}: {
  initialMeta: ReviewsFeedMeta
  brands: Brand[]
  experienceItems: ExperienceReviewCard[]
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Reviews
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            See both hands-on experience reviews and web-collected reviews.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/reviews/new">Write a Review</Link>
        </Button>
      </div>

      <Tabs defaultValue="web" className="w-full">
        <TabsList className="mb-5 w-full justify-start">
          <TabsTrigger value="experience">Experience Reviews</TabsTrigger>
          <TabsTrigger value="web">Web Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="experience">
          <ExperienceReviewsBrowser items={experienceItems} />
        </TabsContent>

        <TabsContent value="web">
          <ReviewsPageClient initialMeta={initialMeta} brands={brands} compact />
        </TabsContent>
      </Tabs>
    </div>
  )
}

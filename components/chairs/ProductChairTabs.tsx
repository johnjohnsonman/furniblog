"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Review } from "@/types/review"
import { ChairReviewsSection } from "./ChairReviewsSection"
import { WhereToBuySection } from "@/components/affiliate/WhereToBuySection"
import type { CatalogAffiliateLink } from "@/lib/data/affiliate-links"

interface ProductChairTabsProps {
  productId: string
  productName: string
  catalogLinks: CatalogAffiliateLink[]
  reviews: Review[]
  reviewCount: number
  defaultPrice?: string
  overview: React.ReactNode
  specs: React.ReactNode
}

export function ProductChairTabs({
  productId,
  productName,
  catalogLinks,
  reviews,
  reviewCount,
  defaultPrice,
  overview,
  specs,
}: ProductChairTabsProps) {
  return (
    <Tabs defaultValue="overview" className="mt-10 w-full">
      <TabsList className="w-full flex-wrap h-auto justify-start gap-1">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="specs">Specs</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
        <TabsTrigger value="purchase">Where to buy</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-8 space-y-0">
        {overview}
      </TabsContent>

      <TabsContent value="specs" className="mt-8 space-y-0">
        {specs}
      </TabsContent>

      <TabsContent value="reviews" className="mt-8">
        <ChairReviewsSection reviews={reviews} />
      </TabsContent>

      <TabsContent value="purchase" className="mt-8">
        <WhereToBuySection
          productId={productId}
          productName={productName}
          catalogLinks={catalogLinks}
          defaultPrice={defaultPrice}
        />
      </TabsContent>
    </Tabs>
  )
}

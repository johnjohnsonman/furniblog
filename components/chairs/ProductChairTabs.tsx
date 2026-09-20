"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
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
  videos?: React.ReactNode
  videoCount?: number
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
  videos,
  videoCount = 0,
}: ProductChairTabsProps) {
  const hasVideos = Boolean(videos) && videoCount > 0
  const [tab, setTab] = useState("overview")
  const ref = useRef<HTMLDivElement>(null)

  // Let in-page links (e.g. the "read what N reviews say" button under the
  // videos) switch tabs reliably — programmatically clicking a Radix trigger is
  // unreliable, so use a custom event into this controlled Tabs instead.
  useEffect(() => {
    function onSelect(e: Event) {
      const detail = (e as CustomEvent<string>).detail
      if (typeof detail === "string" && ["overview", "specs", "reviews", "purchase", ...(hasVideos ? ["videos"] : [])].includes(detail)) {
        setTab(detail)
        requestAnimationFrame(() =>
          ref.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })
        )
      }
    }
    window.addEventListener("product-select-tab", onSelect)
    return () => window.removeEventListener("product-select-tab", onSelect)
  }, [hasVideos])

  return (
    <div ref={ref} className="scroll-mt-20">
      <Tabs value={tab} onValueChange={setTab} className="mt-5 w-full">
      <TabsList className={`grid h-auto w-full grid-cols-2 gap-px rounded-none border border-[#171717] bg-[#171717] p-0 ${hasVideos ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}>
        <TabsTrigger className="rounded-none bg-white py-3 data-[state=active]:bg-[#3157e8] data-[state=active]:text-white" value="overview">Overview</TabsTrigger>
        <TabsTrigger className="rounded-none bg-white py-3 data-[state=active]:bg-[#3157e8] data-[state=active]:text-white" value="specs">Specs</TabsTrigger>
        {hasVideos && <TabsTrigger className="rounded-none bg-white py-3 data-[state=active]:bg-[#3157e8] data-[state=active]:text-white" value="videos">Videos ({videoCount})</TabsTrigger>}
        <TabsTrigger className="rounded-none bg-white py-3 data-[state=active]:bg-[#3157e8] data-[state=active]:text-white" value="reviews" data-product-tab="reviews">Reviews ({reviewCount})</TabsTrigger>
        <TabsTrigger className="rounded-none bg-white py-3 data-[state=active]:bg-[#3157e8] data-[state=active]:text-white" value="purchase">Where to buy</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-8 space-y-0">
        <section aria-label="Research this chair" className="mb-8 border-y border-border py-5">
          <h2 className="text-lg font-semibold">Before choosing {productName}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Compare the published dimensions, watch how the chair works, and find places to try it. Video opinions are separate from specification evidence.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={() => setTab("specs")} className="min-h-11 border border-border px-4 py-2 text-sm font-medium">Check specifications</button>
            {hasVideos && <button type="button" onClick={() => setTab("videos")} className="min-h-11 border border-border px-4 py-2 text-sm font-medium">Watch videos ({videoCount})</button>}
            <Link href={`/stores?model=${encodeURIComponent(productId)}`} className="min-h-11 border border-border px-4 py-2 text-sm font-medium">Find places to try it</Link>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Confirm the exact model and visit arrangements with the store before travelling.</p>
        </section>
        {overview}
      </TabsContent>

      <TabsContent value="specs" className="mt-8 space-y-0">
        {specs}
      </TabsContent>

      {hasVideos && (
        <TabsContent value="videos" className="mt-8">
          {videos}
        </TabsContent>
      )}

      <TabsContent value="reviews" className="mt-8">
        <ChairReviewsSection
          reviews={reviews}
          productSlug={productId}
          productName={productName}
        />
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
    </div>
  )
}

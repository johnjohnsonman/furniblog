import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReviewsPageClient } from "@/components/reviews/reviews-page-client"
import { ReviewsFeedSkeleton } from "@/components/reviews/reviews-feed-skeleton"
import { getBrands, getReviewsFeedMeta } from "@/lib/supabase/queries"

export const metadata = {
  title: "Review Feed | Furniblog",
  description:
    "Search chair reviews from Reddit, YouTube, forums, and more—filter by brand, category, and source.",
}

export const dynamic = "force-dynamic"

export default async function ReviewsPage() {
  const [meta, brands] = await Promise.all([getReviewsFeedMeta(), getBrands()])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-4xl px-4 py-8">
              <ReviewsFeedSkeleton count={6} />
            </div>
          }
        >
          <ReviewsPageClient initialMeta={meta} brands={brands} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

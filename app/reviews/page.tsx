import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReviewsTabbedClient } from "@/components/reviews/reviews-tabbed-client"
import { ReviewsFeedSkeleton } from "@/components/reviews/reviews-feed-skeleton"
import { getBrands, getReviewsFeedMeta } from "@/lib/supabase/queries"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { shuffle } from "@/lib/utils/shuffle"
import type { ExperienceReviewCard } from "@/components/reviews/experience-reviews-list"

export const metadata = {
  title: "Review Feed | Furniblog",
  description:
    "Search chair reviews from Reddit, YouTube, forums, and more—filter by brand, category, and source.",
}

export const dynamic = "force-dynamic"

type SessionRow = {
  id: string
  created_at: string
  sex: "male" | "female" | null
  height_band:
    | "under_5_4"
    | "5_4_5_7"
    | "5_8_5_11"
    | "6_0_6_2"
    | "6_3plus"
    | null
  body: "below" | "normal" | "above" | null
  age_band: "under20" | "20s" | "30s" | "40s" | "50plus" | null
  job: string | null
  sit_hours: "under2" | "2to6" | "over6" | null
  pain: string[] | null
  reasons: string[] | null
  comment: string | null
  review_rankings:
    | Array<{
        rank: number
        chair_id: string
        products:
          | { slug: string; name: string }
          | Array<{ slug: string; name: string }>
          | null
      }>
    | null
}

async function getExperienceCards(): Promise<ExperienceReviewCard[]> {
  try {
    const supabase = createPublicServerClient()
    // Fetch all approved reviews; the client shuffles (random per visit) and
    // paginates them. force-dynamic means the shuffle re-rolls each visit.
    const { data, error } = await supabase
      .from("review_sessions")
      .select(
        "id, created_at, sex, height_band, body, age_band, job, sit_hours, pain, reasons, comment, review_rankings(rank, chair_id, products(slug, name))"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1000)

    if (error || !data) return []

    const cards = (data as SessionRow[]).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      sex: row.sex,
      heightBand: row.height_band,
      body: row.body,
      ageBand: row.age_band,
      job: row.job,
      sitHours: row.sit_hours,
      pain: row.pain ?? [],
      reasons: row.reasons ?? [],
      comment: row.comment,
      rankings: (row.review_rankings ?? [])
        .map((r) => {
          const product = Array.isArray(r.products) ? r.products[0] : r.products
          if (!product?.slug || !product?.name) return null
          return {
            rank: (r.rank as 1 | 2 | 3) ?? 1,
            chairSlug: product.slug,
            chairName: product.name,
          }
        })
        .filter((v): v is { rank: 1 | 2 | 3; chairSlug: string; chairName: string } =>
          Boolean(v)
        )
        .sort((a, b) => a.rank - b.rank),
    }))
    // Drop any card with no ranked chair (no value without a top pick).
    return shuffle(cards.filter((c) => c.rankings.length > 0))
  } catch {
    return []
  }
}

export default async function ReviewsPage() {
  const [meta, brands, experienceCards] = await Promise.all([
    getReviewsFeedMeta(),
    getBrands(),
    getExperienceCards(),
  ])

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
          <ReviewsTabbedClient
            initialMeta={meta}
            brands={brands}
            experienceItems={experienceCards}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

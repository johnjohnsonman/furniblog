import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReviewsTabbedClient } from "@/components/reviews/reviews-tabbed-client"
import { ReviewsFeedSkeleton } from "@/components/reviews/reviews-feed-skeleton"
import { getBrands, getReviewsFeedMeta } from "@/lib/supabase/queries"
import { getReviews } from "@/lib/supabase/reviews-feed"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { shuffle } from "@/lib/utils/shuffle"
import {
  canonicalJob,
  canonicalPain,
  canonicalReason,
  normalizeList,
} from "@/lib/reviews/normalize"
import type { ExperienceReviewCard } from "@/components/reviews/experience-reviews-list"

export const metadata = {
  title: "Review Feed",
  description:
    "Real hands-on chair rankings from people like you, plus web-collected reviews from Reddit, YouTube and forums — filter by brand, category and source.",
  // Consolidate ?page/?sort/?brand/?seed variants to the base feed.
  alternates: { canonical: "/reviews" },
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
  body: string | null
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
      job: canonicalJob(row.job),
      sitHours: row.sit_hours,
      pain: normalizeList(row.pain, canonicalPain),
      reasons: normalizeList(row.reasons, canonicalReason),
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

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Server-render the first page of web reviews so crawlers (and users) see real
  // content immediately. Honor the URL filters/sort so the server-rendered feed
  // matches the dropdowns — otherwise e.g. ?sort=recent showed "Most Recent" in
  // the UI but random data (the client skips the initial refetch).
  const sp = await searchParams
  const one = (k: string): string | undefined => {
    const v = sp[k]
    return Array.isArray(v) ? v[0] : v
  }
  const seedParam = one("seed")
  const initialSeed =
    seedParam && Number.isFinite(Number(seedParam))
      ? Number(seedParam)
      : Math.floor(Math.random() * 2_147_483_647)

  const [meta, brands, experienceCards, initialFeed] = await Promise.all([
    getReviewsFeedMeta(),
    getBrands(),
    getExperienceCards(),
    getReviews({
      page: 1,
      limit: 20,
      category: one("category") ?? "all",
      brand: one("brand") ?? "all",
      source: one("source") ?? "all",
      search: one("search") ?? "",
      sortBy: (one("sort") ?? "random") as NonNullable<Parameters<typeof getReviews>[0]>["sortBy"],
      period: (one("period") ?? "all") as NonNullable<Parameters<typeof getReviews>[0]>["period"],
      seed: initialSeed,
    }).catch(() => ({ reviews: [], total: 0 })),
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
            initialReviews={initialFeed.reviews}
            initialTotal={initialFeed.total}
            initialSeed={initialSeed}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

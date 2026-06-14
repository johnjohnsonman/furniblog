import { NextRequest, NextResponse } from "next/server"
import { getReviews } from "@/lib/supabase/reviews-feed"
import type { ReviewFeedPeriod, ReviewFeedSort } from "@/lib/reviews/feed-types"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = parseInt(searchParams.get("limit") ?? "20", 10)
  const category = searchParams.get("category") ?? "all"
  const brand = searchParams.get("brand") ?? "all"
  const source = searchParams.get("source") ?? "all"
  const search = searchParams.get("search") ?? ""
  const sortBy = (searchParams.get("sort") ??
    searchParams.get("sortBy") ??
    "random") as ReviewFeedSort
  const period = (searchParams.get("period") ?? "all") as ReviewFeedPeriod
  const seedParam = searchParams.get("seed")
  const seed =
    seedParam !== null && Number.isFinite(Number(seedParam))
      ? Number(seedParam)
      : undefined

  try {
    const result = await getReviews({
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 20,
      category,
      brand,
      source,
      search,
      sortBy,
      period,
      seed,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load reviews"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

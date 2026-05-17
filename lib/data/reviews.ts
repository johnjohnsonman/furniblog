import type { ProductReview } from "@/types/product"
import type { Review, ReviewSource, ChairScores } from "@/types/review"
import {
  resolveFeedCategory,
  type FeedCategoryId,
} from "@/lib/reviews/feed-categories"
import { applyReviewProfile } from "./review-profiles"
import { chairReviewsByProduct } from "./chair-reviews"
import { products } from "./products"

export const reviews: ProductReview[] = [
  {
    id: "1",
    productId: "herman-miller-aeron",
    productName: "Aeron Chair",
    productImage:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
    author: "James K.",
    rating: 5,
    title: "Worth every penny after 5 years",
    excerpt:
      "I've used my Aeron for over 5 years now, 8+ hours a day. Still works like new.",
    date: "2024-01-15",
  },
  {
    id: "2",
    productId: "herman-miller-aeron",
    productName: "Aeron Chair",
    productImage:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop",
    author: "Sarah M.",
    rating: 4,
    title: "Great chair, mesh takes getting used to",
    excerpt:
      "After a month, I can't imagine going back to a padded chair.",
    date: "2024-02-20",
  },
  {
    id: "3",
    productId: "herman-miller-embody",
    productName: "Embody Chair",
    productImage:
      "https://images.unsplash.com/photo-1589364101069-1ddddd80873c?w=400&h=400&fit=crop",
    author: "Mike T.",
    rating: 5,
    title: "Best chair for long coding sessions",
    excerpt:
      "As a developer, 10+ hours a day in this chair eliminated my back pain.",
    date: "2024-03-10",
  },
  {
    id: "4",
    productId: "steelcase-gesture",
    productName: "Gesture Chair",
    productImage:
      "https://images.unsplash.com/photo-1541558869434-2840d308329a?w=400&h=400&fit=crop",
    author: "Lisa R.",
    rating: 5,
    title: "The arms make all the difference",
    excerpt:
      "360-degree arm adjustment is a game-changer for laptop and monitor work.",
    date: "2024-01-28",
  },
]

export interface FeedReview extends Review {
  productName: string
  productSlug: string
  chairType?: string
  brandId: string
  brandName: string
  feedCategory: Exclude<FeedCategoryId, "all">
}

const scores = (
  overall: number,
  partial?: Partial<Omit<ChairScores, "overall">>
): ChairScores => ({
  lumbarSupport: partial?.lumbarSupport ?? overall - 0.2,
  seatComfort: partial?.seatComfort ?? overall - 0.1,
  armrest: partial?.armrest ?? overall,
  headrest: partial?.headrest ?? overall - 0.3,
  adjustability: partial?.adjustability ?? overall,
  buildQuality: partial?.buildQuality ?? overall + 0.1,
  valueForMoney: partial?.valueForMoney ?? overall - 0.4,
  overall,
})

const extraFeedReviews: Review[] = [
  {
    id: "rev-embody-1",
    productId: "herman-miller-embody",
    source: "japan_community",
    summary:
      "Japanese office-worker community roundup. The full-back wrap feels unique and suits long desk sessions; the seat is on the firmer side.",
    pros: ["Back support", "Design", "Durability"],
    cons: ["Firm seat", "High price"],
    scores: scores(4.5, { lumbarSupport: 4.7, seatComfort: 4.1 }),
    reviewerHeightCm: 172,
    usageHoursPerDay: 9,
    usagePurpose: "office",
    sourceUrl: "https://example.com/jp-community",
    originalLanguage: "ja",
    verified: false,
    helpfulCount: 44,
    createdAt: "2025-11-01T08:00:00Z",
  },
  {
    id: "rev-leap-1",
    productId: "steelcase-leap",
    source: "reddit",
    summary:
      "Three-year Leap V2 review. LiveBack follows the spine well and the fabric seat works year-round.",
    pros: ["LiveBack", "Seat material", "Adjustability"],
    cons: ["Weight", "Headrest optional"],
    scores: scores(4.4, { lumbarSupport: 4.6, seatComfort: 4.5 }),
    reviewerHeightCm: 176,
    reviewerWeightKg: 70,
    usageHoursPerDay: 8,
    usagePurpose: "office",
    sourceUrl: "https://www.reddit.com/r/OfficeChairs/",
    verified: false,
    helpfulCount: 95,
    createdAt: "2025-10-20T16:00:00Z",
  },
  {
    id: "rev-leap-2",
    productId: "steelcase-leap",
    source: "youtube",
    summary:
      "One-week sit review on YouTube. Among the most balanced office chairs; armrests trail Gesture slightly.",
    pros: ["Balanced comfort", "Brand support"],
    cons: ["Armrests", "Price"],
    scores: scores(4.3, { armrest: 3.9 }),
    reviewerHeightCm: 181,
    usageHoursPerDay: 7,
    sourceUrl: "https://www.youtube.com/",
    verified: false,
    helpfulCount: 52,
    createdAt: "2025-09-14T12:30:00Z",
  },
  {
    id: "rev-freedom-1",
    productId: "humanscale-freedom",
    source: "naver",
    summary:
      "Long-term blog review. Auto-recline is effortless but lumbar position needs tuning at first.",
    pros: ["Auto-recline", "Minimal design"],
    cons: ["Initial setup", "Seat depth"],
    scores: scores(4.2, { adjustability: 4.0 }),
    reviewerHeightCm: 170,
    reviewerWeightKg: 62,
    usageHoursPerDay: 6,
    usagePurpose: "home",
    sourceUrl: "https://blog.naver.com/",
    verified: false,
    helpfulCount: 18,
    createdAt: "2025-08-05T09:15:00Z",
  },
  {
    id: "rev-sayl-1",
    productId: "herman-miller-sayl",
    source: "google",
    summary:
      "Google review roundup. Design punches above its price; many note seat pressure during long sits.",
    pros: ["Design", "Price tier", "Brand"],
    cons: ["Long-session seat", "Few adjustments"],
    scores: scores(3.9, { seatComfort: 3.6, valueForMoney: 4.2 }),
    reviewerHeightCm: 165,
    usageHoursPerDay: 5,
    sourceUrl: "https://www.google.com/maps",
    verified: false,
    helpfulCount: 12,
    createdAt: "2025-07-28T11:00:00Z",
  },
  {
    id: "rev-contessa-1",
    productId: "okamura-contessa-ii",
    source: "japan_community",
    summary:
      "Japanese office community notes. Integrated headrest eases neck fatigue; mesh quality stands out.",
    pros: ["Headrest", "Mesh quality", "Japan support"],
    cons: ["High price", "Armrest width"],
    scores: scores(4.6, { headrest: 4.8, lumbarSupport: 4.5 }),
    reviewerHeightCm: 177,
    reviewerWeightKg: 74,
    usageHoursPerDay: 10,
    usagePurpose: "office",
    sourceUrl: "https://example.com/jp-desk",
    originalLanguage: "ja",
    verified: false,
    helpfulCount: 38,
    createdAt: "2025-11-08T07:45:00Z",
  },
  {
    id: "rev-ing-1",
    productId: "kokuyo-ing",
    source: "dcinside",
    summary:
      "Office-chair forum thread. Strong value locally; lumbar adjustment is intuitive.",
    pros: ["Value", "Local support", "Lumbar dial"],
    cons: ["Brand awareness", "Plain design"],
    scores: scores(4.1, { valueForMoney: 4.5 }),
    reviewerHeightCm: 174,
    usageHoursPerDay: 8,
    usagePurpose: "office",
    sourceUrl: "https://gall.dcinside.com/",
    verified: false,
    helpfulCount: 27,
    createdAt: "2025-10-12T21:30:00Z",
  },
  {
    id: "rev-gesture-3",
    productId: "steelcase-gesture",
    source: "youtube",
    summary:
      "Two-week review for dual-monitor setups—arm angles beat most gaming chairs for desk work.",
    pros: ["Armrests", "Dual monitors", "Build"],
    cons: ["Warm seat in summer", "Weight"],
    scores: scores(4.5, { armrest: 4.9 }),
    reviewerHeightCm: 183,
    usageHoursPerDay: 9,
    usagePurpose: "gaming",
    sourceUrl: "https://www.youtube.com/",
    verified: false,
    helpfulCount: 61,
    createdAt: "2025-09-22T18:00:00Z",
  },
  {
    id: "rev-aeron-6",
    productId: "herman-miller-aeron",
    source: "chairpark",
    summary:
      "Visited Chairpark Gangnam and bought Size C. Larger frame fit C well; staff sizing advice was helpful.",
    pros: ["In-person trial", "Size consultation", "Lumbar support"],
    cons: ["Visit required", "Price"],
    scores: scores(4.7, { lumbarSupport: 4.9, seatComfort: 4.5 }),
    reviewerHeightCm: 188,
    reviewerWeightKg: 92,
    usageHoursPerDay: 10,
    usagePurpose: "office",
    sourceUrl: "https://chairpark.co.kr/",
    verified: true,
    helpfulCount: 19,
    createdAt: "2025-12-01T14:00:00Z",
  },
]

function enrichReview(review: Review): FeedReview | null {
  const product = products.find((p) => p.id === review.productId)
  if (!product) return null
  const withProfile = applyReviewProfile(review)
  return {
    ...withProfile,
    productName: product.name,
    productSlug: product.slug ?? product.id,
    chairType: product.chairType,
    brandId: product.brandId,
    brandName: product.brand,
    feedCategory: resolveFeedCategory(product, review),
  }
}

/** 글로벌 리뷰 피드용 목 데이터 (Supabase 연동 전) */
export function getFeedReviews(): FeedReview[] {
  const fromChairMap = Object.values(chairReviewsByProduct).flat()
  const merged = [...fromChairMap, ...extraFeedReviews]

  const seen = new Set<string>()
  const unique: Review[] = []
  for (const r of merged) {
    if (seen.has(r.id)) continue
    seen.add(r.id)
    unique.push(r)
  }

  return unique
    .map(enrichReview)
    .filter((r): r is FeedReview => r != null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export type BrandReviewCount = {
  brandId: string
  brandName: string
  count: number
}

/** 브랜드별 리뷰 수 (내림차순) */
export function getFeedBrandCounts(feedReviews: FeedReview[]): BrandReviewCount[] {
  const map = new Map<string, BrandReviewCount>()
  for (const r of feedReviews) {
    const existing = map.get(r.brandId)
    if (existing) {
      existing.count += 1
    } else {
      map.set(r.brandId, {
        brandId: r.brandId,
        brandName: r.brandName,
        count: 1,
      })
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
}

/** 카테고리 내에서 리뷰가 있는 브랜드만 */
export function getBrandsForCategory(
  feedReviews: FeedReview[],
  categoryId: FeedCategoryId
): BrandReviewCount[] {
  const pool =
    categoryId === "all"
      ? feedReviews
      : feedReviews.filter((r) => r.feedCategory === categoryId)
  return getFeedBrandCounts(pool)
}

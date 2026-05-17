import type { Review } from "@/types/review"

const chairparkScores = (
  overall: number,
  partial?: Partial<{
    lumbarSupport: number
    seatComfort: number
    armrest: number
    headrest: number
    adjustability: number
    buildQuality: number
    valueForMoney: number
  }>
) => ({
  lumbarSupport: partial?.lumbarSupport ?? overall - 0.2,
  seatComfort: partial?.seatComfort ?? overall - 0.1,
  armrest: partial?.armrest ?? overall,
  headrest: partial?.headrest ?? overall - 0.3,
  adjustability: partial?.adjustability ?? overall,
  buildQuality: partial?.buildQuality ?? overall + 0.2,
  valueForMoney: partial?.valueForMoney ?? overall - 0.5,
  overall,
})

export const chairReviewsByProduct: Record<string, Review[]> = {
  "herman-miller-aeron": [
    {
      id: "rev-aeron-1",
      productId: "herman-miller-aeron",
      source: "chairpark",
      summary:
        "Tried it for 30 minutes at Chairpark before buying. Lumbar support is unmistakable and the mesh breathes well for long sessions.",
      pros: ["Strong lumbar support", "Excellent ventilation", "12-year warranty"],
      cons: ["Premium price", "Mesh seat adjustment period"],
      scores: chairparkScores(4.6, {
        lumbarSupport: 4.8,
        seatComfort: 4.4,
        adjustability: 4.7,
      }),
      reviewerHeightCm: 178,
      reviewerWeightKg: 72,
      usageHoursPerDay: 9,
      usagePurpose: "office",
      sourceUrl: "https://chairpark.co.kr/",
      originalLanguage: "en",
      verified: true,
      helpfulCount: 42,
      createdAt: "2025-11-12T09:00:00Z",
    },
    {
      id: "rev-aeron-2",
      productId: "herman-miller-aeron",
      source: "reddit",
      summary:
        "Long-term review on r/OfficeChairs. Size B reduced back pain, though armrest pads needed replacing after heavy use.",
      pros: ["Less back pain", "Durability", "Strong resale value"],
      cons: ["Armrest pad wear", "Complex initial setup"],
      scores: chairparkScores(4.4, {
        lumbarSupport: 4.7,
        armrest: 4.0,
        valueForMoney: 3.8,
      }),
      reviewerHeightCm: 182,
      reviewerWeightKg: 85,
      usageHoursPerDay: 10,
      usagePurpose: "office",
      sourceUrl: "https://www.reddit.com/r/OfficeChairs/",
      originalLanguage: "en",
      verified: false,
      helpfulCount: 128,
      createdAt: "2025-10-03T14:20:00Z",
    },
    {
      id: "rev-aeron-3",
      productId: "herman-miller-aeron",
      source: "youtube",
      summary:
        "YouTuber’s 8-hour sit test. Adjustment range is wide, but the configuration without a headrest is a miss for some users.",
      pros: ["Wide adjustments", "Build quality", "Brand trust"],
      cons: ["Headrest sold separately", "Price"],
      scores: chairparkScores(4.5, {
        headrest: 3.5,
        adjustability: 4.8,
        buildQuality: 4.9,
      }),
      reviewerHeightCm: 175,
      reviewerWeightKg: 68,
      usageHoursPerDay: 8,
      usagePurpose: "office",
      sourceUrl: "https://www.youtube.com/",
      originalLanguage: "en",
      verified: false,
      helpfulCount: 89,
      createdAt: "2025-09-18T11:00:00Z",
    },
    {
      id: "rev-aeron-4",
      productId: "herman-miller-aeron",
      source: "naver",
      summary:
        "Naver community review. Easy to get service in Korea; mesh ventilation is especially appreciated in summer.",
      pros: ["Local service access", "Summer ventilation"],
      cons: ["High price", "Firm seat feel"],
      scores: chairparkScores(4.3, { valueForMoney: 3.9 }),
      reviewerHeightCm: 168,
      reviewerWeightKg: 58,
      usageHoursPerDay: 7,
      usagePurpose: "home",
      sourceUrl: "https://search.shopping.naver.com/",
      originalLanguage: "en",
      verified: false,
      helpfulCount: 23,
      createdAt: "2025-08-22T08:30:00Z",
    },
    {
      id: "rev-aeron-5",
      productId: "herman-miller-aeron",
      source: "dcinside",
      summary:
        "Forum thread recommends it for office work over gaming; some users find the mesh cold in winter.",
      pros: ["Great for office work", "Highly adjustable"],
      cons: ["Cool seat in winter", "Heavy chair"],
      scores: chairparkScores(4.2, { seatComfort: 3.9 }),
      reviewerHeightCm: 173,
      reviewerWeightKg: 75,
      usageHoursPerDay: 6,
      usagePurpose: "gaming",
      sourceUrl: "https://gall.dcinside.com/",
      originalLanguage: "en",
      verified: false,
      helpfulCount: 15,
      createdAt: "2025-07-10T19:45:00Z",
    },
  ],
  "steelcase-gesture": [
    {
      id: "rev-gesture-1",
      productId: "steelcase-gesture",
      source: "chairpark",
      summary:
        "360° armrest adjustment is ideal for dual-monitor desk setups.",
      pros: ["Armrests", "Versatile postures", "Recline"],
      cons: ["Heavy", "Price"],
      scores: chairparkScores(4.5, { armrest: 4.9, adjustability: 4.8 }),
      reviewerHeightCm: 180,
      reviewerWeightKg: 78,
      usageHoursPerDay: 9,
      usagePurpose: "office",
      originalLanguage: "en",
      verified: true,
      helpfulCount: 31,
      createdAt: "2025-10-01T10:00:00Z",
    },
    {
      id: "rev-gesture-2",
      productId: "steelcase-gesture",
      source: "reddit",
      summary:
        "Classic Gesture vs Aeron debate on Reddit—Gesture wins on armrests for many users.",
      pros: ["Best-in-class armrests", "Device switching"],
      cons: ["Seat can run warm", "Expensive"],
      scores: chairparkScores(4.4, { armrest: 4.9 }),
      reviewerHeightCm: 185,
      reviewerWeightKg: 90,
      usageHoursPerDay: 8,
      usagePurpose: "office",
      sourceUrl: "https://www.reddit.com/",
      originalLanguage: "en",
      verified: false,
      helpfulCount: 67,
      createdAt: "2025-09-05T12:00:00Z",
    },
  ],
}

export function getChairReviewsForProduct(productId: string): Review[] {
  return chairReviewsByProduct[productId] ?? chairReviewsByProduct["herman-miller-aeron"] ?? []
}

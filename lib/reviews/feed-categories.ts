import type { Review } from "@/types/review"
import type { ChairCategory } from "@/types/product"
import {
  CHAIR_CATEGORIES,
  CHAIR_CATEGORY_IDS,
  isChairCategory,
} from "@/lib/chair-categories"

export type FeedCategoryId = "all" | ChairCategory

export const FEED_CATEGORIES: { id: FeedCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  ...CHAIR_CATEGORIES.map((c) => ({ id: c.id as FeedCategoryId, label: c.label })),
]

type ProductLike = {
  category?: string
  chairType?: string
}

export function resolveFeedCategory(
  product: ProductLike,
  review?: Pick<Review, "usagePurpose">
): ChairCategory {
  if (review?.usagePurpose === "gaming") return "gaming"
  if (product.category && isChairCategory(product.category)) {
    return product.category
  }

  const chairType = (product.chairType ?? "").toLowerCase()

  if (chairType.includes("executive")) return "executive"
  if (chairType.includes("gaming")) return "gaming"
  if (chairType.includes("lounge")) return "lounge"
  if (chairType.includes("kneeling") || chairType.includes("saddle")) {
    return "standing"
  }

  return "office"
}

export { CHAIR_CATEGORY_IDS }

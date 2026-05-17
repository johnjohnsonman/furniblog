import type { ChairCategory } from "@/types/product"

export type FeedCategoryId = "all" | ChairCategory

export const FEED_CATEGORY_PILLS: { id: FeedCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "office", label: "Office" },
  { id: "executive", label: "Executive" },
  { id: "gaming", label: "Gaming" },
  { id: "study", label: "Study" },
  { id: "dining", label: "Dining" },
  { id: "conference", label: "Conference" },
  { id: "lounge", label: "Lounge" },
  { id: "standing", label: "Standing" },
]

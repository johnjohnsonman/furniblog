import type { ChairCategory, Product } from "@/types/product"

export type { ChairCategory }

export const CHAIR_CATEGORY_IDS: ChairCategory[] = [
  "office",
  "executive",
  "gaming",
  "study",
  "dining",
  "conference",
  "lounge",
  "standing",
  "design",
]

export const CHAIR_CATEGORIES: {
  id: ChairCategory
  label: string
  navLabel: string
}[] = [
  { id: "office", label: "Office Chairs", navLabel: "Office Chairs" },
  { id: "executive", label: "Executive Chairs", navLabel: "Executive Chairs" },
  { id: "gaming", label: "Gaming Chairs", navLabel: "Gaming Chairs" },
  { id: "study", label: "Study Chairs", navLabel: "Study Chairs" },
  { id: "dining", label: "Dining Chairs", navLabel: "Dining Chairs" },
  { id: "conference", label: "Conference Chairs", navLabel: "Conference Chairs" },
  { id: "lounge", label: "Lounge Chairs", navLabel: "Lounge Chairs" },
  {
    id: "standing",
    label: "Standing & Saddle",
    navLabel: "Standing & Saddle",
  },
  { id: "design", label: "Design Chairs", navLabel: "Design Chairs" },
]

const LABEL_BY_ID = Object.fromEntries(
  CHAIR_CATEGORIES.map((c) => [c.id, c.label])
) as Record<ChairCategory, string>

export function isChairCategory(value: string): value is ChairCategory {
  return CHAIR_CATEGORY_IDS.includes(value as ChairCategory)
}

export function getChairCategoryLabel(
  category: string | ChairCategory
): string {
  if (isChairCategory(category)) return LABEL_BY_ID[category]
  return category
}

/** Filter dropdown: All + 8 categories (value = category id) */
export const CHAIR_CATEGORY_FILTER_OPTIONS: { label: string; value: string }[] =
  [
    { label: "All Categories", value: "All" },
    ...CHAIR_CATEGORIES.map((c) => ({ label: c.label, value: c.id })),
  ]

/** Category pills on /products — order matches typical DB distribution */
export const PRODUCT_LIST_CATEGORIES: { value: string; label: string }[] = [
  { value: "All", label: "All" },
  { value: "office", label: "Office" },
  { value: "executive", label: "Executive" },
  { value: "gaming", label: "Gaming" },
  { value: "conference", label: "Conference" },
  { value: "standing", label: "Standing" },
  { value: "study", label: "Study" },
  { value: "lounge", label: "Lounge" },
  { value: "dining", label: "Dining" },
  { value: "design", label: "Design" },
]

export function countByChairCategory(
  items: Pick<Product, "category">[]
): Record<ChairCategory, number> {
  const counts = Object.fromEntries(
    CHAIR_CATEGORY_IDS.map((id) => [id, 0])
  ) as Record<ChairCategory, number>

  for (const item of items) {
    if (isChairCategory(item.category)) {
      counts[item.category] += 1
    }
  }

  return counts
}

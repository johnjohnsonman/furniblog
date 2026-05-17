import type { ChairCategory } from "@/types/product"

const CHAIR_PLACEHOLDER_BY_CATEGORY: Partial<Record<ChairCategory, string>> = {
  office:
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400",
  gaming:
    "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400",
  executive:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
  standing:
    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400",
}

const DEFAULT_CHAIR_PLACEHOLDER =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"

export function getChairPlaceholderImage(category: string): string {
  const key = category as ChairCategory
  return CHAIR_PLACEHOLDER_BY_CATEGORY[key] ?? DEFAULT_CHAIR_PLACEHOLDER
}

export function resolveProductImageUrl(
  imageUrl: string | null | undefined,
  category: string
): string {
  const trimmed = imageUrl?.trim()
  if (trimmed) return trimmed
  return getChairPlaceholderImage(category)
}

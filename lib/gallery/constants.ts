export const GALLERY_CATEGORIES = [
  { id: "all", label: "All", db: null },
  { id: "office", label: "Office Setup", db: "office" },
  { id: "home_office", label: "Home Office", db: "home_office" },
  { id: "gaming", label: "Gaming", db: "gaming" },
  { id: "executive", label: "Executive", db: "executive" },
  { id: "minimalist", label: "Minimalist", db: "minimalist" },
] as const

export type GalleryCategoryId = (typeof GALLERY_CATEGORIES)[number]["id"]

export const ADMIN_GALLERY_CATEGORIES = GALLERY_CATEGORIES.filter(
  (c) => c.id !== "all"
)

export function galleryCategoryLabel(dbCategory: string): string {
  return (
    ADMIN_GALLERY_CATEGORIES.find((c) => c.db === dbCategory)?.label ??
    dbCategory
  )
}

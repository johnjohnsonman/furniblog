import { getChairCategoryLabel } from "@/lib/chair-categories"

export type HomeImage = { id: string; url: string; model_status: string | null; rights: string | null; is_thumbnail: boolean; sort_order: number }
export type HomeProductRow = {
  id: string; slug: string; name: string; category: string; published: boolean; track: string
  brands: { slug: string; name: string } | { slug: string; name: string }[] | null
  product_images: HomeImage[] | null
}
export type HomeProduct = {
  id: string; slug: string; name: string; category: string; categoryLabel: string
  brand: string; brandSlug: string; image: string; imageId: string
  note?: string; scope?: string; fact?: { value: string; href: string }
}
export function safeHomeImage(image: HomeImage, storageOrigin: string): boolean {
  try {
    const url = new URL(image.url)
    return image.model_status === "verified" && ["kept", "owner_policy"].includes(image.rights ?? "") &&
      url.protocol === "https:" && url.origin === new URL(storageOrigin).origin &&
      url.pathname.startsWith("/storage/v1/object/public/product-images/") && !url.username && !url.password
  } catch { return false }
}
export function homeCatalog(rows: HomeProductRow[], storageOrigin: string) {
  const live = rows.filter(row => row.published && row.track === "chair")
  const categories = new Map<string, { id: string; name: string; count: number }>()
  const brands = new Map<string, { slug: string; name: string; count: number }>()
  const products: HomeProduct[] = []
  for (const row of live) {
    const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands
    if (row.category) {
      const entry = categories.get(row.category) ?? { id: row.category, name: getChairCategoryLabel(row.category), count: 0 }
      entry.count++; categories.set(row.category, entry)
    }
    if (brand?.slug) {
      const entry = brands.get(brand.slug) ?? { ...brand, count: 0 }
      entry.count++; brands.set(brand.slug, entry)
    }
    const image = [...(row.product_images ?? [])].filter(image => safeHomeImage(image, storageOrigin))
      .sort((a, b) => Number(b.is_thumbnail) - Number(a.is_thumbnail) || a.sort_order - b.sort_order || a.id.localeCompare(b.id))[0]
    if (!image || !brand?.slug || !row.slug || !row.name) continue
    products.push({ id: row.id, slug: row.slug, name: row.name, category: row.category,
      categoryLabel: getChairCategoryLabel(row.category), brand: brand.name, brandSlug: brand.slug, image: image.url, imageId: image.id })
  }
  return { total: live.length, products, categories: [...categories.values()], brands: [...brands.values()].sort((a,b) => a.name.localeCompare(b.name)) }
}
export function filterHomeProducts(products: HomeProduct[], category: string, brand: string) {
  return products.filter(product => (category === "all" || product.category === category) && (brand === "all" || product.brandSlug === brand))
}
export function moveHomeSelection(products: HomeProduct[], activeSlug: string, step: number) {
  if (!products.length) return ""
  const index = Math.max(0, products.findIndex(product => product.slug === activeSlug))
  return products[(index + step + products.length) % products.length].slug
}
export function toggleHomeComparison(selected: string[], slug: string) {
  return selected.includes(slug) ? selected.filter(value => value !== slug) : [...selected.slice(-1), slug]
}

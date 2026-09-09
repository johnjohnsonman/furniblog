import type { ProductView } from "@/lib/data/mappers"
import { PRODUCT_IMAGES_DATA, type ProductImageMeta } from "./product-images-data"

export type ResolvedImage = { url: string; alt: string; caption?: string }
export type ResolvedGallery = { hero: ResolvedImage | null; gallery: ResolvedImage[] }

/** Category placeholders live on this host; they must never be published as a
 *  "real" product photo (the frame is hidden instead). */
const PLACEHOLDER_HOST = "images.unsplash.com"

/**
 * Publishable image bundle for a product, reused across product / Chairpedia /
 * Compare surfaces. URLs and order come from the product's own images (admin
 * upload → `product_images`); alt/caption come from the optional metadata
 * registry or are derived from the product name.
 *
 * Returns `{ hero: null, gallery: [] }` when the product has no real image, so
 * callers can hide the frame entirely (no empty placeholders). Broken/missing
 * URLs simply reduce the set — they never throw.
 */
export function resolveProductGallery(
  product: ProductView | null | undefined
): ResolvedGallery {
  if (!product) return { hero: null, gallery: [] }
  const meta: ProductImageMeta | undefined = PRODUCT_IMAGES_DATA[product.slug]
  const urls = Array.from(
    new Set(
      (product.images ?? []).filter(
        (u): u is string => Boolean(u && u.trim()) && !u.includes(PLACEHOLDER_HOST)
      )
    )
  )
  if (urls.length === 0) return { hero: null, gallery: [] }
  const name = product.name ?? "Chair"
  const hero: ResolvedImage = { url: urls[0], alt: meta?.heroAlt ?? name }
  const gallery: ResolvedImage[] = urls.slice(1, 5).map((url, i) => ({
    url,
    alt: meta?.gallery?.[i]?.alt ?? `${name} — view ${i + 2}`,
    caption: meta?.gallery?.[i]?.caption,
  }))
  return { hero, gallery }
}

/**
 * Whether a product is opted in to reusing its own image as the hero of its
 * legacy (content_html) Chairpedia article. Keeps the change scoped to products
 * we've explicitly reviewed; the rich template reuses images regardless.
 */
export function hasImageRegistry(slug: string | null | undefined): boolean {
  return Boolean(slug && PRODUCT_IMAGES_DATA[slug])
}

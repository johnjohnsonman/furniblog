import { CARD_BLOCKED_IMAGE_FILES, SHOWROOM_UNSIGNED_IMAGE_FILES } from "./flagged-images"

const fileOf = (url: string) => url.split("?")[0].split("/").pop() ?? ""
const isFlagged = (url: string) => {
  const file = fileOf(url)
  return CARD_BLOCKED_IMAGE_FILES.has(file) || SHOWROOM_UNSIGNED_IMAGE_FILES.has(file)
}

/**
 * Image for a blog card on a product page. A flagged hero, or a hero that is
 * another chair's product photo, is replaced by, in order: the page product's
 * own photo, a photo of that same product inside the post body (product-images
 * files start with the product slug), or no image.
 * Another chair's photo is never used as a stand-in.
 */
export function productCardImage(
  post: { hero_image_url: string | null; content_html?: string | null },
  productSlug: string,
  productImage?: string | null
): string | null {
  const hero = post.hero_image_url
  // A product photo of a different chair would misrepresent this page's product.
  const otherProductPhoto = Boolean(hero && /\/product-images\//.test(hero) && !fileOf(hero).startsWith(`${productSlug}-`))
  if (hero && !isFlagged(hero) && !otherProductPhoto) return hero
  if (productImage && !isFlagged(productImage)) return productImage
  for (const m of (post.content_html ?? "").matchAll(/<img[^>]+src="([^"]+)"/g)) {
    if (fileOf(m[1]).startsWith(`${productSlug}-`) && !isFlagged(m[1])) return m[1]
  }
  return null
}

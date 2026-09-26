import { CARD_BLOCKED_IMAGE_FILES, SHOWROOM_UNSIGNED_IMAGE_FILES } from "./flagged-images"

const fileOf = (url: string) => url.split("?")[0].split("/").pop() ?? ""

/**
 * Image for a blog card on product pages. Blocked hero images are replaced by
 * the first unflagged image in the post body; with none, the card has no image.
 */
export function productCardImage(post: { hero_image_url: string | null; content_html?: string | null }): string | null {
  const hero = post.hero_image_url
  if (hero && !CARD_BLOCKED_IMAGE_FILES.has(fileOf(hero))) return hero
  for (const m of (post.content_html ?? "").matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const file = fileOf(m[1])
    if (!CARD_BLOCKED_IMAGE_FILES.has(file) && !SHOWROOM_UNSIGNED_IMAGE_FILES.has(file)) return m[1]
  }
  return null
}

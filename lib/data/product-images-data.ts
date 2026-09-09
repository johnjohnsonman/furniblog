/**
 * Optional per-product image METADATA (keyed by product slug).
 *
 * Image URLs and their order are NOT stored here — they come from the product's
 * own images (owner uploads them once in the admin product form → the
 * `product_images` table), so a single upload is reused on the product page,
 * cards, Best lists, Compare rows and the Chairpedia article.
 *
 * This file only holds metadata the current DB schema can't carry without a
 * migration: alt text, captions, provenance and a usage-rights note. It is also
 * the explicit opt-in switch for reusing a product's image as the hero of its
 * legacy (content_html) Chairpedia article — only products listed here get that
 * behaviour, which keeps changes scoped while we pilot.
 *
 * Anything not listed falls back to sensible derived values (alt = product name).
 * When the manufacturer/Amazon API or a fresh shoot later supplies confirmed
 * images, add them to `product_images` and set `rights: "confirmed"` here.
 */

export type ImageRights = "confirmed" | "kept" | "candidate"

export type ProductImageMeta = {
  /** Alt text for the primary/hero image (content-appropriate, not keyword-stuffed). */
  heroAlt?: string
  /** Metadata for gallery images, in display order AFTER the hero. */
  gallery?: { alt: string; caption?: string }[]
  /** Provenance of the bundle (audit only — never shown publicly). */
  source?: string
  /**
   * Usage-rights status (audit only — never shown publicly):
   *  - "kept"      = pre-existing Furniblog image retained by the owner's decision.
   *  - "confirmed" = supplier/manufacturer-cleared or own shoot.
   *  - "candidate" = held, NOT published (ambiguous match or unverified rights).
   */
  rights?: ImageRights
}

export const PRODUCT_IMAGES_DATA: Record<string, ProductImageMeta> = {
  "sihoo-doro-c300": {
    heroAlt: "SIHOO Doro C300 ergonomic mesh office chair",
    source: "Existing Furniblog image (retained)",
    rights: "kept",
  },
  "steelcase-gesture": {
    heroAlt: "Steelcase Gesture office chair",
    source: "Existing Furniblog image (retained)",
    rights: "kept",
  },
  "herman-miller-aeron": {
    heroAlt: "Herman Miller Aeron office chair",
    source: "Existing Furniblog image (retained)",
    rights: "kept",
  },
}

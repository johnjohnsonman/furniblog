/** Slugify an article title into a URL-safe string. */
function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-") // non-alnum -> dash (drops CJK too)
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")
}

/** Short, stable base36 hash of a string (for slug uniqueness keyed off the URL). */
function shortHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash.toString(36).slice(0, 6)
}

/**
 * Build a unique, readable slug for a news article.
 * Title-based for SEO, with a URL-derived suffix so it never collides
 * (the URL is already the table's unique key).
 */
export function newsSlug(title: string, url: string): string {
  const base = slugifyTitle(title || "")
  const suffix = shortHash(url)
  return base ? `${base}-${suffix}` : `news-${suffix}`
}

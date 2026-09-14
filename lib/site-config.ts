/** Public identity. Deliberately independent of request hosts and preview URLs. */
export const SITE_URL = "https://www.chairpedia.com"
export const SITE_NAME = "Chairpedia"

/** Content relationships and historical attribution only, never an auth allowlist. */
export const CONTENT_HOSTS = new Set([
  "furniblog.com", "www.furniblog.com", "chairpedia.com", "www.chairpedia.com",
])

export function publicSiteUrl(value: string): string {
  try {
    const url = new URL(value, SITE_URL)
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return value
    return CONTENT_HOSTS.has(url.hostname) && !url.port
      ? `${SITE_URL}${url.pathname}${url.search}${url.hash}` : value
  } catch { return value }
}

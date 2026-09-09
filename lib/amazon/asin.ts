/** Extract a 10-char ASIN from an Amazon product URL (/dp/ASIN, /gp/product/ASIN). */
export function extractAsin(url: string | null | undefined): string | null {
  if (!url) return null
  const m = url.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?#]|$)/i)
  return m ? m[1].toUpperCase() : null
}

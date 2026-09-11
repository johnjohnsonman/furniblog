const FALLBACK_TAG = "furniblog0e-20"

/**
 * Rewrite Amazon links embedded in stored article HTML so they carry the
 * associate tag and the page-level SubTag (ascsubtag), like the buy buttons
 * do. Body links otherwise bypass both attribution paths — Amazon-side clicks
 * from mid-2026 confirm orders arrived through them untracked.
 *
 * Only full amazon.<tld> product/search URLs are touched; amzn.to shortlinks
 * are left alone (their redirects don't reliably preserve added parameters).
 */
export function rewriteAmazonHrefs(html: string, subtag?: string): string {
  const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || FALLBACK_TAG
  return html.replace(
    /href="(https?:\/\/(?:www\.)?amazon\.[a-z.]{2,10}\/[^"]*)"/gi,
    (match, raw: string) => {
      try {
        const url = new URL(raw.replace(/&amp;/g, "&"))
        if (!url.searchParams.get("tag")) url.searchParams.set("tag", tag)
        if (subtag) url.searchParams.set("ascsubtag", subtag)
        return `href="${url.toString().replace(/&/g, "&amp;")}"`
      } catch {
        return match
      }
    }
  )
}

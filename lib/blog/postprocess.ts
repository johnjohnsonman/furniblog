const AMAZON_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || "furniblog0e-20"

/**
 * Ensure every Amazon link in authored HTML carries our associate tag and
 * affiliate rel attributes. The OneLink script (loaded in the layout) localizes
 * the destination per visitor; this just guarantees attribution + valid rel.
 */
export function tagAmazonLinks(html: string): string {
  return html.replace(
    /<a\s+([^>]*?)href="(https?:\/\/(?:www\.)?(?:amazon\.[a-z.]+|amzn\.to)\/[^"]*)"([^>]*)>/gi,
    (_full, pre: string, url: string, post: string) => {
      let u = url
      if (!/[?&]tag=/.test(u)) {
        u += (u.includes("?") ? "&" : "?") + `tag=${AMAZON_TAG}`
      }
      const attrs = `${pre}${post}`
      const rel = /rel=/i.test(attrs) ? "" : ' rel="sponsored nofollow noopener"'
      const target = /target=/i.test(attrs) ? "" : ' target="_blank"'
      return `<a ${pre}href="${u}"${post}${rel}${target}>`
    }
  )
}

/** Wrap authored <table>s so wide tables scroll on mobile instead of squishing. */
export function wrapTables(html: string): string {
  return html
    .replace(/<table(\s[^>]*)?>/gi, '<div class="cp-table-scroll"><table$1>')
    .replace(/<\/table>/gi, "</table></div>")
}

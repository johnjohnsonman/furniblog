import { load } from "cheerio"
import { publicSiteUrl } from "../site-config"

/** Presentation-only migration. Stored text, image credits and user data stay intact. */
export function rewriteOwnedSiteLinks(html: string): string {
  if (!/(?:https?:)?\/\/(?:www\.)?(?:furniblog|chairpedia)\.com\b/i.test(html)) return html
  const $ = load(html, null, false)
  let changed = false
  $("a[href]").each((_, element) => {
    const old = $(element).attr("href") || ""
    if (!/^(?:https?:)?\/\//i.test(old)) return
    const next = publicSiteUrl(old)
    if (next !== old) { $(element).attr("href", next); changed = true }
  })
  return changed ? $.html() : html
}

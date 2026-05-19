import * as cheerio from "cheerio"
import type { RawContent } from "@/lib/pipeline/types"

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html",
}

type ReviewSiteConfig = {
  name: string
  baseUrl: string
  url: (q: string) => string
  titleSelector: string
  excerptSelector: string
}

const REVIEW_SITES: ReviewSiteConfig[] = [
  {
    name: "btod",
    baseUrl: "https://www.btod.com",
    url: (q) => `https://www.btod.com/blog/?s=${encodeURIComponent(q)}`,
    titleSelector: ".entry-title a",
    excerptSelector: ".entry-summary",
  },
  {
    name: "techradar",
    baseUrl: "https://www.techradar.com",
    url: (q) =>
      `https://www.techradar.com/search?searchTerm=${encodeURIComponent(q + " chair")}`,
    titleSelector: ".article-name",
    excerptSelector: ".article-summary",
  },
  {
    name: "rtings",
    baseUrl: "https://www.rtings.com",
    url: () => "https://www.rtings.com/office-chair/reviews/search#form",
    titleSelector: "h2.test-summary-title",
    excerptSelector: ".test-summary-text",
  },
]

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .trim()
}

function resolveUrl(href: string, baseUrl: string): string {
  if (href.startsWith("http")) return href
  if (href.startsWith("//")) return `https:${href}`
  if (href.startsWith("/")) return `${baseUrl}${href}`
  return `${baseUrl}/${href}`
}

function isRelevant(text: string, chairName: string): boolean {
  const lower = text.toLowerCase()
  const chairWords = chairName.toLowerCase().split(/\s+/)
  return chairWords.some((w) => w.length > 3 && lower.includes(w))
}

async function collectFromSite(
  site: ReviewSiteConfig,
  chairName: string,
  results: RawContent[],
  seenUrls: Set<string>
): Promise<void> {
  const pageUrl = site.url(chairName)
  console.log(`[REVIEW SITES] ${site.name}:`, pageUrl)

  const res = await fetch(pageUrl, { headers: FETCH_HEADERS, cache: "no-store" })
  if (!res.ok) {
    console.log("[REVIEW SITES] Status:", res.status, site.name)
    return
  }

  const html = await res.text()
  const $ = cheerio.load(html)

  $(site.titleSelector).each((_, el) => {
    if (results.length >= 5) return false

    const $el = $(el)
    const title = decodeHtml($el.text())
    if (title.length < 10) return

    const href = $el.attr("href") ?? ""
    const articleUrl = href ? resolveUrl(href, site.baseUrl) : pageUrl
    if (seenUrls.has(articleUrl)) return

    const $parent = $el.closest("article, .post, li, .search-result, div")
    const excerpt = decodeHtml(
      $parent.find(site.excerptSelector).first().text() ||
        $el.parent().next(site.excerptSelector).text()
    )

    const body = excerpt.length > 20 ? `${title}\n\n${excerpt}` : title
    if (!isRelevant(body, chairName) && site.name !== "rtings") return

    seenUrls.add(articleUrl)
    results.push({
      url: articleUrl,
      title,
      body,
      source: "review_sites",
      collectedAt: new Date().toISOString(),
    })
  })
}

export async function collectFromReviewSites(
  chairSlug: string,
  chairName: string
): Promise<RawContent[]> {
  void chairSlug
  const results: RawContent[] = []
  const seenUrls = new Set<string>()

  for (const site of REVIEW_SITES) {
    try {
      await collectFromSite(site, chairName, results, seenUrls)
      await new Promise((r) => setTimeout(r, 2000))
    } catch (e) {
      console.error(`[REVIEW SITES] ${site.name} error:`, e)
    }
    if (results.length >= 5) break
  }

  console.log("[REVIEW SITES] Total:", results.length)
  return results
}

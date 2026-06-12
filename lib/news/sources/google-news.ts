import { parseStringPromise } from "xml2js"
import { parse as parseHtml } from "node-html-parser"
import { fetchWithTimeout } from "@/lib/pipeline/fetch-with-timeout"

export type RawNews = {
  url: string
  title: string
  description: string
  sourceName: string | null
  publishedAt: string | null
  imageUrl: string | null
}

/** Build the Google News search query for a brand (office-chair / furniture scoped). */
export function buildNewsQuery(brand: string): string {
  const clean = brand.trim().replace(/"/g, "")
  return `"${clean}" chair`
}

function buildFeedUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    hl: "en-US",
    gl: "US",
    ceid: "US:en",
  })
  return `https://news.google.com/rss/search?${params.toString()}`
}

function stripHtml(html: string): string {
  if (!html) return ""
  try {
    return parseHtml(html).textContent.replace(/\s+/g, " ").trim()
  } catch {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  }
}

function asText(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (value && typeof value === "object" && "_" in value) {
    const inner = (value as { _?: unknown })._
    return typeof inner === "string" ? inner.trim() : ""
  }
  return ""
}

type RssItem = {
  title?: unknown
  link?: unknown
  pubDate?: unknown
  description?: unknown
  source?: unknown
}

function toIsoDate(value: string): string | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** Fetch and parse a brand's Google News RSS feed into normalized news items. */
export async function fetchGoogleNews(brand: string): Promise<{
  query: string
  items: RawNews[]
}> {
  const query = buildNewsQuery(brand)
  const feedUrl = buildFeedUrl(query)

  const res = await fetchWithTimeout(
    feedUrl,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; FurniblogNewsBot/1.0)" } },
    12_000
  )
  if (!res.ok) {
    throw new Error(`Google News fetch failed: HTTP ${res.status}`)
  }

  const xml = await res.text()
  const parsed = (await parseStringPromise(xml, {
    explicitArray: false,
    trim: true,
  })) as { rss?: { channel?: { item?: RssItem | RssItem[] } } }

  const rawItems = parsed.rss?.channel?.item
  const list: RssItem[] = Array.isArray(rawItems)
    ? rawItems
    : rawItems
      ? [rawItems]
      : []

  const seen = new Set<string>()
  const items: RawNews[] = []

  for (const item of list) {
    const url = asText(item.link)
    if (!url || seen.has(url)) continue
    seen.add(url)

    const title = stripHtml(asText(item.title))
    if (!title) continue

    const source =
      item.source && typeof item.source === "object" && "_" in item.source
        ? asText(item.source)
        : asText(item.source) || null

    items.push({
      url,
      title,
      description: stripHtml(asText(item.description)),
      sourceName: source || null,
      publishedAt: toIsoDate(asText(item.pubDate)),
      // Google News RSS does not include article images; left null (UI degrades gracefully).
      imageUrl: null,
    })
  }

  return { query, items }
}

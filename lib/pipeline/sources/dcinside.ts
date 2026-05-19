import { getSearchQueries } from "@/lib/pipeline/chair-names"
import type { RawContent } from "@/lib/pipeline/types"

const MIN_BODY_LENGTH = 15
const MAX_ITEMS = 5

interface NaverSearchItem {
  title?: string
  link?: string
  description?: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
}

function dedupeByUrl(items: RawContent[]): RawContent[] {
  const seen = new Set<string>()
  const results: RawContent[] = []
  for (const item of items) {
    if (!seen.has(item.url)) {
      seen.add(item.url)
      results.push(item)
    }
  }
  return results
}

function isDcInsideUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    lower.includes("dcinside.com") ||
    lower.includes("dcinside.co.kr") ||
    lower.includes("gall.dcinside")
  )
}

async function naverSearch(
  endpoint: "webkr" | "blog",
  query: string,
  clientId: string,
  clientSecret: string
): Promise<NaverSearchItem[]> {
  const params = new URLSearchParams({
    query,
    display: "10",
  })
  if (endpoint === "blog") {
    params.set("sort", "sim")
  }

  const url = `https://openapi.naver.com/v1/search/${endpoint}?${params}`
  console.log(`[DC] Naver ${endpoint} query:`, query)

  const response = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    console.log(`[DC] Naver ${endpoint} failed:`, response.status, text.slice(0, 200))
    return []
  }

  const data = (await response.json()) as { items?: NaverSearchItem[] }
  const items = data.items ?? []
  console.log(`[DC] Naver ${endpoint} results:`, items.length)
  return items
}

function itemsToRawContent(
  items: NaverSearchItem[],
  koQuery: string,
  requireDcUrl: boolean
): RawContent[] {
  const results: RawContent[] = []

  for (const item of items) {
    const link = item.link?.trim()
    if (!link) continue
    if (requireDcUrl && !isDcInsideUrl(link)) continue

    const title = stripHtml(item.title ?? "")
    const description = stripHtml(item.description ?? "")
    const combined = `${title}\n${description}`.trim()

    if (combined.length < MIN_BODY_LENGTH) continue

    results.push({
      url: link,
      title: title || koQuery,
      body: combined,
      source: "dcinside",
      collectedAt: new Date().toISOString(),
    })
  }

  return results
}

async function searchDCViaNaver(
  koQuery: string,
  clientId: string,
  clientSecret: string
): Promise<RawContent[]> {
  const allResults: RawContent[] = []

  // 1. Web search — DC Inside URLs only
  const webQueries = [
    `${koQuery} site:dcinside.com`,
    `${koQuery} 디시`,
    `${koQuery} 디시인사이드`,
  ]

  for (const query of webQueries) {
    const items = await naverSearch("webkr", query, clientId, clientSecret)
    allResults.push(...itemsToRawContent(items, koQuery, true))
    if (allResults.length >= 5) break
  }

  // 2. Blog search — posts mentioning DC / chair reviews (broader)
  if (allResults.length < 3) {
    const blogItems = await naverSearch(
      "blog",
      `${koQuery} 디시 의자`,
      clientId,
      clientSecret
    )
    for (const raw of itemsToRawContent(blogItems, koQuery, false)) {
      const text = `${raw.title} ${raw.body}`.toLowerCase()
      if (
        text.includes("디시") ||
        text.includes("dcinside") ||
        text.includes("dc inside")
      ) {
        allResults.push(raw)
      }
    }
  }

  return allResults
}

/**
 * DC Inside content via Naver Search API (webkr + blog fallback).
 * Avoids direct gall.dcinside.com fetches blocked on Vercel / browser CORS.
 */
export async function collectFromDCInside(
  chairSlug: string,
  chairNameEn: string
): Promise<RawContent[]> {
  const clientId = process.env.NAVER_CLIENT_ID?.trim()
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    console.log("[DC] NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not set, skipping")
    return []
  }

  const queries = getSearchQueries(chairSlug, chairNameEn, "ko")
  if (queries.length === 0) {
    queries.push(chairNameEn)
  }

  try {
    const allResults: RawContent[] = []

    for (const koQuery of queries.slice(0, 2)) {
      const items = await searchDCViaNaver(koQuery, clientId, clientSecret)
      allResults.push(...items)
    }

    const posts = dedupeByUrl(allResults).slice(0, MAX_ITEMS)

    if (posts.length > 0) {
      console.log("[DC] Sample title:", posts[0].title)
      console.log("[DC] Sample text:", posts[0].body.substring(0, 200))
    } else {
      console.log("[DC] No results — check NAVER API keys and webkr permission")
    }

    console.log("[DC] Total collected:", posts.length)
    return posts
  } catch (e) {
    console.error("[DC] Error:", e)
    return []
  }
}

import { parse } from "node-html-parser"
import { getSearchQueries } from "@/lib/pipeline/chair-names"
import { fetchWithTimeout } from "@/lib/pipeline/fetch-with-timeout"
import type { RawContent } from "@/lib/pipeline/types"

interface NaverBlogItem {
  title?: string
  link?: string
  description?: string
  bloggername?: string
  postdate?: string
}

function stripHtml(html: string): string {
  try {
    const root = parse(html)
    return root.textContent.replace(/\s+/g, " ").trim()
  } catch {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  }
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

async function searchNaverBlog(
  searchQuery: string,
  clientId: string,
  clientSecret: string
): Promise<RawContent[]> {
  const params = new URLSearchParams({
    query: searchQuery,
    display: "10",
    sort: "sim",
  })

  console.log("[NAVER] Query:", searchQuery)

  const res = await fetchWithTimeout(
    `https://openapi.naver.com/v1/search/blog?${params}`,
    {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
    }
  )

  console.log("[NAVER] Response status:", res.status)

  if (!res.ok) {
    console.warn(`[NAVER] search failed: HTTP ${res.status}`)
    return []
  }

  const json = (await res.json()) as { items?: NaverBlogItem[] }
  const items = json.items ?? []
  console.log("[NAVER] Items found:", items.length)

  const results: RawContent[] = []

  for (const item of items) {
    const link = item.link?.trim()
    const title = stripHtml(item.title ?? "")
    const body = stripHtml(item.description ?? "")

    if (!link || title.length < 5 || body.length < 80) continue

    const postdate = item.postdate
    const collectedAt = postdate
      ? `${postdate.slice(0, 4)}-${postdate.slice(4, 6)}-${postdate.slice(6, 8)}T00:00:00.000Z`
      : new Date().toISOString()

    results.push({
      url: link,
      title,
      body: item.bloggername ? `${body}\n\n— ${item.bloggername}` : body,
      source: "naver",
      collectedAt,
    })
  }

  return results
}

export async function collectFromNaver(
  chairSlug: string,
  chairNameEn: string
): Promise<RawContent[]> {
  const clientId = process.env.NAVER_CLIENT_ID?.trim()
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim()

  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    console.log("[NAVER] API keys not found, skipping")
    return []
  }

  console.log("[NAVER] Client ID exists:", !!process.env.NAVER_CLIENT_ID)

  if (!clientId || !clientSecret) {
    console.warn("[NAVER] NAVER_CLIENT_ID or NAVER_CLIENT_SECRET not set — skipping")
    return []
  }

  const queries = getSearchQueries(chairSlug, chairNameEn, "ko")
  const allResults: RawContent[] = []

  try {
    for (const query of queries) {
      const searchQuery = `${query} 의자 리뷰`
      const items = await searchNaverBlog(searchQuery, clientId, clientSecret)
      allResults.push(...items)
    }

    return dedupeByUrl(allResults)
  } catch (err) {
    console.warn("[naver] error:", err instanceof Error ? err.message : err)
    return []
  }
}

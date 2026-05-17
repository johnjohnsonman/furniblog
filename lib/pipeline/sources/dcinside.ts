import axios from "axios"
import { parse } from "node-html-parser"
import { getSearchQueries } from "@/lib/pipeline/chair-names"
import type { RawContent } from "@/lib/pipeline/types"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://gall.dcinside.com",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
}

const AD_KEYWORDS = ["판매", "팝니다", "삽니다", "거래", "양도"]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAdTitle(title: string): boolean {
  const t = title.toLowerCase()
  return AD_KEYWORDS.some((kw) => t.includes(kw))
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

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await axios.get(url, {
      headers: HEADERS,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (s) => s < 400,
    })
    return typeof res.data === "string" ? res.data : null
  } catch {
    return null
  }
}

function extractPostBody(html: string): string {
  const root = parse(html)
  root.querySelectorAll("script, style, img, iframe").forEach((el) => el.remove())

  const selectors = [".write_div", ".s_write", ".tbody", ".gallview_contents"]
  for (const sel of selectors) {
    const node = root.querySelector(sel)
    if (node) {
      const text = node.textContent.replace(/\s+/g, " ").trim()
      if (text.length >= 50) return text
    }
  }

  return root.textContent.replace(/\s+/g, " ").trim()
}

async function searchDCInsidePosts(
  searchQuery: string
): Promise<{ title: string; url: string }[]> {
  console.log("[DC] Searching for:", searchQuery)
  const searchUrl = `https://search.dcinside.com/post/p/1/sort/accuracy/q/${encodeURIComponent(searchQuery)}`

  let responseStatus = 0
  let html: string | null = null
  try {
    const res = await axios.get(searchUrl, {
      headers: HEADERS,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: () => true,
    })
    responseStatus = res.status
    html = typeof res.data === "string" ? res.data : null
  } catch {
    responseStatus = 0
  }

  console.log("[DC] Response status:", responseStatus)
  if (!html || responseStatus >= 400) return []

  const root = parse(html)
  const items: { title: string; url: string }[] = []

  root.querySelectorAll(".ub-content li, .sch_result li, li.ub-content").forEach((li) => {
    const titleEl = li.querySelector(".ub-word, .tit, a")
    const linkEl = li.querySelector("a[href]")
    if (!titleEl || !linkEl) return

    const title = titleEl.textContent.replace(/\s+/g, " ").trim()
    let href = linkEl.getAttribute("href") ?? ""
    if (!title || !href) return
    if (isAdTitle(title)) return

    if (href.startsWith("//")) href = `https:${href}`
    else if (href.startsWith("/")) href = `https://gall.dcinside.com${href}`

    items.push({ title, url: href })
  })

  return items
}

export async function collectFromDCInside(
  chairSlug: string,
  chairNameEn: string
): Promise<RawContent[]> {
  const queries = getSearchQueries(chairSlug, chairNameEn, "ko")
  const maxItems = 10

  try {
    const seenPostUrls = new Set<string>()
    const postItems: { title: string; url: string }[] = []

    for (const searchQuery of queries) {
      const items = await searchDCInsidePosts(searchQuery)
      for (const item of items) {
        if (!seenPostUrls.has(item.url)) {
          seenPostUrls.add(item.url)
          postItems.push(item)
        }
      }
      await sleep(1000)
    }

    const results: RawContent[] = []

    for (const item of postItems.slice(0, maxItems + 5)) {
      if (results.length >= maxItems) break

      await sleep(2500)

      const detailHtml = await fetchHtml(item.url)
      if (!detailHtml) continue

      const body = extractPostBody(detailHtml)
      if (body.length < 150) continue

      results.push({
        url: item.url,
        title: item.title,
        body,
        source: "dcinside",
        collectedAt: new Date().toISOString(),
      })
    }

    const posts = dedupeByUrl(results).slice(0, maxItems)
    if (posts.length > 0) {
      console.log("[DC] Sample post title:", posts[0].title)
      console.log("[DC] Sample post text:", posts[0].body.substring(0, 200))
    }
    return posts
  } catch (err) {
    console.warn(
      "[dcinside] collection failed:",
      err instanceof Error ? err.message : err
    )
    return []
  }
}

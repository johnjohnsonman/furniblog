import { parse } from "node-html-parser"
import type { RawContent } from "@/lib/pipeline/types"
import { getSearchQueries } from "@/lib/pipeline/chair-names"

// Kakaku.com (価格.com) — Japan's biggest price + user-review site. Rich,
// detailed office-chair reviews (esp. Japanese brands: Okamura, Itoki, Kokuyo,
// Ergohuman…). No API, so this scrapes: search → product code → review page.
// Best-effort: returns [] gracefully if Kakaku blocks the request or changes
// markup. Japanese text is summarized into English by the processor.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "ja,en-US;q=0.8,en;q=0.6",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

/** First Kakaku product code (e.g. K0001452880) that a search returns. */
async function findItemCode(query: string): Promise<string | null> {
  const html = await fetchHtml(`https://search.kakaku.com/${encodeURIComponent(query)}/`)
  if (!html) return null
  const m = html.match(/kakaku\.com\/item\/([A-Z]\d{7,12})\//)
  return m ? m[1] : null
}

/** Short stable hash so each distinct review gets a unique (idempotent) URL. */
function hash(text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h.toString(36)
}

function extractReviews(html: string): string[] {
  const out: string[] = []
  const root = parse(html)

  // 1) Structured data (Kakaku sometimes embeds Review objects).
  for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(s.textContent)
      const nodes = Array.isArray(data) ? data : [data]
      for (const d of nodes) {
        const reviews = d?.review ?? d?.reviews
        const list = Array.isArray(reviews) ? reviews : reviews ? [reviews] : []
        for (const r of list) {
          const body = r?.reviewBody ?? r?.description
          if (typeof body === "string" && body.trim().length > 40) out.push(body.trim())
        }
      }
    } catch {
      /* ignore malformed JSON-LD */
    }
  }
  if (out.length > 0) return out

  // 2) DOM heuristic: containers whose class looks like a review body.
  const selectors = [
    '[class*="revEntryCont"]',
    '[class*="reviewText"]',
    '[class*="revText"]',
    '[class*="revMainText"]',
    '[class*="review-body"]',
  ]
  for (const sel of selectors) {
    for (const el of root.querySelectorAll(sel)) {
      const t = el.textContent.replace(/\s+/g, " ").trim()
      if (t.length >= 60 && t.length <= 2500) out.push(t)
      if (out.length >= 12) break
    }
    if (out.length > 0) break
  }
  return out
}

export async function collectFromKakaku(
  chairSlug: string,
  chairName: string
): Promise<RawContent[]> {
  try {
    // Prefer the Japanese product name/alias for the search; fall back to English.
    const jp = getSearchQueries(chairSlug, chairName, "ja")[0]?.trim()
    const code =
      (jp ? await findItemCode(jp) : null) ?? (await findItemCode(chairName))
    if (!code) {
      console.log("[kakaku] no product found for", chairName)
      return []
    }

    const reviewUrl = `https://review.kakaku.com/review/${code}/`
    const html = await fetchHtml(reviewUrl)
    if (!html) return []

    const texts = [...new Set(extractReviews(html))]
      .filter((t) => t.length >= 40)
      .slice(0, 8)

    const results: RawContent[] = texts.map((body) => ({
      // Unique-but-stable per review so the pipeline dedupe keeps them all and
      // re-runs don't create duplicates.
      url: `${reviewUrl}#r${hash(body)}`,
      title: `${chairName} review — Kakaku.com`,
      body,
      source: "kakaku",
      collectedAt: new Date().toISOString(),
    }))

    console.log("[kakaku] reviews:", results.length, "for", chairName)
    return results
  } catch (err) {
    console.warn("[kakaku] error:", err instanceof Error ? err.message : err)
    return []
  }
}

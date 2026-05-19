import type { RawContent } from "@/lib/pipeline/types"

type HnHit = {
  objectID?: string
  comment_text?: string
  story_text?: string
  story_title?: string
  title?: string
  story_url?: string
}

const CHAIR_KEYWORDS = [
  "chair",
  "seat",
  "ergonomic",
  "lumbar",
  "office",
  "sitting",
  "back pain",
  "posture",
  "armrest",
  "mesh",
  "herman miller",
  "steelcase",
  "okamura",
  "humanscale",
]

const TECH_EXCLUDE = [
  "apache",
  "messaging",
  "transport",
  "protocol",
  "library",
  "framework",
  "software",
  "video",
  "github",
  "open source",
  "release",
]

function isChairRelated(text: string): boolean {
  const lower = text.toLowerCase()
  return CHAIR_KEYWORDS.some((kw) => lower.includes(kw))
}

function isTechArticle(storyTitle: string): boolean {
  const lower = storyTitle.toLowerCase()
  return TECH_EXCLUDE.some((kw) => lower.includes(kw))
}

export async function collectFromHackerNews(
  chairSlug: string,
  chairName: string
): Promise<RawContent[]> {
  void chairSlug
  const results: RawContent[] = []
  const seen = new Set<string>()

  const brandPrefix = chairName.split(" ").slice(0, 2).join(" ")
  const queries = [
    `${chairName} chair`,
    `${chairName} ergonomic`,
    `${brandPrefix} office chair`,
  ]

  for (const query of queries.slice(0, 2)) {
    try {
      const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=5`

      console.log("[HN] Searching:", query)
      const res = await fetch(searchUrl, {
        headers: { "User-Agent": "furniblog/1.0" },
        cache: "no-store",
      })

      if (!res.ok) continue

      const data = (await res.json()) as { hits?: HnHit[] }
      const hits = data.hits ?? []
      console.log("[HN] Hits:", hits.length)

      for (const hit of hits) {
        const text = hit.comment_text || hit.story_text || ""
        const title = hit.story_title || hit.title || "Hacker News discussion"
        const objectId = hit.objectID ?? ""
        const url =
          hit.story_url ||
          (objectId ? `https://news.ycombinator.com/item?id=${objectId}` : "")

        if (text.length < 50 || !objectId || seen.has(objectId) || !url) continue

        if (isTechArticle(title)) {
          console.log("[HN] Filtered out (tech article):", title)
          continue
        }

        seen.add(objectId)

        const cleanText = text.replace(/<[^>]*>/g, " ").trim()
        const combined = `${title}\n\n${cleanText}`

        if (!isChairRelated(combined)) {
          console.log("[HN] Filtered out (not chair related):", title)
          continue
        }

        results.push({
          url,
          title,
          body: combined,
          source: "hackernews",
          collectedAt: new Date().toISOString(),
        })

        if (results.length >= 5) break
      }

      if (results.length >= 5) break

      await new Promise((r) => setTimeout(r, 500))
    } catch (e) {
      console.error("[HN] Error:", e)
    }
  }

  console.log("[HN] Total:", results.length)
  return results
}

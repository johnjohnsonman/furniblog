import type { RawContent } from "@/lib/pipeline/types"

interface YoutubeSearchItem {
  id?: { videoId?: string }
  snippet?: { title?: string; description?: string }
}

interface YoutubeVideoItem {
  id?: string
  snippet?: { title?: string; description?: string }
  statistics?: { viewCount?: string }
}

interface CommentThreadItem {
  snippet?: {
    topLevelComment?: {
      snippet?: { textDisplay?: string }
    }
  }
}

export function buildYoutubeSearchQuery(chairName: string): string {
  const name = chairName.trim().replace(/"/g, "")
  return `${name} review`
}

async function getVideoComments(
  videoId: string,
  apiKey: string
): Promise<string> {
  try {
    const params = new URLSearchParams({
      part: "snippet",
      videoId,
      maxResults: "20",
      order: "relevance",
      key: apiKey,
    })
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?${params}`
    )
    if (!res.ok) return ""

    const data = (await res.json()) as { items?: CommentThreadItem[] }
    const comments = (data.items ?? [])
      .map((c) => c.snippet?.topLevelComment?.snippet?.textDisplay ?? "")
      .filter((t) => t.length >= 30)
      .slice(0, 10)
      .join("\n---\n")

    return comments
  } catch {
    return ""
  }
}

type YtLocale = {
  country: string
  regionCode: string
  relevanceLanguage: string
  query: (name: string) => string
  maxResults: number
}

// Always search the global/English pool, then ONE rotating foreign market per
// chair so review coverage spreads worldwide without blowing the API quota
// (2 search calls per chair instead of one-per-locale).
const YT_BASE: YtLocale = {
  country: "US",
  regionCode: "US",
  relevanceLanguage: "en",
  query: (n) => `${n} review`,
  maxResults: 5,
}
const YT_FOREIGN: YtLocale[] = [
  { country: "JP", regionCode: "JP", relevanceLanguage: "ja", query: (n) => `${n} レビュー`, maxResults: 4 },
  { country: "DE", regionCode: "DE", relevanceLanguage: "de", query: (n) => `${n} test erfahrungen`, maxResults: 4 },
  { country: "FR", regionCode: "FR", relevanceLanguage: "fr", query: (n) => `${n} avis test`, maxResults: 4 },
  { country: "IN", regionCode: "IN", relevanceLanguage: "en", query: (n) => `${n} review`, maxResults: 4 },
]

/** Deterministic per-chair rotation so different chairs hit different markets. */
function pickForeignLocale(chairName: string): YtLocale {
  let h = 0
  for (let i = 0; i < chairName.length; i++) h = (h * 31 + chairName.charCodeAt(i)) >>> 0
  return YT_FOREIGN[h % YT_FOREIGN.length]
}

async function searchVideoIds(
  locale: YtLocale,
  chairName: string,
  apiKey: string
): Promise<string[]> {
  const params = new URLSearchParams({
    part: "snippet",
    q: locale.query(chairName),
    type: "video",
    maxResults: String(locale.maxResults),
    regionCode: locale.regionCode,
    relevanceLanguage: locale.relevanceLanguage,
    key: apiKey,
  })
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
    if (!res.ok) {
      console.warn(`[youtube] search failed (${locale.country}): HTTP ${res.status}`)
      return []
    }
    const json = (await res.json()) as { items?: YoutubeSearchItem[] }
    return (json.items ?? [])
      .map((i) => i.id?.videoId)
      .filter((id): id is string => Boolean(id))
  } catch {
    return []
  }
}

export async function collectFromYoutube(chairName: string): Promise<RawContent[]> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    console.warn("[youtube] YOUTUBE_API_KEY not set — skipping")
    return []
  }

  try {
    const locales = [YT_BASE, pickForeignLocale(chairName)]
    console.log("[youtube] markets:", locales.map((l) => l.country).join("+"), "for", chairName)

    const idLists = await Promise.all(
      locales.map((l) => searchVideoIds(l, chairName, apiKey))
    )
    const videoIds = [...new Set(idLists.flat())].slice(0, 9)

    if (videoIds.length === 0) return []

    const videoParams = new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds.join(","),
      key: apiKey,
    })

    const videoRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${videoParams}`
    )

    if (!videoRes.ok) {
      console.warn(`[youtube] videos failed: HTTP ${videoRes.status}`)
      return []
    }

    const videoJson = (await videoRes.json()) as { items?: YoutubeVideoItem[] }
    const results: RawContent[] = []

    for (const video of videoJson.items ?? []) {
      const id = video.id
      if (!id) continue

      const title = (video.snippet?.title ?? chairName).trim()
      const description = (video.snippet?.description ?? "").trim()
      const viewCount = Number(video.statistics?.viewCount ?? 0)

      const comments = await getVideoComments(id, apiKey)
      const body = `${title}\n\n${description}${
        comments ? `\n\nUser comments:\n${comments}` : ""
      }`.trim()

      const minLength = comments.length > 0 ? 100 : 200
      if (body.length < minLength) continue
      if (viewCount < 1000 && !comments) continue

      results.push({
        url: `https://www.youtube.com/watch?v=${id}`,
        title,
        body,
        source: "youtube",
        viewCount,
        collectedAt: new Date().toISOString(),
      })
    }

    console.log("[youtube] Total with comments:", results.length)
    return results
  } catch (err) {
    console.warn(
      "[youtube] error:",
      err instanceof Error ? err.message : err
    )
    return []
  }
}

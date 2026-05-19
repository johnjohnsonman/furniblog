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

/** Quoted exact product name + review (e.g. `"Vitra Physix" review`) */
export function buildYoutubeSearchQuery(chairName: string): string {
  const name = chairName.trim().replace(/"/g, "")
  const tokens = name.split(/\s+/).filter(Boolean)

  if (tokens.length === 1) {
    return `"${name}" chair review`
  }

  return `"${name}" review`
}

/** Model-level token (e.g. Physix, Modus, Aeron) — avoids brand-only matches */
function getPrimaryModelToken(chairName: string): string {
  const tokens = chairName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)

  return tokens[tokens.length - 1] ?? chairName.trim().toLowerCase()
}

export function isVideoRelevantToProduct(
  chairName: string,
  title: string,
  description: string
): boolean {
  const text = `${title} ${description}`.toLowerCase()
  const primary = getPrimaryModelToken(chairName)

  if (!primary || !text.includes(primary)) {
    return false
  }

  const tokens = chairName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)

  if (tokens.length >= 2) {
    const brand = tokens[0]
    if (text.includes(brand) && !text.includes(primary)) {
      return false
    }
  }

  return true
}

async function getVideoComments(
  videoId: string,
  apiKey: string,
  chairName: string
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
      .filter((t) => {
        if (t.length < 30) return false
        const lower = t.toLowerCase()
        const primary = getPrimaryModelToken(chairName)
        return lower.includes(primary)
      })
      .slice(0, 10)
      .join("\n---\n")

    return comments
  } catch {
    return ""
  }
}

export async function collectFromYoutube(chairName: string): Promise<RawContent[]> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    console.warn("[youtube] YOUTUBE_API_KEY not set — skipping")
    return []
  }

  try {
    const searchQuery = buildYoutubeSearchQuery(chairName)
    console.log("[youtube] Search query:", searchQuery)

    const searchParams = new URLSearchParams({
      part: "snippet",
      q: searchQuery,
      type: "video",
      maxResults: "5",
      key: apiKey,
    })

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams}`
    )

    if (!searchRes.ok) {
      console.warn(`[youtube] search failed: HTTP ${searchRes.status}`)
      return []
    }

    const searchJson = (await searchRes.json()) as {
      items?: YoutubeSearchItem[]
    }

    const videoIds = (searchJson.items ?? [])
      .map((i) => i.id?.videoId)
      .filter((id): id is string => Boolean(id))

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

      if (!isVideoRelevantToProduct(chairName, title, description)) {
        console.log("[youtube] Skipped irrelevant video:", title)
        continue
      }

      const comments = await getVideoComments(id, apiKey, chairName)
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

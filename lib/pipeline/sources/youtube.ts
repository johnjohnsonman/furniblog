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

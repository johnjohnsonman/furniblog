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

export async function collectFromYoutube(chairName: string): Promise<RawContent[]> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim()
  if (!apiKey) {
    console.warn("[youtube] YOUTUBE_API_KEY not set — skipping")
    return []
  }

  try {
    const searchParams = new URLSearchParams({
      part: "snippet",
      q: `${chairName} review`,
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
      const description = (video.snippet?.description ?? "").trim()
      const viewCount = Number(video.statistics?.viewCount ?? 0)

      if (!id || description.length < 200) continue
      if (viewCount < 1000) continue

      results.push({
        url: `https://www.youtube.com/watch?v=${id}`,
        title: (video.snippet?.title ?? chairName).trim(),
        body: description,
        source: "youtube",
        viewCount,
        collectedAt: new Date().toISOString(),
      })
    }

    return results
  } catch (err) {
    console.warn(
      "[youtube] error:",
      err instanceof Error ? err.message : err
    )
    return []
  }
}

import type { ReviewSource } from "@/types/review"
import { collectFromReddit } from "@/lib/pipeline/sources/reddit"
import { collectFromYoutube } from "@/lib/pipeline/sources/youtube"
import { collectFromNaver } from "@/lib/pipeline/sources/naver"
import type { RawContent } from "@/lib/pipeline/types"

export type { RawContent } from "@/lib/pipeline/types"

/** @deprecated Use lib/pipeline/sources/* directly */
export interface LegacyRawContent {
  url: string
  title: string
  body: string
  source: ReviewSource
  collectedAt: string
}

function toLegacy(items: RawContent[]): LegacyRawContent[] {
  return items.map((item) => ({
    url: item.url,
    title: item.title,
    body: item.body,
    source: item.source,
    collectedAt: item.collectedAt,
  }))
}

export async function collectFromRedditLegacy(query: string): Promise<LegacyRawContent[]> {
  return toLegacy(await collectFromReddit(query, query))
}

export async function collectFromYoutubeLegacy(
  chairName: string
): Promise<LegacyRawContent[]> {
  return toLegacy(await collectFromYoutube(chairName))
}

export async function collectFromNaverLegacy(query: string): Promise<LegacyRawContent[]> {
  return toLegacy(await collectFromNaver(query, query))
}

export async function collectFromDCInsideLegacy(
  query: string
): Promise<LegacyRawContent[]> {
  const { collectFromDCInside } = await import("@/lib/pipeline/sources/dcinside")
  return toLegacy(await collectFromDCInside(query, query))
}

export type CollectSource = "reddit" | "youtube" | "naver" | "dcinside"

export async function collectBySource(
  source: CollectSource,
  query: string
): Promise<LegacyRawContent[]> {
  switch (source) {
    case "reddit":
      return collectFromRedditLegacy(query)
    case "youtube":
      return collectFromYoutubeLegacy(query)
    case "naver":
      return collectFromNaverLegacy(query)
    case "dcinside":
      return collectFromDCInsideLegacy(query)
    default:
      return []
  }
}

export type { ChairNameEntry } from "@/lib/pipeline/chair-names-types"
export { CHAIR_NAMES } from "@/lib/pipeline/chair-names/index"

import { CHAIR_NAMES } from "@/lib/pipeline/chair-names/index"
import type { ChairNameEntry } from "@/lib/pipeline/chair-names-types"

const EMPTY_ALIASES = { en: [] as string[], ja: [] as string[], ko: [] as string[] }

const MAX_SEARCH_QUERIES = 4

export function getChairNames(slug: string, nameEn: string): ChairNameEntry {
  return (
    CHAIR_NAMES[slug] ?? {
      en: nameEn,
      ja: nameEn,
      ko: nameEn,
      aliases: EMPTY_ALIASES,
    }
  )
}

export function getSearchQueries(
  slug: string,
  nameEn: string,
  language: "en" | "ja" | "ko"
): string[] {
  const entry = CHAIR_NAMES[slug]
  if (!entry) return [nameEn].slice(0, MAX_SEARCH_QUERIES)

  const main = entry[language]
  const aliases = entry.aliases[language]
  const seen = new Set<string>()
  const queries: string[] = []

  for (const q of [main, ...aliases]) {
    const trimmed = q.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    queries.push(trimmed)
    if (queries.length >= MAX_SEARCH_QUERIES) break
  }

  return queries
}

import type { SupabaseClient } from "@supabase/supabase-js"
import { GENERIC_VIDEO_SUMMARY_PHRASES } from "@/lib/videos/summary"

export type VideoCleanupMode = "all" | "clear_summaries" | "generic_summaries"

export type VideoCleanupResult = {
  mode: VideoCleanupMode
  deleted: number
  summariesCleared: number
}

export async function cleanupVideos(params: {
  supabase: SupabaseClient
  mode: VideoCleanupMode
}): Promise<VideoCleanupResult> {
  const { supabase, mode } = params

  if (mode === "all") {
    const { count, error: countError } = await supabase
      .from("videos")
      .select("id", { count: "exact", head: true })

    if (countError) throw new Error(countError.message)

    const { error } = await supabase
      .from("videos")
      .delete()
      .gte("created_at", "1970-01-01T00:00:00Z")
    if (error) throw new Error(error.message)

    return { mode, deleted: count ?? 0, summariesCleared: 0 }
  }

  if (mode === "clear_summaries") {
    const { count, error: countError } = await supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .not("summary", "is", null)

    if (countError) throw new Error(countError.message)

    const { error } = await supabase
      .from("videos")
      .update({ summary: null })
      .not("summary", "is", null)

    if (error) throw new Error(error.message)

    return { mode, deleted: 0, summariesCleared: count ?? 0 }
  }

  // generic_summaries: clear placeholder summaries so backfill can regenerate
  const { data: rows, error: fetchError } = await supabase
    .from("videos")
    .select("id, summary")
    .not("summary", "is", null)

  if (fetchError) throw new Error(fetchError.message)

  const genericIds = (rows ?? [])
    .filter((row) => {
      const s = typeof row.summary === "string" ? row.summary.trim() : ""
      return GENERIC_VIDEO_SUMMARY_PHRASES.some(
        (phrase) => s === phrase || s.startsWith(phrase.slice(0, 40))
      )
    })
    .map((row) => row.id as string)

  if (genericIds.length === 0) {
    return { mode, deleted: 0, summariesCleared: 0 }
  }

  const { error: updateError } = await supabase
    .from("videos")
    .update({ summary: null })
    .in("id", genericIds)

  if (updateError) throw new Error(updateError.message)

  return { mode, deleted: 0, summariesCleared: genericIds.length }
}

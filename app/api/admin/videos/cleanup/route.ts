import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { cleanupVideos, type VideoCleanupMode } from "@/lib/videos/cleanup"

const VALID_MODES: VideoCleanupMode[] = [
  "all",
  "clear_summaries",
  "generic_summaries",
]

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: { mode?: VideoCleanupMode; confirm?: boolean }
  try {
    body = (await request.json()) as { mode?: VideoCleanupMode; confirm?: boolean }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const mode = body.mode
  if (!mode || !VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: "mode must be all, clear_summaries, or generic_summaries" },
      { status: 400 }
    )
  }

  if (!body.confirm) {
    return NextResponse.json(
      { error: "Set confirm: true to run cleanup" },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminClient()
    const result = await cleanupVideos({ supabase, mode })
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 }
    )
  }
}

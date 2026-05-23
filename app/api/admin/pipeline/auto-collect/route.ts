import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import {
  autoCollectFromSubreddits,
  collectSubredditBatch,
} from "@/lib/pipeline/auto-collect"
import { CHAIR_SUBREDDITS } from "@/lib/pipeline/subreddits"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: {
    targetCount?: number
    subreddit?: string
    limit?: number
    statsSoFar?: {
      new: number
      skipped: number
      classified: number
      noMatch: number
      postsScanned: number
    }
    runAll?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const targetCount = Math.min(
    Math.max(1, Number(body.targetCount) || 50),
    500
  )
  const limit = Math.min(Math.max(5, Number(body.limit) || 30), 100)

  try {
    const supabase = createAdminClient()

    if (body.runAll) {
      const stats = await autoCollectFromSubreddits(supabase, {
        targetCount,
        postsPerSubreddit: limit,
        signal: request.signal,
      })
      return NextResponse.json({
        success: true,
        stats,
        subreddits: [...CHAIR_SUBREDDITS],
      })
    }

    const subreddit = String(body.subreddit ?? "").trim()
    if (!subreddit) {
      return NextResponse.json(
        { error: "subreddit or runAll required" },
        { status: 400 }
      )
    }

    const result = await collectSubredditBatch(supabase, {
      subreddit,
      limit,
      targetCount,
      statsSoFar: body.statsSoFar,
      signal: request.signal,
    })

    return NextResponse.json({
      success: true,
      ...result,
      subreddits: [...CHAIR_SUBREDDITS],
    })
  } catch (error) {
    console.error("[auto-collect]", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Collect failed",
      },
      { status: 500 }
    )
  }
}

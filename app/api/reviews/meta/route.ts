import { NextResponse } from "next/server"
import { getReviewsFeedMeta } from "@/lib/supabase/reviews-feed"

export async function GET() {
  try {
    const meta = await getReviewsFeedMeta()
    return NextResponse.json(meta)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load meta"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  collectVideosForChair,
  collectVideosForPublishedChairs,
} from "@/lib/videos/collect"

export const maxDuration = 60

type RequestBody = {
  mode?: "single" | "all"
  chairSlug?: string
  maxChairs?: number
  delayMs?: number
  skipChairsWithVideos?: boolean
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const mode = body.mode ?? "single"

  try {
    if (mode === "single") {
      const chairSlug = body.chairSlug?.trim()
      if (!chairSlug) {
        return NextResponse.json({ error: "chairSlug is required" }, { status: 400 })
      }

      const { data: product, error } = await supabase
        .from("products")
        .select("id, slug, name, published, track, brands(name)")
        .eq("slug", chairSlug)
        .eq("track", "chair")
        .maybeSingle()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      const result = await collectVideosForChair({
        supabase,
        product: product as Parameters<typeof collectVideosForChair>[0]["product"],
      })

      return NextResponse.json({
        success: true,
        mode: "single",
        ...result,
        message: result.quotaExceeded ? "quota exceeded" : "completed",
      })
    }

    const result = await collectVideosForPublishedChairs({
      supabase,
      options: {
        maxChairs: Math.max(1, Math.min(Number(body.maxChairs ?? 50), 100)),
        delayMs: Math.max(0, Math.min(Number(body.delayMs ?? 1000), 20_000)),
        skipChairsWithVideos: Boolean(body.skipChairsWithVideos ?? true),
      },
    })

    return NextResponse.json({
      success: true,
      mode: "all",
      ...result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video collect failed" },
      { status: 500 }
    )
  }
}

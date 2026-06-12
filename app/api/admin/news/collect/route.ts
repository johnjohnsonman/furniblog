import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  collectNewsForBrand,
  collectNewsForAllBrands,
} from "@/lib/news/collect"

export const maxDuration = 60

type RequestBody = {
  mode?: "single" | "all"
  brand?: string
  maxBrands?: number
  maxPerBrand?: number
  delayMs?: number
  skipBrandsWithNews?: boolean
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
      const brand = body.brand?.trim()
      if (!brand) {
        return NextResponse.json({ error: "brand is required" }, { status: 400 })
      }

      const result = await collectNewsForBrand({
        supabase,
        brand,
        maxItems: Math.max(1, Math.min(Number(body.maxPerBrand ?? 10), 25)),
      })

      return NextResponse.json({
        success: true,
        mode: "single",
        ...result,
        message: "completed",
      })
    }

    const result = await collectNewsForAllBrands({
      supabase,
      options: {
        maxBrands: Math.max(1, Math.min(Number(body.maxBrands ?? 20), 120)),
        maxPerBrand: Math.max(1, Math.min(Number(body.maxPerBrand ?? 8), 25)),
        delayMs: Math.max(0, Math.min(Number(body.delayMs ?? 800), 20_000)),
        skipBrandsWithNews: Boolean(body.skipBrandsWithNews ?? false),
      },
    })

    return NextResponse.json({
      success: true,
      mode: "all",
      ...result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "News collect failed" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { fixVideoTitleEntities } from "@/lib/videos/collect"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const supabase = createAdminClient()
    const result = await fixVideoTitleEntities({ supabase })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fix titles failed" },
      { status: 500 }
    )
  }
}

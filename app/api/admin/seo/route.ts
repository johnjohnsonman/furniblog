import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { getSeoOverview, isGscConfigured } from "@/lib/seo/gsc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  if (!isGscConfigured()) {
    return NextResponse.json(
      { error: "Search Console not configured (set GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY / GSC_SITE_URL)." },
      { status: 503 }
    )
  }

  const daysParam = Number(request.nextUrl.searchParams.get("days") ?? 28)
  const days = [1, 7, 28, 90].includes(daysParam) ? daysParam : 28

  try {
    const data = await getSeoOverview(days)
    return NextResponse.json(data)
  } catch (error) {
    return jsonInternalError(error)
  }
}

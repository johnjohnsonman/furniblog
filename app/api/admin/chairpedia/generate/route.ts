import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { generateChairpediaDraft } from "@/lib/chairpedia/generate"

export const runtime = "nodejs"
export const maxDuration = 300 // research + long-form writing can take a while

// AI-generate a research-grounded draft from a chair name.
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const body = await request.json()
    const chairName = (body.chairName as string)?.trim()
    if (!chairName) {
      return NextResponse.json({ error: "Enter a chair name" }, { status: 400 })
    }
    const draft = await generateChairpediaDraft(chairName)
    return NextResponse.json({ draft })
  } catch (error) {
    return jsonInternalError(error)
  }
}

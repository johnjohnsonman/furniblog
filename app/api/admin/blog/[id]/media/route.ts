import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { enrichBlogPosts } from "@/lib/blog/media-server"

export const runtime = "nodejs"

/** Preview only; the editor's regular Save action persists the result. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const body = await request.json()
    if (typeof body.content_html !== "string" || body.content_html.length > 500_000 ||
        !(body.hero_image_url == null || typeof body.hero_image_url === "string")) {
      return NextResponse.json({ error: "Invalid article media input" }, { status: 400 })
    }
    const [post] = await enrichBlogPosts([{ content_html: body.content_html, hero_image_url: body.hero_image_url ?? null }])
    return NextResponse.json({ post })
  } catch (error) { return jsonInternalError(error) }
}

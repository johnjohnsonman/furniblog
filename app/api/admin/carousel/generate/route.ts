import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import { generateCarouselDraft, htmlToText, type CarouselSource } from "@/lib/carousel/generate"

export const runtime = "nodejs"
export const maxDuration = 60

/** Pull image URLs out of an HTML string, in document order, de-duplicated. */
function extractImages(html: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const re = /<img[^>]+src=["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const url = m[1].trim()
    if (url && !seen.has(url)) {
      seen.add(url)
      out.push(url)
    }
  }
  return out
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const body = await request.json()
    const blogId = (body.blogId as string)?.trim() || null

    let source: CarouselSource
    let images: string[] = []

    if (blogId) {
      const supabase = createAdminClient()
      const { data, error } = await supabase
        .from("blog_posts")
        .select("title, subtitle, excerpt, content_html, hero_image_url")
        .eq("id", blogId)
        .maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!data) return NextResponse.json({ error: "Post not found" }, { status: 404 })
      source = {
        title: (data.title as string) ?? "",
        subtitle: (data.subtitle as string | null) ?? null,
        excerpt: (data.excerpt as string | null) ?? null,
        bodyText: htmlToText((data.content_html as string) ?? ""),
      }
      const hero = (data.hero_image_url as string | null) ?? null
      images = [...(hero ? [hero] : []), ...extractImages((data.content_html as string) ?? "")]
    } else {
      const title = (body.title as string)?.trim() || ""
      const text = (body.text as string)?.trim() || ""
      if (text.length < 60) {
        return NextResponse.json({ error: "Paste a post, or select a blog post." }, { status: 400 })
      }
      source = { title, subtitle: null, excerpt: null, bodyText: text }
    }

    const { draft, usage } = await generateCarouselDraft(source)

    return NextResponse.json({
      slides: draft.slides,
      caption: draft.caption,
      hashtags: draft.hashtags,
      images: [...new Set(images)].slice(0, 12),
      usage,
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

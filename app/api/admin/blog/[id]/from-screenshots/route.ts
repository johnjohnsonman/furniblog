import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  generateBlogPostFromImages,
  type BlogImageInput,
  type CatalogChair,
} from "@/lib/blog/generate"
import { tagAmazonLinks } from "@/lib/blog/postprocess"

export const runtime = "nodejs"
export const maxDuration = 300

const MAX_IMAGES = 8

/** data:image/png;base64,XXXX -> { media_type, data } */
function parseDataUrl(dataUrl: string): BlogImageInput | null {
  const m = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/)
  if (!m) return null
  const mt = m[1] === "image/jpg" ? "image/jpeg" : (m[1] as BlogImageInput["media_type"])
  return { media_type: mt, data: m[3] }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const body = (await request.json()) as { images?: string[] }
    const images = (body.images ?? [])
      .slice(0, MAX_IMAGES)
      .map(parseDataUrl)
      .filter((x): x is BlogImageInput => x !== null)

    if (images.length === 0) {
      return NextResponse.json({ error: "Add at least one screenshot." }, { status: 400 })
    }

    const supabase = createAdminClient()
    await supabase
      .from("blog_posts")
      .update({
        gen_status: "generating",
        gen_error: null,
        gen_started_at: new Date().toISOString(),
        source_url: null,
      })
      .eq("id", id)

    after(async () => {
      const db = createAdminClient()
      try {
        const { data: chairs } = await db
          .from("products")
          .select("slug,name")
          .eq("track", "chair")
          .eq("published", true)
        const catalog: CatalogChair[] = (chairs ?? []).map((c) => ({
          slug: c.slug as string,
          name: c.name as string,
        }))

        const draft = await generateBlogPostFromImages({ images, catalog })

        await db
          .from("blog_posts")
          .update({
            title: draft.title || undefined,
            subtitle: draft.subtitle || null,
            excerpt: draft.excerpt || null,
            seo_title: draft.seo_title || null,
            seo_description: draft.seo_description || null,
            content_html: tagAmazonLinks(draft.content_html),
            gen_status: "done",
            gen_error: null,
            gen_sources: [],
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)

        // Category is a later migration (036) — save separately so a not-yet-
        // migrated DB still completes generation.
        if (draft.category) {
          await db.from("blog_posts").update({ category: draft.category }).eq("id", id)
        }
      } catch (err) {
        await db
          .from("blog_posts")
          .update({
            gen_status: "error",
            gen_error: err instanceof Error ? err.message : String(err),
          })
          .eq("id", id)
      }
    })

    return NextResponse.json({ status: "generating" })
  } catch (error) {
    return jsonInternalError(error)
  }
}

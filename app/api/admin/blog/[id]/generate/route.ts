import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { parse as parseHtml } from "node-html-parser"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchWithTimeout } from "@/lib/pipeline/fetch-with-timeout"
import { generateBlogPost, type CatalogChair } from "@/lib/blog/generate"
import { tagAmazonLinks } from "@/lib/blog/postprocess"

export const runtime = "nodejs"
export const maxDuration = 300

/** Pull a usable title + main text body out of an article URL. */
async function extractArticle(url: string): Promise<{ title: string; text: string }> {
  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FurniblogBot/1.0; +https://www.furniblog.com)",
      },
    },
    15_000
  )
  if (!res.ok) throw new Error(`Could not fetch the source (HTTP ${res.status})`)
  const html = await res.text()
  const root = parseHtml(html)

  root.querySelectorAll("script, style, noscript, nav, header, footer, aside, form").forEach((n) =>
    n.remove()
  )

  const title =
    root.querySelector('meta[property="og:title"]')?.getAttribute("content")?.trim() ||
    root.querySelector("title")?.textContent?.trim() ||
    ""

  const main =
    root.querySelector("article") ||
    root.querySelector("main") ||
    root.querySelector(".entry-content") ||
    root.querySelector("#content") ||
    root.querySelector("body") ||
    root

  const text = main.textContent.replace(/\s+\n/g, "\n").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim()
  return { title, text }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { id } = await context.params
  try {
    const body = await request.json()
    const sourceUrl = (body.sourceUrl as string)?.trim()
    if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) {
      return NextResponse.json({ error: "Paste a valid http(s) source URL." }, { status: 400 })
    }

    const supabase = createAdminClient()
    await supabase
      .from("blog_posts")
      .update({
        gen_status: "generating",
        gen_error: null,
        gen_started_at: new Date().toISOString(),
        source_url: sourceUrl,
      })
      .eq("id", id)

    after(async () => {
      const db = createAdminClient()
      try {
        const { title, text } = await extractArticle(sourceUrl)
        if (!text || text.length < 200) {
          throw new Error("The source page had too little readable text (paywall or JS-only?).")
        }

        const { data: chairs } = await db
          .from("products")
          .select("slug,name")
          .eq("track", "chair")
          .eq("published", true)
        const catalog: CatalogChair[] = (chairs ?? []).map((c) => ({
          slug: c.slug as string,
          name: c.name as string,
        }))

        const draft = await generateBlogPost({
          sourceText: text,
          sourceTitle: title,
          sourceUrl,
          catalog,
        })

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
            gen_sources: [sourceUrl],
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)

        // Category lives in a later migration (036); save it separately so a
        // not-yet-migrated DB still completes generation.
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

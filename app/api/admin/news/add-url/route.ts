import { NextRequest, NextResponse } from "next/server"
import { parse as parseHtml } from "node-html-parser"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { fetchWithTimeout } from "@/lib/pipeline/fetch-with-timeout"
import { checkNewsRelevance } from "@/lib/news/relevance"
import { newsSlug } from "@/lib/news/slug"
import { loadKnownBrands } from "@/lib/news/collect"
import { loadBrandImages, pickBrandImage } from "@/lib/news/brand-images"

export const runtime = "nodejs"
export const maxDuration = 60

type RequestBody = {
  /** "preview" extracts + summarizes without saving; "publish" stores the (edited) fields. */
  action?: "preview" | "publish"
  url?: string
  brand?: string | null
  // Publish-only (already reviewed/edited by the admin):
  title?: string
  summary?: string | null
  whyItMatters?: string | null
  imageUrl?: string | null
  sourceName?: string | null
  publishedAt?: string | null
}

function metaContent(root: ReturnType<typeof parseHtml>, selectors: string[]): string {
  for (const sel of selectors) {
    const el = root.querySelector(sel)
    const content = el?.getAttribute("content")?.trim()
    if (content) return content
  }
  return ""
}

/** Best-effort extraction of an article's title / description / image / date from its HTML. */
async function extractArticle(url: string): Promise<{
  title: string
  description: string
  imageUrl: string | null
  sourceName: string | null
  publishedAt: string | null
}> {
  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FurniblogNewsBot/1.0; +https://www.furniblog.com)",
      },
    },
    12_000
  )
  if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`)

  const html = await res.text()
  const root = parseHtml(html)

  const title =
    metaContent(root, [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ]) ||
    root.querySelector("title")?.textContent?.trim() ||
    ""

  const description = metaContent(root, [
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
    'meta[name="description"]',
  ])

  const imageUrl =
    metaContent(root, [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ]) || null

  const sourceName =
    metaContent(root, ['meta[property="og:site_name"]']) ||
    (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "")
      } catch {
        return null
      }
    })()

  const rawDate = metaContent(root, [
    'meta[property="article:published_time"]',
    'meta[name="article:published_time"]',
    'meta[property="og:updated_time"]',
    'meta[name="date"]',
  ])
  let publishedAt: string | null = null
  if (rawDate) {
    const d = new Date(rawDate)
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString()
  }

  return { title, description, imageUrl, sourceName, publishedAt }
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

  const action = body.action ?? "preview"
  const url = body.url?.trim()
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json(
      { error: "A valid http(s) URL is required" },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    // Reject duplicates early (url is the table's unique key).
    const { data: existing } = await supabase
      .from("news")
      .select("id, slug")
      .eq("url", url)
      .maybeSingle()
    if (existing) {
      return NextResponse.json(
        {
          error: "This article is already in the news feed.",
          existingId: existing.id,
          existingSlug: existing.slug,
        },
        { status: 409 }
      )
    }

    const knownBrands = await loadKnownBrands(supabase)

    if (action === "preview") {
      // 1) Pull metadata from the page (best effort).
      let extracted = {
        title: "",
        description: "",
        imageUrl: null as string | null,
        sourceName: null as string | null,
        publishedAt: null as string | null,
      }
      let fetchError: string | null = null
      try {
        extracted = await extractArticle(url)
      } catch (err) {
        fetchError = err instanceof Error ? err.message : "Could not fetch the page"
      }

      // 2) Summarize with Claude (reuse the curator). For a manually chosen
      //    article we IGNORE the relevance gate — we only want summary/brand.
      let summary: string | null = null
      let whyItMatters: string | null = null
      let brand: string | null = body.brand?.trim() || null
      if (extracted.title || extracted.description) {
        try {
          const rel = await checkNewsRelevance({
            title: extracted.title,
            description: extracted.description,
            candidateBrand: brand ?? "",
            knownBrands,
          })
          summary = rel.summary
          whyItMatters = rel.whyItMatters
          if (!brand) brand = rel.brand
        } catch {
          // Summary stays null; admin can write it manually.
        }
      }

      // 3) Thumbnail: og:image, else brand fallback.
      const brandImages = await loadBrandImages(supabase)
      const imageUrl =
        extracted.imageUrl || pickBrandImage(brandImages, brand) || null

      return NextResponse.json({
        action: "preview",
        fetchError,
        preview: {
          url,
          title: extracted.title,
          summary,
          whyItMatters,
          brand,
          imageUrl,
          sourceName: extracted.sourceName,
          publishedAt: extracted.publishedAt,
        },
      })
    }

    // action === "publish": store the (admin-reviewed) fields.
    const title = body.title?.trim()
    if (!title) {
      return NextResponse.json(
        { error: "A title is required to publish." },
        { status: 400 }
      )
    }

    // Only accept a brand that is actually in our known list.
    const knownSet = new Set(knownBrands.map((b) => b.toLowerCase()))
    const proposedBrand = body.brand?.trim() || ""
    const brand =
      proposedBrand && knownSet.has(proposedBrand.toLowerCase())
        ? proposedBrand
        : null

    const brandImages = await loadBrandImages(supabase)
    const imageUrl =
      body.imageUrl?.trim() || pickBrandImage(brandImages, brand) || null

    const row = {
      url,
      slug: newsSlug(title, url),
      title,
      source_name: body.sourceName?.trim() || null,
      image_url: imageUrl,
      published_at: body.publishedAt?.trim() || new Date().toISOString(),
      brand,
      summary: body.summary?.trim() || null,
      why_it_matters: body.whyItMatters?.trim() || null,
      status: "published" as const,
      source_query: "manual",
    }

    const { data: inserted, error } = await supabase
      .from("news")
      .insert(row)
      .select("id, slug")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      action: "publish",
      success: true,
      id: inserted.id,
      slug: inserted.slug,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "add-url failed" },
      { status: 500 }
    )
  }
}

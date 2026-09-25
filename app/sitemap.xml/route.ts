import { renderSitemapIndex } from "@/lib/seo/sitemap-sections"

// Sitemap index: one child sitemap per content type (/sitemaps/<type>.xml).
export const dynamic = "force-dynamic"

export function GET() {
  return new Response(renderSitemapIndex(), {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" },
  })
}

import { isSitemapSection, loadSitemapSection, renderUrlset } from "@/lib/seo/sitemap-sections"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: Promise<{ section: string }> }) {
  const { section: file } = await params
  const section = file.replace(/\.xml$/, "")
  if (!file.endsWith(".xml") || !isSitemapSection(section)) return new Response("Not found", { status: 404 })
  const entries = await loadSitemapSection(section)
  return new Response(renderUrlset(entries), {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" },
  })
}

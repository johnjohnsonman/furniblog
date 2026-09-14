import { load } from "cheerio"

/** Render-only navigation; does not rewrite stored articles, media or destinations. */
export function prepareArticleReading(html: string) {
  const $ = load(html, null, false)
  const counts = new Map<string, number>()
  $("[id]").each((_, node) => { const id = $(node).attr("id")!; counts.set(id, (counts.get(id) ?? 0) + 1) })
  const used = new Set([...counts.keys(), "blog-buying-heading", "article-contents-heading"])
  const headings: { id: string; text: string }[] = []
  $("h2").each((_, node) => {
    const heading = $(node)
    if (heading.closest("nav,aside,figure,table").length) return
    const text = heading.text().replace(/\s+/g, " ").trim()
    if (!text) return
    let id = heading.attr("id")
    if (!id || counts.get(id) !== 1 || id === "blog-buying-heading" || id === "article-contents-heading") {
      const stem = "article-" + (text.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80) || "section")
      id = stem
      let suffix = 2
      while (used.has(id)) id = `${stem}-${suffix++}`
      heading.attr("id", id)
      used.add(id)
    }
    headings.push({ id, text })
  })
  $(".cp-table-scroll").each((index, node) => {
    const region = $(node)
    const caption = region.find("caption").first().text().replace(/\s+/g, " ").trim()
    region.attr({ tabindex: "0", role: "region", "aria-label": caption || `Comparison table ${index + 1}` })
    if (!region.prev().hasClass("article-table-hint")) {
      region.before('<p class="article-table-hint">If columns extend beyond the screen, scroll sideways to see more.</p>')
    }
  })
  return { html: $.html(), headings }
}

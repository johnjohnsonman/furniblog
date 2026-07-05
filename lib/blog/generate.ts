import Anthropic from "@anthropic-ai/sdk"

// Translation + rewrite is well within Sonnet; override via env if desired.
const MODEL =
  process.env.BLOG_MODEL?.trim() || process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-6"

export const BLOG_CATEGORIES = [
  "Reviews",
  "Comparisons",
  "Guides",
  "Design Stories",
] as const

export type BlogDraft = {
  title: string
  subtitle: string
  excerpt: string
  seo_title: string
  seo_description: string
  category: string
  content_html: string
}

function normalizeCategory(value: string): string {
  const v = value.trim().toLowerCase()
  const hit = BLOG_CATEGORIES.find((c) => c.toLowerCase() === v)
  if (hit) return hit
  if (v.includes("compar")) return "Comparisons"
  if (v.includes("review")) return "Reviews"
  if (v.includes("design") || v.includes("story") || v.includes("stories")) return "Design Stories"
  return "Guides"
}

export type CatalogChair = { slug: string; name: string }

function field(text: string, key: string): string {
  const re = new RegExp(`^${key}:\\s*(.+)$`, "im")
  const m = text.match(re)
  return m ? m[1].trim() : ""
}

/** Tolerant parse: pull the KEY: lines and the HTML body after ===BODY===. */
function parseDraft(raw: string): BlogDraft {
  let text = raw.trim()
  // strip leading code fence if any
  text = text.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "")

  const marker = text.search(/===\s*BODY\s*===/i)
  let head = ""
  let body = ""
  if (marker !== -1) {
    head = text.slice(0, marker)
    body = text.slice(marker).replace(/^[\s\S]*?===\s*BODY\s*===/i, "").trim()
  } else {
    // No marker — recover: body starts at first HTML tag.
    const firstTag = text.search(/<(h2|h3|p|ul|ol|blockquote|table)/i)
    if (firstTag !== -1) {
      head = text.slice(0, firstTag)
      body = text.slice(firstTag).trim()
    } else {
      body = text
    }
  }
  body = body.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim()

  let title = field(head, "TITLE")
  if (!title) {
    const h2 = body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    if (h2) title = h2[1].replace(/<[^>]+>/g, "").trim()
  }

  return {
    title,
    subtitle: field(head, "SUBTITLE"),
    excerpt: field(head, "EXCERPT"),
    seo_title: field(head, "SEO_TITLE"),
    seo_description: field(head, "SEO_DESCRIPTION"),
    category: normalizeCategory(field(head, "CATEGORY") || "Guides"),
    content_html: body,
  }
}

/**
 * Convert a source article (Korean or English) into a clean, original,
 * SEO-optimized English blog post with Amazon affiliate links.
 */
export async function generateBlogPost(params: {
  sourceText: string
  sourceTitle?: string
  sourceUrl?: string
  catalog: CatalogChair[]
}): Promise<BlogDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY")

  const client = new Anthropic({ apiKey })

  // Bounded catalog for internal linking (slug + name only).
  const catalogList = params.catalog
    .slice(0, 200)
    .map((c) => `${c.slug} — ${c.name}`)
    .join("\n")

  const prompt = `You are an editor for Furniblog, an English-language site about office, ergonomic and design chairs. Convert the SOURCE article below into a polished, original English blog post.

RULES
- If the source is Korean (or any non-English language), translate it to natural, fluent English — do NOT produce a literal machine translation. Rewrite for clarity, flow and a Western reader.
- Keep it FAITHFUL to the source's facts and intent. Do not invent specs, prices, brands, dates, or claims that aren't supported by the source.
- Make it genuinely useful and readable: clear structure, helpful headings, scannable. This is editorial content, not a thin rewrite.
- SEO: write a keyword-aware title and meta fields; use descriptive H2/H3 subheadings.

AFFILIATE & LINKS
- Where you recommend or discuss a chair people could buy, add an Amazon affiliate link using an Amazon SEARCH url: <a href="https://www.amazon.com/s?k=BRAND+MODEL+chair">…</a>. NEVER guess an Amazon product id (no /dp/ links) — only search urls.
- If a chair you mention exists in the CATALOG below, link its name to its Furniblog product page instead: <a href="/products/SLUG">…</a> (internal link). Use the exact slug from the catalog.
- Don't over-link: link the first meaningful mention only.

ALLOWED HTML TAGS ONLY: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a href>, <table>, <thead>, <tbody>, <tr>, <th>, <td>. No <h1>, <img>, <div>, <span>, class/style attributes, scripts.

OUTPUT FORMAT (follow EXACTLY — the KEY lines first, each on one line, then the body):
TITLE: the post's English headline
SUBTITLE: one compelling sub-line (max ~90 chars)
EXCERPT: 1–2 sentence summary for cards/meta (max ~160 chars)
SEO_TITLE: an SEO title tag, ~55–60 chars
SEO_DESCRIPTION: an SEO meta description, ~150–158 chars
CATEGORY: exactly one of — Reviews | Comparisons | Guides | Design Stories
===BODY===
the full article body as raw HTML using only the allowed tags

CATALOG (for internal /products/SLUG links — use only when genuinely relevant):
${catalogList || "(none)"}

SOURCE${params.sourceUrl ? ` (from ${params.sourceUrl})` : ""}:
${params.sourceTitle ? `Title: ${params.sourceTitle}\n` : ""}${params.sourceText.slice(0, 16000)}
`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  })

  const block = response.content.find((b) => b.type === "text")
  const raw = block && block.type === "text" ? block.text : ""
  const draft = parseDraft(raw)
  if (!draft.content_html || draft.content_html.length < 40) {
    throw new Error("The conversion returned an empty body")
  }
  if (!draft.title) draft.title = params.sourceTitle?.trim() || "Untitled post"
  return draft
}

export type BlogImageInput = {
  media_type: "image/png" | "image/jpeg" | "image/webp" | "image/gif"
  data: string
}

/**
 * Same as generateBlogPost, but the source is screenshot(s) of a post (e.g. a
 * Naver blog that won't scrape by URL). Claude reads the images with vision,
 * translates + rewrites into an original English SEO blog post.
 */
export async function generateBlogPostFromImages(params: {
  images: BlogImageInput[]
  catalog: CatalogChair[]
}): Promise<BlogDraft> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY")
  if (params.images.length === 0) throw new Error("No screenshots provided")

  const client = new Anthropic({ apiKey })

  const catalogList = params.catalog
    .slice(0, 200)
    .map((c) => `${c.slug} — ${c.name}`)
    .join("\n")

  const prompt = `You are an editor for Furniblog, an English-language site about office, ergonomic and design chairs.

The attached SCREENSHOT(S) are a blog post the author wrote (often in Korean, e.g. a Naver blog). Read ALL of the screenshots IN ORDER — together they form ONE article. Read the on-image text carefully. Then convert it into a polished, original English blog post.

RULES
- The source is usually Korean — translate to natural, fluent English. Do NOT produce a literal machine translation; rewrite for clarity, flow and a Western reader.
- Read the text from the images only. Reconstruct the full article across all screenshots (they are sequential parts of the same post). Ignore UI chrome — site headers, menus, ads/"Promoted", sidebars, comment sections, share buttons.
- Keep it FAITHFUL to the source's facts and intent. Do not invent specs, prices, brands, dates or claims that aren't in the screenshots. If some text is cut off or unreadable, work with what's legible rather than guessing.
- Make it genuinely useful and readable: clear structure, helpful H2/H3 headings, scannable.

AFFILIATE & LINKS
- Where you recommend or discuss a chair people could buy, add an Amazon affiliate link using an Amazon SEARCH url: <a href="https://www.amazon.com/s?k=BRAND+MODEL+chair">…</a>. NEVER guess an Amazon product id (no /dp/ links) — only search urls.
- If a chair you mention exists in the CATALOG below, link its name to its Furniblog product page instead: <a href="/products/SLUG">…</a> (internal link). Use the exact slug from the catalog.
- Don't over-link: link the first meaningful mention only.

ALLOWED HTML TAGS ONLY: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>, <a href>, <table>, <thead>, <tbody>, <tr>, <th>, <td>. No <h1>, <img>, <div>, <span>, class/style attributes, scripts.

OUTPUT FORMAT (follow EXACTLY — the KEY lines first, each on one line, then the body):
TITLE: the post's English headline
SUBTITLE: one compelling sub-line (max ~90 chars)
EXCERPT: 1–2 sentence summary for cards/meta (max ~160 chars)
SEO_TITLE: an SEO title tag, ~55–60 chars
SEO_DESCRIPTION: an SEO meta description, ~150–158 chars
CATEGORY: exactly one of — Reviews | Comparisons | Guides | Design Stories
===BODY===
the full article body as raw HTML using only the allowed tags

CATALOG (for internal /products/SLUG links — use only when genuinely relevant):
${catalogList || "(none)"}`

  const imageBlocks = params.images.map((im) => ({
    type: "image" as const,
    source: { type: "base64" as const, media_type: im.media_type, data: im.data },
  }))

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: [
          ...imageBlocks,
          { type: "text", text: prompt },
        ] as Anthropic.Messages.MessageParam["content"],
      },
    ],
  })

  const block = response.content.find((b) => b.type === "text")
  const raw = block && block.type === "text" ? block.text : ""
  const draft = parseDraft(raw)
  if (!draft.content_html || draft.content_html.length < 40) {
    throw new Error("The conversion returned an empty body (screenshots unreadable?)")
  }
  if (!draft.title) draft.title = "Untitled post"
  return draft
}

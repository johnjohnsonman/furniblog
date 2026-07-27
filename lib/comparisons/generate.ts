import Anthropic from "@anthropic-ai/sdk"

const MODEL =
  process.env.COMPARISON_MODEL?.trim() ||
  process.env.CLAUDE_MODEL?.trim() ||
  "claude-sonnet-4-5"

/** One product's grounding data, assembled from the DB (no web search). */
export type ComparisonProductInput = {
  name: string
  brand: string
  priceLabel: string
  category: string
  specs: Record<string, unknown> | null
  description: string
  rating: number | null
  reviewCount: number
  sampleReviews: string[]
  prosFromReviews: string[]
  consFromReviews: string[]
}

export type ComparisonFaq = { q: string; a: string }

export type ComparisonDraft = {
  title: string
  subtitle: string
  excerpt: string
  seo_title: string
  seo_description: string
  tier: "premium" | "value" | "mixed"
  content_html: string
  faq: ComparisonFaq[]
}

export type GenUsage = {
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
}

function priceFor(model: string): { in: number; out: number } {
  const m = model.toLowerCase()
  if (m.includes("opus")) return { in: 15, out: 75 }
  if (m.includes("haiku")) return { in: 1, out: 5 }
  return { in: 3, out: 15 } // sonnet default
}

function stripFences(t: string): string {
  return t.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```\s*$/, "").trim()
}

function field(text: string, key: string): string {
  const m = text.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "im"))
  return m ? m[1].trim() : ""
}

function normalizeTier(v: string): ComparisonDraft["tier"] {
  const s = v.trim().toLowerCase()
  if (s === "premium") return "premium"
  if (s === "value" || s === "budget") return "value"
  return "mixed"
}

const BODY_MARKER = "===BODY==="

function parseDraft(raw: string): ComparisonDraft {
  const text = stripFences(raw.trim())
  let body = ""
  const idx = text.indexOf(BODY_MARKER)
  if (idx !== -1) body = text.slice(idx + BODY_MARKER.length)
  else {
    const m = text.match(/<(?:h2|h3|p|table|ul|ol|blockquote)\b/i)
    if (m && m.index !== undefined) body = text.slice(m.index)
  }
  body = stripFences(body.trim())

  let title = field(text, "TITLE")
  if (!title) {
    const h2 = body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    if (h2) title = h2[1].replace(/<[^>]+>/g, "").trim()
  }

  // FAQ_JSON: [{"q":"…","a":"…"}] on one line before the body.
  let faq: ComparisonFaq[] = []
  const faqLine = field(text, "FAQ_JSON")
  if (faqLine) {
    try {
      const parsed = JSON.parse(faqLine)
      if (Array.isArray(parsed)) {
        faq = parsed
          .filter((x) => x && typeof x.q === "string" && typeof x.a === "string")
          .map((x) => ({ q: String(x.q).trim(), a: String(x.a).trim() }))
          .filter((x) => x.q && x.a)
          .slice(0, 5)
      }
    } catch {
      /* ignore malformed FAQ */
    }
  }

  return {
    title,
    subtitle: field(text, "SUBTITLE"),
    excerpt: field(text, "EXCERPT"),
    seo_title: field(text, "SEO_TITLE"),
    seo_description: field(text, "SEO_DESCRIPTION"),
    tier: normalizeTier(field(text, "TIER") || "mixed"),
    content_html: body,
    faq,
  }
}

function productBlock(label: string, p: ComparisonProductInput): string {
  const specs = p.specs ? JSON.stringify(p.specs) : "(none)"
  return `${label}: ${p.name}
- Brand: ${p.brand}
- Price: ${p.priceLabel}
- Category: ${p.category}
- Specs: ${specs}
- Editorial description: ${p.description || "(none)"}
- Aggregate rating: ${p.rating ?? "n/a"} from ${p.reviewCount} reviews
- Pros mentioned in reviews: ${p.prosFromReviews.join("; ") || "(none)"}
- Cons mentioned in reviews: ${p.consFromReviews.join("; ") || "(none)"}
- Sample review snippets:
${p.sampleReviews.map((r) => `  • ${r}`).join("\n") || "  (none)"}`
}

/**
 * Draft an "A vs B" comparison strictly from the supplied product data.
 * No web search — everything is grounded in DB specs + real review snippets.
 */
export async function generateComparisonDraft(
  a: ComparisonProductInput,
  b: ComparisonProductInput
): Promise<{ draft: ComparisonDraft; usage: GenUsage }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY")
  const client = new Anthropic({ apiKey })

  const prompt = `You are a senior office-chair editor for Furniblog. Write a head-to-head comparison of TWO chairs using ONLY the data provided below. This is buying-decision content: shoppers deciding between these two.

STRICT RULES
- Use ONLY the supplied data (specs, prices, ratings, review snippets). NEVER invent specs, prices, awards, or numbers. If a detail isn't provided, omit it or say it's not specified.
- Be genuinely useful and even-handed. Base each chair's strengths/weaknesses on the review data given. It's fine (good, even) to say which one wins for which type of buyer.
- Clear, confident editorial English. Short paragraphs, scannable.

ALLOWED HTML TAGS ONLY: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <blockquote>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <th>, <td>. No <h1>, <img>, <a>, <div>, <span>, class/style attributes, scripts.

STRUCTURE (each section opens with <h2>):
1. Intro — one paragraph framing the matchup.
2. "At a glance" — a comparison <table> with a header row (Spec | ${a.name} | ${b.name}) covering price, category, key adjustments, weight capacity, warranty, and rating where available.
3. "${a.name} — strengths & weaknesses" (from its reviews).
4. "${b.name} — strengths & weaknesses" (from its reviews).
5. "How they differ" — the real trade-offs.
6. "Who should buy which" — clear recommendations per buyer type.
7. "The verdict" — a decisive bottom line.

Return EXACTLY this plain-text format (no code fences):
TITLE: e.g. "${a.name} vs ${b.name}: Which Should You Buy?" — do NOT append "Review".
SUBTITLE: one compelling line (max ~90 chars)
EXCERPT: 1–2 sentence summary (max ~160 chars)
SEO_TITLE: ~55–60 chars, include both chair names and "vs"
SEO_DESCRIPTION: ~150–158 chars, compelling
TIER: one of premium | value | mixed (premium if both are high-end brands, value if both are budget/bestseller, else mixed)
FAQ_JSON: a JSON array of 3 genuine buyer questions with concise answers, grounded ONLY in the data above, on ONE line. Format: [{"q":"Is ${a.name} better than ${b.name}?","a":"…"},{"q":"…","a":"…"},{"q":"…","a":"…"}]
===BODY===
the full HTML body per the structure above

DATA
${productBlock("CHAIR A", a)}

${productBlock("CHAIR B", b)}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  })

  const u = response.usage
  const p = priceFor(MODEL)
  const inputTokens = u?.input_tokens ?? 0
  const outputTokens = u?.output_tokens ?? 0
  const usage: GenUsage = {
    model: MODEL,
    inputTokens,
    outputTokens,
    costUsd: (inputTokens / 1e6) * p.in + (outputTokens / 1e6) * p.out,
  }

  const block = response.content.find((x) => x.type === "text")
  const raw = block && block.type === "text" ? block.text : ""
  const draft = parseDraft(raw)
  if (!draft.content_html || draft.content_html.length < 60) {
    throw new Error("The comparison came back empty")
  }
  if (!draft.title) draft.title = `${a.name} vs ${b.name}`
  return { draft, usage }
}

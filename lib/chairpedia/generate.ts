import Anthropic from "@anthropic-ai/sdk"

// A capable model for long-form research writing. Override via env if desired.
const MODEL = process.env.CHAIRPEDIA_MODEL?.trim() || process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

export type ChairpediaDraft = {
  title: string
  subtitle: string
  excerpt: string
  seo_title: string
  seo_description: string
  origin: string
  content_html: string
  sources: string[]
}

/** Token/search usage and the resulting USD cost for one generation. */
export type GenUsage = {
  model: string
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  webSearches: number
  costUsd: number
}

/** Per-million-token prices (USD). Anthropic list pricing; web search billed separately. */
function priceFor(model: string): { in: number; out: number; cacheWrite: number; cacheRead: number } {
  const m = model.toLowerCase()
  if (m.includes("opus")) return { in: 15, out: 75, cacheWrite: 18.75, cacheRead: 1.5 }
  if (m.includes("haiku")) return { in: 1, out: 5, cacheWrite: 1.25, cacheRead: 0.1 }
  // Sonnet (default for Chairpedia) and anything else.
  return { in: 3, out: 15, cacheWrite: 3.75, cacheRead: 0.3 }
}

/** Web search server tool: $10 per 1,000 requests. */
const WEB_SEARCH_USD = 0.01

function computeCost(model: string, u: Omit<GenUsage, "model" | "costUsd">): number {
  const p = priceFor(model)
  return (
    (u.inputTokens / 1_000_000) * p.in +
    (u.outputTokens / 1_000_000) * p.out +
    (u.cacheCreationTokens / 1_000_000) * p.cacheWrite +
    (u.cacheReadTokens / 1_000_000) * p.cacheRead +
    u.webSearches * WEB_SEARCH_USD
  )
}

/**
 * The 16-section editorial structure for a Chairpedia deep-dive. The model fills
 * each as an <h2> section. Order matters for narrative + SEO flow.
 */
const SECTIONS = [
  "Overview — what this chair is, in one confident paragraph",
  "At a glance — key specs as a bullet list (price tier, materials, adjustments, warranty, weight capacity)",
  "The brand & its philosophy",
  "The designer and the design story",
  "Design language & aesthetics",
  "Ergonomics & how it supports the body",
  "Key adjustments & mechanisms (recline, lumbar, armrests, seat depth)",
  "Materials & build quality",
  "Sitting experience — what it actually feels like day to day",
  "Who it's for (and who should skip it)",
  "Comparisons with key rivals",
  "Sizing, fit & configuration options",
  "Sustainability & certifications",
  "Maintenance, durability & warranty",
  "Pricing, value & where it sits in the market",
  "Verdict — the bottom line",
] as const

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

/** Strip a leading/trailing ```lang code fence if the model wrapped the body. */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```[a-zA-Z]*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim()
}

const BODY_MARKER = "===BODY==="

/**
 * Parse the model's plain-text response: "KEY: value" lines, a ===BODY=== marker,
 * then the raw HTML body. Avoids JSON entirely so unescaped quotes/braces in the
 * HTML can't break parsing (the old JSON format's failure).
 *
 * Tolerant by design — the model occasionally drops the marker, wraps the body in
 * a code fence, or emits the HTML straight away. Rather than hard-fail (which threw
 * away an otherwise good ~6k-token article), we recover the body from the first
 * real HTML tag and pull KEY fields from anywhere in the text.
 */
function parseDraft(raw: string): ChairpediaDraft {
  const text = stripCodeFences(raw.trim())

  // KEY fields may sit before the marker, or anywhere if the marker was dropped —
  // match against the whole text on their own line.
  const field = (key: string): string => {
    const m = text.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"))
    return m ? m[1].trim() : ""
  }

  // Body: prefer the explicit marker; otherwise recover from the first HTML block.
  let body = ""
  const idx = text.indexOf(BODY_MARKER)
  if (idx !== -1) {
    body = text.slice(idx + BODY_MARKER.length)
  } else {
    const htmlStart = text.match(/<(?:h2|h3|p|table|ul|ol|blockquote)\b/i)
    if (htmlStart && htmlStart.index !== undefined) body = text.slice(htmlStart.index)
  }
  body = stripCodeFences(body.trim())

  // Title fallback: first <h2> when the TITLE: line was omitted.
  let title = field("TITLE")
  if (!title) {
    const h2 = body.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    if (h2) title = h2[1].replace(/<[^>]+>/g, "").trim()
  }

  const sources = field("SOURCES")
    .split("|")
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s))

  return {
    title,
    subtitle: field("SUBTITLE"),
    excerpt: field("EXCERPT"),
    seo_title: field("SEO_TITLE"),
    seo_description: field("SEO_DESCRIPTION"),
    origin: field("ORIGIN"),
    content_html: body,
    sources,
  }
}

const SYSTEM = `You are a senior furniture editor writing for Furniblog, an authoritative English-language office-chair review publication. You write detailed, trustworthy, SEO-optimized deep-dives.

NON-NEGOTIABLE RULES:
- Ground every factual claim in your web research. Use the web_search tool to verify the brand, designer, materials, mechanisms, price tier, certifications, and history BEFORE writing.
- NEVER invent specs, dates, names, awards, or numbers. If you cannot verify a specific fact, either omit it or state it as general/unconfirmed ("the brand reports…", "commonly cited as…") rather than asserting it.
- If the chair does not appear to exist or you cannot find reliable information, say so honestly in the overview rather than fabricating a profile.
- Write in clear, engaging, confident editorial English. No marketing fluff, no hallucinated superlatives.
- Each section should be substantial (multiple sentences / a real paragraph), not one line.`

export type GenTier = "premium" | "standard"

type TierConfig = {
  maxUses: number
  maxTokens: number
  searches: string
  minSources: number
  sourcesLine: string
  words: string
}

export const TIER_CONFIG: Record<GenTier, TierConfig> = {
  // Top-tier: exhaustive research, long authoritative article.
  premium: {
    maxUses: 18,
    maxTokens: 20000,
    searches: "12–18",
    minSources: 12,
    sourcesLine: "12–20",
    words: "2,200–3,200",
  },
  // Standard: ~5 searches, a solid but lighter article (cheaper/faster).
  standard: {
    maxUses: 5,
    maxTokens: 16000,
    searches: "4–6",
    minSources: 4,
    sourcesLine: "5–8",
    words: "1,100–1,700",
  },
}

function buildPrompt(chairName: string, cfg: TierConfig): string {
  const sectionList = SECTIONS.map((s, i) => `${i + 1}. ${s}`).join("\n")
  return `Research and write a complete Chairpedia deep-dive for the office chair: "${chairName}".

First, RESEARCH with web_search before writing — aim for ${cfg.searches} searches covering different angles, not just one or two. Search separately for:
- the brand's official product page and spec sheet
- the designer(s) and the design story
- independent reviews (review sites, YouTube, Reddit/forums — what real owners say)
- retailer listings to pin down the real price
- certifications (BIFMA, GREENGUARD, etc.), warranty terms, and sustainability claims
- direct comparisons against named rival chairs
Gather and keep AT LEAST ${cfg.minSources} distinct, credible source URLs you actually use. The richer and more cross-checked your research, the better — thin research produces a thin article.

Then write the article body as clean, well-structured semantic HTML. This renders directly on the site, so structure matters as much as facts.

ALLOWED TAGS ONLY: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <blockquote>, <strong>, <em>, <a href>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.
- Do NOT use <h1> (the page title is rendered separately).
- Do NOT include <html>, <head>, <body>, <style>, <div>, <span>, class/style attributes, or images. Plain semantic tags only — the site styles them.

FORMATTING RULES (this is what makes the page look organized):
- Open every section with an <h2>. Use <h3> for sub-points within a section.
- Keep paragraphs to 2–4 sentences. Break dense material into multiple <p> rather than one wall of text.
- For the "At a glance" section, output a two-column <table> (no header row needed, or a "Spec / Detail" header): each <tr> has a <th> label (e.g. Brand, Designer, Year, Materials, Adjustments, Warranty, Price tier, Weight capacity) and a <td> value. Do NOT cram specs into a paragraph.
- For the "Comparisons with key rivals" section, output a <table> with a header row comparing this chair against 2–3 named rivals across a few dimensions (price tier, seat/back, adjustments, standout strength).
- Use <ul> with <li> for any list of features, pros, or who-it's-for points. Where helpful, lead a <li> with a <strong>label</strong> then the detail.
- Use <blockquote> for a designer/brand philosophy quote or a one-line editorial takeaway (1 or 2 across the article, not more).

Structure the body as exactly these 16 sections, each opening with an <h2> heading (you may rephrase the heading text naturally):
${sectionList}

Target length: ${cfg.words} words of body content — substantial and authoritative, but still clear and scannable (short paragraphs, lists, tables). Every section should be a real, fleshed-out passage, not a token sentence.

Return your answer in EXACTLY this plain-text format — NOT JSON, no code fences:

TITLE: the chair's proper display name ONLY (e.g. "Steelcase Series 2"). Do NOT append words like "Review", "Guide", "Explained", "Deep Dive", a year, or any tagline — just the clean product name.
SUBTITLE: one compelling editorial line (max ~90 chars)
EXCERPT: a 1–2 sentence summary for cards and meta description (max ~160 chars)
SEO_TITLE: an SEO title tag, ~55–60 chars, including the chair name. Do NOT use the word "Review"; a short descriptor like "– Ergonomic Chair Guide" is fine.
SEO_DESCRIPTION: an SEO meta description, ~150–158 chars, compelling and keyword-rich
ORIGIN: country of origin / manufacture, one or two words (e.g. Japan, Germany, USA)
SOURCES: ${cfg.sourcesLine} distinct real source URLs you actually used, separated by " | " (pipe), ALL on this single line
===BODY===
the full 16-section article body as raw HTML per the rules above

Format rules (critical — follow exactly):
- Begin your reply with "TITLE:" — output nothing (no preamble, no commentary) before it.
- The seven "KEY: value" lines come first, each on ONE line, in the order shown above.
- Then a line containing ONLY ===BODY=== — this separator is MANDATORY, never omit it.
- Then the HTML body itself: raw HTML, NOT escaped, NOT quoted, NOT wrapped in code fences (no \`\`\`).
- Output nothing after the HTML body.`
}

/**
 * Generate a research-grounded Chairpedia draft for a chair name.
 * Uses Claude with the web_search server tool for anti-hallucination grounding.
 */
export async function generateChairpediaDraft(
  chairName: string,
  tier: GenTier = "premium"
): Promise<{ draft: ChairpediaDraft; usage: GenUsage }> {
  const client = getClient()
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured")

  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.premium

  const baseParams = {
    model: MODEL,
    max_tokens: cfg.maxTokens,
    system: SYSTEM,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: cfg.maxUses,
      } satisfies Anthropic.Messages.WebSearchTool20250305,
    ],
  }

  // Accumulate token + web-search usage across every API call (the initial one
  // plus each pause_turn continuation — each call is billed for its full input).
  const acc = { inputTokens: 0, outputTokens: 0, cacheCreationTokens: 0, cacheReadTokens: 0, webSearches: 0 }
  const addUsage = (u: Anthropic.Messages.Usage | undefined) => {
    if (!u) return
    acc.inputTokens += u.input_tokens ?? 0
    acc.outputTokens += u.output_tokens ?? 0
    acc.cacheCreationTokens += u.cache_creation_input_tokens ?? 0
    acc.cacheReadTokens += u.cache_read_input_tokens ?? 0
    acc.webSearches += u.server_tool_use?.web_search_requests ?? 0
  }

  // web_search can return stop_reason "pause_turn" on a long-running turn — feed
  // the partial assistant content back so the model finishes writing the answer.
  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: buildPrompt(chairName, cfg) },
  ]
  let response = await client.messages.create({ ...baseParams, messages })
  addUsage(response.usage)
  for (let guard = 0; response.stop_reason === "pause_turn" && guard < 6; guard++) {
    messages.push({ role: "assistant", content: response.content })
    response = await client.messages.create({ ...baseParams, messages })
    addUsage(response.usage)
  }

  const usage: GenUsage = { model: MODEL, ...acc, costUsd: computeCost(MODEL, acc) }

  // The final assistant text blocks contain the answer (web_search runs server-side).
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()

  if (!text) throw new Error("The model returned no text output")

  const draft = parseDraft(text)

  if (!draft.content_html || !draft.title) {
    throw new Error("The generated draft is missing a title or body")
  }

  return { draft, usage }
}

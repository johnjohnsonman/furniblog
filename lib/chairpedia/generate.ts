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
 * Parse the model's plain-text response: seven "KEY: value" lines, then a
 * ===BODY=== marker, then the raw HTML body. Avoids JSON entirely so unescaped
 * quotes/braces in the HTML can't break parsing (the old JSON format's failure).
 */
function parseDraft(raw: string): ChairpediaDraft {
  const text = raw.trim()
  const idx = text.indexOf(BODY_MARKER)
  if (idx === -1) {
    throw new Error("The generated draft is missing the ===BODY=== marker")
  }
  const head = text.slice(0, idx)
  const body = stripCodeFences(text.slice(idx + BODY_MARKER.length).trim())

  const field = (key: string): string => {
    const m = head.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"))
    return m ? m[1].trim() : ""
  }

  const sources = field("SOURCES")
    .split("|")
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//.test(s))

  return {
    title: field("TITLE"),
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
    maxTokens: 12000,
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

TITLE: the chair's proper display name as a clean article title
SUBTITLE: one compelling editorial line (max ~90 chars)
EXCERPT: a 1–2 sentence summary for cards and meta description (max ~160 chars)
SEO_TITLE: an SEO title tag, ~55–60 chars, including the chair name
SEO_DESCRIPTION: an SEO meta description, ~150–158 chars, compelling and keyword-rich
ORIGIN: country of origin / manufacture, one or two words (e.g. Japan, Germany, USA)
SOURCES: ${cfg.sourcesLine} distinct real source URLs you actually used, separated by " | " (pipe), ALL on this single line
===BODY===
the full 16-section article body as raw HTML per the rules above

Format rules (critical — follow exactly):
- The seven "KEY: value" lines come first, each on ONE line, in the order shown above.
- Then a line containing only ===BODY===
- Then the HTML body itself: raw HTML, NOT escaped, NOT quoted, NOT in code fences.
- Output nothing before "TITLE:" and nothing after the HTML body.`
}

/**
 * Generate a research-grounded Chairpedia draft for a chair name.
 * Uses Claude with the web_search server tool for anti-hallucination grounding.
 */
export async function generateChairpediaDraft(
  chairName: string,
  tier: GenTier = "premium"
): Promise<ChairpediaDraft> {
  const client = getClient()
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured")

  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.premium

  const response = await client.messages.create({
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
    messages: [{ role: "user", content: buildPrompt(chairName, cfg) }],
  })

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

  return draft
}

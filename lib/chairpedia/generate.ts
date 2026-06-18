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

function stripJsonMarkdown(text: string): string {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
}

/** Pull the largest {...} block out of mixed text, tolerating prose around it. */
function extractJsonObject(text: string): string {
  const clean = stripJsonMarkdown(text)
  const start = clean.indexOf("{")
  const end = clean.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return clean
  return clean.slice(start, end + 1)
}

const SYSTEM = `You are a senior furniture editor writing for Furniblog, an authoritative English-language office-chair review publication. You write detailed, trustworthy, SEO-optimized deep-dives.

NON-NEGOTIABLE RULES:
- Ground every factual claim in your web research. Use the web_search tool to verify the brand, designer, materials, mechanisms, price tier, certifications, and history BEFORE writing.
- NEVER invent specs, dates, names, awards, or numbers. If you cannot verify a specific fact, either omit it or state it as general/unconfirmed ("the brand reports…", "commonly cited as…") rather than asserting it.
- If the chair does not appear to exist or you cannot find reliable information, say so honestly in the overview rather than fabricating a profile.
- Write in clear, engaging, confident editorial English. No marketing fluff, no hallucinated superlatives.
- Each section should be substantial (multiple sentences / a real paragraph), not one line.`

function buildPrompt(chairName: string): string {
  const sectionList = SECTIONS.map((s, i) => `${i + 1}. ${s}`).join("\n")
  return `Research and write a complete Chairpedia deep-dive for the office chair: "${chairName}".

First, use web_search to research this exact chair. Verify: manufacturer/brand, the designer(s), year/era, materials, adjustment mechanisms, certifications, warranty, approximate price tier, and how it compares to rivals. Do several searches if needed.

Then write the article body as semantic HTML using ONLY these tags: <h2>, <h3>, <p>, <ul>, <li>, <ol>, <blockquote>, <strong>, <em>, <a href>. Do NOT use <h1> (the page title is rendered separately). Do NOT include <html>, <head>, or <body> wrappers. Do NOT include images (the editor adds those).

Structure the body as exactly these 16 sections, each opening with an <h2> heading (you may rephrase the heading text naturally):
${sectionList}

Target length: 1,400–2,200 words of body content.

Return ONLY a single JSON object (no prose before or after) with these string fields:
{
  "title": "the chair's proper display name as a clean article title",
  "subtitle": "one compelling editorial line (max ~90 chars)",
  "excerpt": "a 1–2 sentence summary for cards and meta description fallback (max ~160 chars)",
  "seo_title": "an SEO-optimized title tag, ~55–60 chars, includes the chair name",
  "seo_description": "an SEO meta description, ~150–158 chars, compelling and keyword-rich",
  "origin": "country of origin / manufacture (e.g. 'Japan', 'Germany', 'USA') — one or two words",
  "content_html": "the full 16-section article body as HTML per the rules above",
  "sources": ["array of the source URLs you actually relied on"]
}

Escape the HTML properly so it is valid JSON. Output nothing but the JSON object.`
}

/**
 * Generate a research-grounded Chairpedia draft for a chair name.
 * Uses Claude with the web_search server tool for anti-hallucination grounding.
 */
export async function generateChairpediaDraft(chairName: string): Promise<ChairpediaDraft> {
  const client = getClient()
  if (!client) throw new Error("ANTHROPIC_API_KEY is not configured")

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 8,
      } satisfies Anthropic.Messages.WebSearchTool20250305,
    ],
    messages: [{ role: "user", content: buildPrompt(chairName) }],
  })

  // The final assistant text blocks contain the JSON (web_search runs server-side).
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim()

  if (!text) throw new Error("The model returned no text output")

  let parsed: Partial<ChairpediaDraft>
  try {
    parsed = JSON.parse(extractJsonObject(text))
  } catch {
    throw new Error("Could not parse the generated draft as JSON")
  }

  if (!parsed.content_html || !parsed.title) {
    throw new Error("The generated draft is missing required fields")
  }

  return {
    title: String(parsed.title).trim(),
    subtitle: String(parsed.subtitle ?? "").trim(),
    excerpt: String(parsed.excerpt ?? "").trim(),
    seo_title: String(parsed.seo_title ?? "").trim(),
    seo_description: String(parsed.seo_description ?? "").trim(),
    origin: String(parsed.origin ?? "").trim(),
    content_html: String(parsed.content_html).trim(),
    sources: Array.isArray(parsed.sources) ? parsed.sources.map(String) : [],
  }
}

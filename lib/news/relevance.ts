import Anthropic from "@anthropic-ai/sdk"

const CLAUDE_MODEL = process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

/** A news article must be reasonably furniture / office-chair focused. */
export const NEWS_RELEVANCE_MIN = 0.4

export type NewsRelevanceResult = {
  relevant: boolean
  confidence: number
  isFurnitureNews: boolean
  /** Brand picked from the known list, or null if none clearly applies. */
  brand: string | null
  /** One-line English summary, or null when generation fails. */
  summary: string | null
  /** 1-2 sentence editorial "why this matters" for readers of a chair site. */
  whyItMatters: string | null
  reason: string
}

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

function stripJsonMarkdown(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()
}

/**
 * Judge whether a news article is about furniture / office chairs, assign the
 * most fitting brand, and produce a one-line summary — all in one Claude call.
 */
export async function checkNewsRelevance(params: {
  title: string
  description: string
  /** The brand whose feed surfaced this article (a strong hint, not a guarantee). */
  candidateBrand: string
  /** Full list of brands we track, so Claude can correct the assignment. */
  knownBrands: string[]
}): Promise<NewsRelevanceResult> {
  const title = params.title.trim()
  const description = params.description.trim()
  const candidateBrand = params.candidateBrand.trim()

  if (!title && !description) {
    return {
      relevant: false,
      confidence: 0,
      isFurnitureNews: false,
      brand: null,
      summary: null,
      whyItMatters: null,
      reason: "empty article",
    }
  }

  const client = getClient()
  if (!client) {
    return {
      relevant: false,
      confidence: 0,
      isFurnitureNews: false,
      brand: null,
      summary: null,
      whyItMatters: null,
      reason: "no ANTHROPIC_API_KEY (cannot verify)",
    }
  }

  // Keep the brand list bounded so the prompt stays small.
  const brandList = params.knownBrands.slice(0, 200).join(", ")

  const prompt = `You curate a news feed about office/ergonomic chairs and furniture brands.
Decide whether this news article is genuinely about furniture or office/ergonomic chairs
(product launches, design, reviews, company/industry news for furniture makers, awards, collaborations).

This article came from a search for the brand "${candidateBrand}".

Respond ONLY with valid JSON:
{"isFurnitureNews": true|false, "brand": "<one brand from the list, or null>", "confidence": 0.0-1.0, "summary": "one English sentence (max 200 chars)", "whyItMatters": "1-2 sentences on why a chair/furniture shopper should care", "reason": "short explanation"}

Rules:
- isFurnitureNews: true ONLY if the article's MAIN SUBJECT is furniture or office/ergonomic chairs,
  or a furniture brand's product/design/business news. If it is mainly about unrelated topics
  (general finance, sports, politics, a same-named person/place, software, electronics, real estate),
  set isFurnitureNews=false and confidence below 0.2 (HARD REJECT).
- brand: choose the single best-matching brand from this list, or null if none clearly applies:
  ${brandList}
  Prefer "${candidateBrand}" if the article is about it.
- confidence: how clearly this is furniture/office-chair news.
  - 0.8-1.0: dedicated furniture/chair product, design, or review story
  - 0.5-0.8: clearly furniture/brand business or industry news
  - 0.4-0.5: furniture-adjacent but still on-topic
  - Below 0.4: tangential or off-topic
- summary: one factual sentence describing what the article reports. No markdown, no surrounding quotes.
  Do not invent facts beyond the title/description.
- whyItMatters: 1-2 sentences of editorial context for an office-chair/furniture audience — why this is
  interesting or useful to someone researching chairs (e.g. new model, price, ergonomics, availability).
  No markdown. Keep it grounded in the article.

Title: ${title || "(empty)"}
Description: ${description.slice(0, 1500) || "(empty)"}
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 250,
      messages: [{ role: "user", content: prompt }],
    })
    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      return {
        relevant: false,
        confidence: 0,
        isFurnitureNews: false,
        brand: null,
        summary: null,
        whyItMatters: null,
        reason: "claude: empty response",
      }
    }

    const parsed = JSON.parse(stripJsonMarkdown(block.text)) as {
      isFurnitureNews?: boolean
      brand?: string | null
      confidence?: number
      summary?: string
      whyItMatters?: string
      reason?: string
    }

    const isFurnitureNews = parsed.isFurnitureNews === true
    const rawConfidence =
      typeof parsed.confidence === "number" ? parsed.confidence : 0
    const reason =
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim()
        : "(no reason)"

    // Hard gate: non-furniture topics never pass.
    let confidence = rawConfidence
    if (!isFurnitureNews) confidence = Math.min(confidence, 0.19)

    // Only accept a brand that is actually in our known list.
    const knownSet = new Set(params.knownBrands.map((b) => b.toLowerCase()))
    const proposedBrand =
      typeof parsed.brand === "string" ? parsed.brand.trim() : ""
    const brand =
      proposedBrand && knownSet.has(proposedBrand.toLowerCase())
        ? proposedBrand
        : knownSet.has(candidateBrand.toLowerCase())
          ? candidateBrand
          : null

    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim().replace(/\s+/g, " ").slice(0, 280)
        : null

    const whyItMatters =
      typeof parsed.whyItMatters === "string" && parsed.whyItMatters.trim()
        ? parsed.whyItMatters.trim().replace(/\s+/g, " ").slice(0, 500)
        : null

    return {
      relevant: confidence >= NEWS_RELEVANCE_MIN,
      confidence,
      isFurnitureNews,
      brand,
      summary,
      whyItMatters,
      reason,
    }
  } catch {
    return {
      relevant: false,
      confidence: 0,
      isFurnitureNews: false,
      brand: null,
      summary: null,
      whyItMatters: null,
      reason: "claude: parse/request error",
    }
  }
}

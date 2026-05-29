import Anthropic from "@anthropic-ai/sdk"
import { CONFIDENCE_MIN } from "@/lib/pipeline/processor"

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

export type VideoRelevanceResult = {
  relevant: boolean
  confidence: number
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

/** Keyword pre-check before Claude (saves API calls on obvious mismatches). */
function passesKeywordGate(
  title: string,
  description: string,
  chairName: string,
  brandName?: string | null
): boolean {
  const haystack = `${title} ${description}`.toLowerCase()
  const chairTokens = chairName
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3)
  const brand = brandName?.trim().toLowerCase() ?? ""

  const hasChairToken = chairTokens.some((token) => haystack.includes(token))
  const hasBrand = brand ? haystack.includes(brand) : false

  if (brand && hasBrand && hasChairToken) return true
  if (chairTokens.length >= 2 && chairTokens.filter((t) => haystack.includes(t)).length >= 2) {
    return true
  }
  return hasChairToken && chairTokens.some((t) => t.length >= 5)
}

export async function checkVideoRelevance(params: {
  title: string
  description: string
  chairName: string
  brandName?: string | null
}): Promise<VideoRelevanceResult> {
  const title = params.title.trim()
  const description = params.description.trim()
  const chairName = params.chairName.trim()
  const brandName = params.brandName?.trim() || null

  if (!passesKeywordGate(title, description, chairName, brandName)) {
    return { relevant: false, confidence: 0 }
  }

  const client = getClient()
  if (!client) {
    return passesKeywordGate(title, description, chairName, brandName)
      ? { relevant: true, confidence: 0.5 }
      : { relevant: false, confidence: 0 }
  }

  const targetLabel = brandName ? `${brandName} ${chairName}` : chairName

  const prompt = `You judge whether a YouTube video is specifically about this exact office chair model.

Target chair: "${targetLabel}" (exact model: "${chairName}"${brandName ? `, brand: "${brandName}"` : ""})

Respond ONLY with valid JSON:
{"confidence": 0.0-1.0}

confidence scale:
- 0.7-1.0: Video is clearly a review, comparison, setup, or long-term use focused on this exact chair model
- 0.4-0.7: Video mentions this model with useful chair-specific detail
- 0.2-0.4: Vague mention, roundup where this chair is minor, or mostly about another product
- Below 0.2: Wrong chair model, brand-only roundup, gaming/streaming unrelated content, desk accessories, or unrelated topic

CRITICAL: If the video is NOT specifically about "${chairName}", set confidence below 0.2.
Same-brand different models (e.g. Leap vs Gesture) must be below 0.2 unless "${chairName}" is the main subject.

Title: ${title || "(empty)"}
Description: ${description.slice(0, 1500) || "(empty)"}
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 80,
      messages: [{ role: "user", content: prompt }],
    })
    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      return { relevant: false, confidence: 0 }
    }

    const parsed = JSON.parse(stripJsonMarkdown(block.text)) as {
      confidence?: number
    }
    const confidence =
      typeof parsed.confidence === "number" ? parsed.confidence : 0

    return {
      relevant: confidence >= CONFIDENCE_MIN,
      confidence,
    }
  } catch {
    return { relevant: false, confidence: 0 }
  }
}

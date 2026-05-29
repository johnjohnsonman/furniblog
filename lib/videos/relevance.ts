import Anthropic from "@anthropic-ai/sdk"

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

/** A video must be reasonably chair-focused, but variants/sizes of a model still count. */
export const VIDEO_RELEVANCE_MIN = 0.4

export type VideoRelevanceResult = {
  relevant: boolean
  confidence: number
  isChairVideo: boolean
  isThisModel: boolean
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

/** Remove parenthetical variant/size suffixes: "Aeron (Size B)" -> "Aeron", "Leap (V2)" -> "Leap". */
export function stripVariantSuffix(name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function hasWord(haystack: string, word: string): boolean {
  if (!word) return false
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`\\b${escaped}\\b`, "i").test(haystack)
}

/**
 * Keyword pre-check before Claude (saves API calls on obvious mismatches).
 * Uses word-boundary matching so "Mera" does not match "camera", etc.
 */
function passesKeywordGate(
  title: string,
  description: string,
  chairName: string,
  brandName?: string | null
): boolean {
  const haystack = `${title} ${description}`
  const chairTokens = chairName
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length >= 3)
  const brand = brandName?.trim().toLowerCase() ?? ""

  const matchedChairTokens = chairTokens.filter((token) => hasWord(haystack, token))
  const hasBrand = brand ? hasWord(haystack, brand) : false

  // Require brand + model token, or at least two distinct model tokens.
  if (brand && hasBrand && matchedChairTokens.length >= 1) return true
  if (matchedChairTokens.length >= 2) return true
  return false
}

export async function checkVideoRelevance(params: {
  title: string
  description: string
  chairName: string
  brandName?: string | null
}): Promise<VideoRelevanceResult> {
  const title = params.title.trim()
  const description = params.description.trim()
  // Always compare against the base model name (no "(Size B)", "(V2)", etc.).
  const chairName = stripVariantSuffix(params.chairName.trim())
  const brandName = params.brandName?.trim() || null

  if (!passesKeywordGate(title, description, chairName, brandName)) {
    return {
      relevant: false,
      confidence: 0,
      isChairVideo: false,
      isThisModel: false,
      reason: "keyword gate: model/brand not mentioned",
    }
  }

  const client = getClient()
  if (!client) {
    // Without Claude we cannot verify topic focus — be conservative and reject.
    return {
      relevant: false,
      confidence: 0,
      isChairVideo: false,
      isThisModel: false,
      reason: "no ANTHROPIC_API_KEY (cannot verify)",
    }
  }

  const targetLabel = brandName ? `${brandName} ${chairName}` : chairName

  const prompt = `You are a relevance judge for an office-chair video library.
Decide whether a YouTube video's MAIN SUBJECT is this office chair model (any size/variant of it).

Target chair: "${targetLabel}" (base model: "${chairName}"${brandName ? `, brand: "${brandName}"` : ""})

Respond ONLY with valid JSON:
{"isChairVideo": true|false, "isThisModel": true|false, "confidence": 0.0-1.0, "reason": "short explanation"}

Rules:
- isChairVideo: true ONLY if the video is primarily about a physical office/desk/ergonomic chair.
  If the video is mainly about makeup, electronics, phones, VR/AR headsets (e.g. Apple Vision Pro),
  sunglasses/smart glasses (e.g. Meta Ray-Bans), gaming hardware, software, or any non-chair topic,
  set isChairVideo=false and confidence below 0.2 (HARD REJECT, regardless of keyword matches).
- isThisModel: true if the video is about the base model "${chairName}". Variants and sizes of the
  same model count as this model — if the video is about the base model (e.g. Aeron, Leap, Embody,
  Gesture), accept it even if it does NOT mention the specific size/variant (e.g. "Size B", "V2").
  Different models from the same brand (e.g. Leap vs Gesture) do NOT count as this model.
- confidence: how certain you are this video is about the "${chairName}" chair.
  - 0.8-1.0: Dedicated review/comparison/setup/long-term use of this chair model
  - 0.5-0.8: Clearly about this chair model with chair-specific detail
  - 0.4-0.5: A chair video where this model is meaningfully featured
  - 0.2-0.4: Chair video about a different model, or this model only mentioned in passing
  - Below 0.2: Not a chair video at all, or wrong product entirely

If isChairVideo is true and the base model is meaningfully the subject, prefer confidence >= 0.4.
A keyword match alone is NOT enough — the chair itself must be the core subject.

Title: ${title || "(empty)"}
Description: ${description.slice(0, 1500) || "(empty)"}
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    })
    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      return {
        relevant: false,
        confidence: 0,
        isChairVideo: false,
        isThisModel: false,
        reason: "claude: empty response",
      }
    }

    const parsed = JSON.parse(stripJsonMarkdown(block.text)) as {
      isChairVideo?: boolean
      isThisModel?: boolean
      confidence?: number
      reason?: string
    }

    const isChairVideo = parsed.isChairVideo === true
    const isThisModel = parsed.isThisModel === true
    const rawConfidence =
      typeof parsed.confidence === "number" ? parsed.confidence : 0
    const reason =
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim()
        : "(no reason)"

    // Hard gate: non-chair topics never pass. Wrong model is capped below threshold.
    let confidence = rawConfidence
    if (!isChairVideo) confidence = Math.min(confidence, 0.19)
    else if (!isThisModel) confidence = Math.min(confidence, 0.39)

    return {
      relevant: confidence >= VIDEO_RELEVANCE_MIN,
      confidence,
      isChairVideo,
      isThisModel,
      reason,
    }
  } catch {
    return {
      relevant: false,
      confidence: 0,
      isChairVideo: false,
      isThisModel: false,
      reason: "claude: parse/request error",
    }
  }
}

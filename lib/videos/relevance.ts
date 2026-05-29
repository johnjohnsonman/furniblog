import Anthropic from "@anthropic-ai/sdk"

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

/** Stricter than the generic pipeline minimum: a video must be clearly chair-focused. */
export const VIDEO_RELEVANCE_MIN = 0.5

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
  const chairName = params.chairName.trim()
  const brandName = params.brandName?.trim() || null

  if (!passesKeywordGate(title, description, chairName, brandName)) {
    return { relevant: false, confidence: 0 }
  }

  const client = getClient()
  if (!client) {
    // Without Claude we cannot verify topic focus — be conservative and reject.
    return { relevant: false, confidence: 0 }
  }

  const targetLabel = brandName ? `${brandName} ${chairName}` : chairName

  const prompt = `You are a strict relevance judge for an office-chair video library.
Decide whether a YouTube video's MAIN SUBJECT is this exact office chair model.

Target chair: "${targetLabel}" (exact model: "${chairName}"${brandName ? `, brand: "${brandName}"` : ""})

Respond ONLY with valid JSON:
{"isChairVideo": true|false, "isThisModel": true|false, "confidence": 0.0-1.0}

Rules:
- isChairVideo: true ONLY if the video is primarily about a physical office/desk/ergonomic chair.
  If the video is mainly about makeup, electronics, phones, VR/AR headsets (e.g. Apple Vision Pro),
  sunglasses/smart glasses (e.g. Meta Ray-Bans), gaming, software, vlogs, or any non-chair topic,
  set isChairVideo=false and confidence below 0.2.
- isThisModel: true ONLY if "${chairName}" (the exact model) is the central focus of the video,
  not a different model or a brand-wide roundup.
- confidence: how certain you are that this video is specifically about the "${chairName}" chair.
  - 0.8-1.0: Dedicated review/comparison/setup/long-term use of this exact chair model
  - 0.5-0.8: Clearly about this chair model with chair-specific detail
  - 0.2-0.5: Chair video but a different model, or this model only mentioned in passing
  - Below 0.2: Not a chair video at all, or wrong product entirely

A keyword match alone is NOT enough — the chair itself must be the core subject.
If isChairVideo is false, confidence MUST be below 0.2 regardless of keyword matches.

Title: ${title || "(empty)"}
Description: ${description.slice(0, 1500) || "(empty)"}
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    })
    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      return { relevant: false, confidence: 0 }
    }

    const parsed = JSON.parse(stripJsonMarkdown(block.text)) as {
      isChairVideo?: boolean
      isThisModel?: boolean
      confidence?: number
    }

    const rawConfidence =
      typeof parsed.confidence === "number" ? parsed.confidence : 0
    // Hard gates: must be a chair video AND this exact model.
    const confidence =
      parsed.isChairVideo === false || parsed.isThisModel === false
        ? Math.min(rawConfidence, 0.19)
        : rawConfidence

    return {
      relevant: confidence >= VIDEO_RELEVANCE_MIN,
      confidence,
    }
  } catch {
    return { relevant: false, confidence: 0 }
  }
}

import Anthropic from "@anthropic-ai/sdk"
import { formatAliasHintsForPrompt } from "@/lib/pipeline/chair-aliases"

export type KnownChair = {
  id: string
  name: string
  slug: string
}

export type ChairClassification = {
  /** Product slugs from the provided list */
  chairs: string[]
  isReview: boolean
  sentiment: "positive" | "negative" | "mixed" | "neutral"
}

const CLASSIFY_MODEL =
  process.env.CLAUDE_CLASSIFY_MODEL?.trim() || "claude-haiku-4-5-20251001"

function parseClassificationJson(text: string): ChairClassification {
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  if (!json) {
    return { chairs: [], isReview: false, sentiment: "neutral" }
  }
  try {
    const parsed = JSON.parse(json) as {
      chairs?: unknown
      isReview?: boolean
      sentiment?: string
    }
    const chairs = Array.isArray(parsed.chairs)
      ? parsed.chairs.map((c) => String(c).trim()).filter(Boolean)
      : []
    const sentiment = parsed.sentiment
    const validSentiment =
      sentiment === "positive" ||
      sentiment === "negative" ||
      sentiment === "mixed" ||
      sentiment === "neutral"
        ? sentiment
        : "neutral"
    return {
      chairs,
      isReview: Boolean(parsed.isReview),
      sentiment: validSentiment,
    }
  } catch {
    return { chairs: [], isReview: false, sentiment: "neutral" }
  }
}

export async function classifyChair(
  postText: string,
  knownChairs: KnownChair[]
): Promise<ChairClassification> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn("[classify-chair] ANTHROPIC_API_KEY missing")
    return { chairs: [], isReview: false, sentiment: "neutral" }
  }

  const chairList = knownChairs
    .slice(0, 80)
    .map((c) => `${c.slug}: ${c.name}`)
    .join("\n")

  const anthropic = new Anthropic({ apiKey })

  const result = await anthropic.messages.create({
    model: CLASSIFY_MODEL,
    max_tokens: 500,
    system: `Classify chair-related Reddit posts. Return JSON only:
{
  "chairs": ["product-slug-1"],
  "isReview": true,
  "sentiment": "positive" | "negative" | "mixed" | "neutral"
}

Rules:
- "chairs" must use slugs from the provided list only (not UUIDs)
- Multiple slugs allowed for comparison posts
- isReview=false for buy/sell, memes, or general desk photos without chair feedback
- Empty chairs array if no specific chair from the list is mentioned
- Use alias hints when the post uses nicknames

Alias hints:
${formatAliasHintsForPrompt()}`,
    messages: [
      {
        role: "user",
        content: `Post:\n${postText.slice(0, 4000)}\n\nAvailable chairs (slug: name):\n${chairList}`,
      },
    ],
  })

  const text =
    result.content[0]?.type === "text" ? result.content[0].text : ""
  return parseClassificationJson(text)
}

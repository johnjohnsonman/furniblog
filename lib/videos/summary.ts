import Anthropic from "@anthropic-ai/sdk"

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

/** Placeholder phrases used by old fallbacks — used for cleanup, not for display. */
export const GENERIC_VIDEO_SUMMARY_PHRASES = [
  "This video shares an overview related to the chair.",
  "This video covers chair usage experience and key comfort points.",
]

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

function isGenericSummary(text: string): boolean {
  const normalized = text.trim()
  if (!normalized) return true
  return GENERIC_VIDEO_SUMMARY_PHRASES.some(
    (phrase) => normalized === phrase || normalized.startsWith(phrase.slice(0, 50))
  )
}

/**
 * Returns a unique one-line English summary, or null if generation fails.
 * Never returns a generic placeholder string.
 */
export async function generateVideoSummary(
  title: string,
  description: string,
  chairName?: string
): Promise<string | null> {
  const client = getClient()
  if (!client) return null

  const safeTitle = title.trim()
  const safeDescription = description.trim()
  if (!safeTitle && !safeDescription) return null

  const chairHint = chairName?.trim()
    ? `The video should be about the "${chairName}" office chair.\n`
    : ""

  const prompt = `${chairHint}Write ONE unique English sentence (max 220 characters) summarizing this specific YouTube video.
State what the video actually covers (review angle, comparison, setup, pros/cons, who it's for).
Be specific to this title and description — do not use generic filler like "this video covers chair usage".
Do not invent facts not present in the text. No markdown, no quotes around the sentence.

Title: ${safeTitle || "(no title)"}
Description: ${safeDescription.slice(0, 2000) || "(no description)"}

Respond with JSON only: {"summary": "your one sentence here"}
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    })
    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") return null

    let summaryText: string | null = null
    try {
      const parsed = JSON.parse(stripJsonMarkdown(block.text)) as {
        summary?: string
      }
      summaryText = parsed.summary?.trim().replace(/\s+/g, " ") ?? null
    } catch {
      const plain = block.text.trim().replace(/\s+/g, " ")
      if (plain.length >= 20 && plain.length <= 280) {
        summaryText = plain
      }
    }

    if (!summaryText || isGenericSummary(summaryText)) return null
    return summaryText
  } catch {
    return null
  }
}

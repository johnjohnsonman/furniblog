import Anthropic from "@anthropic-ai/sdk"

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

function fallbackSummary(title: string, description: string): string {
  const text = description.trim() || title.trim()
  if (!text) return "This video shares an overview related to the chair."
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text
}

export async function generateVideoSummary(
  title: string,
  description: string
): Promise<string> {
  const client = getClient()
  if (!client) return fallbackSummary(title, description)

  const safeTitle = title.trim() || "Untitled video"
  const safeDescription = description.trim()

  const prompt = `Write one neutral English summary line (1-2 sentences) for a chair-related YouTube video.
Focus on what the video covers and its core takeaway.
Do not use hype, do not invent details, and do not include markdown.

Title: ${safeTitle}
Description: ${safeDescription || "(empty)"}
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 120,
      messages: [{ role: "user", content: prompt }],
    })
    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      return fallbackSummary(safeTitle, safeDescription)
    }
    const summary = block.text.trim().replace(/\s+/g, " ")
    return summary || fallbackSummary(safeTitle, safeDescription)
  } catch {
    return fallbackSummary(safeTitle, safeDescription)
  }
}

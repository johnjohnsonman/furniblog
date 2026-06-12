import Anthropic from "@anthropic-ai/sdk"

const CLAUDE_MODEL = process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

/** Reviews scoring at/above this match the assigned product well enough to keep. */
export const REVIEW_AUDIT_MIN = 0.4

export type ReviewAuditResult = {
  score: number
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
 * Judge whether an aggregated review is actually about its assigned product/brand.
 * Returns a 0-1 match score (low = the review is about a different chair/brand).
 */
export async function auditReviewMatch(params: {
  summary: string
  pros: string[]
  cons: string[]
  productName: string
  brandName: string | null
}): Promise<ReviewAuditResult> {
  const client = getClient()
  if (!client) {
    return { score: -1, reason: "no ANTHROPIC_API_KEY (cannot audit)" }
  }

  const target = params.brandName
    ? `${params.brandName} ${params.productName}`
    : params.productName
  const prosCons = [
    params.pros.length ? `Pros: ${params.pros.join("; ")}` : "",
    params.cons.length ? `Cons: ${params.cons.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const prompt = `You audit a furniture review database for mis-filed entries.
A stored review is assigned to a specific chair. Decide whether the review text is
actually about THAT chair (the same model; variants/sizes count) and brand.

Assigned chair: "${target}" (model: "${params.productName}"${
    params.brandName ? `, brand: "${params.brandName}"` : ""
  })

Respond ONLY with valid JSON:
{"score": 0.0-1.0, "reason": "short explanation"}

Scoring:
- 0.8-1.0: clearly about this exact chair model
- 0.4-0.8: plausibly about this chair (same model family / brand context fits)
- 0.2-0.4: ambiguous — could be a different model, or too generic to tell
- 0.0-0.2: clearly about a DIFFERENT chair or brand, or not a chair review at all (MISMATCH)
The review text may be Korean, Japanese, or English. Judge by meaning.

Review summary: ${params.summary.slice(0, 1200) || "(empty)"}
${prosCons}
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    })
    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      return { score: -1, reason: "claude: empty response" }
    }
    const parsed = JSON.parse(stripJsonMarkdown(block.text)) as {
      score?: number
      reason?: string
    }
    const score =
      typeof parsed.score === "number" && Number.isFinite(parsed.score)
        ? Math.max(0, Math.min(1, parsed.score))
        : -1
    const reason =
      typeof parsed.reason === "string" && parsed.reason.trim()
        ? parsed.reason.trim()
        : "(no reason)"
    return { score, reason }
  } catch {
    return { score: -1, reason: "claude: parse/request error" }
  }
}

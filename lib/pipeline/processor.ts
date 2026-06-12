import Anthropic from "@anthropic-ai/sdk"
import type { QueueItem } from "@/types/pipeline"
import type {
  BackIssueId,
  BodyType,
  ChairScores,
  FurnitureScores,
} from "@/types/review"
import type { ProcessedReview, RawContent } from "@/lib/pipeline/types"

const CHAIR_KEYWORDS = [
  "chair",
  "seat",
  "sitting",
  "ergonomic",
  "lumbar",
  "armrest",
  "backrest",
  "cushion",
  "recline",
  "mesh",
  "office",
  "desk",
  "work",
  "posture",
  "back pain",
  "herman miller",
  "steelcase",
  "okamura",
  "humanscale",
  "aeron",
  "leap",
  "gesture",
  "embody",
  "cosm",
]

const CHAIR_EXTRACTION_PROMPT = `You are a premium chair review analyst.
The text is confirmed chair-related. Extract review content only.
Respond ONLY with a JSON object. Never copy the original text.

{
  "summary": "2-3 sentence English summary of key points",
  "scores": {
    "lumbarSupport": 1-5 or null,
    "seatComfort": 1-5 or null,
    "armrest": 1-5 or null,
    "headrest": 1-5 or null,
    "adjustability": 1-5 or null,
    "buildQuality": 1-5 or null,
    "valueForMoney": 1-5 or null,
    "overall": 1-5
  },
  "pros": ["pro1", "pro2"],
  "cons": ["con1"],
  "reviewerHeightCm": number or null,
  "reviewerWeightKg": number or null,
  "usageHoursPerDay": number or null,
  "occupation": "job type" or null,
  "bodyType": "slim"|"average"|"athletic"|"plus" or null,
  "backIssues": ["lower_back_pain"] or [],
  "confidence": 0.5-1.0
}

Always set confidence at least 0.5 when extracting chair feedback.`

function hasChairKeywords(text: string): boolean {
  const lower = text.toLowerCase()
  return CHAIR_KEYWORDS.some((kw) => lower.includes(kw))
}

const CHAIR_SYSTEM_PROMPT = `You are a premium chair review analyst.
Analyze the following review text and respond ONLY with a JSON object.
Never copy the original text. Summarize and restructure completely.

{
  "summary": "2-3 sentence English summary of key points",
  "scores": {
    "lumbarSupport": 1-5 or null,
    "seatComfort": 1-5 or null,
    "armrest": 1-5 or null,
    "headrest": 1-5 or null,
    "adjustability": 1-5 or null,
    "buildQuality": 1-5 or null,
    "valueForMoney": 1-5 or null,
    "overall": 1-5
  },
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "reviewerHeightCm": number or null,
  "reviewerWeightKg": number or null,
  "usageHoursPerDay": number or null,
  "occupation": "job type" or null,
  "bodyType": "slim"|"average"|"athletic"|"plus" or null,
  "backIssues": ["lower_back_pain"] or [],
  "confidence": 0.0-1.0
}

Extract reviewer physical profile from the text.
Look for mentions of:
- Height: "6'2"", "188cm", "tall", "short", "5'10""
  Convert imperial to cm: 5'10" = 177cm, 6'0" = 183cm, 6'2" = 188cm
- Weight: "200lbs", "90kg", "heavy", "lightweight"
  Convert lbs to kg: 200lbs = 91kg
- Body type inference:
  'slim': mentions thin, lightweight, petite, small frame
  'athletic': mentions muscular, broad shoulders, athletic build
  'plus': mentions heavy, large, plus size, overweight
  'average': default if mentioned but no specific type
- Back issues (use ids):
  lower_back_pain, herniated_disc, sciatica, neck_pain, scoliosis, hip_pain, no_issues

If the text is not a chair review or is too vague, set confidence below 0.25.`

const CHAIR_SYSTEM_PROMPT_KO = `You are analyzing Korean text that may contain chair or furniture reviews.
Even if the text is partially relevant, extract what you can.
Respond ONLY with valid JSON. Never copy original text.

If the text mentions ANY of these, it's relevant:
- Chair brands: 오카무라, 허먼밀러, 스틸케이스, 휴먼스케일, 하워스, 콘테사, 에어론, 립체어
- Chair parts: 의자, 체어, 등판, 요추, 좌판, 팔걸이, 헤드레스트, 허리
- Work/sitting: 앉다, 사무, 재택, 업무, 장시간

{
  "summary": "2-3 sentence English summary of key points about this chair",
  "scores": {
    "lumbarSupport": 1-5 or null,
    "seatComfort": 1-5 or null,
    "armrest": 1-5 or null,
    "headrest": 1-5 or null,
    "adjustability": 1-5 or null,
    "buildQuality": 1-5 or null,
    "valueForMoney": 1-5 or null,
    "overall": 1-5
  },
  "pros": ["English pro1", "English pro2"],
  "cons": ["English con1"],
  "reviewerHeightCm": number or null,
  "reviewerWeightKg": number or null,
  "usageHoursPerDay": number or null,
  "occupation": "job type" or null,
  "bodyType": "slim"|"average"|"athletic"|"plus" or null,
  "backIssues": ["lower_back_pain"] or [],
  "confidence": 0.0-1.0
}

Set confidence:
- 0.7-1.0: Clear chair review with specific feedback
- 0.4-0.7: Mentions chair but limited detail
- 0.2-0.4: Vague mention, extract what's available
- 0.0-0.2: Not related to chairs at all

IMPORTANT: If ANY chair-related content exists, confidence should be at least 0.3.
Translate all insights to English.`

const CHAIR_SYSTEM_PROMPT_JA = `Analyze this text about a chair. It may be in English or Japanese.
Extract review information and respond ONLY with valid JSON, no markdown.

{
  "summary": "2-3 sentences in English",
  "pros": ["English pros"],
  "cons": ["English cons"],
  "overall": 1-5
}

Always extract available chair feedback. Use overall 3 if uncertain.`

const FURNITURE_SYSTEM_PROMPT = `You are an editor for a premium furniture encyclopedia.
Analyze the following text and respond with JSON only in English.
Never copy the source verbatim.
{
"summary": "3-4 sentence English summary (design, history, features)",
"scores": {
"design": 1-5 or null,
"quality": 1-5 or null,
"value": 1-5 or null,
"overall": 1-5
},
"pros": ["pro1"],
"cons": ["con1"],
"designKeywords": ["keyword1", "keyword2"],
"confidence": 0.0-1.0
}`

type ChairAiResponse = {
  summary?: string
  scores: ChairScores
  pros: string[]
  cons: string[]
  reviewerHeightCm?: number | null
  reviewerWeightKg?: number | null
  usageHoursPerDay?: number | null
  occupation?: string | null
  bodyType?: BodyType | null
  backIssues?: BackIssueId[]
  confidence: number
}

type FurnitureAiResponse = {
  summary?: string
  scores: FurnitureScores
  pros: string[]
  cons: string[]
  designKeywords?: string[]
  confidence: number
}

function extractJson(text: string): unknown {
  const cleaned = stripJsonMarkdown(text)
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1].trim() : cleaned
  return JSON.parse(raw)
}

function pickSummary(parsed: { summary?: string }): string {
  return parsed.summary?.trim() ?? ""
}

export const CONFIDENCE_MIN = 0.2

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

export type ClaudeProcessResult = {
  summary: string
  pros: string[]
  cons: string[]
  overall: number
  confidence: number
  mentions_back_pain?: boolean
  mentions_lumbar?: boolean
  back_issue_sentiment?: "positive" | "negative" | "neutral" | null
}

export type ProcessWithClaudeOutcome =
  | { status: "success"; data: ClaudeProcessResult }
  | { status: "rejected"; confidence: number }
  | { status: "error" }

type SimpleChairResponse = {
  summary?: string
  pros?: string[]
  cons?: string[]
  overall?: number
  confidence?: number
  mentions_back_pain?: boolean
  mentions_lumbar?: boolean
  back_issue_sentiment?: "positive" | "negative" | "neutral" | null
}

function stripJsonMarkdown(text: string): string {
  return text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()
}

function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function processWithClaude(
  item: RawContent,
  chairName: string
): Promise<ProcessWithClaudeOutcome> {
  const client = getClient()
  if (!client) {
    console.error("[PROCESSOR] ANTHROPIC_API_KEY not set")
    return { status: "error" }
  }

  const body = item.body.slice(0, 3000)
  const userContent = `${item.title}\n\n${body}`

  console.log("[PROCESSOR] Input text length:", item.body.length)
  console.log("[PROCESSOR] Source:", item.source)

  const prompt = `
You are a chair review analyst.
Analyze the following text (may be in Korean, Japanese, or English).
Respond ONLY with valid JSON. No markdown, no explanation.
ALL fields must be in ENGLISH regardless of the source language.

{
  "summary": "2-3 sentences in ENGLISH summarizing the review",
  "pros": ["positive point in ENGLISH", "positive point in ENGLISH"],
  "cons": ["negative point in ENGLISH"],
  "overall": 4,
  "confidence": 0.85,
  "mentions_back_pain": true,
  "mentions_lumbar": false,
  "back_issue_sentiment": "positive"
}

confidence: 0.0-1.0 how specifically this content reviews "${chairName}" (the exact chair model).
- 0.7-1.0: Clear review focused on ${chairName}
- 0.4-0.7: Mentions ${chairName} with useful detail
- 0.2-0.4: Vague or only brief mention
- Below 0.2: Wrong product — same brand different model, brand overview, or unrelated

CRITICAL relevance rule:
If this content does NOT specifically cover "${chairName}" and instead discusses
other products from the same brand, a brand-wide roundup, or a different chair model,
you MUST set confidence below 0.2 (e.g. 0.1). Do not summarize other products as if they were ${chairName}.

mentions_back_pain: true if back pain, lower back, 허리, 요통 mentioned
mentions_lumbar: true if lumbar support, 요추 mentioned
back_issue_sentiment:
  - "positive": says good for back / helps back pain
  - "negative": says bad for back / worsens pain
  - "neutral": only mentions back without clear sentiment
  - null: no back-related mention

Rules:
- summary MUST be in English
- pros MUST be in English
- cons MUST be in English
- overall MUST be 1-5 (use 3 if uncertain)
- Translate all insights to English even if source is Japanese or Korean
- Only extract feedback that clearly applies to ${chairName}, not sibling models
`

  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `${prompt.trim()}\n\n---\n\n${userContent}`,
        },
      ],
    })

    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      console.log("[PROCESSOR] No text block in Claude response")
      return { status: "error" }
    }

    console.log("[PROCESSOR] Raw response:", block.text)

    const text = stripJsonMarkdown(block.text)
    const parsed = JSON.parse(text) as SimpleChairResponse

    const rawOverall =
      typeof parsed.overall === "number" ? parsed.overall : 3
    const overall = Math.min(5, Math.max(1, rawOverall))

    const confidence =
      typeof parsed.confidence === "number" ? parsed.confidence : 0.5

    if (confidence < CONFIDENCE_MIN) {
      console.log(
        "[PROCESSOR] Rejected low relevance for",
        chairName,
        "confidence:",
        confidence
      )
      return { status: "rejected", confidence }
    }

    const summary =
      parsed.summary?.trim() ||
      item.title?.trim() ||
      item.body.slice(0, 200).trim() ||
      "Review collected from source"

    const sentiment = parsed.back_issue_sentiment
    const backIssueSentiment =
      sentiment === "positive" ||
      sentiment === "negative" ||
      sentiment === "neutral"
        ? sentiment
        : null

    const result: ClaudeProcessResult = {
      summary,
      pros: parsed.pros ?? [],
      cons: parsed.cons ?? [],
      overall,
      confidence,
      mentions_back_pain: parsed.mentions_back_pain === true,
      mentions_lumbar: parsed.mentions_lumbar === true,
      back_issue_sentiment: backIssueSentiment,
    }

    console.log("[PROCESSOR] Parsed summary:", result.summary)
    return { status: "success", data: result }
  } catch (err) {
    console.error(
      "[PROCESSOR] Claude error:",
      err instanceof Error ? err.message : err
    )
    return { status: "error" }
  }
}

function toAiOutput(
  itemType: "chair" | "furniture",
  parsed: ChairAiResponse | FurnitureAiResponse
): QueueItem["aiOutput"] {
  const summary = pickSummary(parsed)

  if (itemType === "chair") {
    const p = parsed as ChairAiResponse
    return {
      summary,
      scores: p.scores,
      pros: p.pros ?? [],
      cons: p.cons ?? [],
      confidence: p.confidence,
      reviewerHeightCm: p.reviewerHeightCm ?? undefined,
      reviewerWeightKg: p.reviewerWeightKg ?? undefined,
    }
  }

  const p = parsed as FurnitureAiResponse
  return {
    summary,
    scores: p.scores,
    pros: p.pros ?? [],
    cons: p.cons ?? [],
    confidence: p.confidence,
    designKeywords: p.designKeywords,
  }
}

/** Legacy queue processor (used by /api/pipeline/process). */
export async function processReviewContent(params: {
  rawContent: string
  itemType: "chair" | "furniture"
  queueId: string
}): Promise<{ success: boolean; data?: QueueItem["aiOutput"]; error?: string }> {
  const client = getClient()
  if (!client) {
    return { success: false, error: "missing_api_key" }
  }

  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system:
        params.itemType === "chair" ? CHAIR_SYSTEM_PROMPT : FURNITURE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: params.rawContent.slice(0, 3000),
        },
      ],
    })

    const block = message.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      return { success: false, error: "empty_response" }
    }

    const parsed = extractJson(block.text) as ChairAiResponse | FurnitureAiResponse

    if (typeof parsed.confidence !== "number") {
      return { success: false, error: "invalid_response" }
    }

    if (parsed.confidence < CONFIDENCE_MIN) {
      return { success: false, error: "low_confidence" }
    }

    const summary = pickSummary(parsed)
    if (!summary || !parsed.scores?.overall) {
      return { success: false, error: "invalid_response" }
    }

    return {
      success: true,
      data: toAiOutput(params.itemType, parsed),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error"
    return { success: false, error: message }
  }
}

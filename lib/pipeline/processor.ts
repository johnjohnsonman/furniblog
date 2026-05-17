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
  "overall": 1-5,
  "isRelevant": true/false
}

If about chairs at all, set isRelevant: true.
If isRelevant is false, still return the JSON with empty pros/cons and overall: 3.`

function getChairSystemPrompt(
  source: RawContent["source"]
): string {
  switch (source) {
    case "dcinside":
    case "naver":
      return CHAIR_SYSTEM_PROMPT_KO
    case "japan_community":
      return CHAIR_SYSTEM_PROMPT_JA
    default:
      return CHAIR_SYSTEM_PROMPT
  }
}

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

type JapanSimpleAiResponse = {
  summary?: string
  pros?: string[]
  cons?: string[]
  overall?: number
  isRelevant?: boolean
  scores?: { overall?: number }
  confidence?: number
}

function parseJapanCommunityResponse(
  parsed: JapanSimpleAiResponse,
  rawContent: RawContent,
  options?: ProcessWithClaudeOptions,
  keywordMatch = false
): ProcessedReview | null {
  if (parsed.isRelevant === false && !keywordMatch) {
    console.log("[PROCESSOR] Rejected: isRelevant false (japan_community)")
    return null
  }

  const summary = pickSummary(parsed)
  const overall = parsed.overall ?? parsed.scores?.overall

  if (!summary || overall == null) {
    if (!options?.debug) {
      console.log("[PROCESSOR] Rejected: missing summary or overall (japan_community)")
      return null
    }
  }

  const effectiveSummary =
    summary || `Review: ${rawContent.title}`.slice(0, 200)
  const effectiveOverall = overall ?? 3

  const result: ProcessedReview = {
    summary: effectiveSummary,
    scores: { overall: effectiveOverall },
    pros: parsed.pros ?? [],
    cons: parsed.cons ?? [],
    confidence:
      parsed.isRelevant === true
        ? 0.85
        : typeof parsed.confidence === "number"
          ? parsed.confidence
          : 0.5,
    sourceUrl: rawContent.url,
    source: rawContent.source,
  }

  console.log("[PROCESSOR] japan_community overall:", effectiveOverall)
  console.log("[PROCESSOR] Parsed summary:", result.summary)
  return result
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
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(raw)
}

function pickSummary(parsed: { summary?: string }): string {
  return parsed.summary?.trim() ?? ""
}

export const CONFIDENCE_MIN = 0.2

const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

export type ProcessWithClaudeOptions = {
  debug?: boolean
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
  rawContent: RawContent,
  itemType: "chair" | "furniture",
  options?: ProcessWithClaudeOptions
): Promise<ProcessedReview | null> {
  const client = getClient()
  if (!client) {
    console.error("[PROCESSOR] ANTHROPIC_API_KEY not set")
    return null
  }

  const body = rawContent.body.slice(0, 3000)
  const userContent = `${rawContent.title}\n\n${body}`
  const keywordMatch =
    itemType === "chair" && hasChairKeywords(`${rawContent.title}\n${body}`)

  console.log("[PROCESSOR] Input text length:", rawContent.body.length)
  console.log("[PROCESSOR] Source:", rawContent.source)
  console.log("[PROCESSOR] Chair keywords matched:", keywordMatch)
  console.log("[PROCESSOR] First 200 chars:", rawContent.body.substring(0, 200))

  try {
    const systemPrompt =
      itemType === "chair"
        ? keywordMatch
          ? CHAIR_EXTRACTION_PROMPT
          : getChairSystemPrompt(rawContent.source)
        : FURNITURE_SYSTEM_PROMPT

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    })

    const block = response.content.find((b) => b.type === "text")
    if (!block || block.type !== "text") {
      console.log("[PROCESSOR] No text block in Claude response")
      return null
    }

    console.log("[PROCESSOR] Raw response:", block.text)

    const parsed = extractJson(block.text) as
      | ChairAiResponse
      | FurnitureAiResponse
      | JapanSimpleAiResponse

    if (
      itemType === "chair" &&
      rawContent.source === "japan_community" &&
      ("isRelevant" in parsed || "overall" in parsed)
    ) {
      const japanResult = parseJapanCommunityResponse(
        parsed as JapanSimpleAiResponse,
        rawContent,
        options,
        keywordMatch
      )
      if (japanResult) return japanResult
    }

    if (typeof parsed.confidence !== "number" && options?.debug) {
      ;(parsed as ChairAiResponse).confidence = 0.5
    }

    console.log("[PROCESSOR] Parsed confidence:", (parsed as ChairAiResponse).confidence)

    if (keywordMatch && typeof (parsed as ChairAiResponse).confidence === "number") {
      ;(parsed as ChairAiResponse).confidence = Math.max(
        (parsed as ChairAiResponse).confidence,
        0.5
      )
    } else if (keywordMatch) {
      ;(parsed as ChairAiResponse).confidence = 0.5
    }

    const minConfidence = keywordMatch ? 0 : options?.debug ? 0 : CONFIDENCE_MIN
    if (typeof parsed.confidence !== "number" || parsed.confidence < minConfidence) {
      console.log(
        "[PROCESSOR] Rejected: confidence",
        parsed.confidence,
        `< ${minConfidence}`
      )
      return null
    }

    const summary = pickSummary(parsed)
    console.log("[PROCESSOR] Parsed summary:", summary)

    if (!summary || !parsed.scores?.overall) {
      console.log("[PROCESSOR] Rejected: missing summary or overall score", {
        hasSummary: Boolean(summary),
        overall: parsed.scores?.overall,
      })
      if (!options?.debug) return null
    }

    const isKoSource =
      rawContent.source === "dcinside" || rawContent.source === "naver"

    const effectiveSummary =
      summary ||
      (options?.debug
        ? `Debug summary: ${rawContent.title}`.slice(0, 200)
        : "")
    let effectiveOverall =
      parsed.scores?.overall ?? (options?.debug ? 3 : undefined)

    if (
      effectiveOverall == null &&
      effectiveSummary &&
      isKoSource &&
      typeof parsed.confidence === "number" &&
      parsed.confidence >= CONFIDENCE_MIN
    ) {
      effectiveOverall = 3
    }

    if (!effectiveSummary || effectiveOverall == null) return null

    if (itemType === "chair") {
      const p = parsed as ChairAiResponse
      const result: ProcessedReview = {
        summary: effectiveSummary,
        scores: {
          ...p.scores,
          overall: effectiveOverall,
        },
        pros: p.pros ?? [],
        cons: p.cons ?? [],
        reviewerHeightCm: p.reviewerHeightCm,
        reviewerWeightKg: p.reviewerWeightKg,
        usageHoursPerDay: p.usageHoursPerDay,
        occupation: p.occupation,
        bodyType: p.bodyType ?? null,
        backIssues: Array.isArray(p.backIssues) ? p.backIssues : [],
        confidence:
          typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
        sourceUrl: rawContent.url,
        source: rawContent.source,
      }
      console.log("[PROCESSOR] Parsed confidence:", result.confidence)
      console.log("[PROCESSOR] Parsed summary:", result.summary)
      return result
    }

    const p = parsed as FurnitureAiResponse
    const result: ProcessedReview = {
      summary: effectiveSummary,
      scores: {
        ...(p.scores as unknown as ChairScores),
        overall: effectiveOverall,
      },
      pros: p.pros ?? [],
      cons: p.cons ?? [],
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      sourceUrl: rawContent.url,
      source: rawContent.source,
    }
    console.log("[PROCESSOR] Parsed confidence:", result.confidence)
    console.log("[PROCESSOR] Parsed summary:", result.summary)
    return result
  } catch (err) {
    console.error(
      "[PROCESSOR] Claude error:",
      err instanceof Error ? err.message : err
    )
    return null
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

export { sleep as processorSleep }

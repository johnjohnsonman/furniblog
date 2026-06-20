import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const maxDuration = 120

const MODEL = process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"
const MAX_REVIEWS = 100
const MAX_IMAGES = 10

type ImageBlock = {
  type: "image"
  source: { type: "base64"; media_type: "image/png" | "image/jpeg" | "image/webp" | "image/gif"; data: string }
}

function parseDataUrl(dataUrl: string): ImageBlock["source"] | null {
  const m = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp|gif));base64,(.+)$/)
  if (!m) return null
  const mt = m[1] === "image/jpg" ? "image/jpeg" : (m[1] as ImageBlock["source"]["media_type"])
  return { type: "base64", media_type: mt, data: m[3] }
}

function extractJsonArray(text: string): string {
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const a = clean.indexOf("[")
  const b = clean.lastIndexOf("]")
  return a === -1 || b <= a ? "[]" : clean.slice(a, b + 1)
}

type Extracted = {
  summary?: string
  pros?: string[]
  cons?: string[]
  overall?: number
  mentions_back_pain?: boolean
  mentions_lumbar?: boolean
  back_issue_sentiment?: "positive" | "negative" | "neutral" | null
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })

  let body: { chairSlug?: string; images?: string[] }
  try {
    body = (await request.json()) as { chairSlug?: string; images?: string[] }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const chairSlug = body.chairSlug?.trim()
  const images = (body.images ?? []).slice(0, MAX_IMAGES)
  if (!chairSlug) return NextResponse.json({ error: "Select a chair first." }, { status: 400 })
  if (images.length === 0) return NextResponse.json({ error: "Add at least one screenshot." }, { status: 400 })

  const supabase = createAdminClient()
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("slug", chairSlug)
    .eq("track", "chair")
    .maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!product) return NextResponse.json({ error: "Chair not found." }, { status: 404 })

  const imageBlocks: ImageBlock[] = []
  for (const dataUrl of images) {
    const source = parseDataUrl(dataUrl)
    if (source) imageBlocks.push({ type: "image", source })
  }
  if (imageBlocks.length === 0) {
    return NextResponse.json({ error: "Couldn't read the uploaded images." }, { status: 400 })
  }

  const prompt = `These screenshot(s) show an online forum / Reddit thread about office chairs.
Extract EVERY substantive user opinion about the "${product.name}" as its own separate review — the original post AND each comment that shares a real experience or opinion about this chair.

For each one, output an object:
{"summary":"2-3 sentence English summary, PARAPHRASED (never copy the user's exact words)","pros":["..."],"cons":["..."],"overall":<1-5>,"mentions_back_pain":<true|false>,"mentions_lumbar":<true|false>,"back_issue_sentiment":"positive"|"negative"|"neutral"|null}

Rules:
- Include negative and critical opinions honestly — do NOT soften or omit them. overall must reflect real sentiment (low if they disliked the chair).
- One object per distinct commenter/opinion. Up to ${MAX_REVIEWS} total.
- SKIP: ads / "Promoted" posts, navigation, sidebars, vote counts, and low-value replies with no real opinion ("same here", "lol", "such as?").
- SKIP anything clearly about a DIFFERENT chair model.
- overall is 1-5 (use 3 only if genuinely mixed). All text in English.
Return ONLY a JSON array — no prose, no markdown. If nothing relevant, return [].`

  const anthropic = new Anthropic({ apiKey })
  let parsed: Extracted[]
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text", text: prompt },
          ] as Anthropic.Messages.MessageParam["content"],
        },
      ],
    })
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
    parsed = JSON.parse(extractJsonArray(text)) as Extracted[]
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Vision extraction failed." },
      { status: 502 }
    )
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return NextResponse.json(
      { error: "No reviews about this chair were found in the screenshot(s)." },
      { status: 422 }
    )
  }

  const rows = parsed
    .slice(0, MAX_REVIEWS)
    .map((r) => {
      const summary = String(r.summary ?? "").trim()
      if (!summary) return null
      const overall = Math.min(5, Math.max(1, Math.round(Number(r.overall) || 3)))
      const scores: Record<string, unknown> = { overall }
      if (r.mentions_back_pain === true) scores.mentionsBackPain = true
      if (r.mentions_lumbar === true) scores.mentionsLumbar = true
      if (r.back_issue_sentiment) scores.backIssueSentiment = r.back_issue_sentiment
      return {
        product_id: product.id,
        source: "community",
        summary_ko: summary,
        pros: Array.isArray(r.pros) ? r.pros.map(String).slice(0, 6) : [],
        cons: Array.isArray(r.cons) ? r.cons.map(String).slice(0, 6) : [],
        scores,
        source_url: null,
        original_language: "en",
        verified: false,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (rows.length === 0) {
    return NextResponse.json({ error: "Extraction returned nothing usable." }, { status: 422 })
  }

  const { error: insErr } = await supabase.from("reviews").insert(rows)
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    added: rows.length,
    chair: { slug: product.slug, name: product.name },
    samples: rows.slice(0, 3).map((r) => ({ overall: (r.scores as { overall: number }).overall, summary: r.summary_ko })),
  })
}

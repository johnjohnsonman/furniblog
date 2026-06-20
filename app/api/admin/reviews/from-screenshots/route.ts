import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { matchProductInList } from "@/lib/chairpedia/match-product"

export const runtime = "nodejs"
export const maxDuration = 300

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
  chairName?: string
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

  const prompt = `These screenshot(s) show an online forum / Reddit thread discussing office chairs. The thread is mainly about the "${product.name}", but commenters often mention OTHER chairs too.

Extract EVERY substantive opinion about ANY specific office chair — the original post and each comment that shares a real experience or opinion. Each (commenter, chair) opinion becomes its own review object.

For each one, output an object:
{"chairName":"the exact chair this opinion is about, brand + model (e.g. 'Herman Miller Cosm', 'Steelcase Leap V2'). Leave EMPTY (\\"\\") when it's about the thread's main chair (the ${product.name}) or just says 'this chair' / 'it' with no other name.","summary":"a DETAILED review in English","pros":["..."],"cons":["..."],"overall":<1-5>,"mentions_back_pain":<true|false>,"mentions_lumbar":<true|false>,"back_issue_sentiment":"positive"|"negative"|"neutral"|null}

The "summary" field is the actual review body shown on the site — make it RICH and DETAILED, not a short summary:
- Capture EVERYTHING this person said: their full experience, specifics, what they liked and disliked, how long they've owned it, their use case / body type / setup, comparisons to other chairs, and any nuance or caveat.
- Write a substantial paragraph — roughly 4-8 sentences, and longer if the person wrote a lot. Do NOT compress or trim away detail; longer, specific reviews are more valuable.
- Paraphrase in your own words (never copy their exact wording verbatim), but keep their real stance, tone, and all the concrete details.

Rules:
- Include negative and critical opinions honestly — do NOT soften or omit them. overall must reflect real sentiment (low if they disliked the chair).
- chairName: use the FULL brand + model when a chair is named; use "" for the main chair / unnamed references ("this chair", "it").
- One object per (commenter, chair) opinion. Up to ${MAX_REVIEWS} total.
- SKIP: ads / "Promoted" posts, navigation, sidebars, vote counts.
- SKIP pure name-drops and one-liners with no real substance ("Cosm is great", "same here", "lol", "such as?") — only include opinions with actual detail.
- overall is 1-5 (use 3 only if genuinely mixed). All text in English.
Return ONLY a JSON array — no prose, no markdown. If nothing relevant, return [].`

  const anthropic = new Anthropic({ apiKey })
  let parsed: Extracted[]
  try {
    // Stream: a large max_tokens makes the SDK reject non-streaming requests
    // ("Streaming is required for operations that may take longer than 10 min").
    const res = await anthropic.messages
      .stream({
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
      .finalMessage()
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

  // Load the catalog once for in-memory chair-name matching.
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, slug, name")
    .eq("track", "chair")
    .limit(2000)
  const catalog = (allProducts ?? []) as { id: string; slug: string; name: string }[]

  const MIN_LEN = 40 // skip name-drops / one-liners
  const unmatched = new Set<string>()
  const nameById = new Map<string, string>()
  type Row = {
    product_id: string
    source: string
    summary_ko: string
    pros: string[]
    cons: string[]
    scores: Record<string, unknown>
    source_url: null
    original_language: string
    verified: boolean
  }
  const rows: Row[] = []

  for (const r of parsed.slice(0, MAX_REVIEWS)) {
    const summary = String(r.summary ?? "").trim()
    if (summary.length < MIN_LEN) continue

    // Route to the named chair; default to the selected chair for unnamed
    // ("this chair"/"it") references. Conservative: skip names we can't match.
    const chairName = String(r.chairName ?? "").trim()
    let targetId: string
    let targetName: string
    if (!chairName) {
      targetId = product.id
      targetName = product.name
    } else {
      const matched = matchProductInList(chairName, catalog)
      if (!matched) {
        unmatched.add(chairName)
        continue
      }
      targetId = matched.id
      targetName = matched.name
    }

    const overall = Math.min(5, Math.max(1, Math.round(Number(r.overall) || 3)))
    const scores: Record<string, unknown> = { overall }
    if (r.mentions_back_pain === true) scores.mentionsBackPain = true
    if (r.mentions_lumbar === true) scores.mentionsLumbar = true
    if (r.back_issue_sentiment) scores.backIssueSentiment = r.back_issue_sentiment

    nameById.set(targetId, targetName)
    rows.push({
      product_id: targetId,
      source: "community",
      summary_ko: summary,
      pros: Array.isArray(r.pros) ? r.pros.map(String).slice(0, 6) : [],
      cons: Array.isArray(r.cons) ? r.cons.map(String).slice(0, 6) : [],
      scores,
      source_url: null,
      original_language: "en",
      verified: false,
    })
  }

  if (rows.length === 0) {
    return NextResponse.json(
      {
        error:
          unmatched.size > 0
            ? `Only found opinions about chairs not in the catalog: ${[...unmatched]
                .slice(0, 8)
                .join(", ")}.`
            : "No usable reviews were found in the screenshot(s).",
      },
      { status: 422 }
    )
  }

  const { error: insErr } = await supabase.from("reviews").insert(rows)
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  const counts = new Map<string, number>()
  for (const row of rows) counts.set(row.product_id, (counts.get(row.product_id) ?? 0) + 1)
  const byChair = [...counts.entries()]
    .map(([id, count]) => ({ name: nameById.get(id) ?? "Chair", count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    success: true,
    added: rows.length,
    byChair,
    unmatched: [...unmatched].slice(0, 12),
    samples: rows.slice(0, 3).map((row) => ({
      chair: nameById.get(row.product_id) ?? "",
      overall: (row.scores as { overall: number }).overall,
      summary: row.summary_ko,
    })),
  })
}

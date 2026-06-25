import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const maxDuration = 60

// Opus 4.8 for the best expert reasoning; override via env if needed.
const MODEL = process.env.CHAIR_AI_MODEL?.trim() || "claude-opus-4-8"

type CatalogRow = {
  slug: string
  name: string
  category: string | null
  price_usd: number | null
  price_range: string | null
  best_for: string | null
  thumbnail_url: string | null
  brands: { name: string } | { name: string }[] | null
}

function brandName(b: CatalogRow["brands"]): string {
  if (!b) return ""
  return Array.isArray(b) ? (b[0]?.name ?? "") : b.name
}

function priceLabel(row: { price_usd: number | null; price_range: string | null }): string {
  if (row.price_usd) return `$${row.price_usd.toLocaleString()}`
  return row.price_range || "Price on request"
}

/** Pull the recommendation JSON out of the model's reply, tolerantly. */
function parseResult(text: string): { intro: string; picks: { slug: string; reason: string }[] } | null {
  let t = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "")
  const start = t.indexOf("{")
  const end = t.lastIndexOf("}")
  if (start === -1 || end === -1) return null
  t = t.slice(start, end + 1)
  try {
    const parsed = JSON.parse(t) as {
      intro?: unknown
      picks?: unknown
    }
    const intro = typeof parsed.intro === "string" ? parsed.intro : ""
    const picks = Array.isArray(parsed.picks)
      ? parsed.picks
          .map((p) => {
            const o = p as { slug?: unknown; reason?: unknown }
            return {
              slug: typeof o.slug === "string" ? o.slug.trim() : "",
              reason: typeof o.reason === "string" ? o.reason.trim() : "",
            }
          })
          .filter((p) => p.slug)
      : []
    return { intro, picks }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  let body: { query?: string }
  try {
    body = (await request.json()) as { query?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const query = body.query?.trim()
  if (!query) {
    return NextResponse.json({ error: "Tell me what you're looking for." }, { status: 400 })
  }
  if (query.length > 1000) {
    return NextResponse.json({ error: "That's a bit long — keep it under 1000 characters." }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    return NextResponse.json({ error: "chA.I.r is not configured (missing API key)." }, { status: 500 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("products")
      .select("slug, name, category, price_usd, price_range, best_for, thumbnail_url, brands(name)")
      .eq("track", "chair")
      .eq("published", true)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as CatalogRow[]
    if (rows.length === 0) {
      return NextResponse.json({ error: "The catalog is empty right now." }, { status: 503 })
    }

    // Compact, grounded catalog the model must choose from (slug is the key).
    const catalog = rows
      .map((r) => {
        const brand = brandName(r)
        const bits = [
          `${r.slug} — ${r.name}`,
          brand,
          r.category ?? "",
          priceLabel(r),
          r.best_for ? `best for ${r.best_for}` : "",
        ].filter(Boolean)
        return bits.join(" · ")
      })
      .join("\n")

    const system = `You are chA.I.r, Furniblog's expert chair advisor. A person describes what they need in their own words, and you recommend the chairs that fit them best.

STRICT RULES:
- Recommend ONLY chairs from the CATALOG below, referenced by their exact slug. Never invent a chair, brand, or slug.
- Choose the 3–5 best matches for the person's needs, best first.
- For each pick, write one warm, specific sentence (max ~30 words) on WHY it fits what they asked — reference their actual needs (use, budget, body, pain, hours, style).
- If the request is vague, make sensible assumptions and still recommend.
- Write a friendly 1–2 sentence intro that reflects their request.

OUTPUT: Respond with ONLY a JSON object, no preamble, no markdown fences:
{"intro": "...", "picks": [{"slug": "exact-slug", "reason": "..."}, ...]}

CATALOG (choose only from these):
${catalog}`

    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" }, // catalog is stable → cache across requests
        },
      ],
      messages: [{ role: "user", content: query }],
    })

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "I couldn't help with that request. Try describing your seating needs." },
        { status: 422 }
      )
    }

    const textBlock = response.content.find((b) => b.type === "text")
    const raw = textBlock && textBlock.type === "text" ? textBlock.text : ""
    const parsed = parseResult(raw)
    if (!parsed || parsed.picks.length === 0) {
      return NextResponse.json(
        { error: "I couldn't find a good match — try rephrasing your needs." },
        { status: 502 }
      )
    }

    // Ground the picks against the real catalog; drop anything hallucinated.
    const bySlug = new Map(rows.map((r) => [r.slug, r]))
    const picks = parsed.picks
      .map((p) => {
        const row = bySlug.get(p.slug)
        if (!row) return null
        return {
          slug: row.slug,
          name: row.name,
          brand: brandName(row),
          category: row.category ?? "office",
          price: priceLabel(row),
          thumbnailUrl: row.thumbnail_url,
          reason: p.reason,
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .slice(0, 5)

    if (picks.length === 0) {
      return NextResponse.json(
        { error: "I couldn't match that to our catalog — try rephrasing." },
        { status: 502 }
      )
    }

    return NextResponse.json({ intro: parsed.intro, picks })
  } catch (err) {
    const message = err instanceof Error ? err.message : "chA.I.r failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

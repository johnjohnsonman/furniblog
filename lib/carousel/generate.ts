import Anthropic from "@anthropic-ai/sdk"
import type { CarouselDraft, Slide, SlideLayout } from "@/lib/carousel/types"

const MODEL =
  process.env.CAROUSEL_MODEL?.trim() ||
  process.env.CLAUDE_MODEL?.trim() ||
  "claude-sonnet-4-5"

export type GenUsage = {
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
}

function priceFor(model: string): { in: number; out: number } {
  const m = model.toLowerCase()
  if (m.includes("opus")) return { in: 15, out: 75 }
  if (m.includes("haiku")) return { in: 1, out: 5 }
  return { in: 3, out: 15 } // sonnet default
}

/** Strip an HTML article down to readable plain text (headings kept as lines). */
export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(h[1-6]|p|li|tr|blockquote|div)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

const VALID_LAYOUTS: SlideLayout[] = ["cover", "text", "stat", "cta"]

function coerceSlide(x: unknown): Slide | null {
  if (!x || typeof x !== "object") return null
  const o = x as Record<string, unknown>
  const layout = VALID_LAYOUTS.includes(o.layout as SlideLayout)
    ? (o.layout as SlideLayout)
    : "text"
  const title = String(o.title ?? "").trim()
  if (!title && layout !== "cta") return null
  const s: Slide = { layout, title }
  if (o.eyebrow) s.eyebrow = String(o.eyebrow).trim().slice(0, 40)
  if (o.body) s.body = String(o.body).trim().slice(0, 220)
  if (o.stat && typeof o.stat === "object") {
    const st = o.stat as Record<string, unknown>
    s.stat = {
      before: st.before ? String(st.before).trim().slice(0, 12) : undefined,
      after: st.after ? String(st.after).trim().slice(0, 12) : undefined,
      value: st.value ? String(st.value).trim().slice(0, 14) : undefined,
      label: st.label ? String(st.label).trim().slice(0, 60) : undefined,
    }
  }
  return s
}

function parseDraft(raw: string): CarouselDraft {
  let text = raw.trim()
  // Strip code fences if present.
  text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```\s*$/, "").trim()
  // Extract the outermost JSON object.
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1) throw new Error("No JSON object in model output")
  const json = text.slice(start, end + 1)
  const parsed = JSON.parse(json) as Record<string, unknown>

  const slides = Array.isArray(parsed.slides)
    ? parsed.slides.map(coerceSlide).filter((s): s is Slide => Boolean(s))
    : []
  if (slides.length < 3) throw new Error("Too few slides generated")

  // Guarantee the first slide is a cover and the last a CTA.
  if (slides[0].layout !== "cover") slides[0].layout = "cover"
  const last = slides[slides.length - 1]
  if (last.layout !== "cta") {
    slides.push({ layout: "cta", title: "Read the full story", eyebrow: "MORE" })
  }

  const caption = String(parsed.caption ?? "").trim()
  const hashtags = Array.isArray(parsed.hashtags)
    ? parsed.hashtags
        .map((h) => String(h).trim().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 20)
    : []

  return { slides: slides.slice(0, 10), caption, hashtags }
}

export type CarouselSource = {
  title: string
  subtitle?: string | null
  excerpt?: string | null
  bodyText: string // plain text (already stripped of HTML)
}

/**
 * Turn one article into a 7–9 slide Instagram carousel, grounded ONLY in the
 * supplied text (no invented facts/numbers). Also drafts the caption + hashtags,
 * because the last feed slide isn't clickable — the link lives in the caption.
 */
export async function generateCarouselDraft(
  src: CarouselSource
): Promise<{ draft: CarouselDraft; usage: GenUsage }> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY")
  const client = new Anthropic({ apiKey })

  const prompt = `You are Furniblog's social editor. Turn the ARTICLE below into a scroll-stopping Instagram carousel of 7–9 slides. This drives furniture/chair enthusiasts from Instagram to the full article.

STRICT RULES
- Use ONLY facts, numbers and claims found in the ARTICLE. NEVER invent specs, stats, prices or awards. If the article has no strong number, don't fabricate a "stat" slide.
- Punchy, confident, editorial English. Titles are SHORT (max ~7 words). Body is 1 tight sentence.
- Slide 1 is the HOOK (layout "cover"): the single most intriguing angle, not a boring summary.
- Middle slides build the story: each one idea. Use layout "stat" ONLY when the article gives a striking number (e.g. a measured reduction, a count, a year) — put it in the stat object. Otherwise "text".
- Final slide is the call to action (layout "cta").

LAYOUTS
- "cover": eyebrow (tiny kicker), title (the hook), body (one teaser line).
- "text": eyebrow (chapter label like "WHY MOVEMENT"), title, body (one sentence).
- "stat": eyebrow (label), title (short), and a stat object. For a before→after use {"before":"110","after":"43","label":"Backrest pressure −60%"}. For a single figure use {"value":"360","label":"joints in the human body"}.
- "cta": title like "Read the full story", eyebrow "MORE". (Body/link handled by the template.)

Return ONE JSON object, nothing else:
{
  "slides": [
    {"layout":"cover","eyebrow":"…","title":"…","body":"…"},
    {"layout":"text","eyebrow":"…","title":"…","body":"…"},
    {"layout":"stat","eyebrow":"…","title":"…","stat":{"before":"…","after":"…","label":"…"}},
    {"layout":"cta","eyebrow":"MORE","title":"Read the full story"}
  ],
  "caption": "First line = the hook. 2–3 short sentences of value. End with: 'Full guide → link in bio 🔗 (furniblog.com)'. Plain text, a few tasteful emojis ok.",
  "hashtags": ["officechair","ergonomicchair","homeoffice", "…up to 15 relevant niche tags, no # symbol"]
}

ARTICLE
Title: ${src.title}
${src.subtitle ? `Subtitle: ${src.subtitle}\n` : ""}${src.excerpt ? `Summary: ${src.excerpt}\n` : ""}
Body:
${src.bodyText.slice(0, 9000)}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  })

  const u = response.usage
  const p = priceFor(MODEL)
  const inputTokens = u?.input_tokens ?? 0
  const outputTokens = u?.output_tokens ?? 0
  const usage: GenUsage = {
    model: MODEL,
    inputTokens,
    outputTokens,
    costUsd: (inputTokens / 1e6) * p.in + (outputTokens / 1e6) * p.out,
  }

  const block = response.content.find((x) => x.type === "text")
  const rawText = block && block.type === "text" ? block.text : ""
  const draft = parseDraft(rawText)
  return { draft, usage }
}

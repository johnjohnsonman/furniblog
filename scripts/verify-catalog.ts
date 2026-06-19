/**
 * Research-grounded catalog verification: for every product, use Claude + the
 * web_search tool to find the real current USD price (converting from KRW/JPY/
 * EUR official prices when USD isn't listed) and the correct category. Then fix
 * price_usd / price_range / category in the DB.
 *
 * Anti-hallucination: prices/categories come from web research, not guessing.
 * If a price can't be verified, it's left null rather than invented.
 *
 * Usage:
 *   npm run verify:catalog -- --limit 5        # dry-run on 5 products
 *   npm run verify:catalog                      # dry-run on all
 *   npm run verify:catalog -- --apply           # write changes
 */

import { config } from "dotenv"
import { readFileSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

config({ path: resolve(__dirname, "../.env.local") })

const MODEL = process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"
const CONCURRENCY = 4
const VALID_CATEGORIES = [
  "office",
  "executive",
  "gaming",
  "study",
  "conference",
  "lounge",
  "standing",
  "dining",
]

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

type Product = {
  id: string
  name: string
  category: string | null
  price_usd: number | null
  price_range: string | null
  brand: string | null
}

type Research = {
  priceUsd: number | null
  category: string | null
  confidence: number
  note: string
}

function priceTier(u: number): string {
  return u < 300 ? "$" : u < 800 ? "$$" : u < 1600 ? "$$$" : "$$$$"
}

function extractJson(text: string): string {
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const a = clean.indexOf("{")
  const b = clean.lastIndexOf("}")
  return a === -1 || b <= a ? clean : clean.slice(a, b + 1)
}

const SYSTEM = `You are a meticulous furniture-market researcher. You verify facts with web_search and NEVER invent numbers. If you cannot find a reliable price, return null — do not guess.`

function prompt(name: string, brand: string | null): string {
  return `Research the office/desk chair "${name}"${brand ? ` by ${brand}` : ""} using web_search (do a few searches).

Find two things:
1. priceUsd — its current typical retail price in US dollars (street/selling price, not inflated MSRP). If it is only sold in KRW, JPY, EUR, or GBP, convert the official/typical price to USD at roughly current exchange rates and return that number. Return null ONLY if you genuinely cannot find any price.
2. category — the single best-fit category, chosen from EXACTLY this list:
   - "office"      : ergonomic / task desk chair (mesh or padded, adjustable, for daily work)
   - "executive"   : premium high-back, leather/padded, status/boardroom presence chair
   - "gaming"      : racing-style or gaming-brand chair
   - "conference"  : meeting / visitor / stacking chair
   - "lounge"      : lounge / recliner / relaxation chair
   - "standing"    : saddle, kneeling, perch, ball, or standing-desk active stool
   - "study"       : budget home / student desk chair
   - "dining"      : dining chair

Return ONLY this JSON (no prose):
{"priceUsd": number|null, "category": "one of the list", "confidence": 0.0-1.0, "note": "one short line: price source + why this category"}`
}

async function research(p: Product): Promise<Research | null> {
  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM,
      tools: [
        { type: "web_search_20250305", name: "web_search", max_uses: 4 } as Anthropic.Messages.WebSearchTool20250305,
      ],
      messages: [{ role: "user", content: prompt(p.name, p.brand) }],
    })
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
    const parsed = JSON.parse(extractJson(text)) as Partial<Research>
    const priceUsd =
      typeof parsed.priceUsd === "number" && parsed.priceUsd > 0
        ? Math.round(parsed.priceUsd)
        : null
    const category =
      typeof parsed.category === "string" && VALID_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : null
    return {
      priceUsd,
      category,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      note: String(parsed.note ?? "").slice(0, 140),
    }
  } catch (e) {
    console.error(`  ! ${p.name}: ${e instanceof Error ? e.message : e}`)
    return null
  }
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx])
    }
  }
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker))
  return out
}

async function main() {
  const apply = process.argv.includes("--apply")
  const limArg = process.argv.find((a) => a.startsWith("--limit"))
  const limit = limArg ? Number(limArg.split("=")[1] ?? process.argv[process.argv.indexOf(limArg) + 1]) : undefined
  // --names <path>: only process products whose name is listed (one per line).
  const namesIdx = process.argv.indexOf("--names")
  let onlyNames: Set<string> | null = null
  if (namesIdx !== -1 && process.argv[namesIdx + 1]) {
    const raw = readFileSync(process.argv[namesIdx + 1], "utf8")
    onlyNames = new Set(raw.split("\n").map((s) => s.trim()).filter(Boolean))
    console.log(`Resume mode: only ${onlyNames.size} listed products.`)
  }

  const { data } = await sb
    .from("products")
    .select("id, name, category, price_usd, price_range, brands(name)")
    .order("name")
    .limit(2000)
  let products: Product[] = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price_usd: p.price_usd,
    price_range: p.price_range,
    brand: Array.isArray(p.brands) ? p.brands[0]?.name : p.brands?.name,
  }))
  if (onlyNames) products = products.filter((p) => onlyNames!.has(p.name))
  if (limit) products = products.slice(0, limit)

  console.log(`Researching ${products.length} products (concurrency ${CONCURRENCY})…\n`)

  let priceFix = 0, catFix = 0, unverified = 0, done = 0
  const results = await pool(products, CONCURRENCY, async (p) => {
    const r = await research(p)
    done++
    if (!r) { unverified++; return { p, r: null } }
    const update: Record<string, unknown> = {}
    if (r.priceUsd != null && r.confidence >= 0.5 && r.priceUsd !== p.price_usd) {
      update.price_usd = r.priceUsd
      update.price_range = priceTier(r.priceUsd)
      priceFix++
    } else if (r.priceUsd == null) {
      unverified++
    }
    if (r.category && r.confidence >= 0.6 && r.category !== p.category) {
      update.category = r.category
      catFix++
    }
    const changed = Object.keys(update).length > 0
    console.log(
      `[${done}/${products.length}] ${p.name.slice(0, 34).padEnd(34)} ` +
        `$${p.price_usd ?? "-"}→$${(update.price_usd as number) ?? p.price_usd ?? "?"} | ` +
        `${p.category}→${(update.category as string) ?? p.category} ` +
        `(${r.confidence.toFixed(2)}) ${changed ? "" : "[no change] "}${r.note}`
    )
    if (apply && changed) {
      const { error } = await sb.from("products").update(update).eq("id", p.id)
      if (error) console.error(`    ! update failed: ${error.message}`)
    }
    return { p, r, update }
  })

  console.log(
    `\n=== ${apply ? "APPLIED" : "DRY RUN"} === price fixes ${priceFix}, category fixes ${catFix}, unverified prices ${unverified}, total ${results.length}`
  )
  if (!apply) console.log(`Re-run with "--apply" to write changes.`)
}

main().catch((e) => { console.error(e); process.exit(1) })

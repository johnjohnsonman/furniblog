/**
 * Import the unified store experience workbook into experience_reviews.
 *
 *   node scripts/import-experience.mjs --dry-run   # no DB writes, prints plan
 *   node scripts/import-experience.mjs             # translate + insert
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * ANTHROPIC_API_KEY. Run migrations 020 + 021 + 022 first.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import xlsx from "xlsx"
import { createClient } from "@supabase/supabase-js"
import Anthropic from "@anthropic-ai/sdk"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

function loadEnv() {
  const p = path.join(ROOT, ".env.local")
  if (!existsSync(p)) return
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
loadEnv()

const DRY = process.argv.includes("--dry-run")
const FILE = path.join(ROOT, "data", "체어파크_통합_체험후기_데이터.xlsx")
const SHEET = "통합 체험후기"
const MODEL = process.env.CLAUDE_MODEL?.trim() || "claude-sonnet-4-5"

/* --------------------------- header detection --------------------------- */
// field -> candidate substrings found in the header cell.
const HEADER_MATCHERS = {
  rank1: ["1위", "1순위", "첫번째", "1 위"],
  rank2: ["2위", "2순위", "두번째", "2 위"],
  rank3: ["3위", "3순위", "세번째", "3 위"],
  rating: ["별점", "평점", "점수", "star"],
  gender: ["성별"],
  height: ["키", "신장"],
  weight_or_body: ["몸무게", "체중", "체형"],
  age_group: ["연령", "나이"],
  job: ["직업"],
  main_purpose: ["주 사용", "주목적", "주 목적", "용도", "사용 목적", "목적"],
  sitting_hours: ["앉는", "착석", "사용 시간", "사용시간", "이용 시간"],
  previous_chair: ["기존", "이전 의자", "쓰던", "사용하던"],
  pain_areas: ["불편", "통증", "아픈"],
  standing_desk: ["스탠딩", "스탠드", "standing"],
  purchase_reason: ["구매"],
  selection_reasons: ["선정", "선택 이유", "선택이유", "이유"],
  review_text: ["후기", "리뷰", "코멘트", "의견", "내용", "한줄", "한 줄"],
  store_location: ["매장", "지점", "체험 매장"],
  comparing_chairs: ["비교"],
  nickname: ["닉네임", "성함", "이름"],
  phone: ["연락처", "전화", "휴대", "핸드폰"],
}
// resolve order: specific fields first so generic ones (이유/후기/이름) don't steal columns.
const RESOLVE_ORDER = [
  "rank1", "rank2", "rank3", "rating", "gender", "height", "weight_or_body",
  "age_group", "job", "main_purpose", "sitting_hours", "previous_chair",
  "pain_areas", "standing_desk", "store_location", "comparing_chairs", "phone",
  "nickname", "purchase_reason", "selection_reasons", "review_text",
]

function detectColumns(headers) {
  const map = {}
  const used = new Set()
  for (const field of RESOLVE_ORDER) {
    const matchers = HEADER_MATCHERS[field]
    let found = -1
    for (let i = 0; i < headers.length; i++) {
      if (used.has(i)) continue
      const h = String(headers[i] ?? "").trim()
      if (!h) continue
      if (matchers.some((m) => h.includes(m))) {
        found = i
        break
      }
    }
    if (found >= 0) {
      map[field] = found
      used.add(found)
    }
  }
  return map
}

/* --------------------------- value normalization --------------------------- */
const HEIGHT_BANDS = ["~160", "161-165", "166-170", "171-175", "176-180", "181+"]

function normGender(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  if (/남|male|m\b/i.test(s)) return "남성"
  if (/여|female|f\b/i.test(s)) return "여성"
  return null
}
function normHeight(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10)
  if (Number.isFinite(num) && num >= 130 && num <= 210) {
    if (num <= 160) return "~160"
    if (num <= 165) return "161-165"
    if (num <= 170) return "166-170"
    if (num <= 175) return "171-175"
    if (num <= 180) return "176-180"
    return "181+"
  }
  if (HEIGHT_BANDS.includes(s)) return s
  return null
}
function normAge(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10)
  if (Number.isFinite(num)) {
    if (num >= 60) return "60대+"
    if (num >= 50) return "50대"
    if (num >= 40) return "40대"
    if (num >= 30) return "30대"
    if (num >= 20) return "20대"
    if (num >= 10) return "10대"
  }
  return null
}
function normStanding(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  if (/사용|쓰|yes|있|o\b/i.test(s)) return "사용"
  if (/안|미사용|no|없|x\b/i.test(s)) return "안 함"
  return s.slice(0, 20)
}
function splitArray(v) {
  const s = String(v ?? "").trim()
  if (!s) return []
  return s
    .split(/[,/·、|\n]+/)
    .map((x) => x.trim())
    .filter((x, i, a) => x && a.indexOf(x) === i)
    .slice(0, 20)
}
function cleanText(v, max = 2000) {
  const s = String(v ?? "").trim()
  return s ? s.slice(0, max) : null
}
function normRating(v) {
  const n = parseInt(String(v ?? "").replace(/[^0-9]/g, ""), 10)
  if (!Number.isFinite(n) || n < 1 || n > 5) return null
  return n
}

/* --------------------------- chair normalization --------------------------- */
// Exact Korean source name (parenthetical variant + comma tail stripped)
// -> canonical furniblog product name (must match products.name exactly).
const MANUAL_ALIASES = {
  "스틸케이스-립체어": "Steelcase Leap V2",
  "휴먼스케일-프리덤": "Humanscale Freedom Headrest",
  "오카무라-콘테사2": "Okamura Contessa II",
  "오까무라-콘테사2": "Okamura Contessa II",
  "스틸케이스-제스처": "Steelcase Gesture",
  "놀-제너레이션": "Knoll ReGeneration",
  "허먼밀러-엠바디 게이밍": "Herman Miller x Logitech G Embody Gaming Chair",
  "허먼밀러-코즘": "Herman Miller Cosm High Back",
  "휴먼스케일-월드원": "Humanscale World One",
  "하워스-펀체어": "Haworth Fern",
  "오카무라-실피": "Okamura Sylphy",
  "오까무라-실피": "Okamura Sylphy",
  "스틸케이스-씽크": "Steelcase Think V2",
  "세두스-오픈업 모던 클래식": "Sedus open up",
  "빌크한-On": "Wilkhahn ON",
  "글로벌-콩코드 프레지덴셜": "Global Concorde Presidential",
  "이토키-액트 2 텍스처드 메쉬": "Itoki ACT2",
  "허먼밀러-세일": "Herman Miller Sayl",
  // Unresolved (no matching product yet) — left null on purpose:
  //   "놀-뉴슨 테스크 체어"  (no Knoll Newson product)
  //   "오카무라-레전더"       (ambiguous)
}
// Regex rules for families with variant suffixes (B-size / C-size etc.)
const REGEX_RULES = [
  [/에어론|aeron/i, "Herman Miller Aeron"],
]

function canonicalKey(raw) {
  // take the first chair if several are comma-joined in one cell,
  // then drop a trailing "(메쉬)/(패브릭)/(가죽)" style variant note.
  const first = String(raw ?? "").split(/[,，]/)[0].trim()
  return first.replace(/\s*\(.*?\)\s*$/g, "").trim()
}

function canonicalizeChair(raw, productIndex) {
  const ko = canonicalKey(raw)
  if (!ko) return { ko: null, en: null, productId: null }

  let en = MANUAL_ALIASES[ko] ?? null
  if (!en) {
    for (const [re, name] of REGEX_RULES) {
      if (re.test(ko)) {
        en = name
        break
      }
    }
  }
  const productId = en ? productIndex.byName.get(en.toLowerCase())?.id ?? null : null
  return { ko, en, productId }
}

/* --------------------------- translation --------------------------- */
let anthropic = null
function getAnthropic() {
  if (anthropic) return anthropic
  const key = process.env.ANTHROPIC_API_KEY?.trim()
  if (!key) throw new Error("ANTHROPIC_API_KEY not set")
  anthropic = new Anthropic({ apiKey: key })
  return anthropic
}

async function translateBatch(texts) {
  if (texts.length === 0) return []
  const client = getAnthropic()
  const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join("\n")
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content:
          "Translate each numbered Korean chair-review snippet into natural, concise English. " +
          "Keep brand/product names. Return ONLY a JSON array of strings in the same order, no commentary.\n\n" +
          numbered,
      },
    ],
  })
  const text = msg.content.map((c) => (c.type === "text" ? c.text : "")).join("")
  const start = text.indexOf("[")
  const end = text.lastIndexOf("]")
  if (start === -1 || end === -1) throw new Error("Translation parse failed")
  const arr = JSON.parse(text.slice(start, end + 1))
  if (!Array.isArray(arr) || arr.length !== texts.length) {
    throw new Error(`Translation count mismatch: got ${arr.length} of ${texts.length}`)
  }
  return arr.map((x) => String(x))
}

async function buildTranslationMap(uniqueSet, { sampleOnly = false } = {}) {
  const all = [...uniqueSet].filter(Boolean)
  const map = new Map()
  const list = sampleOnly ? all.slice(0, 2) : all
  const BATCH = 25
  for (let i = 0; i < list.length; i += BATCH) {
    const chunk = list.slice(i, i + BATCH)
    const out = await translateBatch(chunk)
    chunk.forEach((ko, j) => map.set(ko, out[j]))
    if (!sampleOnly) console.log(`  translated ${Math.min(i + BATCH, list.length)}/${list.length}`)
  }
  return map
}

/* --------------------------- main --------------------------- */
async function main() {
  if (!existsSync(FILE)) {
    console.error(`\n✗ Excel not found: ${FILE}`)
    console.error("  Place the workbook at furniblog/data/체어파크_통합_체험후기_데이터.xlsx and retry.\n")
    process.exit(1)
  }

  const wb = xlsx.readFile(FILE)
  const ws = wb.Sheets[SHEET] || wb.Sheets[wb.SheetNames[0]]
  if (!ws) {
    console.error(`✗ Sheet "${SHEET}" not found. Sheets: ${wb.SheetNames.join(", ")}`)
    process.exit(1)
  }
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: "" })
  const headers = rows[0].map((h) => String(h ?? "").trim())
  const dataRows = rows.slice(1).filter((r) => r.some((c) => String(c ?? "").trim()))

  const cols = detectColumns(headers)

  console.log("\n=== Detected column mapping ===")
  for (const field of RESOLVE_ORDER) {
    const idx = cols[field]
    console.log(`  ${field.padEnd(18)} -> ${idx != null ? `[${idx}] "${headers[idx]}"` : "(none)"}`)
  }
  console.log(`\nTotal data rows: ${dataRows.length}`)

  // products index
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("track", "chair")
  if (prodErr) {
    console.error("✗ products query failed:", prodErr.message)
    process.exit(1)
  }
  const productIndex = {
    all: products,
    byName: new Map(products.map((p) => [p.name.toLowerCase(), p])),
  }

  const cell = (r, field) => (cols[field] != null ? r[cols[field]] : "")

  // chair matching table
  const chairMap = new Map() // ko -> {en, productId, count}
  for (const r of dataRows) {
    for (const f of ["rank1", "rank2", "rank3"]) {
      const ko = String(cell(r, f) ?? "").trim()
      if (!ko) continue
      if (!chairMap.has(ko)) {
        const res = canonicalizeChair(ko, productIndex)
        chairMap.set(ko, { en: res.en, productId: res.productId, count: 0 })
      }
      chairMap.get(ko).count++
    }
  }

  console.log("\n=== Chair matching table (한글 → English → product_id) ===")
  const sorted = [...chairMap.entries()].sort((a, b) => b[1].count - a[1].count)
  for (const [ko, info] of sorted) {
    const flag = info.productId ? "OK " : info.en ? "EN?" : "✗  "
    console.log(
      `  ${flag} (${String(info.count).padStart(3)}) ${ko}  →  ${info.en ?? "—"}  →  ${info.productId ?? "null"}`
    )
  }
  const unmatched = sorted.filter(([, i]) => !i.productId)
  console.log(`\nUnmatched chairs (no product_id): ${unmatched.length} of ${chairMap.size}`)
  if (unmatched.length) {
    console.log("  → add these to EXPLICIT_RULES / MANUAL_ALIASES:")
    for (const [ko] of unmatched) console.log(`     "${ko}"`)
  }

  // sample rows
  function mapRow(r) {
    const c1 = canonicalizeChair(cell(r, "rank1"), productIndex)
    const c2 = canonicalizeChair(cell(r, "rank2"), productIndex)
    const c3 = canonicalizeChair(cell(r, "rank3"), productIndex)
    return {
      gender: normGender(cell(r, "gender")),
      height: normHeight(cell(r, "height")),
      weight_or_body: cleanText(cell(r, "weight_or_body"), 40),
      age_group: normAge(cell(r, "age_group")),
      job_ko: cleanText(cell(r, "job"), 60),
      main_purpose: cleanText(cell(r, "main_purpose"), 60),
      sitting_hours: cleanText(cell(r, "sitting_hours"), 40),
      previous_chair_ko: cleanText(cell(r, "previous_chair"), 200),
      pain_areas_ko: splitArray(cell(r, "pain_areas")),
      standing_desk: normStanding(cell(r, "standing_desk")),
      rank1_chair: c1.en ?? c1.ko,
      rank2_chair: c2.en ?? c2.ko,
      rank3_chair: c3.en ?? c3.ko,
      rank1_product_id: c1.productId,
      rank2_product_id: c2.productId,
      rank3_product_id: c3.productId,
      rating: normRating(cell(r, "rating")),
      review_text_ko: cleanText(cell(r, "review_text")),
      selection_reasons_ko: splitArray(cell(r, "selection_reasons")),
      purchase_reason: cleanText(cell(r, "purchase_reason"), 500),
      store_location: cleanText(cell(r, "store_location"), 40),
      comparing_chairs: cleanText(cell(r, "comparing_chairs"), 300),
      nickname: cleanText(cell(r, "nickname"), 60),
      phone: cleanText(cell(r, "phone"), 40),
    }
  }

  console.log("\n=== Sample mapped rows (first 5, pre-translation) ===")
  for (const r of dataRows.slice(0, 5)) {
    console.log(JSON.stringify(mapRow(r)))
  }

  // unique strings to translate
  const tReview = new Set()
  const tElems = new Set() // reasons + pain + job + previous chair (short)
  for (const r of dataRows) {
    const m = mapRow(r)
    if (m.review_text_ko) tReview.add(m.review_text_ko)
    if (m.job_ko) tElems.add(m.job_ko)
    if (m.previous_chair_ko) tElems.add(m.previous_chair_ko)
    for (const x of m.selection_reasons_ko) tElems.add(x)
    for (const x of m.pain_areas_ko) tElems.add(x)
  }

  if (DRY) {
    const reportPath = path.join(ROOT, "data", "_dry-run-report.json")
    writeFileSync(
      reportPath,
      JSON.stringify(
        {
          headers,
          columns: cols,
          totalRows: dataRows.length,
          chairProducts: products
            .map((p) => ({ id: p.id, name: p.name, slug: p.slug }))
            .sort((a, b) => a.name.localeCompare(b.name)),
          chairMatches: sorted.map(([ko, i]) => ({
            ko,
            en: i.en,
            productId: i.productId,
            count: i.count,
          })),
        },
        null,
        2
      ),
      "utf8"
    )
    console.log(`\nWrote UTF-8 report: ${reportPath}`)
    console.log(`\n=== DRY RUN ===`)
    console.log(`  unique review texts: ${tReview.size}, unique short elements: ${tElems.size}`)
    console.log("  Testing translation on up to 2 samples each…")
    try {
      const rv = await buildTranslationMap(tReview, { sampleOnly: true })
      const el = await buildTranslationMap(tElems, { sampleOnly: true })
      for (const [k, v] of rv) console.log(`    review: ${k}  →  ${v}`)
      for (const [k, v] of el) console.log(`    elem:   ${k}  →  ${v}`)
    } catch (e) {
      console.log(`  (translation test skipped: ${e.message})`)
    }
    console.log(`\n  Would INSERT ${dataRows.length} rows (source=import_614, status=pending). No DB writes made.`)
    return
  }

  // real run: translate everything
  console.log("\nTranslating review texts…")
  const reviewMap = await buildTranslationMap(tReview)
  console.log("Translating short elements…")
  const elemMap = await buildTranslationMap(tElems)

  const tr = (ko) => (ko ? elemMap.get(ko) ?? ko : null)
  const trArr = (arr) => arr.map((x) => elemMap.get(x) ?? x)

  const records = dataRows.map((r) => {
    const m = mapRow(r)
    return {
      source: "import_614",
      status: "pending",
      gender: m.gender,
      height: m.height,
      weight_or_body: m.weight_or_body,
      age_group: m.age_group,
      job: tr(m.job_ko),
      job_ko: m.job_ko,
      main_purpose: m.main_purpose,
      sitting_hours: m.sitting_hours,
      previous_chair: tr(m.previous_chair_ko),
      previous_chair_ko: m.previous_chair_ko,
      pain_areas: trArr(m.pain_areas_ko),
      pain_areas_ko: m.pain_areas_ko,
      standing_desk: m.standing_desk,
      rank1_chair: m.rank1_chair,
      rank2_chair: m.rank2_chair,
      rank3_chair: m.rank3_chair,
      rank1_product_id: m.rank1_product_id,
      rank2_product_id: m.rank2_product_id,
      rank3_product_id: m.rank3_product_id,
      rating: m.rating,
      review_text: m.review_text_ko ? reviewMap.get(m.review_text_ko) ?? m.review_text_ko : null,
      review_text_ko: m.review_text_ko,
      selection_reasons: trArr(m.selection_reasons_ko),
      selection_reasons_ko: m.selection_reasons_ko,
      purchase_reason: m.purchase_reason,
      store_location: m.store_location,
      comparing_chairs: m.comparing_chairs,
      nickname: m.nickname,
      phone: m.phone,
    }
  })

  console.log(`\nInserting ${records.length} rows…`)
  const CHUNK = 100
  let inserted = 0
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK)
    const { error } = await supabase.from("experience_reviews").insert(chunk)
    if (error) {
      console.error(`✗ insert failed at chunk ${i}:`, error.message)
      process.exit(1)
    }
    inserted += chunk.length
    console.log(`  inserted ${inserted}/${records.length}`)
  }
  console.log(`\n✓ Done. Inserted ${inserted} rows (status=pending). Review them in /admin/experience.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

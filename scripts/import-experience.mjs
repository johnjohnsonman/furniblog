/**
 * Import the unified store experience workbook into the normalized
 * review_sessions (1 row/respondent) + review_rankings (1 row/ranked chair).
 *
 *   node scripts/import-experience.mjs --dry-run   # no DB writes, prints plan
 *   node scripts/import-experience.mjs             # translate + insert
 *
 * Requires .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * ANTHROPIC_API_KEY. Run migrations 016 + 021 + 023 first (023 adds
 * source='import_614' + _ko/previous_chair columns).
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
// review_sessions CHECK encodings (016): sex male/female, sit_hours under2/2to6/over6.
// height_band / age_band CHECKs were dropped (021); we still use the 016 vocab.
function normSex(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  if (/남|male/i.test(s)) return "male"
  if (/여|female/i.test(s)) return "female"
  return null
}
function normHeightBand(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10)
  if (Number.isFinite(num) && num >= 120 && num <= 220) {
    if (num <= 160) return "~160"
    if (num <= 169) return "160s"
    if (num <= 179) return "170s"
    if (num <= 184) return "180s"
    return "185+"
  }
  if (["~160", "160s", "170s", "180s", "185+"].includes(s)) return s
  return null
}
function normAgeBand(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  const num = parseInt(s.replace(/[^0-9]/g, ""), 10)
  if (Number.isFinite(num)) {
    if (num >= 50) return "50s+"
    if (num >= 40) return "40s"
    if (num >= 30) return "30s"
    if (num >= 20) return "20s"
    if (num >= 10) return "10s"
  }
  if (["10s", "20s", "30s", "40s", "50s+"].includes(s)) return s
  return null
}
function normSitHours(v) {
  const s = String(v ?? "").trim()
  if (!s) return null
  const nums = (s.match(/\d+/g) || []).map(Number)
  if (nums.length === 0) return null
  const maxN = Math.max(...nums)
  const openEnded = /이상|초과|over|\+/.test(s)
  if (maxN < 2) return "under2"
  if (maxN === 2 && !openEnded) return "under2"
  if (openEnded && maxN >= 6) return "over6"
  if (maxN > 6) return "over6"
  return "2to6"
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

  // Excel columns with no review_sessions home — intentionally dropped.
  const DROPPED = ["weight_or_body", "purchase_reason", "nickname", "store_location"]
  const droppedPresent = DROPPED.filter((f) => cols[f] != null)

  // one respondent -> one review_sessions row (Korean originals + English text)
  function mapSession(r) {
    const mainPurpose = cleanText(cell(r, "main_purpose"), 80)
    return {
      sex: normSex(cell(r, "gender")),
      height_band: normHeightBand(cell(r, "height")),
      body: null, // no reliable below/normal/above source in the workbook
      age_band: normAgeBand(cell(r, "age_group")),
      sit_hours: normSitHours(cell(r, "sitting_hours")),
      job_ko: cleanText(cell(r, "job"), 80),
      uses_ko: mainPurpose ? [mainPurpose] : [], // stored as-is (not translated)
      pain_ko: splitArray(cell(r, "pain_areas")),
      reasons_ko: splitArray(cell(r, "selection_reasons")),
      comment_ko: cleanText(cell(r, "review_text")),
      previous_chair_ko: cleanText(cell(r, "previous_chair"), 200),
      contact: cleanText(cell(r, "phone"), 40),
    }
  }

  // one respondent -> up to 3 review_rankings rows (matched chairs only, deduped)
  function mapRankings(r) {
    const out = []
    const seen = new Set()
    for (const [f, rank] of [["rank1", 1], ["rank2", 2], ["rank3", 3]]) {
      const c = canonicalizeChair(cell(r, f), productIndex)
      if (!c.productId || seen.has(c.productId)) continue
      seen.add(c.productId)
      out.push({ rank, chair_id: c.productId, chair_ko: c.ko, chair_en: c.en })
    }
    return out
  }

  let rankingsTotal = 0
  for (const r of dataRows) rankingsTotal += mapRankings(r).length

  console.log("\n=== Sample review_sessions rows (first 5, pre-translation) ===")
  for (const r of dataRows.slice(0, 5)) console.log(JSON.stringify(mapSession(r)))
  console.log("\n=== Sample review_rankings (first 5 respondents) ===")
  dataRows.slice(0, 5).forEach((r, i) => {
    console.log(`  #${i + 1}: ` + mapRankings(r).map((x) => `[${x.rank}] ${x.chair_en} (${x.chair_id})`).join("  |  "))
  })

  // unique strings to translate (comment + short text elements)
  const tReview = new Set()
  const tElems = new Set()
  for (const r of dataRows) {
    const m = mapSession(r)
    if (m.comment_ko) tReview.add(m.comment_ko)
    if (m.job_ko) tElems.add(m.job_ko)
    if (m.previous_chair_ko) tElems.add(m.previous_chair_ko)
    for (const x of m.reasons_ko) tElems.add(x)
    for (const x of m.pain_ko) tElems.add(x)
  }

  if (DRY) {
    const reportPath = path.join(ROOT, "data", "_dry-run-report.json")
    writeFileSync(
      reportPath,
      JSON.stringify(
        {
          headers,
          columns: cols,
          droppedColumns: droppedPresent,
          totalSessions: dataRows.length,
          totalRankings: rankingsTotal,
          chairProducts: products
            .map((p) => ({ id: p.id, name: p.name, slug: p.slug }))
            .sort((a, b) => a.name.localeCompare(b.name)),
          chairMatches: sorted.map(([ko, i]) => ({
            ko,
            en: i.en,
            productId: i.productId,
            count: i.count,
          })),
          sessionSample: dataRows.slice(0, 5).map(mapSession),
          rankingsSample: dataRows.slice(0, 5).map(mapRankings),
        },
        null,
        2
      ),
      "utf8"
    )
    console.log(`\nWrote UTF-8 report: ${reportPath}`)
    console.log(`\n=== DRY RUN ===`)
    if (droppedPresent.length)
      console.log(`  Dropped (no review_sessions column): ${droppedPresent.join(", ")}`)
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
    console.log(
      `\n  Would INSERT ${dataRows.length} review_sessions + ${rankingsTotal} review_rankings ` +
        `(source=import_614, status=pending). No DB writes made.`
    )
    return
  }

  // real run: translate everything
  console.log("\nTranslating review comments…")
  const reviewMap = await buildTranslationMap(tReview)
  console.log("Translating short elements…")
  const elemMap = await buildTranslationMap(tElems)

  const tr = (ko) => (ko ? elemMap.get(ko) ?? ko : null)
  const trArr = (arr) => arr.map((x) => elemMap.get(x) ?? x)

  const buildSession = (r) => {
    const m = mapSession(r)
    return {
      source: "import_614",
      status: "pending",
      sex: m.sex,
      height_band: m.height_band,
      body: m.body,
      age_band: m.age_band,
      sit_hours: m.sit_hours,
      job: tr(m.job_ko),
      job_ko: m.job_ko,
      uses: m.uses_ko,
      pain: trArr(m.pain_ko),
      pain_ko: m.pain_ko,
      reasons: trArr(m.reasons_ko),
      reasons_ko: m.reasons_ko,
      comment: m.comment_ko ? reviewMap.get(m.comment_ko) ?? m.comment_ko : null,
      comment_ko: m.comment_ko,
      previous_chair: tr(m.previous_chair_ko),
      previous_chair_ko: m.previous_chair_ko,
      purchased: null,
      contact: m.contact,
    }
  }

  console.log(`\nInserting ${dataRows.length} review_sessions + rankings…`)
  const CHUNK = 100
  let insertedS = 0
  let insertedR = 0
  for (let i = 0; i < dataRows.length; i += CHUNK) {
    const slice = dataRows.slice(i, i + CHUNK)
    const sessionRows = slice.map(buildSession)
    const { data: ins, error } = await supabase
      .from("review_sessions")
      .insert(sessionRows)
      .select("id")
    if (error) {
      console.error(`✗ review_sessions insert failed at row ${i}:`, error.message)
      process.exit(1)
    }
    if (!ins || ins.length !== slice.length) {
      console.error(`✗ returned id count ${ins?.length} != ${slice.length} (order unsafe). Aborting.`)
      process.exit(1)
    }
    const rankingRows = []
    slice.forEach((r, j) => {
      const sid = ins[j].id
      for (const rk of mapRankings(r)) {
        rankingRows.push({ session_id: sid, chair_id: rk.chair_id, rank: rk.rank })
      }
    })
    if (rankingRows.length) {
      const { error: rErr } = await supabase.from("review_rankings").insert(rankingRows)
      if (rErr) {
        console.error(`✗ review_rankings insert failed near row ${i}:`, rErr.message)
        process.exit(1)
      }
      insertedR += rankingRows.length
    }
    insertedS += slice.length
    console.log(`  sessions ${insertedS}/${dataRows.length}, rankings ${insertedR}`)
  }
  console.log(
    `\n✓ Done. Inserted ${insertedS} review_sessions + ${insertedR} review_rankings ` +
      `(status=pending). Approve them in the admin review queue.`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

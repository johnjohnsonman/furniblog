/**
 * Backfill reviews for thin products — the ones the cron rotation hasn't been
 * able to reach.
 *
 * Why this exists: the cron rotates over ALL published chairs (least-recently-
 * attempted first) inside a ~105s review budget, so a chair gets retried only
 * once every 1-3 weeks. Chairs that keep yielding 0 reviews therefore stay thin
 * for a long time, and thin pages are the main reason Google refuses to index
 * them. Running locally has no Vercel 300s ceiling, so we can work the whole
 * backlog in one pass.
 *
 * This calls the exact same pipeline the cron does (executeServerPipeline), so
 * results, dedup and `pipeline_runs` bookkeeping are identical — it just picks
 * targets by "fewest reviews" instead of "least recently attempted".
 *
 * Usage:
 *   npm run backfill:reviews                          # dry-run: list targets
 *   npm run backfill:reviews -- --apply               # collect for all targets
 *   npm run backfill:reviews -- --apply --limit 10    # first 10 only
 *   npm run backfill:reviews -- --min-reviews 3       # target <3 reviews, not just 0
 *   npm run backfill:reviews -- --apply --concurrency 1
 *   npm run backfill:reviews -- --apply --max-per-source 3
 *
 * Dry-run is the default and writes nothing.
 */

import { config } from "dotenv"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"
import { executeServerPipeline } from "@/lib/pipeline/server-run"

config({ path: resolve(__dirname, "../.env.local") })

/**
 * Keep in sync with REVIEW_SERVER_SOURCES in lib/cron/run.ts. Duplicated rather
 * than imported because lib/cron/run.ts also pulls in the news/video collectors,
 * which we don't want to load in a CLI process.
 */
const REVIEW_SERVER_SOURCES = [
  "reddit",
  "youtube",
  "naver",
  "dcinside",
  "trustpilot",
  "review_sites",
  "hackernews",
  "kakaku",
]

/** One chair can hang on a slow source chain; don't let it stall the batch. */
const CHAIR_TIMEOUT_MS = 240_000
const PAGE_SIZE = 1000

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Product = {
  id: string
  slug: string
  name: string
  category: string | null
}

type Target = Product & { reviewCount: number }

type Outcome = {
  target: Target
  saved: number
  collected: number
  error?: string
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}

function num(name: string, fallback: number): number {
  const raw = arg(name)
  const parsed = Number(raw)
  return raw !== undefined && Number.isFinite(parsed) ? parsed : fallback
}

function withTimeout<T>(promise: Promise<T>, ms: number, name: string): Promise<T> {
  return new Promise((res, rej) => {
    const timer = setTimeout(() => rej(new Error(`${name} timed out after ${ms}ms`)), ms)
    promise.then(
      (v) => {
        clearTimeout(timer)
        res(v)
      },
      (e) => {
        clearTimeout(timer)
        rej(e)
      }
    )
  })
}

/** All published chairs. */
async function loadProducts(): Promise<Product[]> {
  const out: Product[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await sb
      .from("products")
      .select("id, slug, name, category")
      .eq("published", true)
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`products: ${error.message}`)
    const rows = (data ?? []) as Product[]
    out.push(...rows)
    if (rows.length < PAGE_SIZE) return out
  }
}

/** product_id -> review count. Paginated: the table is well past 1000 rows. */
async function loadReviewCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await sb
      .from("reviews")
      .select("product_id")
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(`reviews: ${error.message}`)
    const rows = (data ?? []) as { product_id: string | null }[]
    for (const row of rows) {
      if (!row.product_id) continue
      counts.set(row.product_id, (counts.get(row.product_id) ?? 0) + 1)
    }
    if (rows.length < PAGE_SIZE) return counts
  }
}

async function collectFor(target: Target, maxPerSource: number): Promise<Outcome> {
  try {
    const r = await withTimeout(
      executeServerPipeline({
        productId: target.id,
        productSlug: target.slug,
        productName: target.name,
        sources: REVIEW_SERVER_SOURCES,
        allSources: REVIEW_SERVER_SOURCES,
        maxPerSource,
      }),
      CHAIR_TIMEOUT_MS,
      target.slug
    )
    return { target, saved: r.saved, collected: r.collected }
  } catch (e) {
    return { target, saved: 0, collected: 0, error: (e as Error).message }
  }
}

/** Run `workers` chairs at a time, pulling from a shared queue. */
async function runPool(
  targets: Target[],
  workers: number,
  maxPerSource: number,
  onDone: (o: Outcome, index: number) => void
): Promise<Outcome[]> {
  const results: Outcome[] = new Array(targets.length)
  let cursor = 0
  async function worker() {
    while (true) {
      const i = cursor++
      if (i >= targets.length) return
      const outcome = await collectFor(targets[i], maxPerSource)
      results[i] = outcome
      onDone(outcome, i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(workers, targets.length) }, worker))
  return results
}

function summarize(results: Outcome[], elapsedMs: number) {
  const done = results.filter(Boolean)
  const saved = done.reduce((s, r) => s + r.saved, 0)
  const helped = done.filter((r) => r.saved > 0)
  const empty = done.filter((r) => r.saved === 0 && !r.error)
  const failed = done.filter((r) => r.error)

  console.log(`\n${"=".repeat(64)}`)
  console.log(`처리 ${done.length}개 · 저장된 리뷰 ${saved}건 · ${Math.round(elapsedMs / 1000)}초`)
  console.log(`  리뷰 확보 ${helped.length} / 수집 0건 ${empty.length} / 실패 ${failed.length}`)

  if (helped.length) {
    console.log(`\n리뷰가 붙은 의자:`)
    for (const r of helped.sort((a, b) => b.saved - a.saved)) {
      console.log(`  +${String(r.saved).padStart(3)}  ${r.target.name}`)
    }
  }
  if (empty.length) {
    console.log(`\n수집 0건 — 웹에 리뷰가 사실상 없는 의자 (카탈로그 정리 후보):`)
    for (const r of empty) console.log(`   ·  ${r.target.name}  [${r.target.slug}]`)
    console.log(`  → 반복해도 0건이면 노출을 줄이거나(published=false) 카탈로그에서 빼는 걸 검토하세요.`)
  }
  if (failed.length) {
    console.log(`\n실패:`)
    for (const r of failed) console.log(`   ·  ${r.target.slug}: ${r.error}`)
  }
}

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env vars (.env.local)")
    process.exit(1)
  }

  const apply = process.argv.includes("--apply")
  const minReviews = num("min-reviews", 1)
  const limit = num("limit", Number.POSITIVE_INFINITY)
  const concurrency = Math.max(1, num("concurrency", 2))
  const maxPerSource = num("max-per-source", 5)

  const [products, counts] = await Promise.all([loadProducts(), loadReviewCounts()])

  const targets: Target[] = products
    .map((p) => ({ ...p, reviewCount: counts.get(p.id) ?? 0 }))
    .filter((p) => p.reviewCount < minReviews)
    .sort((a, b) => a.reviewCount - b.reviewCount || a.name.localeCompare(b.name))
    .slice(0, limit === Number.POSITIVE_INFINITY ? undefined : limit)

  console.log(`제품 ${products.length}개 중 리뷰 ${minReviews}건 미만 = ${targets.length}개`)

  if (!targets.length) {
    console.log("보강할 대상이 없습니다.")
    return
  }

  for (const t of targets) {
    console.log(`  [${String(t.reviewCount).padStart(2)}]  ${t.name}  (${t.category ?? "-"})`)
  }

  if (!apply) {
    console.log(
      `\nDRY-RUN — 아무것도 쓰지 않았습니다. 실제 수집: npm run backfill:reviews -- --apply`
    )
    console.log(
      `소스 ${REVIEW_SERVER_SOURCES.length}개 × 최대 ${maxPerSource}건 = 의자당 최대 ${
        REVIEW_SERVER_SOURCES.length * maxPerSource
      }건 처리(Claude 호출 발생, API 과금).`
    )
    return
  }

  console.log(`\n수집 시작 — 동시 ${concurrency}개, 소스당 최대 ${maxPerSource}건\n`)
  const startedAt = Date.now()
  let finished = 0

  const results = await runPool(targets, concurrency, maxPerSource, (o) => {
    finished += 1
    const tag = o.error ? `실패 (${o.error})` : `수집 ${o.collected} → 저장 ${o.saved}`
    console.log(`[${finished}/${targets.length}] ${o.target.name} — ${tag}`)
  })

  summarize(results, Date.now() - startedAt)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

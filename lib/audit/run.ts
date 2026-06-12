import type { SupabaseClient } from "@supabase/supabase-js"
import { auditReviewMatch } from "@/lib/audit/review-match"
import { checkVideoRelevance } from "@/lib/videos/relevance"
import { checkNewsRelevance } from "@/lib/news/relevance"
import { loadKnownBrands } from "@/lib/news/collect"

export type AuditType = "reviews" | "videos" | "news"

export type AuditRunResult = {
  type: AuditType
  processed: number
  remaining: number
  done: boolean
}

/** Stop a single batch once this much wall-clock has elapsed (stay under function limits). */
const TIME_BUDGET_MS = 45_000

type BrandRel = { name?: string | null } | Array<{ name?: string | null }> | null
type ProductRel =
  | { name?: string | null; brands?: BrandRel }
  | Array<{ name?: string | null; brands?: BrandRel }>
  | null

function one<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null
  return Array.isArray(rel) ? (rel[0] ?? null) : rel
}

function productNameAndBrand(rel: ProductRel): {
  name: string | null
  brand: string | null
} {
  const product = one(rel)
  const name = product?.name?.trim() || null
  const brand = one(product?.brands)?.name?.trim() || null
  return { name, brand }
}

async function countRemaining(
  supabase: SupabaseClient,
  table: AuditType
): Promise<number> {
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .is("audited_at", null)
  return count ?? 0
}

async function writeAudit(
  supabase: SupabaseClient,
  table: AuditType,
  id: string,
  score: number,
  reason: string
): Promise<void> {
  await supabase
    .from(table)
    .update({
      audit_score: score,
      audit_reason: reason.slice(0, 500),
      audited_at: new Date().toISOString(),
    })
    .eq("id", id)
}

/**
 * Re-audit a batch of not-yet-audited rows for one content type.
 * Writes audit_score/audit_reason/audited_at on each row. Time-budgeted so the
 * caller can loop (run → run → …) until `done`.
 */
export async function auditBatch(params: {
  supabase: SupabaseClient
  type: AuditType
  limit: number
}): Promise<AuditRunResult> {
  const { supabase, type } = params
  const limit = Math.max(1, Math.min(params.limit, 100))
  const startedAt = Date.now()
  let processed = 0

  if (type === "reviews") {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, summary_ko, pros, cons, products(name, brands(name))")
      .is("audited_at", null)
      .limit(limit)
    if (error) throw new Error(error.message)

    for (const row of data ?? []) {
      const { name, brand } = productNameAndBrand(row.products as ProductRel)
      if (!name) {
        // No linked product — can't match; flag as orphan.
        await writeAudit(supabase, "reviews", row.id, 0, "no linked product")
        processed += 1
        continue
      }
      const result = await auditReviewMatch({
        summary: typeof row.summary_ko === "string" ? row.summary_ko : "",
        pros: Array.isArray(row.pros) ? (row.pros as string[]) : [],
        cons: Array.isArray(row.cons) ? (row.cons as string[]) : [],
        productName: name,
        brandName: brand,
      })
      if (result.score >= 0) {
        await writeAudit(supabase, "reviews", row.id, result.score, result.reason)
        processed += 1
      }
      if (Date.now() - startedAt > TIME_BUDGET_MS) break
    }
  } else if (type === "videos") {
    const { data, error } = await supabase
      .from("videos")
      .select("id, title, description, brand, products(name)")
      .is("audited_at", null)
      .limit(limit)
    if (error) throw new Error(error.message)

    for (const row of data ?? []) {
      const { name } = productNameAndBrand(row.products as ProductRel)
      if (!name) {
        await writeAudit(supabase, "videos", row.id, 0, "no linked product")
        processed += 1
        continue
      }
      const result = await checkVideoRelevance({
        title: typeof row.title === "string" ? row.title : "",
        description: typeof row.description === "string" ? row.description : "",
        chairName: name,
        brandName: typeof row.brand === "string" ? row.brand : null,
      })
      await writeAudit(supabase, "videos", row.id, result.confidence, result.reason)
      processed += 1
      if (Date.now() - startedAt > TIME_BUDGET_MS) break
    }
  } else {
    // news
    const knownBrands = await loadKnownBrands(supabase)
    const { data, error } = await supabase
      .from("news")
      .select("id, title, summary, brand")
      .is("audited_at", null)
      .limit(limit)
    if (error) throw new Error(error.message)

    for (const row of data ?? []) {
      const brand = typeof row.brand === "string" ? row.brand : ""
      const result = await checkNewsRelevance({
        title: typeof row.title === "string" ? row.title : "",
        description: typeof row.summary === "string" ? row.summary : "",
        candidateBrand: brand,
        knownBrands,
      })
      await writeAudit(supabase, "news", row.id, result.confidence, result.reason)
      processed += 1
      if (Date.now() - startedAt > TIME_BUDGET_MS) break
    }
  }

  const remaining = await countRemaining(supabase, type)
  return { type, processed, remaining, done: remaining === 0 }
}

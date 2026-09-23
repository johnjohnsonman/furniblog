import { createPublicServerClient } from "@/lib/supabase/public-server"
import { isSupabaseConfigured, resolveProductUuid } from "@/lib/supabase/queries"

export type ProductFitEvidence = {
  fieldKey: string
  evidenceType: string
  sourceTitle: string
  sourceUrl: string
  checkedOn: string
  notes: string
}

export type ProductFitTrustSummary = {
  verifiedConfigurations: number
  markets: string[]
  lastCheckedOn: string | null
}

const SPEC_KEYS_BY_EVIDENCE: Record<string, string[]> = {
  recommended_height: ["recommendedHeightMin", "recommendedHeightMax"],
  seat_height: ["seatHeightMin", "seatHeightMax"],
  seat_depth: ["seatDepth", "seatDepthMin", "seatDepthMax"],
  seat_width: ["seatWidth"],
  weight_capacity: ["weightCapacityKg"],
  armrest_floor_height: ["armrestFloorHeightMin", "armrestFloorHeightMax"],
}

/** Keep only measurements that have field-level provenance. */
export function filterChairSpecsByEvidence<T extends Record<string, unknown>>(
  specs: T | null | undefined,
  evidenceFields: ReadonlySet<string>
): Partial<T> | undefined {
  if (!specs || evidenceFields.size === 0) return undefined
  const allowed = new Set(
    [...evidenceFields].flatMap((field) => SPEC_KEYS_BY_EVIDENCE[field] ?? [])
  )
  const filtered = Object.fromEntries(
    Object.entries(specs).filter(
      ([key, value]) => allowed.has(key) && typeof value === "number" && Number.isFinite(value)
    )
  ) as Partial<T>
  return Object.keys(filtered).length ? filtered : undefined
}

/** Evidence fields for the whole published chair catalog, keyed by slug. */
export async function getAllProductFitEvidenceFields(): Promise<Map<string, Set<string>>> {
  if (!isSupabaseConfigured()) return new Map()
  const supabase = createPublicServerClient()
  const [productsResult, evidenceResult] = await Promise.all([
    supabase.from("products").select("id,slug").eq("published", true).eq("track", "chair").limit(2000),
    supabase.from("product_fit_evidence").select("product_id,field_key").limit(10000),
  ])
  if (productsResult.error || evidenceResult.error) return new Map()
  const slugById = new Map((productsResult.data ?? []).map((row) => [row.id as string, row.slug as string]))
  const result = new Map<string, Set<string>>()
  for (const row of evidenceResult.data ?? []) {
    const slug = slugById.get(row.product_id as string)
    if (!slug) continue
    const fields = result.get(slug) ?? new Set<string>()
    fields.add(row.field_key as string)
    result.set(slug, fields)
  }
  return result
}

export async function getProductFitEvidence(slug: string): Promise<ProductFitEvidence[]> {
  const productId = await resolveProductUuid(slug)
  if (!productId) return []
  const { data, error } = await createPublicServerClient().from("product_fit_evidence")
    .select("field_key,evidence_type,source_title,source_url,checked_on,notes")
    .eq("product_id", productId)
    .order("checked_on", { ascending: false })
  if (error) return []
  return (data ?? []).map(row => ({ fieldKey: row.field_key, evidenceType: row.evidence_type, sourceTitle: row.source_title, sourceUrl: row.source_url, checkedOn: row.checked_on, notes: row.notes }))
}

export async function getProductFitTrustSummary(slug: string): Promise<ProductFitTrustSummary> {
  const productId = await resolveProductUuid(slug)
  if (!productId) return { verifiedConfigurations: 0, markets: [], lastCheckedOn: null }
  const { data, error } = await createPublicServerClient().from("product_fit_configurations")
    .select("market_code,checked_on")
    .eq("product_id", productId)
    .eq("status", "verified")
    .order("checked_on", { ascending: false })
    .limit(100)
  if (error) return { verifiedConfigurations: 0, markets: [], lastCheckedOn: null }
  return {
    verifiedConfigurations: data?.length ?? 0,
    markets: [...new Set((data ?? []).map(row => row.market_code as string))].sort(),
    lastCheckedOn: (data?.[0]?.checked_on as string | undefined) ?? null,
  }
}

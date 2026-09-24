import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

type ProductRow = {
  id: string
  slug: string
  name: string
  thumbnail_url: string | null
  description_en: string | null
  best_for: string | null
  pros: string[] | null
  cons: string[] | null
  chair_specs: Record<string, unknown> | null
  brands: { name?: string } | { name?: string }[] | null
}

type QualityRow = ProductRow & {
  brand: string
  affiliate: boolean
  video: boolean
  evidence: number
  configurations: number
  editorial: boolean
  repeatedSpecs: number
  quarantinedFields: string[]
  archivedDuplicateCount: number
  score: number
  reviewLane: string
}

function specSignature(value: Record<string, unknown> | null) {
  if (!value || Object.keys(value).length === 0) return ""
  return JSON.stringify(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
}

function brandName(value: ProductRow["brands"]) {
  if (Array.isArray(value)) return value[0]?.name ?? "—"
  return value?.name ?? "—"
}

async function loadCatalogQuality() {
  const supabase = createAdminClient()
  const [productsResult, linksResult, videosResult, evidenceResult, configurationsResult, quarantineResult] = await Promise.all([
    supabase.from("products").select("id,slug,name,thumbnail_url,description_en,best_for,pros,cons,chair_specs,brands(name)").eq("published", true).eq("track", "chair").order("name").limit(2000),
    supabase.from("affiliate_links").select("product_id").eq("is_active", true).limit(10000),
    supabase.from("videos").select("product_id").eq("status", "published").limit(10000),
    supabase.from("product_fit_evidence").select("product_id,field_key").limit(10000),
    supabase.from("product_fit_configurations").select("product_id").eq("status", "verified").limit(10000),
    supabase.from("product_fit_spec_quarantine").select("product_id,duplicate_count,quarantined_keys").eq("batch_key", "duplicate-fit-specs-2026-09-22").limit(10000),
  ])
  if (productsResult.error) throw new Error(productsResult.error.message)

  const products = (productsResult.data ?? []) as ProductRow[]
  const affiliateIds = new Set((linksResult.data ?? []).map((row) => row.product_id as string))
  const videoIds = new Set((videosResult.data ?? []).map((row) => row.product_id as string))
  const evidenceCounts = new Map<string, Set<string>>()
  for (const row of evidenceResult.data ?? []) {
    const set = evidenceCounts.get(row.product_id as string) ?? new Set<string>()
    set.add(row.field_key as string)
    evidenceCounts.set(row.product_id as string, set)
  }
  const configurationCounts = new Map<string, number>()
  for (const row of configurationsResult.data ?? []) {
    const productId = row.product_id as string
    configurationCounts.set(productId, (configurationCounts.get(productId) ?? 0) + 1)
  }
  const signatureCounts = new Map<string, number>()
  for (const product of products) {
    const signature = specSignature(product.chair_specs)
    if (signature) signatureCounts.set(signature, (signatureCounts.get(signature) ?? 0) + 1)
  }
  const quarantine = new Map<string, { duplicateCount: number; keys: string[] }>()
  for (const row of quarantineResult.data ?? []) {
    quarantine.set(row.product_id as string, {
      duplicateCount: Number(row.duplicate_count) || 0,
      keys: Array.isArray(row.quarantined_keys) ? row.quarantined_keys as string[] : [],
    })
  }

  const rows: QualityRow[] = products.map((product) => {
    const editorial = Boolean(
      product.description_en?.trim() && product.best_for?.trim() && product.pros?.length && product.cons?.length
    )
    const affiliate = affiliateIds.has(product.id)
    const video = videoIds.has(product.id)
    const evidence = evidenceCounts.get(product.id)?.size ?? 0
    const configurations = configurationCounts.get(product.id) ?? 0
    const repeatedSpecs = signatureCounts.get(specSignature(product.chair_specs)) ?? 0
    const archived = quarantine.get(product.id)
    const quarantinedFields = archived?.keys ?? []
    const archivedDuplicateCount = archived?.duplicateCount ?? 0
    const score = [Boolean(product.thumbnail_url), editorial, affiliate, video, evidence > 0].filter(Boolean).length
    const reviewLane = configurations > 0 ? "Configuration verified" : quarantinedFields.length > 0 ? "Restore sourced fit data" : repeatedSpecs >= 3 ? "Review duplicated specs" : evidence === 0 ? "Backfill sources" : "Review configuration"
    return { ...product, brand: brandName(product.brands), affiliate, video, evidence, configurations, editorial, repeatedSpecs, quarantinedFields, archivedDuplicateCount, score, reviewLane }
  }).sort((a, b) => b.quarantinedFields.length - a.quarantinedFields.length || a.score - b.score || b.repeatedSpecs - a.repeatedSpecs || a.name.localeCompare(b.name))

  return { rows, queryErrors: [linksResult.error, videosResult.error, evidenceResult.error, configurationsResult.error, quarantineResult.error].filter(Boolean).map((error) => error!.message) }
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{ok ? label : `Missing ${label.toLowerCase()}`}</span>
}

const reviewLanes = ["Configuration verified", "Restore sourced fit data", "Review duplicated specs", "Backfill sources", "Review configuration"] as const

export default async function CatalogQualityPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { rows, queryErrors } = await loadCatalogQuality()
  const params = await searchParams
  const requestedLane = typeof params.lane === "string" ? params.lane : "all"
  const lane = requestedLane === "all" || reviewLanes.includes(requestedLane as typeof reviewLanes[number]) ? requestedLane : "all"
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase().slice(0, 100) : ""
  const visibleRows = rows.filter((row) =>
    (lane === "all" || row.reviewLane === lane) &&
    (!query || `${row.name} ${row.brand} ${row.slug}`.toLowerCase().includes(query))
  )
  const count = (test: (row: QualityRow) => boolean) => rows.filter(test).length
  const complete = count((row) => row.score === 5 && row.repeatedSpecs < 3 && row.quarantinedFields.length === 0)
  const quarantined = count((row) => row.quarantinedFields.length > 0)

  return <div className="space-y-7 p-6">
    <div>
      <h1 className="text-2xl font-semibold">Catalog quality</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Every published chair is evaluated with the same five checks. The lowest coverage products appear first so catalog work can be completed systematically.</p>
    </div>

    {queryErrors.length > 0 && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">Some quality signals could not be loaded: {queryErrors.join(" · ")}</div>}

    <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4" method="get">
      <label className="grid gap-1 text-sm"><span>Review lane</span><select name="lane" defaultValue={lane} className="min-h-11 rounded border bg-white px-3"><option value="all">All review lanes</option>{reviewLanes.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="grid min-w-64 flex-1 gap-1 text-sm"><span>Product, brand or slug</span><input name="q" defaultValue={query} className="min-h-11 rounded border px-3" placeholder="Search all 236 chairs" /></label>
      <button className="min-h-11 rounded bg-primary px-5 text-sm text-primary-foreground">Filter</button>
      <Link href="/admin/catalog-quality" className="py-3 text-sm underline">Reset</Link>
      <p className="w-full text-xs text-muted-foreground">Showing {visibleRows.length} of {rows.length} published chairs.</p>
    </form>

    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-9">
      {[
        ["Published", rows.length], ["Complete", complete], ["Images", count((r) => Boolean(r.thumbnail_url))],
        ["Editorial", count((r) => r.editorial)], ["Buy links", count((r) => r.affiliate)],
        ["Videos", count((r) => r.video)], ["Fit evidence", count((r) => r.evidence > 0)],
        ["Fit restoration", quarantined],
        ["Verified configs", rows.reduce((sum, row) => sum + row.configurations, 0)],
      ].map(([label, value]) => <div key={label} className="rounded-lg border bg-white p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}
    </div>
    <div className="rounded-lg border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Product</th><th className="px-3 py-3">Coverage</th><th className="px-3 py-3">Editorial</th><th className="px-3 py-3">Commerce</th><th className="px-3 py-3">Evidence</th><th className="px-3 py-3">Review lane</th><th className="px-3 py-3">Data risk</th><th className="px-3 py-3">Actions</th></tr></thead>
          <tbody>{visibleRows.map((row) => <tr key={row.id} className="border-t align-top">
            <td className="px-4 py-3"><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.brand} · {row.slug}</p></td>
            <td className="px-3 py-3 font-semibold">{row.score}/5</td>
            <td className="space-y-1 px-3 py-3"><Status ok={Boolean(row.thumbnail_url)} label="Image" /><br /><Status ok={row.editorial} label="Copy" /></td>
            <td className="space-y-1 px-3 py-3"><Status ok={row.affiliate} label="Buy link" /><br /><Status ok={row.video} label="Video" /></td>
            <td className="px-3 py-3"><span className={row.evidence ? "text-emerald-700" : "text-amber-800"}>{row.evidence} verified fields</span><br /><span className={row.configurations ? "text-blue-700" : "text-muted-foreground"}>{row.configurations} verified configurations</span></td>
            <td className="px-3 py-3 font-medium">{row.reviewLane}</td>
            <td className="px-3 py-3">{row.quarantinedFields.length > 0 ? <><span className="font-medium text-amber-800">{row.quarantinedFields.length} fields safely archived</span><br /><span className="text-xs text-muted-foreground">Former duplicate group: {row.archivedDuplicateCount} products</span></> : row.repeatedSpecs >= 3 ? <span className="font-medium text-red-700">Same raw specs on {row.repeatedSpecs} products</span> : <span className="text-muted-foreground">No duplicate cluster</span>}</td>
            <td className="whitespace-nowrap px-3 py-3"><Link className="underline" href={`/admin/products/${row.slug}/edit`}>Edit</Link><span className="mx-2 text-muted-foreground">·</span><Link className="underline" href={`/products/${row.slug}`} target="_blank">View</Link></td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>
}

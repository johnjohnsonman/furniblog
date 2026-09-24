import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Fit configuration review", robots: { index: false, follow: false } }

const fields = [
  ["Seat height min", "seat_height_min", "seatHeightMin"],
  ["Seat height max", "seat_height_max", "seatHeightMax"],
  ["Seat depth min", "seat_depth_min", "seatDepthMin"],
  ["Seat depth max", "seat_depth_max", "seatDepthMax"],
  ["Fixed seat depth", "seat_depth_fixed", "seatDepth"],
  ["Seat width", "seat_width", "seatWidth"],
  ["Weight capacity (kg)", "weight_capacity", "weightCapacityKg"],
  ["Arm-to-floor min", "armrest_floor_height_min", "armrestFloorHeightMin"],
  ["Arm-to-floor max", "armrest_floor_height_max", "armrestFloorHeightMax"],
] as const
type Product = { name: string; slug: string; chair_specs: Record<string, unknown> | null }
type Configuration = {
  id: string; label: string; market_code: string; configuration_key: string
  status: string; options: Record<string, string | boolean>; notes: string
  checked_on: string; source_title: string; source_url: string
  products: Product | Product[] | null
} & Record<(typeof fields)[number][1], number | null>
const display = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "Unknown"

export default async function FitConfigurationsPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Authenticate here as well as in the panel layout, before privileged data reads.
  if (!(await isAdminAuthenticated())) redirect("/admin/login")
  const params = await searchParams
  const status = typeof params.status === "string" && ["draft", "verified", "retired", "all"].includes(params.status) ? params.status : "draft"
  const market = typeof params.market === "string" && /^[A-Za-z]{2}$/.test(params.market) ? params.market.toUpperCase() : ""
  const requested = Number(params.page)
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 10000) : 1
  const size = 25
  let rows: Configuration[] = [], total = 0, unavailable = false
  try {
    let query = createAdminClient().from("product_fit_configurations")
      .select("*,products(name,slug,chair_specs)", { count: "exact" })
      .order("updated_at", { ascending: false }).order("id")
      .range((page - 1) * size, page * size - 1)
    if (status !== "all") query = query.eq("status", status)
    if (market) query = query.eq("market_code", market)
    const result = await query
    if (result.error) unavailable = true
    else { rows = (result.data ?? []) as unknown as Configuration[]; total = result.count ?? 0 }
  } catch { unavailable = true }
  const href = (next: number) => `/admin/fit-configurations?${new URLSearchParams({ status, market, page: String(next) })}`
  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
    <header>
      <p className="text-sm text-muted-foreground">Chairpedia / Evidence review</p>
      <h1 className="mt-2 font-serif text-3xl">Regional and option specifications</h1>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">Review each configuration independently. Drafts are private. These records are not yet used by the calculator; this screen does not publish or change specifications.</p>
    </header>
    <form className="flex flex-wrap items-end gap-4" method="get">
      <label className="grid gap-1 text-sm">Status<select name="status" defaultValue={status} className="min-h-11 rounded border bg-background px-3"><option value="draft">Draft</option><option value="verified">Verified</option><option value="retired">Retired</option><option value="all">All</option></select></label>
      <label className="grid gap-1 text-sm">Market (two-letter code)<input name="market" defaultValue={market} maxLength={2} pattern="[A-Za-z]{2}" placeholder="US" className="min-h-11 w-28 rounded border px-3" /></label>
      <button className="min-h-11 rounded bg-primary px-5 text-sm text-primary-foreground">Filter</button>
      <Link href="/admin/fit-configurations" className="py-3 text-sm underline">Reset</Link>
    </form>
    {unavailable ? <p role="alert" className="rounded border p-5">Configuration records could not be loaded. Check the database connection and migration 054, then reload this page.</p> : <>
      <p className="text-sm text-muted-foreground">{total} configurations matching filters · Page {page} · Dimensions in cm unless marked kg</p>
      {!rows.length && <p className="rounded border p-5">No configurations on this page. Change filters or return to the first page.</p>}
      {rows.map(row => {
        const product = Array.isArray(row.products) ? row.products[0] : row.products
        const baseline = product?.chair_specs ?? {}
        const sourceIsWeb = /^https?:\/\//i.test(row.source_url)
        return <article key={row.id} className="min-w-0 space-y-4 rounded-lg border p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><h2 className="break-words text-xl font-semibold">{product?.name ?? "Product unavailable"}</h2><p className="break-words text-sm">{row.label}</p><p className="mt-1 break-all font-mono text-xs text-muted-foreground">{product?.slug} / {row.market_code} / {row.configuration_key}</p></div>
            <span className="rounded border px-3 py-1 text-sm">{row.status}</span>
          </div>
          <dl className="flex flex-wrap gap-3 text-sm">{Object.entries(row.options ?? {}).map(([key, value]) => <div key={key} className="rounded bg-muted px-3 py-2"><dt className="text-xs text-muted-foreground">{key.replaceAll("_", " ")}</dt><dd>{typeof value === "boolean" ? value ? "Yes" : "No" : value}</dd></div>)}</dl>
          <div className="overflow-x-auto"><table className="w-full min-w-[360px] text-left text-sm"><caption className="mb-2 text-left text-xs text-muted-foreground">Existing product-wide values are shown for comparison, not as verified evidence.</caption><thead><tr className="border-b"><th className="py-2 pr-3">Measurement</th><th className="px-2">Product-wide</th><th className="px-2">This configuration</th></tr></thead><tbody>{fields.map(([label, key, oldKey]) => {
            const value = row[key] == null ? null : Number(row[key])
            const old = baseline[oldKey]
            const changed = typeof old === "number" && value !== null && old !== value
            return <tr key={key} className="border-b last:border-0"><th className="py-2 pr-3 font-normal">{label}</th><td className="px-2 tabular-nums">{display(old)}</td><td className="px-2 tabular-nums">{display(value)}{changed && <span className="ml-2 text-xs text-amber-700">Different</span>}</td></tr>
          })}</tbody></table></div>
          <div className="space-y-2 break-words text-sm"><p>{sourceIsWeb ? <a href={row.source_url} target="_blank" rel="noopener noreferrer" className="underline">{row.source_title}</a> : row.source_title}</p><p className="text-xs text-muted-foreground">Source checked {row.checked_on}. This is an access date, not a document revision date.</p><p className="whitespace-pre-wrap">{row.notes}</p></div>
        </article>
      })}
      <nav aria-label="Configuration pages" className="flex gap-5 text-sm">{page > 1 && <Link href={href(page - 1)} className="py-3 underline">Previous</Link>}{page * size < total && <Link href={href(page + 1)} className="py-3 underline">Next</Link>}{page > 1 && <Link href={href(1)} className="py-3 underline">First page</Link>}</nav>
    </>}
  </div>
}

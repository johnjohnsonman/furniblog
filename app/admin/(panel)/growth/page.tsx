import { createAdminClient } from "@/lib/supabase/admin"
import { isBlogPostGoogleSearchable, BLOG_DUPLICATE_LOSERS } from "@/lib/seo/search-visibility"

export const dynamic = "force-dynamic"

const DAYS = 30

type ClickRow = { product_id: string; retailer_name: string | null; referrer: string | null; clicked_at: string }
type ViewRow = { path: string | null; referrer: string | null }

function channelOf(referrer: string | null): string | null {
  const r = referrer ?? ""
  if (!r) return null
  if (/duckduckgo/.test(r)) return "DuckDuckGo"
  if (/bing|copilot/.test(r)) return "Bing"
  if (/google\./.test(r)) return "Google"
  if (/chatgpt|openai/.test(r)) return "ChatGPT"
  if (/claude\.ai/.test(r)) return "Claude"
  if (/perplexity/.test(r)) return "Perplexity"
  if (/kagi|yahoo|ecosia|brave|ixquick/.test(r)) return "Other search"
  return null
}

function pathOf(referrer: string | null): string {
  if (!referrer) return "(direct/unknown)"
  try {
    return new URL(referrer).pathname
  } catch {
    return "(direct/unknown)"
  }
}

async function loadData() {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - DAYS * 864e5).toISOString()

  const { data: clicks } = await supabase
    .from("affiliate_clicks")
    .select("product_id, retailer_name, referrer, clicked_at")
    .gte("clicked_at", since)
    .limit(5000)

  const views: ViewRow[] = []
  for (let offset = 0; offset < 20000; offset += 1000) {
    const { data } = await supabase
      .from("page_views")
      .select("path, referrer")
      .gte("created_at", since)
      .range(offset, offset + 999)
    if (!data?.length) break
    views.push(...data)
    if (data.length < 1000) break
  }

  const { data: products } = await supabase.from("products").select("id, slug, name").limit(500)
  const productName = new Map((products ?? []).map((p) => [p.id, p.name]))

  // ── Affiliate clicks by source page & product
  const clicksByPage = new Map<string, number>()
  const clicksByProduct = new Map<string, number>()
  for (const c of (clicks ?? []) as ClickRow[]) {
    clicksByPage.set(pathOf(c.referrer), (clicksByPage.get(pathOf(c.referrer)) ?? 0) + 1)
    const name = productName.get(c.product_id) ?? c.product_id
    clicksByProduct.set(name, (clicksByProduct.get(name) ?? 0) + 1)
  }

  // ── External-channel landings
  const channelTotals = new Map<string, number>()
  const landingsByPath = new Map<string, { total: number; channels: Map<string, number> }>()
  for (const v of views) {
    const ch = channelOf(v.referrer)
    if (!ch || !v.path) continue
    channelTotals.set(ch, (channelTotals.get(ch) ?? 0) + 1)
    const entry = landingsByPath.get(v.path) ?? { total: 0, channels: new Map() }
    entry.total += 1
    entry.channels.set(ch, (entry.channels.get(ch) ?? 0) + 1)
    landingsByPath.set(v.path, entry)
  }

  // ── Google re-open candidates: Naver-adapted posts earning external landings
  const blogLandings = [...landingsByPath.entries()].filter(([p]) => p.startsWith("/blog/"))
  const slugs = blogLandings.map(([p]) => p.replace("/blog/", "").replace(/\/$/, ""))
  const { data: posts } = slugs.length
    ? await supabase.from("blog_posts").select("slug, source_url").in("slug", slugs)
    : { data: [] as { slug: string; source_url: string | null }[] }
  const postBySlug = new Map((posts ?? []).map((p) => [p.slug, p]))
  const candidates = blogLandings
    .map(([path, entry]) => {
      const slug = path.replace("/blog/", "").replace(/\/$/, "")
      const post = postBySlug.get(slug)
      if (!post) return null
      const naver = /naver/.test(post.source_url ?? "")
      if (!naver) return null
      // Duplicate losers are permanently closed to Google; don't list them.
      if (BLOG_DUPLICATE_LOSERS.has(slug)) return null
      return {
        slug,
        landings: entry.total,
        channels: [...entry.channels.entries()].map(([c, n]) => `${c} ${n}`).join(" · "),
        googleOpen: isBlogPostGoogleSearchable(post),
      }
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.landings - a.landings)

  return {
    totalClicks: (clicks ?? []).length,
    clicksByPage: [...clicksByPage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20),
    clicksByProduct: [...clicksByProduct.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15),
    channelTotals: [...channelTotals.entries()].sort((a, b) => b[1] - a[1]),
    topLandings: [...landingsByPath.entries()]
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 20)
      .map(([path, e]) => ({ path, total: e.total, channels: [...e.channels.entries()].map(([c, n]) => `${c} ${n}`).join(" · ") })),
    candidates,
  }
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={head.length} className="px-3 py-4 text-muted-foreground">No data</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {r.map((c, j) => <td key={j} className={`px-3 py-2 ${j > 0 ? "whitespace-nowrap" : "break-all"}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function AdminGrowthPage() {
  const d = await loadData()
  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Growth scoreboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Last {DAYS} days. Affiliate clicks come from our first-party log; orders/commissions live in the
          Amazon Associates report (match the page column against its SubTag values, e.g.{" "}
          <code className="rounded bg-muted px-1">blog_...</code>).
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Affiliate clicks by page ({d.totalClicks} total)</h2>
        <Table head={["Page", "Clicks"]} rows={d.clicksByPage.map(([p, n]) => [p, n])} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Affiliate clicks by product</h2>
        <Table head={["Product", "Clicks"]} rows={d.clicksByProduct.map(([p, n]) => [p, n])} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Search &amp; AI channels</h2>
        <Table head={["Channel", "Landings"]} rows={d.channelTotals.map(([c, n]) => [c, n])} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Top landing pages (external search &amp; AI)</h2>
        <Table head={["Page", "Landings", "Channels"]} rows={d.topLandings.map((r) => [r.path, r.total, r.channels])} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Google re-open candidates</h2>
        <p className="text-sm text-muted-foreground">
          Naver-adapted posts currently earning external search/AI landings. &ldquo;Open&rdquo; means already
          re-enabled for Google; candidates get a provenance + enrichment pass first, then an allowlist entry.
        </p>
        <Table
          head={["Post", "Landings", "Channels", "Google"]}
          rows={d.candidates.map((c) => [c.slug, c.landings, c.channels, c.googleOpen ? "✅ open" : "🔒 candidate"])}
        />
      </section>
    </div>
  )
}

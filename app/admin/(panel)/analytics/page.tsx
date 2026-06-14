"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type TrafficStats = {
  pv_today: number
  pv_week: number
  pv_month: number
  uv_today: number
  uv_week: number
  uv_month: number
  top_pages: { path: string; views: number }[]
  top_referrers: { referrer: string; views: number }[]
  by_country: { country: string; views: number }[]
}

type AnalyticsData = {
  today: number
  week: number
  month: number
  topProducts: { slug: string; name: string; count: number }[]
  byRetailer: Record<string, number>
  byCountry: Record<string, number>
  visitors: TrafficStats | null
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/analytics")
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Request failed (${res.status})`)
      }
      setData((await res.json()) as AnalyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAnalytics()
  }, [fetchAnalytics])

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-medium">Analytics</h1>
        <Button variant="outline" size="sm" onClick={() => void fetchAnalytics()} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      {data && (
        <>
          {/* ---- Site traffic (first-party pageviews) ---- */}
          <h2 className="text-lg font-medium mb-4">Site traffic</h2>
          {data.visitors ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Visitors today", value: data.visitors.uv_today, sub: `${data.visitors.pv_today} views` },
                  { label: "Visitors · 7 days", value: data.visitors.uv_week, sub: `${data.visitors.pv_week} views` },
                  { label: "Visitors · 30 days", value: data.visitors.uv_month, sub: `${data.visitors.pv_month} views` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-5 bg-card rounded-xl border border-border text-center"
                  >
                    <p className="text-3xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
                <section>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Top pages (7d)</h3>
                  <ul className="space-y-1.5 text-sm">
                    {data.visitors.top_pages.length === 0 ? (
                      <li className="text-muted-foreground">No data yet.</li>
                    ) : (
                      data.visitors.top_pages.map((p) => (
                        <li key={p.path} className="flex justify-between gap-2 py-1.5 border-b border-border">
                          <span className="truncate font-mono text-xs">{p.path}</span>
                          <span className="font-medium shrink-0">{p.views}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
                <section>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Top referrers (7d)</h3>
                  <ul className="space-y-1.5 text-sm">
                    {data.visitors.top_referrers.length === 0 ? (
                      <li className="text-muted-foreground">No data yet.</li>
                    ) : (
                      data.visitors.top_referrers.map((r) => (
                        <li key={r.referrer} className="flex justify-between gap-2 py-1.5 border-b border-border">
                          <span className="truncate">{r.referrer}</span>
                          <span className="font-medium shrink-0">{r.views}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
                <section>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Visitors by country (7d)</h3>
                  <ul className="space-y-1.5 text-sm">
                    {data.visitors.by_country.length === 0 ? (
                      <li className="text-muted-foreground">No data yet.</li>
                    ) : (
                      data.visitors.by_country.map((c) => (
                        <li key={c.country} className="flex justify-between gap-2 py-1.5 border-b border-border">
                          <span>{c.country}</span>
                          <span className="font-medium shrink-0">{c.views}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mb-12">
              No traffic recorded yet — data appears once visitors browse the live site.
            </p>
          )}

          {/* ---- Affiliate clicks ---- */}
          <h2 className="text-lg font-medium mb-4">Affiliate clicks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Today", value: data.today },
              { label: "This week", value: data.week },
              { label: "This month", value: data.month },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 bg-card rounded-xl border border-border text-center"
              >
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <section className="mb-10">
            <h2 className="text-lg font-medium mb-4">Top 10 products by clicks</h2>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-right py-3 px-4">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-muted-foreground">
                        No clicks recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.topProducts.map((row) => (
                      <tr key={row.slug} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">{row.name}</td>
                        <td className="py-3 px-4 text-right font-medium">{row.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <section>
              <h2 className="text-lg font-medium mb-4">Clicks by retailer</h2>
              <ul className="space-y-2 text-sm">
                {Object.entries(data.byRetailer)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => (
                    <li
                      key={name}
                      className="flex justify-between py-2 border-b border-border"
                    >
                      <span className="capitalize">{name}</span>
                      <span className="font-medium">{count}</span>
                    </li>
                  ))}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Clicks by country</h2>
              <ul className="space-y-2 text-sm">
                {Object.entries(data.byCountry)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => (
                    <li
                      key={name}
                      className="flex justify-between py-2 border-b border-border"
                    >
                      <span>{name}</span>
                      <span className="font-medium">{count}</span>
                    </li>
                  ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

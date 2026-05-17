"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type AnalyticsData = {
  today: number
  week: number
  month: number
  topProducts: { slug: string; name: string; count: number }[]
  byRetailer: Record<string, number>
  byCountry: Record<string, number>
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

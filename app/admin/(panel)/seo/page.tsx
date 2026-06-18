"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, RefreshCw, MousePointerClick, Eye, Percent, TrendingUp } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }
type SeoData = {
  range: { startDate: string; endDate: string; days: number }
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  trend: { date: string; clicks: number; impressions: number }[]
  topQueries: Row[]
  topPages: Row[]
  byCountry: Row[]
}

const RANGES = [
  { label: "7d", value: 7 },
  { label: "28d", value: 28 },
  { label: "90d", value: 90 },
] as const

const COUNTRY_NAMES: Record<string, string> = {
  usa: "United States", gbr: "United Kingdom", can: "Canada", deu: "Germany",
  fra: "France", kor: "South Korea", jpn: "Japan", ind: "India", aus: "Australia",
  nld: "Netherlands", esp: "Spain", ita: "Italy", bra: "Brazil", swe: "Sweden",
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Eye; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  )
}

function shortPage(url: string): string {
  try {
    return new URL(url).pathname || "/"
  } catch {
    return url
  }
}

export default function AdminSeoPage() {
  const [days, setDays] = useState<number>(28)
  const [data, setData] = useState<SeoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (d: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/seo?days=${d}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Request failed (${res.status})`)
      }
      setData((await res.json()) as SeoData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Search Console data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData(days)
  }, [days, fetchData])

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-2xl font-medium">SEO — Search Console</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  days === r.value ? "bg-foreground text-background" : "bg-white text-muted-foreground hover:bg-muted"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => void fetchData(days)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {data && (
        <p className="text-xs text-muted-foreground mb-6">
          {data.range.startDate} → {data.range.endDate} · Google organic search
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 mb-6 rounded-lg border border-red-200 bg-red-50 p-3">{error}</p>
      )}

      {!data && loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={MousePointerClick} label="Clicks" value={data.totals.clicks.toLocaleString()} />
            <StatCard icon={Eye} label="Impressions" value={data.totals.impressions.toLocaleString()} />
            <StatCard icon={Percent} label="Avg CTR" value={`${(data.totals.ctr * 100).toFixed(1)}%`} />
            <StatCard icon={TrendingUp} label="Avg position" value={data.totals.position.toFixed(1)} />
          </div>

          <div className="rounded-xl border border-border bg-white p-4">
            <h2 className="text-sm font-medium mb-3">Clicks & impressions</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend} margin={{ top: 5, right: 8, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} minTickGap={24} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line yAxisId="l" type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} dot={false} name="Clicks" />
                  <Line yAxisId="r" type="monotone" dataKey="impressions" stroke="#c084fc" strokeWidth={2} dot={false} name="Impressions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <RowTable title="Top queries" rows={data.topQueries} label={(r) => r.keys[0]} />
            <RowTable title="Top pages" rows={data.topPages} label={(r) => shortPage(r.keys[0])} mono />
          </div>

          <RowTable
            title="By country"
            rows={data.byCountry}
            label={(r) => COUNTRY_NAMES[r.keys[0]] ?? r.keys[0].toUpperCase()}
          />
        </div>
      )}
    </div>
  )
}

function RowTable({
  title,
  rows,
  label,
  mono,
}: {
  title: string
  rows: Row[]
  label: (r: Row) => string
  mono?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="text-xs text-muted-foreground">clicks · impr · pos</span>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {rows.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground text-center">No data yet.</p>}
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2 text-sm">
            <span className={cn("flex-1 truncate", mono && "font-mono text-xs")} title={label(r)}>
              {label(r)}
            </span>
            <span className="tabular-nums w-10 text-right font-medium">{r.clicks}</span>
            <span className="tabular-nums w-14 text-right text-muted-foreground">{r.impressions}</span>
            <span className="tabular-nums w-10 text-right text-muted-foreground">{r.position.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

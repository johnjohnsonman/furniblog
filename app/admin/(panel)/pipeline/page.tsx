"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { fetchJson } from "@/lib/admin/fetch-json"
import {
  collectDCInsideFromBrowser,
  collectRedditFromBrowser,
} from "@/lib/pipeline/browser-collect"
import type { RawContent } from "@/lib/pipeline/types"

type ProductOption = { id: string; slug: string; name: string }

type PipelineSourceKey =
  | "reddit"
  | "youtube"
  | "dcinside"
  | "japan_community"
  | "naver"

type RunDebugSample = {
  source: string
  url: string
  textPreview: string
  claudeOutput: {
    summary?: string
    confidence?: number
  } | null
}

type RunResult = {
  collected: number
  processed: number
  saved: number
  failed: number
  chairName?: string
  debugSamples?: RunDebugSample[]
}

type HistoryRow = {
  id: string
  chairName: string
  chairSlug: string
  sources: string[]
  collected: number
  processed: number
  saved: number
  failed: number
  createdAt: string
}

type HistoryStats = {
  totalRuns: number
  totalCollected: number
  totalSaved: number
  successRate: number
}

type HistoryResponse = {
  runs: HistoryRow[]
  total: number
  page: number
  totalPages: number
  stats: HistoryStats
}

const SOURCE_OPTIONS: { key: PipelineSourceKey; label: string; hint?: string }[] = [
  { key: "reddit", label: "Reddit", hint: "Browser" },
  { key: "youtube", label: "YouTube", hint: "Server" },
  { key: "dcinside", label: "DC Inside", hint: "Browser*" },
  { key: "japan_community", label: "Japan", hint: "Server" },
  { key: "naver", label: "Naver", hint: "Server" },
]

const SERVER_SOURCE_KEYS: PipelineSourceKey[] = [
  "youtube",
  "naver",
  "japan_community",
]

const HISTORY_LIMIT = 20

const SOURCE_FILTER_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "dcinside", label: "DC Inside" },
  { value: "japan_community", label: "Japan" },
  { value: "naver", label: "Naver" },
] as const

function formatSourceLabel(source: string): string {
  const found = SOURCE_OPTIONS.find((s) => s.key === source)
  return found?.label ?? source
}

function runStatus(row: HistoryRow): {
  label: string
  className: string
} {
  if (row.saved > 0) {
    return {
      label: "Success",
      className:
        "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
    }
  }
  if (row.collected > 0) {
    return {
      label: "No matches",
      className:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    }
  }
  return {
    label: "No data",
    className:
      "border-border bg-muted text-muted-foreground",
  }
}

export default function AdminPipelinePage() {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [chairSlug, setChairSlug] = useState("")
  const [sources, setSources] = useState<Record<PipelineSourceKey, boolean>>({
    reddit: true,
    youtube: true,
    dcinside: false,
    japan_community: false,
    naver: false,
  })
  const [running, setRunning] = useState(false)
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [runAllIndex, setRunAllIndex] = useState(0)
  const [runAllTotal, setRunAllTotal] = useState(0)
  const [runAllChairName, setRunAllChairName] = useState<string | null>(null)
  const [runAllSaved, setRunAllSaved] = useState(0)
  const [runAllDoneMessage, setRunAllDoneMessage] = useState<string | null>(null)
  const stopAllRef = useRef(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [history, setHistory] = useState<HistoryRow[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyTotalPages, setHistoryTotalPages] = useState(0)
  const [historyStats, setHistoryStats] = useState<HistoryStats>({
    totalRuns: 0,
    totalCollected: 0,
    totalSaved: 0,
    successRate: 0,
  })

  const [searchInput, setSearchInput] = useState("")
  const [searchDebounced, setSearchDebounced] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [resultsFilter, setResultsFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setHistoryPage(1)
  }, [searchDebounced, sourceFilter, resultsFilter, dateFilter])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const qs = new URLSearchParams({
        page: String(historyPage),
        limit: String(HISTORY_LIMIT),
      })
      if (searchDebounced) qs.set("search", searchDebounced)
      if (sourceFilter !== "all") qs.set("source", sourceFilter)
      if (resultsFilter === "yes") qs.set("hasResults", "true")
      if (resultsFilter === "no") qs.set("hasResults", "false")
      if (dateFilter !== "all") qs.set("dateRange", dateFilter)

      const historyResult = await fetchJson<HistoryResponse>(
        `/api/pipeline/history?${qs}`
      )
      if (!historyResult.ok) {
        setHistoryError(historyResult.error)
        setHistory([])
        setHistoryTotal(0)
        setHistoryTotalPages(0)
        setHistoryStats({
          totalRuns: 0,
          totalCollected: 0,
          totalSaved: 0,
          successRate: 0,
        })
        return
      }

      setHistoryError(null)
      const data = historyResult.data
      setHistory(data.runs ?? [])
      setHistoryTotal(data.total ?? 0)
      setHistoryTotalPages(data.totalPages ?? 0)
      setHistoryStats(
        data.stats ?? {
          totalRuns: 0,
          totalCollected: 0,
          totalSaved: 0,
          successRate: 0,
        }
      )
    } finally {
      setHistoryLoading(false)
    }
  }, [historyPage, searchDebounced, sourceFilter, resultsFilter, dateFilter])

  useEffect(() => {
    void (async () => {
      const result = await fetchJson<{
        products?: { id: string; slug: string; name: string }[]
      }>("/api/admin/products")
      if (!result.ok) {
        console.error("Failed to load products:", result.error)
        return
      }
      const list = (result.data.products ?? []).map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
      }))
      setProducts(list)
      if (list[0] && !chairSlug) setChairSlug(list[0].slug)
    })()
  }, [chairSlug])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  async function collectAndProcessChair(
    product: ProductOption,
    selectedSources: PipelineSourceKey[]
  ) {
    const browserItems: RawContent[] = []

    if (selectedSources.includes("reddit")) {
      setStatus("Collecting from Reddit (your browser)…")
      browserItems.push(...(await collectRedditFromBrowser(product.name)))
    }

    if (selectedSources.includes("dcinside")) {
      setStatus("Trying DC Inside (browser — may be blocked by CORS)…")
      browserItems.push(
        ...(await collectDCInsideFromBrowser(product.slug, product.name))
      )
    }

    const serverSources = selectedSources.filter((s) =>
      SERVER_SOURCE_KEYS.includes(s)
    )

    let serverItems: RawContent[] = []
    if (serverSources.length > 0) {
      setStatus(`Collecting from ${serverSources.join(", ")} (server)…`)
      const serverRes = await fetchJson<{
        items?: RawContent[]
        error?: string
      }>("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chairSlug: product.slug,
          sources: serverSources,
        }),
      })

      if (!serverRes.ok) {
        throw new Error(serverRes.error)
      }
      serverItems = serverRes.data.items ?? []
    }

    const allItems = [...browserItems, ...serverItems]
    setStatus(
      `Collected ${allItems.length} posts (${browserItems.length} browser, ${serverItems.length} server). Processing with AI…`
    )

    const processRes = await fetchJson<{
      error?: string
      collected: number
      processed: number
      saved: number
      failed: number
      chairName?: string
    }>("/api/pipeline/process-items?debug=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        items: allItems,
        sources: selectedSources,
      }),
    })

    if (!processRes.ok) {
      throw new Error(processRes.error)
    }

    return processRes.data
  }

  async function runPipeline() {
    setRunning(true)
    setError(null)
    setResult(null)
    setRunAllDoneMessage(null)
    setStatus(null)

    try {
      const selectedSources = (
        Object.entries(sources) as [PipelineSourceKey, boolean][]
      )
        .filter(([, on]) => on)
        .map(([key]) => key)

      if (selectedSources.length === 0) {
        throw new Error("Select at least one source")
      }

      const product = products.find((p) => p.slug === chairSlug)
      if (!product) {
        throw new Error("Selected chair not found")
      }

      const data = await collectAndProcessChair(product, selectedSources)
      setResult({
        collected: data.collected,
        processed: data.processed,
        saved: data.saved,
        failed: data.failed,
        chairName: data.chairName ?? product.name,
      })

      setHistoryPage(1)
      void loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pipeline failed")
    } finally {
      setRunning(false)
      setStatus(null)
    }
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function runAllChairs() {
    stopAllRef.current = false
    setIsRunningAll(true)
    setRunning(true)
    setError(null)
    setResult(null)
    setRunAllDoneMessage(null)
    setRunAllIndex(0)
    setRunAllTotal(0)
    setRunAllChairName(null)
    setRunAllSaved(0)

    const runAllSources: PipelineSourceKey[] = ["reddit"]
    let index = 0
    let total = 0
    let savedTotal = 0
    let done = false

    try {
      while (!done && !stopAllRef.current) {
        const batchRes = await fetchJson<{
          error?: string
          done: boolean
          next: number
          total: number
          product: { id: string; slug: string; name: string } | null
        }>("/api/pipeline/run-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index }),
        })

        if (!batchRes.ok) {
          throw new Error(batchRes.error)
        }

        const data = batchRes.data
        total = data.total
        done = data.done
        index = data.next

        setRunAllTotal(total)
        setRunAllIndex(data.done ? total : data.next)

        if (data.product && !stopAllRef.current) {
          setRunAllChairName(data.product.name)
          setStatus(`Run all: ${data.product.name}`)

          const result = await collectAndProcessChair(
            data.product,
            runAllSources
          )
          savedTotal += result.saved ?? 0
          setRunAllSaved(savedTotal)
        } else {
          setRunAllChairName(null)
        }

        if (!done && !stopAllRef.current) {
          await delay(1000)
        }
      }

      if (stopAllRef.current) {
        setRunAllDoneMessage(
          `Stopped at ${index} / ${total}. Saved ${savedTotal} reviews so far.`
        )
      } else {
        setRunAllDoneMessage(
          `Done! Processed ${total} chairs. Saved ${savedTotal} reviews.`
        )
      }

      setResult({
        collected: 0,
        processed: total,
        saved: savedTotal,
        failed: 0,
      })
      setHistoryPage(1)
      void loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run all failed")
    } finally {
      setIsRunningAll(false)
      setRunning(false)
      setRunAllChairName(null)
      setStatus(null)
    }
  }

  function stopRunAll() {
    stopAllRef.current = true
  }

  const rangeStart =
    historyTotal === 0 ? 0 : (historyPage - 1) * HISTORY_LIMIT + 1
  const rangeEnd = Math.min(historyPage * HISTORY_LIMIT, historyTotal)

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-serif text-2xl font-medium">Review Pipeline</h1>
      <p className="text-sm text-muted-foreground mt-2 mb-8">
        Reddit is collected in your browser (Vercel IPs are blocked). YouTube,
        Naver, and Japan are collected on the server. Claude processing runs on
        the server after collection.
      </p>

      <section className="border border-border rounded-xl p-6 mb-8 space-y-6">
        <h2 className="text-lg font-medium">Run for one chair</h2>

        <div className="space-y-2">
          <Label>Chair</Label>
          <Select value={chairSlug} onValueChange={setChairSlug}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select chair" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-6">
          {SOURCE_OPTIONS.map(({ key, label, hint }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={sources[key]}
                onCheckedChange={(checked) =>
                  setSources((s) => ({ ...s, [key]: Boolean(checked) }))
                }
              />
              {label}
              {hint && (
                <span className="text-xs text-muted-foreground">({hint})</span>
              )}
            </label>
          ))}
        </div>

        <Button
          onClick={() => void runPipeline()}
          disabled={running || isRunningAll || !chairSlug}
        >
          {running && !isRunningAll ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          Run Pipeline
        </Button>
      </section>

      {(running || result) && (
        <section className="border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Run result</h2>
          {(running || status) && !isRunningAll && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {running && <Loader2 className="h-4 w-4 animate-spin" />}
              {status ?? "Processing…"}
            </p>
          )}
          {result && !running && (
            <ul className="space-y-2 text-sm">
              {result.chairName && (
                <li>
                  <span className="text-muted-foreground">Chair:</span>{" "}
                  {result.chairName}
                </li>
              )}
              <li>Collected: {result.collected} posts</li>
              <li>Processed: {result.processed} reviews</li>
              <li>Saved: {result.saved} reviews</li>
              <li>Failed: {result.failed} (low confidence or errors)</li>
            </ul>
          )}
          {result?.debugSamples && result.debugSamples.length > 0 && !running && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-medium">Debug samples</p>
              {result.debugSamples.map((sample, i) => (
                <div
                  key={`${sample.url}-${i}`}
                  className="rounded-lg border border-border p-3 text-xs space-y-2"
                >
                  <p>
                    <span className="text-muted-foreground">Source:</span>{" "}
                    {sample.source}
                  </p>
                  <p className="break-all">
                    <span className="text-muted-foreground">URL:</span>{" "}
                    {sample.url}
                  </p>
                  <pre className="whitespace-pre-wrap bg-muted/50 p-2 rounded text-[11px]">
                    {sample.textPreview}
                  </pre>
                  {sample.claudeOutput && (
                    <p>
                      Claude: confidence {sample.claudeOutput.confidence} —{" "}
                      {sample.claudeOutput.summary?.slice(0, 120)}…
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="border border-border rounded-xl p-6 mb-8 space-y-4">
        <h2 className="text-lg font-medium">Quick run</h2>
        <p className="text-sm text-muted-foreground">
          Process every chair with Reddit collected in your browser (one chair
          per step). Avoids Vercel IP blocks and server timeouts.
        </p>
        <Button
          variant="outline"
          onClick={() => void runAllChairs()}
          disabled={running}
        >
          Run for All Chairs
        </Button>

        {isRunningAll && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="text-sm font-medium">
              Processing {runAllIndex} / {runAllTotal || "…"}
              {runAllChairName ? `: ${runAllChairName}` : ""}
            </div>
            {runAllChairName && (
              <p className="text-sm text-muted-foreground">
                Current: {runAllChairName}
              </p>
            )}
            {runAllTotal > 0 && (
              <progress
                className="w-full h-2 rounded"
                value={runAllIndex}
                max={runAllTotal}
              />
            )}
            <p className="text-sm text-muted-foreground">
              Saved so far: {runAllSaved} reviews
            </p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={stopRunAll}
            >
              Stop
            </Button>
          </div>
        )}

        {runAllDoneMessage && !isRunningAll && (
          <p className="text-sm text-foreground">{runAllDoneMessage}</p>
        )}
      </section>

      {error && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mb-6">
          Pipeline run failed. {error}
        </div>
      )}

      <section>
        <h2 className="text-lg font-medium mb-4">Pipeline run history</h2>

        {historyError && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded mb-4">
            Could not load history. {historyError}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="py-4">
            <CardContent className="px-4 py-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Runs
              </p>
              <p className="text-2xl font-semibold mt-1">
                {historyStats.totalRuns.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="px-4 py-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Collected
              </p>
              <p className="text-2xl font-semibold mt-1">
                {historyStats.totalCollected.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="px-4 py-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Total Saved
              </p>
              <p className="text-2xl font-semibold mt-1">
                {historyStats.totalSaved.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardContent className="px-4 py-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Success Rate
              </p>
              <p className="text-2xl font-semibold mt-1">
                {historyStats.successRate}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Search chair…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-xs"
          />
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resultsFilter} onValueChange={setResultsFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="yes">Has results</SelectItem>
              <SelectItem value="no">No results</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="py-3 px-4">Chair</th>
                <th className="py-3 px-4">Sources</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Collected</th>
                <th className="py-3 px-4 text-right">Processed</th>
                <th className="py-3 px-4 text-right">Saved</th>
                <th className="py-3 px-4 text-right">Failed</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                    Loading…
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No runs found.
                  </td>
                </tr>
              ) : (
                history.map((row) => {
                  const status = runStatus(row)
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-border"
                    >
                      <td className="py-3 px-4 font-medium">{row.chairName}</td>
                      <td className="py-3 px-4">
                        {(row.sources ?? [])
                          .map(formatSourceLabel)
                          .join(", ") || "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">{row.collected}</td>
                      <td className="py-3 px-4 text-right">{row.processed}</td>
                      <td className="py-3 px-4 text-right">{row.saved}</td>
                      <td className="py-3 px-4 text-right">{row.failed}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cn("font-normal", status.className)}
                        >
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <p className="text-sm text-muted-foreground">
            {historyTotal === 0
              ? "No runs"
              : `Showing ${rangeStart}-${rangeEnd} of ${historyTotal} runs`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={historyPage <= 1 || historyLoading}
              onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {historyPage} of {Math.max(historyTotalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={
                historyPage >= historyTotalPages ||
                historyTotalPages === 0 ||
                historyLoading
              }
              onClick={() =>
                setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

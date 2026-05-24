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
  browserCollectJapan,
  browserCollectReddit,
  getAliases,
  getJapaneseName,
  type BrowserCollectItem,
} from "@/app/admin/(panel)/pipeline/browser-collect"
import { ChairSearchCombobox } from "@/components/admin/pipeline/chair-search-combobox"
import { Switch } from "@/components/ui/switch"

type ProductOption = { id: string; slug: string; name: string }

type PipelineSourceKey =
  | "reddit"
  | "youtube"
  | "dcinside"
  | "japan_community"
  | "naver"
  | "trustpilot"
  | "review_sites"
  | "hackernews"

type RunDebugSample = {
  source: string
  url: string
  textPreview: string
  claudeOutput: {
    summary?: string
    confidence?: number
  } | null
}

type SourceCounts = {
  reddit: number
  youtube: number
  dcinside: number
  japan_community: number
  naver: number
  trustpilot: number
  review_sites: number
  hackernews: number
  browser: number
  server: number
}

interface PipelineResult {
  collected: number
  processed: number
  saved: number
  failed: number
  chairName?: string
  sourceCounts?: SourceCounts
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

const SOURCE_OPTIONS: { key: PipelineSourceKey; label: string }[] = [
  { key: "reddit", label: "Reddit (Browser)" },
  { key: "youtube", label: "YouTube (Server)" },
  { key: "dcinside", label: "DC Inside (Server)" },
  { key: "japan_community", label: "Japan (Browser)" },
  { key: "naver", label: "Naver (Server)" },
  { key: "trustpilot", label: "Trustpilot (Server)" },
  { key: "review_sites", label: "Review Sites (Server)" },
  { key: "hackernews", label: "Hacker News (Server)" },
]

const HISTORY_LIMIT = 20
const PER_SOURCE_LIMIT = 5

const BROWSER_SOURCE_LIST: PipelineSourceKey[] = ["reddit", "japan_community"]
const SERVER_SOURCE_LIST: PipelineSourceKey[] = [
  "youtube",
  "naver",
  "dcinside",
  "trustpilot",
  "review_sites",
  "hackernews",
]

const AUTO_SOURCE_OPTIONS: { key: PipelineSourceKey; label: string }[] = [
  { key: "reddit", label: "Reddit" },
  { key: "youtube", label: "YouTube" },
  { key: "dcinside", label: "DC Inside" },
  { key: "japan_community", label: "Japan" },
  { key: "naver", label: "Naver" },
  { key: "review_sites", label: "Review Sites" },
  { key: "hackernews", label: "Hacker News" },
]

interface AutoState {
  running: boolean
  currentIndex: number
  totalChairs: number
  currentChair: string
  currentSource: string
  totalCollected: number
  totalSaved: number
  totalSkipped: number
  startTime: number | null
}

function formatEta(ms: number): string {
  const min = Math.ceil(ms / 60_000)
  if (min < 1) return "<1 min"
  return `~${min} min`
}

const SOURCE_FILTER_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "dcinside", label: "DC Inside" },
  { value: "japan_community", label: "Japan" },
  { value: "naver", label: "Naver" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "review_sites", label: "Review Sites" },
  { value: "hackernews", label: "Hacker News" },
] as const

function formatSourceLabel(source: string): string {
  const found = SOURCE_OPTIONS.find((s) => s.key === source)
  if (found) return found.label
  if (source === "japan_community") return "Japan"
  return source.replace(/_/g, " ")
}

function historyRowStatus(row: HistoryRow): {
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
    trustpilot: false,
    review_sites: false,
    hackernews: false,
  })
  const [running, setRunning] = useState(false)
  const [runStatus, setRunStatus] = useState("")
  const [currentSource, setCurrentSource] = useState("")
  const [completedSources, setCompletedSources] = useState<string[]>([])
  const [isRunningAll, setIsRunningAll] = useState(false)
  const [runAllIndex, setRunAllIndex] = useState(0)
  const [runAllTotal, setRunAllTotal] = useState(0)
  const [runAllChairName, setRunAllChairName] = useState<string | null>(null)
  const [runAllSaved, setRunAllSaved] = useState(0)
  const [runAllDoneMessage, setRunAllDoneMessage] = useState<string | null>(null)
  const stopAllRef = useRef(false)
  const stopAutoRef = useRef(false)

  const [autoSettings, setAutoSettings] = useState({
    sources: ["reddit", "youtube"] as PipelineSourceKey[],
    delaySeconds: 5,
    skipExisting: true,
    onlyEmpty: false,
  })
  const [autoState, setAutoState] = useState<AutoState>({
    running: false,
    currentIndex: 0,
    totalChairs: 0,
    currentChair: "",
    currentSource: "",
    totalCollected: 0,
    totalSaved: 0,
    totalSkipped: 0,
    startTime: null,
  })
  const [lastAutoRun, setLastAutoRun] = useState<{
    date: string
    saved: number
    chairs: number
  } | null>(null)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastAutoCollection")
      if (raw) setLastAutoRun(JSON.parse(raw) as { date: string; saved: number; chairs: number })
    } catch {
      /* ignore */
    }
  }, [])

  async function runPipelineApi(
    product: ProductOption,
    sources: PipelineSourceKey[],
    browserItems: BrowserCollectItem[],
    allSources?: PipelineSourceKey[]
  ) {
    return fetchJson<{
      error?: string
      collected: number
      processed: number
      saved: number
      failed: number
      chairName?: string
      sourceCounts?: SourceCounts
    }>("/api/pipeline/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        sources,
        allSources: allSources ?? sources,
        browserItems: browserItems.slice(0, PER_SOURCE_LIMIT),
        maxPerSource: PER_SOURCE_LIMIT,
      }),
    })
  }

  async function runPipelineSequential(
    product: ProductOption,
    selectedSources: PipelineSourceKey[]
  ): Promise<PipelineResult> {
    let totalCollected = 0
    let totalSaved = 0
    let totalFailed = 0
    let lastSourceCounts: SourceCounts | undefined

    setCompletedSources([])
    setCurrentSource("")

    const browserItems: BrowserCollectItem[] = []

    if (selectedSources.includes("reddit")) {
      setCurrentSource("reddit")
      setRunStatus("Collecting from Reddit (browser)...")
      try {
        const items = await browserCollectReddit(
          product.name,
          getAliases(product.name)
        )
        browserItems.push(...items.slice(0, PER_SOURCE_LIMIT))
        setRunStatus(`Reddit: ${Math.min(items.length, PER_SOURCE_LIMIT)} posts found`)
      } catch {
        setRunStatus("Reddit: failed, continuing...")
      }
      setCompletedSources((prev) => [...prev, "reddit"])
    }

    if (selectedSources.includes("japan_community")) {
      setCurrentSource("japan_community")
      setRunStatus("Collecting from Japan (browser)...")
      try {
        const items = await browserCollectJapan(
          product.name,
          getJapaneseName(product.name)
        )
        browserItems.push(...items.slice(0, PER_SOURCE_LIMIT))
        setRunStatus(`Japan: ${Math.min(items.length, PER_SOURCE_LIMIT)} posts found`)
      } catch {
        setRunStatus("Japan: failed, continuing...")
      }
      setCompletedSources((prev) => [...prev, "japan_community"])
    }

    if (browserItems.length > 0) {
      setCurrentSource("processing")
      setRunStatus(`Processing ${browserItems.length} posts with Claude AI...`)
      try {
        const runResult = await runPipelineApi(
          product,
          [],
          browserItems,
          selectedSources.filter((s) => BROWSER_SOURCE_LIST.includes(s))
        )
        if (!runResult.ok) throw new Error(runResult.error)
        const data = runResult.data
        totalCollected += data.collected ?? 0
        totalSaved += data.saved ?? 0
        totalFailed += data.failed ?? 0
        lastSourceCounts = data.sourceCounts
        setRunStatus(`Browser sources: saved ${data.saved ?? 0} reviews`)
      } catch {
        setRunStatus("Browser processing failed, continuing...")
      }
      await new Promise((r) => setTimeout(r, 1000))
    }

    const selectedServerSources = selectedSources.filter((s) =>
      SERVER_SOURCE_LIST.includes(s)
    )

    for (const source of selectedServerSources) {
      setCurrentSource(source)
      setRunStatus(`Collecting from ${formatSourceLabel(source)}...`)

      try {
        const runResult = await runPipelineApi(product, [source], [], selectedSources)
        if (!runResult.ok) throw new Error(runResult.error)
        const data = runResult.data
        totalCollected += data.collected ?? 0
        totalSaved += data.saved ?? 0
        totalFailed += data.failed ?? 0
        lastSourceCounts = data.sourceCounts
        setRunStatus(
          `${formatSourceLabel(source)}: saved ${data.saved ?? 0} reviews`
        )
      } catch {
        setRunStatus(`${formatSourceLabel(source)}: failed, continuing...`)
      }

      setCompletedSources((prev) =>
        prev.includes(source) ? prev : [...prev, source]
      )
      await new Promise((r) => setTimeout(r, 1500))
    }

    setCurrentSource("")
    setRunStatus("")

    return {
      collected: totalCollected,
      processed: totalCollected,
      saved: totalSaved,
      failed: totalFailed,
      chairName: product.name,
      sourceCounts: lastSourceCounts,
    }
  }

  async function runPipeline() {
    const product = products.find((p) => p.slug === chairSlug)
    if (!product) {
      setError("Select a chair")
      return
    }

    setRunning(true)
    setError(null)
    setResult(null)
    setRunAllDoneMessage(null)
    setRunStatus("")
    setCompletedSources([])
    setCurrentSource("")

    try {
      const selectedSources = (
        Object.entries(sources) as [PipelineSourceKey, boolean][]
      )
        .filter(([, on]) => on)
        .map(([key]) => key)

      if (selectedSources.length === 0) {
        throw new Error("Select at least one source")
      }

      const pipelineResult = await runPipelineSequential(
        product,
        selectedSources
      )
      setResult(pipelineResult)
      setRunStatus(`Saved ${pipelineResult.saved} reviews!`)
      setHistoryPage(1)
      void loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pipeline failed")
    } finally {
      setRunning(false)
      setCompletedSources([])
      setCurrentSource("")
      setTimeout(() => setRunStatus(""), 3000)
    }
  }

  async function runPipelineForProduct(
    product: ProductOption,
    selectedSources: PipelineSourceKey[]
  ) {
    return runPipelineSequential(product, selectedSources)
  }

  async function startAutoCollection() {
    stopAutoRef.current = false
    setError(null)

    const productsResult = await fetchJson<{
      products?: ProductOption[]
    }>("/api/admin/products?limit=200&published=true")

    if (!productsResult.ok) {
      setError(productsResult.error)
      return
    }

    let targetProducts = productsResult.data.products ?? []

    const countsResult = await fetchJson<Record<string, number>>(
      "/api/admin/review-counts"
    )
    const reviewCounts = countsResult.ok ? countsResult.data : {}

    if (autoSettings.onlyEmpty) {
      targetProducts = targetProducts.filter(
        (p) => !reviewCounts[p.id] || reviewCounts[p.id] === 0
      )
    }

    setAutoState({
      running: true,
      currentIndex: 0,
      totalChairs: targetProducts.length,
      currentChair: "",
      currentSource: "",
      totalCollected: 0,
      totalSaved: 0,
      totalSkipped: 0,
      startTime: Date.now(),
    })

    let totalSaved = 0
    let totalCollected = 0
    let totalSkipped = 0

    for (let i = 0; i < targetProducts.length; i++) {
      if (stopAutoRef.current) break

      const product = targetProducts[i]

      if (autoSettings.skipExisting && !autoSettings.onlyEmpty) {
        const count = reviewCounts[product.id] ?? 0
        if (count > 0) {
          totalSkipped += 1
          setAutoState((prev) => ({
            ...prev,
            currentIndex: i + 1,
            currentChair: `${product.name} (skipped)`,
            totalSkipped,
          }))
          continue
        }
      }

      setAutoState((prev) => ({
        ...prev,
        currentIndex: i + 1,
        currentChair: product.name,
      }))

      const browserItems: BrowserCollectItem[] = []

      if (autoSettings.sources.includes("reddit")) {
        setAutoState((prev) => ({ ...prev, currentSource: "reddit" }))
        try {
          const items = await browserCollectReddit(
            product.name,
            getAliases(product.name)
          )
          browserItems.push(...items.slice(0, PER_SOURCE_LIMIT))
        } catch {
          /* continue */
        }
      }

      if (autoSettings.sources.includes("japan_community")) {
        setAutoState((prev) => ({ ...prev, currentSource: "japan_community" }))
        try {
          const items = await browserCollectJapan(
            product.name,
            getJapaneseName(product.name)
          )
          browserItems.push(...items.slice(0, PER_SOURCE_LIMIT))
        } catch {
          /* continue */
        }
      }

      if (browserItems.length > 0) {
        setAutoState((prev) => ({ ...prev, currentSource: "AI processing" }))
        try {
          const runResult = await runPipelineApi(
            product,
            [],
            browserItems,
            autoSettings.sources.filter((s) => BROWSER_SOURCE_LIST.includes(s))
          )
          if (runResult.ok) {
            totalCollected += runResult.data.collected ?? 0
            totalSaved += runResult.data.saved ?? 0
          }
        } catch {
          /* continue */
        }
        await new Promise((r) => setTimeout(r, 1000))
      }

      const serverSources = autoSettings.sources.filter((s) =>
        SERVER_SOURCE_LIST.includes(s)
      )

      for (const source of serverSources) {
        if (stopAutoRef.current) break

        setAutoState((prev) => ({ ...prev, currentSource: source }))

        try {
          const runResult = await runPipelineApi(
            product,
            [source],
            [],
            autoSettings.sources
          )
          if (runResult.ok) {
            totalCollected += runResult.data.collected ?? 0
            totalSaved += runResult.data.saved ?? 0
          }
        } catch {
          /* continue */
        }

        await new Promise((r) => setTimeout(r, 1500))
      }

      setAutoState((prev) => ({
        ...prev,
        totalCollected,
        totalSaved,
        totalSkipped,
      }))

      if (!stopAutoRef.current) {
        await new Promise((r) =>
          setTimeout(r, autoSettings.delaySeconds * 1000)
        )
      }
    }

    const record = {
      date: new Date().toISOString(),
      saved: totalSaved,
      chairs: targetProducts.length,
    }
    localStorage.setItem("lastAutoCollection", JSON.stringify(record))
    setLastAutoRun(record)

    setAutoState((prev) => ({
      ...prev,
      running: false,
      currentSource: "",
      totalCollected,
      totalSaved,
      totalSkipped,
    }))

    setHistoryPage(1)
    void loadHistory()
  }

  function stopAutoCollection() {
    stopAutoRef.current = true
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
    setRunStatus("")

    const runAllSources: PipelineSourceKey[] = ["reddit", "youtube"]
    let savedTotal = 0

    try {
      let chairList = products
      if (chairList.length === 0) {
        const productsResult = await fetchJson<{
          products?: ProductOption[]
        }>("/api/admin/products")
        if (!productsResult.ok) {
          throw new Error(productsResult.error)
        }
        chairList = (productsResult.data.products ?? []).map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
        }))
      }

      const total = chairList.length
      setRunAllTotal(total)

      for (let i = 0; i < total; i++) {
        if (stopAllRef.current) break

        const product = chairList[i]
        setRunAllIndex(i + 1)
        setRunAllChairName(product.name)
        setChairSlug(product.slug)

        try {
          const pipelineResult = await runPipelineForProduct(
            product,
            runAllSources
          )
          savedTotal += pipelineResult.saved
          setRunAllSaved(savedTotal)
        } catch (err) {
          console.error("Run all chair failed:", product.name, err)
        }

        if (i < total - 1 && !stopAllRef.current) {
          await delay(2000)
        }
      }

      if (stopAllRef.current) {
        setRunAllDoneMessage(
          `Stopped early. Saved ${savedTotal} reviews so far.`
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
      setRunStatus("")
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
        Reddit and Japan run in your browser. YouTube, Naver, DC Inside,
        Trustpilot, and Review Sites run on the server. Claude AI processes and
        saves
        reviews.
      </p>

      <section className="border border-border rounded-xl p-6 mb-8 space-y-6">
        <h2 className="text-lg font-medium">Run for one chair</h2>

        <ChairSearchCombobox
          products={products}
          value={chairSlug}
          onChange={setChairSlug}
          disabled={running || autoState.running}
        />

        <div className="flex flex-wrap gap-6">
          {SOURCE_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={sources[key]}
                onCheckedChange={(checked) =>
                  setSources((s) => ({ ...s, [key]: Boolean(checked) }))
                }
              />
              {label}
            </label>
          ))}
        </div>

        {running && (
          <div className="mt-3 space-y-1">
            {(Object.entries(sources) as [PipelineSourceKey, boolean][])
              .filter(([, on]) => on)
              .map(([source]) => (
                <div key={source} className="flex items-center gap-2 text-sm">
                  {completedSources.includes(source) ? (
                    <span className="text-green-500">✓</span>
                  ) : currentSource === source ||
                    (currentSource === "processing" &&
                      (source === "reddit" || source === "japan_community")) ? (
                    <span className="text-blue-500 animate-pulse">●</span>
                  ) : (
                    <span className="text-gray-300">○</span>
                  )}
                  <span className="capitalize">{formatSourceLabel(source)}</span>
                </div>
              ))}
            {runStatus && (
              <p className="text-xs text-gray-500 mt-2">{runStatus}</p>
            )}
          </div>
        )}

        <Button
          onClick={() => void runPipeline()}
          disabled={running || isRunningAll || autoState.running || !chairSlug}
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
          {running && !isRunningAll && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
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
              <li>
                Collected: {result.collected} posts
                {result.sourceCounts && (
                  <span className="text-muted-foreground">
                    {" "}
                    (Reddit: {result.sourceCounts.reddit}, DC:{" "}
                    {result.sourceCounts.dcinside}, Japan:{" "}
                    {result.sourceCounts.japan_community}, YouTube:{" "}
                    {result.sourceCounts.youtube}, Naver:{" "}
                    {result.sourceCounts.naver}, Trustpilot:{" "}
                    {result.sourceCounts.trustpilot}, Review Sites:{" "}
                    {result.sourceCounts.review_sites}, HN:{" "}
                    {result.sourceCounts.hackernews})
                  </span>
                )}
              </li>
              <li>Processed: {result.processed} reviews</li>
              <li>Saved: {result.saved} reviews</li>
              <li>Failed: {result.failed} (low relevance or errors)</li>
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
          Process every chair one at a time. Reddit is collected in your browser;
          YouTube on the server. Runs sequentially from your browser.
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
            {runStatus && (
              <p className="text-sm text-blue-600 dark:text-blue-400 animate-pulse">
                {runStatus}
              </p>
            )}
            <div className="text-sm font-medium">
              Processing {runAllIndex} / {runAllTotal || "..."}
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

      <section className="border border-border rounded-xl p-6 mb-8 space-y-4">
        <h2 className="text-lg font-medium">Auto Collection</h2>
        <p className="text-sm text-muted-foreground">
          Run selected sources for every published chair sequentially. Each
          source collects up to {PER_SOURCE_LIMIT} items per chair.
        </p>

        <div className="flex flex-wrap gap-4">
          {AUTO_SOURCE_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={autoSettings.sources.includes(key)}
                onCheckedChange={(checked) => {
                  setAutoSettings((s) => ({
                    ...s,
                    sources: checked
                      ? [...s.sources, key]
                      : s.sources.filter((x) => x !== key),
                  }))
                }}
                disabled={autoState.running}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-2">
            <Label>Delay between chairs</Label>
            <Select
              value={String(autoSettings.delaySeconds)}
              onValueChange={(v) =>
                setAutoSettings((s) => ({
                  ...s,
                  delaySeconds: Number(v),
                }))
              }
              disabled={autoState.running}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3s</SelectItem>
                <SelectItem value="5">5s</SelectItem>
                <SelectItem value="10">10s</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={autoSettings.skipExisting}
              onCheckedChange={(checked) =>
                setAutoSettings((s) => ({ ...s, skipExisting: Boolean(checked) }))
              }
              disabled={autoState.running}
            />
            Skip chairs with existing reviews
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={autoSettings.onlyEmpty}
              onCheckedChange={(checked) =>
                setAutoSettings((s) => ({ ...s, onlyEmpty: Boolean(checked) }))
              }
              disabled={autoState.running}
            />
            Only chairs with 0 reviews
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => void startAutoCollection()}
            disabled={running || autoState.running || autoSettings.sources.length === 0}
          >
            ▶ Start Auto Collection
          </Button>
          {autoState.running && (
            <Button variant="destructive" onClick={stopAutoCollection}>
              ■ Stop
            </Button>
          )}
        </div>

        {autoState.running && (
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 space-y-3">
            <p className="text-sm font-medium text-green-800">
              🟢 Auto Collection Running
            </p>
            <p className="text-sm">
              Progress: {autoState.currentIndex} / {autoState.totalChairs}
            </p>
            {autoState.totalChairs > 0 && (
              <progress
                className="w-full h-2 rounded"
                value={autoState.currentIndex}
                max={autoState.totalChairs}
              />
            )}
            <p className="text-sm text-muted-foreground">
              Current: {autoState.currentChair || "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              Current source: {autoState.currentSource || "—"}
              {autoState.currentSource ? " ●" : ""}
            </p>
            <p className="text-sm">
              Saved so far: {autoState.totalSaved} reviews
              {autoState.totalSkipped > 0 &&
                ` · Skipped: ${autoState.totalSkipped}`}
            </p>
            {autoState.startTime && autoState.currentIndex > 0 && (
              <p className="text-sm text-muted-foreground">
                Est. remaining:{" "}
                {formatEta(
                  ((Date.now() - autoState.startTime) / autoState.currentIndex) *
                    (autoState.totalChairs - autoState.currentIndex)
                )}
              </p>
            )}
          </div>
        )}

        {lastAutoRun && !autoState.running && (
          <p className="text-xs text-muted-foreground">
            Last auto run: {new Date(lastAutoRun.date).toLocaleString()} — saved{" "}
            {lastAutoRun.saved} reviews across {lastAutoRun.chairs} chairs
          </p>
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
                  const status = historyRowStatus(row)
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

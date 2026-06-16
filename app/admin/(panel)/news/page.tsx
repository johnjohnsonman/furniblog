"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Brand = { slug: string; name: string }

type NewsItem = {
  id: string
  slug: string | null
  url: string
  title: string | null
  source_name: string | null
  brand: string | null
  summary: string | null
  image_url: string | null
  published_at: string | null
  status: "published" | "hidden"
  featured: boolean
}

type SingleResult = {
  brand: string
  fetched: number
  inserted: number
  skippedIrrelevant: number
}

export default function AdminNewsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState("")
  const [maxPerBrand, setMaxPerBrand] = useState(10)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<string>("")
  const [log, setLog] = useState<string[]>([])
  const [news, setNews] = useState<NewsItem[]>([])

  const addLog = useCallback((line: string) => {
    setLog((prev) => [line, ...prev].slice(0, 50))
  }, [])

  const loadNews = useCallback(async () => {
    const res = await fetch("/api/admin/news/feature?limit=200")
    const data = await res.json()
    if (Array.isArray(data.news)) setNews(data.news)
  }, [])

  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => {
        const list: Brand[] = d.brands ?? []
        setBrands(list)
        if (list.length > 0) setSelectedBrand(list[0].name)
      })
    loadNews()
  }, [loadNews])

  async function collectOne(brand: string): Promise<SingleResult | null> {
    const res = await fetch("/api/admin/news/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "single", brand, maxPerBrand }),
    })
    const data = await res.json()
    if (!res.ok) {
      addLog(`❌ ${brand}: ${data.error ?? "failed"}`)
      return null
    }
    addLog(
      `✅ ${brand}: fetched ${data.fetched}, added ${data.inserted}, skipped ${data.skippedIrrelevant}`
    )
    return data as SingleResult
  }

  async function handleCollectSingle() {
    if (!selectedBrand || busy) return
    setBusy(true)
    setProgress(`Collecting ${selectedBrand}…`)
    await collectOne(selectedBrand)
    setProgress("")
    setBusy(false)
    loadNews()
  }

  async function handleCollectAll() {
    if (busy || brands.length === 0) return
    if (
      !window.confirm(
        `Collect news for all ${brands.length} brands? This runs one brand at a time and may take a few minutes.`
      )
    )
      return

    setBusy(true)
    setLog([])
    let added = 0
    for (let i = 0; i < brands.length; i++) {
      const brand = brands[i]
      setProgress(`(${i + 1}/${brands.length}) ${brand.name}…`)
      const result = await collectOne(brand.name)
      if (result) added += result.inserted
    }
    setProgress(`Done — ${added} new articles added across ${brands.length} brands.`)
    setBusy(false)
    loadNews()
  }

  async function patchNews(
    id: string,
    update: { featured?: boolean; status?: "published" | "hidden" }
  ) {
    // Optimistic update.
    setNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...update } : n))
    )
    const res = await fetch("/api/admin/news/feature", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...update }),
    })
    if (!res.ok) {
      // Revert on failure.
      addLog("❌ update failed, reloading")
      loadNews()
    }
  }

  async function uploadThumbnail(id: string, file: File) {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch(`/api/admin/news/${id}/thumbnail`, {
      method: "POST",
      credentials: "include",
      body: form,
    })
    const data = await res.json()
    if (!res.ok) {
      addLog(`❌ thumbnail upload failed: ${data.error ?? "error"}`)
      return
    }
    setNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, image_url: data.image_url } : n))
    )
    addLog("✅ thumbnail updated")
  }

  async function clearThumbnail(id: string) {
    const res = await fetch(`/api/admin/news/${id}/thumbnail`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) {
      addLog("❌ thumbnail clear failed")
      return
    }
    setNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, image_url: null } : n))
    )
  }

  const featuredCount = news.filter((n) => n.featured && n.status === "published")
    .length

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">News Collection</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Collect brand / office-chair news from Google News, curated by Claude.
        Flag up to 3 articles as <strong>Featured</strong> for the homepage hero
        on <code className="text-xs">/news</code>.
      </p>

      {/* Collection controls */}
      <div className="mb-8 rounded-lg border border-border p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              disabled={busy}
              className="h-10 w-56 rounded-md border border-input bg-background px-3 text-sm"
            >
              {brands.map((b) => (
                <option key={b.slug} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Max / brand
            </label>
            <input
              type="number"
              min={1}
              max={25}
              value={maxPerBrand}
              onChange={(e) => setMaxPerBrand(Number(e.target.value) || 10)}
              disabled={busy}
              className="h-10 w-24 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleCollectSingle}
            disabled={busy || !selectedBrand}
            className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Collect this brand
          </button>
          <button
            type="button"
            onClick={handleCollectAll}
            disabled={busy || brands.length === 0}
            className="h-10 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
          >
            Collect all brands
          </button>
        </div>

        {progress && (
          <p className="mt-4 text-sm font-medium text-foreground">{progress}</p>
        )}
        {log.length > 0 && (
          <div className="mt-4 max-h-40 overflow-auto rounded-md bg-muted/40 p-3 font-mono text-xs">
            {log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
      </div>

      {/* News management */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium">
          Articles ({news.length})
        </h2>
        <span
          className={`text-sm ${
            featuredCount > 3 ? "text-red-600" : "text-muted-foreground"
          }`}
        >
          {featuredCount} featured{featuredCount > 3 ? " (hero shows 3)" : ""}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="w-32 px-4 py-3">Thumbnail</th>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Brand</th>
              <th className="w-24 px-4 py-3">Featured</th>
              <th className="w-24 px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No news collected yet. Run a collection above.
                </td>
              </tr>
            ) : (
              news.map((n) => (
                <tr key={n.id} className="border-b border-border align-top">
                  <td className="px-4 py-3">
                    <NewsThumbCell
                      item={n}
                      onUpload={uploadThumbnail}
                      onClear={clearThumbnail}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={n.slug ? `/news/${n.slug}` : n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground hover:underline"
                    >
                      {n.title || "(untitled)"}
                    </a>
                    {n.summary ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {n.summary}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.source_name || "News"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {n.brand || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        patchNews(n.id, { featured: !n.featured })
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                        n.featured
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {n.featured ? "★ Featured" : "☆ Feature"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        patchNews(n.id, {
                          status:
                            n.status === "published" ? "hidden" : "published",
                        })
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                        n.status === "published"
                          ? "border-border hover:bg-muted"
                          : "border-red-300 bg-red-50 text-red-700"
                      }`}
                    >
                      {n.status === "published" ? "Published" : "Hidden"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NewsThumbCell({
  item,
  onUpload,
  onClear,
}: {
  item: NewsItem
  onUpload: (id: string, file: File) => Promise<void>
  onClear: (id: string) => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    setBusy(true)
    await onUpload(item.id, file)
    setBusy(false)
  }

  return (
    <div className="w-28 space-y-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative block aspect-[16/9] w-full overflow-hidden rounded-md border border-border bg-muted transition-opacity hover:opacity-80 disabled:opacity-50"
        title="Click to upload a thumbnail"
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
            {busy ? "Uploading…" : "No image"}
          </span>
        )}
      </button>
      <div className="flex items-center justify-between text-[10px]">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {item.image_url ? "Replace" : "Upload"}
        </button>
        {item.image_url ? (
          <button
            type="button"
            onClick={() => void onClear(item.id)}
            disabled={busy}
            className="text-red-600 hover:underline disabled:opacity-50"
          >
            Clear
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"

type AuditType = "reviews" | "videos" | "news"

type Stats = { total: number; audited: number; remaining: number; flagged: number }

type FlaggedItem = {
  id: string
  audit_score: number | null
  audit_reason: string | null
  // reviews
  summary_ko?: string | null
  source?: string | null
  source_url?: string | null
  products?: { name?: string | null; brands?: { name?: string | null } | { name?: string | null }[] } | { name?: string | null }[] | null
  // videos
  title?: string | null
  youtube_id?: string | null
  // news
  url?: string | null
  brand?: string | null
}

const TYPES: { key: AuditType; label: string }[] = [
  { key: "reviews", label: "Reviews" },
  { key: "videos", label: "Videos" },
  { key: "news", label: "News" },
]

function productName(item: FlaggedItem): string {
  const p = Array.isArray(item.products) ? item.products[0] : item.products
  return p?.name?.trim() || "—"
}

function itemTitle(type: AuditType, item: FlaggedItem): string {
  if (type === "reviews") return item.summary_ko?.trim() || "(no summary)"
  return item.title?.trim() || "(untitled)"
}

function itemLink(type: AuditType, item: FlaggedItem): string | null {
  if (type === "reviews") return item.source_url ?? null
  if (type === "videos")
    return item.youtube_id ? `https://www.youtube.com/watch?v=${item.youtube_id}` : null
  return item.url ?? null
}

export default function AdminAuditPage() {
  const [type, setType] = useState<AuditType>("reviews")
  const [threshold, setThreshold] = useState(0.4)
  const [stats, setStats] = useState<Stats | null>(null)
  const [items, setItems] = useState<FlaggedItem[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState("")

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/audit?type=${type}&threshold=${threshold}`)
    const data = await res.json()
    if (data.stats) setStats(data.stats)
    if (Array.isArray(data.items)) setItems(data.items)
    setSelected(new Set())
  }, [type, threshold])

  useEffect(() => {
    load()
  }, [load])

  async function runAudit() {
    if (busy) return
    setBusy(true)
    setProgress("Starting…")
    try {
      // Loop batches until nothing is left unaudited.
      for (let i = 0; i < 200; i++) {
        const res = await fetch("/api/admin/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run", type, limit: 25 }),
        })
        const data = await res.json()
        if (!res.ok) {
          setProgress(`Error: ${data.error ?? "failed"}`)
          break
        }
        setProgress(
          `Audited ${data.processed} this batch · ${data.remaining} left…`
        )
        if (data.done || data.processed === 0) {
          setProgress(`Done. ${data.remaining} unaudited remaining.`)
          break
        }
      }
    } finally {
      setBusy(false)
      load()
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))
    )
  }

  async function deleteSelected() {
    if (selected.size === 0 || busy) return
    if (
      !window.confirm(
        `Permanently delete ${selected.size} ${type}? This cannot be undone.`
      )
    )
      return
    setBusy(true)
    try {
      const res = await fetch("/api/admin/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          type,
          ids: [...selected],
        }),
      })
      const data = await res.json()
      if (!res.ok) setProgress(`Delete failed: ${data.error ?? ""}`)
      else setProgress(`Deleted ${data.deleted}.`)
    } finally {
      setBusy(false)
      load()
    }
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">Content Audit</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Re-check stored items against their assigned product/brand with Claude.
        Items scoring below the threshold are likely mis-filed — review them and
        delete only what you choose.
      </p>

      {/* Type tabs */}
      <div className="mb-6 flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            disabled={busy}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              type === t.key
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats + controls */}
      <div className="mb-6 rounded-lg border border-border p-5">
        {stats && (
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <span>Total: <strong>{stats.total}</strong></span>
            <span className="text-muted-foreground">Audited: {stats.audited}</span>
            <span className="text-muted-foreground">Unaudited: {stats.remaining}</span>
            <span className="text-red-600">Flagged (&lt;{threshold}): {stats.flagged}</span>
          </div>
        )}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Flag threshold
            </label>
            <input
              type="number"
              step="0.05"
              min={0}
              max={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value) || 0.4)}
              disabled={busy}
              className="h-10 w-24 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={runAudit}
            disabled={busy}
            className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Working…" : `Run audit on all ${type}`}
          </button>
          <button
            type="button"
            onClick={load}
            disabled={busy}
            className="h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-40"
          >
            Refresh
          </button>
        </div>
        {progress && (
          <p className="mt-3 text-sm font-medium text-foreground">{progress}</p>
        )}
      </div>

      {/* Flagged items */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-lg font-medium">
          Flagged {type} ({items.length})
        </h2>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAll}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {selected.size === items.length ? "Clear all" : "Select all"}
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={selected.size === 0 || busy}
              className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-40"
            >
              Delete selected ({selected.size})
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="w-10 px-3 py-3"></th>
              <th className="w-16 px-3 py-3">Score</th>
              <th className="px-3 py-3">Item</th>
              <th className="px-3 py-3">Assigned / reason</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                  No flagged items. Run the audit, or lower the threshold.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const link = itemLink(type, item)
                return (
                  <tr key={item.id} className="border-b border-border align-top">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      <span
                        className={
                          (item.audit_score ?? 0) < 0.2
                            ? "text-red-600"
                            : "text-amber-600"
                        }
                      >
                        {item.audit_score?.toFixed(2) ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-foreground hover:underline"
                        >
                          {itemTitle(type, item)}
                        </a>
                      ) : (
                        <span className="font-medium text-foreground">
                          {itemTitle(type, item)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <div className="font-medium text-foreground">
                        {type === "news" ? item.brand || "—" : productName(item)}
                      </div>
                      <div className="text-xs">{item.audit_reason || ""}</div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Plus, ExternalLink, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Entry = {
  id: string
  slug: string
  title: string
  tier: string | null
  status: string
  featured: boolean
  updated_at: string
}

export default function AdminComparisonsList() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/comparisons")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to load")
      setEntries(data.entries ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function createNew() {
    setCreating(true)
    try {
      const res = await fetch("/api/admin/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled comparison" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create")
      router.push(`/admin/comparisons/${data.id}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create")
      setCreating(false)
    }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return
    const res = await fetch(`/api/admin/comparisons/${id}`, { method: "DELETE" })
    if (res.ok) setEntries((prev) => prev.filter((e) => e.id !== id))
    else alert("Delete failed")
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-2xl font-medium">Comparisons</h1>
        <Button size="sm" onClick={() => void createNew()} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-2">New comparison</span>
        </Button>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Pick two chairs, generate a data-grounded &ldquo;A vs B&rdquo; page, review, then publish to <code className="text-xs">/compare</code>.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No comparisons yet. Click “New comparison” to start.</p>
      ) : (
        <div className="rounded-xl border border-border divide-y divide-border bg-white">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
              <Link href={`/admin/comparisons/${e.id}`} className="flex-1 min-w-0">
                <div className="font-medium truncate">{e.title}</div>
                <div className="text-xs text-muted-foreground">/{e.slug}</div>
              </Link>
              {e.tier && (
                <span className="text-[10px] font-semibold uppercase tracking-wide rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                  {e.tier}
                </span>
              )}
              {e.featured && <span className="text-[11px] text-[#9a7b4f] font-semibold">FEATURED</span>}
              <span className={cn(
                "text-[11px] font-semibold rounded-full px-2 py-0.5",
                e.status === "published" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
              )}>{e.status}</span>
              {e.status === "published" && (
                <a href={`/compare/${e.slug}`} target="_blank" rel="noopener" className="text-muted-foreground hover:text-foreground" title="View live">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button onClick={() => void remove(e.id, e.title)} className="text-muted-foreground hover:text-red-600" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

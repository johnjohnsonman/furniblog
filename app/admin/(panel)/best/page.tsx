"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Plus, Trash2 } from "lucide-react"

type BestList = {
  id: string
  slug: string
  title: string
  status: "draft" | "published"
  sort_order: number
  count: number
}

export default function AdminBestPage() {
  const router = useRouter()
  const [lists, setLists] = useState<BestList[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/best")
    const data = await res.json()
    if (res.ok) setLists(data.lists ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function createList() {
    if (creating) return
    setCreating(true)
    const title = window.prompt("New list title (e.g. Best Mesh Chairs)")?.trim()
    if (!title) {
      setCreating(false)
      return
    }
    const res = await fetch("/api/admin/best", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    const data = await res.json()
    setCreating(false)
    if (res.ok) router.push(`/admin/best/${data.id}`)
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Delete the list "${title}"? This can't be undone.`)) return
    await fetch(`/api/admin/best/${id}`, { method: "DELETE" })
    void load()
  }

  return (
    <div className="max-w-4xl p-8">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium">Best Lists</h1>
        <button
          type="button"
          onClick={createList}
          disabled={creating}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          New list
        </button>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Curate ranked &ldquo;Best X chairs&rdquo; lists. Add chairs from the catalog,
        set the order, and publish to <code className="text-xs">/best</code>.
      </p>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3">List</th>
              <th className="w-24 px-4 py-3">Chairs</th>
              <th className="w-24 px-4 py-3">Status</th>
              <th className="w-16 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : lists.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No lists yet. Create one above.
                </td>
              </tr>
            ) : (
              lists.map((l) => (
                <tr key={l.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Link href={`/admin/best/${l.id}`} className="font-medium hover:underline">
                      {l.title}
                    </Link>
                    <span className="ml-2 text-xs text-muted-foreground">/{l.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.count}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        l.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(l.id, l.title)}
                      className="text-muted-foreground transition-colors hover:text-red-600"
                      title="Delete list"
                    >
                      <Trash2 className="h-4 w-4" />
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

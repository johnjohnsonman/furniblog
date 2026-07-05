"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Plus, Trash2 } from "lucide-react"

type Post = {
  id: string
  slug: string
  title: string
  status: "draft" | "published"
  featured: boolean
  updated_at: string
  gen_status: string | null
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sourceUrl, setSourceUrl] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function del(post: Post) {
    if (deletingId) return
    if (!window.confirm(`Delete "${post.title || "this post"}"? This can't be undone.`)) return
    setDeletingId(post.id)
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" })
      if (res.ok) setPosts((prev) => prev.filter((p) => p.id !== post.id))
      else {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? "Delete failed")
      }
    } catch {
      alert("Network error")
    } finally {
      setDeletingId(null)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/blog")
    const data = await res.json()
    if (res.ok) setPosts(data.posts ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function createFromUrl() {
    const url = sourceUrl.trim()
    if (!url || creating) return
    if (!/^https?:\/\//i.test(url)) {
      setError("Paste a valid http(s) URL.")
      return
    }
    setCreating(true)
    setError("")
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create post")
        return
      }
      // Jump straight into the editor; conversion auto-starts there.
      router.push(`/admin/blog/${data.id}?convert=1`)
    } catch {
      setError("Network error")
    } finally {
      setCreating(false)
    }
  }

  async function createBlank() {
    if (creating) return
    setCreating(true)
    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled post" }),
    })
    const data = await res.json()
    setCreating(false)
    if (res.ok) router.push(`/admin/blog/${data.id}`)
  }

  return (
    <div className="max-w-5xl p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">Blog</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Paste a blog article link (Korean or English). AI rewrites it into a
        clean, SEO-optimized English post with Amazon affiliate links — review,
        then publish to <code className="text-xs">/blog</code>.
      </p>

      {/* Add from URL */}
      <div className="mb-8 rounded-lg border border-[#9a7b4f]/30 bg-[#9a7b4f]/5 p-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9a7b4f]">
          Convert an article → English blog post
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void createFromUrl()
            }}
            placeholder="https://… (your Korean or English blog post)"
            disabled={creating}
            className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            style={{ minWidth: 280 }}
          />
          <button
            type="button"
            onClick={createFromUrl}
            disabled={creating || !sourceUrl.trim()}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Convert
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={createBlank}
          disabled={creating}
          className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          or start a blank post
        </button>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="px-4 py-3">Title</th>
              <th className="w-28 px-4 py-3">Status</th>
              <th className="w-32 px-4 py-3">Updated</th>
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
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No posts yet. Convert an article above.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${p.id}`} className="font-medium hover:underline">
                      {p.title}
                    </Link>
                    {p.gen_status === "generating" && (
                      <span className="ml-2 text-xs text-amber-600">converting…</span>
                    )}
                    {p.gen_status === "error" && (
                      <span className="ml-2 text-xs text-red-600">conversion error</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => void del(p)}
                      disabled={deletingId === p.id}
                      title="Delete post"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
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

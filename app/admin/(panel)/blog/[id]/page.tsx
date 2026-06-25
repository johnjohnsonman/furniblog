"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, ExternalLink, Save, Upload, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChairpediaEditor } from "@/components/admin/chairpedia-editor"
import { cn } from "@/lib/utils"

type Post = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  hero_image_url: string | null
  excerpt: string | null
  content_html: string
  source_url: string | null
  category: string | null
  featured: boolean | null
  seo_title: string | null
  seo_description: string | null
  status: string
  gen_status: string | null
  gen_error: string | null
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
}

export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const [e, setE] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [converting, setConverting] = useState(false)
  const [genError, setGenError] = useState("")
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoStarted = useRef(false)

  const set = <K extends keyof Post>(k: K, v: Post[K]) =>
    setE((prev) => (prev ? { ...prev, [k]: v } : prev))

  function startPolling() {
    if (pollRef.current) clearTimeout(pollRef.current)
    let elapsed = 0
    const tick = async () => {
      let post: Post | null = null
      try {
        const res = await fetch(`/api/admin/blog/${id}`, { cache: "no-store" })
        const data = await res.json()
        if (res.ok) post = data.post as Post
      } catch {
        /* keep polling */
      }
      if (post?.gen_status === "done") {
        setConverting(false)
        const done = post
        setE((prev) => {
          const base = prev ?? done
          const isDefaultSlug = !base.slug || /-(?:[a-z0-9]{6,})$/.test(base.slug) === false
          return {
            ...base,
            title: done.title || base.title,
            subtitle: done.subtitle,
            excerpt: done.excerpt,
            seo_title: done.seo_title,
            seo_description: done.seo_description,
            content_html: done.content_html,
            gen_status: "done",
            slug: done.title && (base.slug.startsWith("untitled-post") || base.slug.startsWith("post-"))
              ? slugify(done.title)
              : base.slug,
          }
        })
        return
      }
      if (post?.gen_status === "error") {
        setConverting(false)
        setGenError(post.gen_error ?? "Conversion failed")
        return
      }
      elapsed += 4
      if (elapsed > 320) {
        setConverting(false)
        setGenError("Taking too long — refresh in a minute.")
        return
      }
      pollRef.current = setTimeout(() => void tick(), 4000)
    }
    pollRef.current = setTimeout(() => void tick(), 4000)
  }

  const convert = useCallback(
    async (url: string) => {
      const u = url.trim()
      if (!u) return
      setConverting(true)
      setGenError("")
      try {
        const res = await fetch(`/api/admin/blog/${id}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceUrl: u }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Could not start conversion")
        startPolling()
      } catch (err) {
        setConverting(false)
        setGenError(err instanceof Error ? err.message : "Could not start conversion")
      }
    },
    [id]
  )

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/blog/${id}`)
    const data = await res.json()
    if (res.ok) {
      const post = data.post as Post
      setE(post)
      setSourceUrl(post.source_url ?? "")
      if (post.gen_status === "generating") {
        setConverting(true)
        startPolling()
      }
      // Auto-start conversion when arriving from the list "Convert" action.
      if (
        !autoStarted.current &&
        searchParams.get("convert") === "1" &&
        post.source_url &&
        post.gen_status !== "done"
      ) {
        autoStarted.current = true
        void convert(post.source_url)
      }
    }
    setLoading(false)
  }, [id, searchParams, convert])

  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current) }, [])

  async function save(nextStatus?: "draft" | "published") {
    if (!e) return
    setSaving(true)
    setMsg("")
    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: e.title,
        slug: e.slug,
        subtitle: e.subtitle,
        hero_image_url: e.hero_image_url,
        excerpt: e.excerpt,
        content_html: e.content_html,
        source_url: sourceUrl || null,
        category: e.category || null,
        featured: e.featured ?? false,
        seo_title: e.seo_title,
        seo_description: e.seo_description,
        status: nextStatus ?? e.status,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) {
      setMsg(data.error ?? "Save failed")
      return
    }
    if (nextStatus) set("status", nextStatus)
    setMsg("Saved ✓")
  }

  async function uploadHero(file: File) {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/chairpedia/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.url) set("hero_image_url", data.url)
    else alert(data.error ?? "Upload failed")
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    )
  }
  if (!e) return <div className="p-8">Not found. <Link href="/admin/blog" className="underline">Back</Link></div>

  const field = "w-full rounded-lg border border-border px-3 py-2 text-sm"
  const label = "block text-xs font-semibold text-muted-foreground mb-1"

  return (
    <div className="max-w-6xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Blog
        </Link>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          {e.status === "published" && (
            <a href={`/blog/${e.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-1.5">Save</span>
          </Button>
          {e.status === "published" ? (
            <Button size="sm" variant="ghost" onClick={() => void save("draft")} disabled={saving}>Unpublish</Button>
          ) : (
            <Button size="sm" onClick={() => void save("published")} disabled={saving}>Publish</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Convert from URL */}
          <div className="rounded-xl border border-[#9a7b4f]/30 bg-[#9a7b4f]/5 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#9a7b4f]">
              <Sparkles className="h-4 w-4" /> Convert from source URL
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                value={sourceUrl}
                onChange={(ev) => setSourceUrl(ev.target.value)}
                placeholder="https://… (Korean or English article)"
                disabled={converting}
              />
              <Button onClick={() => void convert(sourceUrl)} disabled={converting || !sourceUrl.trim()}>
                {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-1.5">{converting ? "Converting…" : "Convert"}</span>
              </Button>
            </div>
            {converting && (
              <p className="mt-2 text-xs text-muted-foreground">
                Translating + rewriting in the background (~60–90s). Keep this tab open — fields fill in automatically.
              </p>
            )}
            {genError && <p className="mt-2 text-xs text-red-600">{genError}</p>}
            <p className="mt-2 text-[11px] text-muted-foreground">
              AI rewrites the article into clean English, adds SEO fields and Amazon affiliate links. Review before publishing.
            </p>
          </div>

          <input
            className="w-full border-b border-border pb-2 font-serif text-2xl font-medium outline-none"
            value={e.title}
            onChange={(ev) => set("title", ev.target.value)}
            placeholder="Title"
          />
          <input
            className={field}
            value={e.subtitle ?? ""}
            onChange={(ev) => set("subtitle", ev.target.value)}
            placeholder="Subtitle (one line)"
          />
          <ChairpediaEditor value={e.content_html} onChange={(html) => set("content_html", html)} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div>
            <label className={label}>Status</label>
            <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold", e.status === "published" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
              {e.status}
            </span>
          </div>
          <div>
            <label className={label}>Slug (URL)</label>
            <input className={field} value={e.slug} onChange={(ev) => set("slug", ev.target.value)} />
            <p className="mt-1 text-[11px] text-muted-foreground">/blog/{e.slug}</p>
          </div>
          <div>
            <label className={label}>Hero image</label>
            {e.hero_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.hero_image_url} alt="" className="mb-2 w-full rounded-lg border border-border" />
            )}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
              <Upload className="h-4 w-4" /> {e.hero_image_url ? "Replace" : "Upload"} hero
              <input type="file" accept="image/*" className="hidden" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) void uploadHero(f); ev.target.value = "" }} />
            </label>
          </div>
          <div>
            <label className={label}>Category</label>
            <select className={field} value={e.category ?? ""} onChange={(ev) => set("category", ev.target.value || null)}>
              <option value="">— none —</option>
              <option value="Reviews">Reviews</option>
              <option value="Comparisons">Comparisons</option>
              <option value="Guides">Guides</option>
              <option value="Design Stories">Design Stories</option>
            </select>
          </div>
          <div>
            <label className={label}>Excerpt (card / SEO fallback)</label>
            <textarea className={cn(field, "h-20 resize-none")} value={e.excerpt ?? ""} onChange={(ev) => set("excerpt", ev.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={Boolean(e.featured)} onChange={(ev) => set("featured", ev.target.checked)} />
            Featured (top of blog index)
          </label>
          <div className="border-t border-border pt-2">
            <label className={label}>SEO title</label>
            <input className={field} value={e.seo_title ?? ""} onChange={(ev) => set("seo_title", ev.target.value)} placeholder="(defaults to title)" />
            <label className={cn(label, "mt-3")}>SEO description</label>
            <textarea className={cn(field, "h-20 resize-none")} value={e.seo_description ?? ""} onChange={(ev) => set("seo_description", ev.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, ExternalLink, Save, Upload, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChairpediaEditor } from "@/components/admin/chairpedia-editor"
import { cn } from "@/lib/utils"

const COLLECTIONS = [
  { slug: "icons", label: "The Icons" },
  { slug: "japanese-premium", label: "Japanese Premium" },
  { slug: "ergonomic-milestones", label: "Ergonomic Milestones" },
  { slug: "buy-now", label: "Worth It — Buy Now" },
]

type Entry = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  hero_image_url: string | null
  excerpt: string | null
  content_html: string
  origin: string | null
  collections: string[] | null
  featured: boolean | null
  seo_title: string | null
  seo_description: string | null
  status: string
  product_id: string | null
  products: { slug: string; name: string } | { slug: string; name: string }[] | null
  gen_status: string | null
  gen_error: string | null
  gen_sources: string[] | null
}

function linkedName(p: Entry["products"]): { slug: string; name: string } | null {
  if (!p) return null
  return Array.isArray(p) ? p[0] ?? null : p
}

export default function AdminChairpediaEditor() {
  const { id } = useParams<{ id: string }>()
  const [e, setE] = useState<Entry | null>(null)
  const [productSlug, setProductSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [aiName, setAiName] = useState("")
  const [generating, setGenerating] = useState(false)
  const [genTier, setGenTier] = useState<"standard" | "premium" | null>(null)
  const [aiError, setAiError] = useState("")
  const [sources, setSources] = useState<string[]>([])
  const heroRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = <K extends keyof Entry>(k: K, v: Entry[K]) =>
    setE((prev) => (prev ? { ...prev, [k]: v } : prev))

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/chairpedia/${id}`)
    const data = await res.json()
    if (res.ok) {
      const entry = data.entry as Entry
      setE(entry)
      if (entry.title && entry.title !== "Untitled entry") setAiName(entry.title)
      // Resume polling if a generation is still running (e.g. after a refresh).
      if (entry.gen_status === "generating") { setGenerating(true); startPolling() }
    }
    setLoading(false)
  }, [id])

  useEffect(() => { void load() }, [load])

  // Stop polling when leaving the page.
  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current) }, [])

  // Clear which tier is running once generation ends (done/error/timeout).
  useEffect(() => { if (!generating) setGenTier(null) }, [generating])

  async function save(nextStatus?: "draft" | "published") {
    if (!e) return
    setSaving(true); setMsg("")
    const body: Record<string, unknown> = {
      title: e.title, slug: e.slug, subtitle: e.subtitle, hero_image_url: e.hero_image_url,
      excerpt: e.excerpt, content_html: e.content_html, origin: e.origin,
      collections: e.collections ?? [], featured: e.featured ?? false,
      seo_title: e.seo_title, seo_description: e.seo_description,
      product_id: e.product_id, // persists an unlink; product_slug (below) overrides to link
      status: nextStatus ?? e.status,
    }
    if (productSlug.trim()) body.product_slug = productSlug.trim()
    const res = await fetch(`/api/admin/chairpedia/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg(data.error ?? "Save failed"); return }
    if (nextStatus) set("status", nextStatus)
    setMsg("Saved ✓")
    // If the user linked a product by slug, refresh so its name shows.
    if (productSlug.trim()) { setProductSlug(""); void load() }
  }

  async function uploadHero(file: File) {
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/admin/chairpedia/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.url) set("hero_image_url", data.url)
    else alert(data.error ?? "Upload failed")
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80)
  }

  function startPolling() {
    if (pollRef.current) clearTimeout(pollRef.current)
    let elapsed = 0
    const tick = async () => {
      let entry: Entry | null = null
      try {
        const res = await fetch(`/api/admin/chairpedia/${id}`, { cache: "no-store" })
        const data = await res.json()
        if (res.ok) entry = data.entry as Entry
      } catch { /* transient — keep polling */ }

      if (entry?.gen_status === "done") {
        setGenerating(false)
        setSources(entry.gen_sources ?? [])
        const done = entry
        setE((prev) => {
          const base = prev ?? done
          const isDefaultSlug = !base.slug || /^(untitled-entry|entry-)/.test(base.slug)
          return {
            ...base,
            title: done.title || base.title,
            subtitle: done.subtitle,
            excerpt: done.excerpt,
            seo_title: done.seo_title,
            seo_description: done.seo_description,
            origin: done.origin,
            content_html: done.content_html,
            product_id: done.product_id,
            products: done.products,
            gen_status: "done",
            slug: isDefaultSlug && done.title ? slugify(done.title) : base.slug,
          }
        })
        return
      }
      if (entry?.gen_status === "error") {
        setGenerating(false)
        setAiError(entry.gen_error ?? "Generation failed")
        return
      }
      elapsed += 4
      if (elapsed > 320) {
        setGenerating(false)
        setAiError("Generation is taking too long. It may still finish — refresh in a minute.")
        return
      }
      pollRef.current = setTimeout(() => void tick(), 4000)
    }
    pollRef.current = setTimeout(() => void tick(), 4000)
  }

  async function generate(tier: "standard" | "premium") {
    const name = aiName.trim()
    if (!name) return
    setGenTier(tier)
    setGenerating(true); setAiError(""); setSources([])
    try {
      const res = await fetch("/api/admin/chairpedia/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, chairName: name, tier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.details ?? data.error ?? "Could not start generation")
      startPolling()
    } catch (err) {
      setGenerating(false)
      setAiError(err instanceof Error ? err.message : "Could not start generation")
    }
  }

  function toggleCollection(slug: string) {
    if (!e) return
    const cur = e.collections ?? []
    set("collections", cur.includes(slug) ? cur.filter((c) => c !== slug) : [...cur, slug])
  }

  if (loading) return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
  if (!e) return <div className="p-8">Not found. <Link href="/admin/chairpedia" className="underline">Back</Link></div>

  const field = "w-full rounded-lg border border-border px-3 py-2 text-sm"
  const label = "block text-xs font-semibold text-muted-foreground mb-1"

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/chairpedia" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Chairpedia
        </Link>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          {e.status === "published" && (
            <a href={`/chairpedia/${e.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}<span className="ml-1.5">Save</span>
          </Button>
          {e.status === "published" ? (
            <Button size="sm" variant="ghost" onClick={() => void save("draft")} disabled={saving}>Unpublish</Button>
          ) : (
            <Button size="sm" onClick={() => void save("published")} disabled={saving}>Publish</Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI generate */}
          <div className="rounded-xl border border-[#9a7b4f]/30 bg-[#9a7b4f]/5 p-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#9a7b4f] mb-2">
              <Sparkles className="h-4 w-4" /> AI draft (web-researched)
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                value={aiName}
                onChange={(ev) => setAiName(ev.target.value)}
                onKeyDown={(ev) => { if (ev.key === "Enter" && !generating) void generate("standard") }}
                placeholder="Chair name — e.g. Herman Miller Aeron"
                disabled={generating}
              />
              <Button
                onClick={() => void generate("standard")}
                disabled={generating || !aiName.trim()}
                title="Standard: ~5 web searches, a solid lighter article (cheaper, faster)"
              >
                {generating && genTier === "standard" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-1.5">{generating && genTier === "standard" ? "Researching…" : "Generate"}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => void generate("premium")}
                disabled={generating || !aiName.trim()}
                title="Deep: exhaustive ~18 web searches, long authoritative article (slower, costs more)"
              >
                {generating && genTier === "premium" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-1.5">{generating && genTier === "premium" ? "Researching…" : "Deep"}</span>
              </Button>
            </div>
            {generating && <p className="text-xs text-muted-foreground mt-2">Researching in the background — usually ~90 seconds. Keep this tab open; fields fill in automatically when ready.</p>}
            {aiError && <p className="text-xs text-red-600 mt-2">{aiError}</p>}
            {sources.length > 0 && (
              <details className="mt-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer">Sources used ({sources.length})</summary>
                <ul className="mt-1 space-y-0.5">
                  {sources.map((s, i) => (
                    <li key={i}><a href={s} target="_blank" rel="noopener" className="underline break-all">{s}</a></li>
                  ))}
                </ul>
              </details>
            )}
            <p className="text-[11px] text-muted-foreground mt-2"><b>Generate</b> = standard (~5 searches, ~1.1–1.7k words). <b>Deep</b> = exhaustive (~18 searches, ~2.2–3.2k words, costs more). Both fill all fields; review before publishing.</p>
          </div>

          <input className="w-full text-2xl font-serif font-medium outline-none border-b border-border pb-2"
            value={e.title} onChange={(ev) => set("title", ev.target.value)} placeholder="Title" />
          <input className={field} value={e.subtitle ?? ""} onChange={(ev) => set("subtitle", ev.target.value)} placeholder="Subtitle (one line)" />
          <ChairpediaEditor value={e.content_html} onChange={(html) => set("content_html", html)} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div>
            <label className={label}>Status</label>
            <span className={cn("inline-block text-xs font-semibold rounded-full px-2.5 py-1",
              e.status === "published" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>{e.status}</span>
          </div>

          <div>
            <label className={label}>Slug (URL)</label>
            <input className={field} value={e.slug} onChange={(ev) => set("slug", ev.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">/chairpedia/{e.slug}</p>
          </div>

          <div>
            <label className={label}>Hero image</label>
            {e.hero_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.hero_image_url} alt="" className="w-full rounded-lg mb-2 border border-border" />
            )}
            <input ref={heroRef} type="file" accept="image/*" className="hidden"
              onChange={(ev) => { const f = ev.target.files?.[0]; if (f) void uploadHero(f); ev.target.value = "" }} />
            <Button variant="outline" size="sm" onClick={() => heroRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1.5" /> {e.hero_image_url ? "Replace" : "Upload"} hero
            </Button>
          </div>

          <div>
            <label className={label}>Excerpt (card / SEO fallback)</label>
            <textarea className={cn(field, "h-20 resize-none")} value={e.excerpt ?? ""} onChange={(ev) => set("excerpt", ev.target.value)} />
          </div>

          <div>
            <label className={label}>Linked product (Amazon buy button)</label>
            {(() => {
              const lp = linkedName(e.products)
              if (e.product_id && lp) {
                return (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm">
                    <span className="truncate"><span className="font-medium">{lp.name}</span> <span className="text-muted-foreground">/{lp.slug}</span></span>
                    <button type="button" className="text-muted-foreground hover:text-red-600 shrink-0" title="Unlink"
                      onClick={() => { setE((prev) => prev ? { ...prev, product_id: null, products: null } : prev); setProductSlug("") }}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              }
              return (
                <>
                  <input className={field} value={productSlug} onChange={(ev) => setProductSlug(ev.target.value)}
                    placeholder="e.g. herman-miller-aeron" />
                  <p className="text-[11px] text-muted-foreground mt-1">Type a catalog product slug to enable the buy button. AI Generate auto-links a match when it finds one.</p>
                </>
              )
            })()}
          </div>

          <div>
            <label className={label}>Origin (filter)</label>
            <input className={field} value={e.origin ?? ""} onChange={(ev) => set("origin", ev.target.value)} placeholder="e.g. Japan / Germany / USA" />
          </div>

          <div>
            <label className={label}>Collections (rails)</label>
            <div className="space-y-1.5">
              {COLLECTIONS.map((c) => (
                <label key={c.slug} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={(e.collections ?? []).includes(c.slug)} onChange={() => toggleCollection(c.slug)} />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={Boolean(e.featured)} onChange={(ev) => set("featured", ev.target.checked)} />
            Featured (homepage rotation)
          </label>

          <div className="pt-2 border-t border-border">
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

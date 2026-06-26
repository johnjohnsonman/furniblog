"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Loader2, ArrowLeft, ExternalLink, Save, Upload, ArrowUp, ArrowDown, X, Plus, Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Item = {
  id: string
  rank: number
  blurb: string | null
  products: { slug: string; name: string; thumbnail_url: string | null; brands: { name: string } | { name: string }[] | null } | null
}
type BestList = {
  id: string
  slug: string
  title: string
  intro: string | null
  hero_image_url: string | null
  seo_title: string | null
  seo_description: string | null
  status: string
  sort_order: number
  best_list_items: Item[]
}
type ProductHit = { slug: string; name: string; brand: string }

function brandName(b: Item["products"]): string {
  const p = b
  if (!p?.brands) return ""
  return Array.isArray(p.brands) ? (p.brands[0]?.name ?? "") : p.brands.name
}

export default function AdminBestEditor() {
  const { id } = useParams<{ id: string }>()
  const [e, setE] = useState<BestList | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [search, setSearch] = useState("")
  const [hits, setHits] = useState<ProductHit[]>([])
  const heroRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof BestList>(k: K, v: BestList[K]) =>
    setE((prev) => (prev ? { ...prev, [k]: v } : prev))

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/best/${id}`)
    const data = await res.json()
    if (res.ok) setE(data.list as BestList)
    setLoading(false)
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  // product search for adding items
  useEffect(() => {
    const q = search.trim()
    if (!q) {
      setHits([])
      return
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(q)}`)
      const data = await res.json()
      setHits((data.products ?? []).slice(0, 8))
    }, 250)
    return () => clearTimeout(t)
  }, [search])

  async function saveFields(nextStatus?: "draft" | "published") {
    if (!e) return
    setSaving(true)
    setMsg("")
    const res = await fetch(`/api/admin/best/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: e.title,
        slug: e.slug,
        intro: e.intro,
        hero_image_url: e.hero_image_url,
        seo_title: e.seo_title,
        seo_description: e.seo_description,
        sort_order: e.sort_order,
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

  async function addItem(slug: string) {
    const res = await fetch(`/api/admin/best/${id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug: slug }),
    })
    if (!res.ok) {
      const d = await res.json()
      setMsg(d.error ?? "Add failed")
    }
    setSearch("")
    setHits([])
    void load()
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/admin/best/${id}/items?itemId=${itemId}`, { method: "DELETE" })
    void load()
  }

  async function move(index: number, dir: -1 | 1) {
    if (!e) return
    const items = [...e.best_list_items]
    const j = index + dir
    if (j < 0 || j >= items.length) return
    const a = items[index]
    const b = items[j]
    const ar = a.rank
    a.rank = b.rank
    b.rank = ar
    await fetch(`/api/admin/best/${id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: a.id, rank: a.rank }, { id: b.id, rank: b.rank }] }),
    })
    void load()
  }

  async function saveBlurb(itemId: string, blurb: string) {
    await fetch(`/api/admin/best/${id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: itemId, blurb }] }),
    })
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
  if (!e) return <div className="p-8">Not found. <Link href="/admin/best" className="underline">Back</Link></div>

  const field = "w-full rounded-lg border border-border px-3 py-2 text-sm"
  const label = "block text-xs font-semibold text-muted-foreground mb-1"
  const items = [...e.best_list_items].sort((a, b) => a.rank - b.rank)

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/best" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Best Lists
        </Link>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          {e.status === "published" && (
            <a href={`/best/${e.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              View <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => void saveFields()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="ml-1.5">Save</span>
          </Button>
          {e.status === "published" ? (
            <Button size="sm" variant="ghost" onClick={() => void saveFields("draft")} disabled={saving}>Unpublish</Button>
          ) : (
            <Button size="sm" onClick={() => void saveFields("published")} disabled={saving}>Publish</Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Fields */}
        <div className="space-y-4 lg:col-span-1">
          <div>
            <label className={label}>Title</label>
            <input className={field} value={e.title} onChange={(ev) => set("title", ev.target.value)} />
          </div>
          <div>
            <label className={label}>Slug (URL)</label>
            <input className={field} value={e.slug} onChange={(ev) => set("slug", ev.target.value)} />
            <p className="mt-1 text-[11px] text-muted-foreground">/best/{e.slug}</p>
          </div>
          <div>
            <label className={label}>Intro</label>
            <textarea className={cn(field, "h-24 resize-none")} value={e.intro ?? ""} onChange={(ev) => set("intro", ev.target.value)} placeholder="Short intro shown under the title" />
          </div>
          <div>
            <label className={label}>Hero image</label>
            {e.hero_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.hero_image_url} alt="" className="mb-2 w-full rounded-lg border border-border" />
            )}
            <input ref={heroRef} type="file" accept="image/*" className="hidden" onChange={(ev) => { const f = ev.target.files?.[0]; if (f) void uploadHero(f); ev.target.value = "" }} />
            <Button variant="outline" size="sm" onClick={() => heroRef.current?.click()}>
              <Upload className="mr-1.5 h-4 w-4" /> {e.hero_image_url ? "Replace" : "Upload"} image
            </Button>
            {e.hero_image_url && (
              <button type="button" onClick={() => set("hero_image_url", null)} className="ml-3 text-xs text-red-600 hover:underline">
                Remove
              </button>
            )}
          </div>
          <div>
            <label className={label}>Sort order (lower = first)</label>
            <input type="number" className={field} value={e.sort_order} onChange={(ev) => set("sort_order", Number(ev.target.value) || 0)} />
          </div>
          <div className="border-t border-border pt-3">
            <label className={label}>SEO title</label>
            <input className={field} value={e.seo_title ?? ""} onChange={(ev) => set("seo_title", ev.target.value)} placeholder="(defaults to title)" />
            <label className={cn(label, "mt-3")}>SEO description</label>
            <textarea className={cn(field, "h-20 resize-none")} value={e.seo_description ?? ""} onChange={(ev) => set("seo_description", ev.target.value)} />
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-serif text-lg font-medium">Chairs in this list ({items.length})</h2>

          {/* Add */}
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-10 w-full rounded-lg border border-border pl-9 pr-3 text-sm"
              value={search}
              onChange={(ev) => setSearch(ev.target.value)}
              placeholder="Search the catalog to add a chair…"
            />
            {hits.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white shadow-lg">
                {hits.map((h) => (
                  <button
                    key={h.slug}
                    type="button"
                    onClick={() => void addItem(h.slug)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span><span className="font-medium">{h.name}</span> <span className="text-muted-foreground">· {h.brand}</span></span>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              No chairs yet. Search above to add some.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={it.id} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span className="text-sm font-semibold text-muted-foreground">{i + 1}</span>
                    <button type="button" onClick={() => void move(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => void move(i, 1)} disabled={i === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                  </div>
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                    {it.products?.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.products.thumbnail_url} alt="" className="h-full w-full object-contain p-1" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{it.products?.name ?? "(missing product)"}</p>
                    <p className="text-xs text-muted-foreground">{brandName(it.products)}</p>
                    <input
                      className="mt-2 w-full rounded border border-border px-2 py-1 text-xs"
                      defaultValue={it.blurb ?? ""}
                      placeholder="Why it's here (optional, shown on the list)…"
                      onBlur={(ev) => void saveBlurb(it.id, ev.target.value)}
                    />
                  </div>
                  <button type="button" onClick={() => void removeItem(it.id)} className="text-muted-foreground hover:text-red-600" title="Remove">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, ExternalLink, Save, Upload } from "lucide-react"
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
}

export default function AdminChairpediaEditor() {
  const { id } = useParams<{ id: string }>()
  const [e, setE] = useState<Entry | null>(null)
  const [productSlug, setProductSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const heroRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof Entry>(k: K, v: Entry[K]) =>
    setE((prev) => (prev ? { ...prev, [k]: v } : prev))

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/chairpedia/${id}`)
    const data = await res.json()
    if (res.ok) setE(data.entry as Entry)
    setLoading(false)
  }, [id])

  useEffect(() => { void load() }, [load])

  async function save(nextStatus?: "draft" | "published") {
    if (!e) return
    setSaving(true); setMsg("")
    const body: Record<string, unknown> = {
      title: e.title, slug: e.slug, subtitle: e.subtitle, hero_image_url: e.hero_image_url,
      excerpt: e.excerpt, content_html: e.content_html, origin: e.origin,
      collections: e.collections ?? [], featured: e.featured ?? false,
      seo_title: e.seo_title, seo_description: e.seo_description,
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
  }

  async function uploadHero(file: File) {
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/admin/chairpedia/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (data.url) set("hero_image_url", data.url)
    else alert(data.error ?? "Upload failed")
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
            <label className={label}>Linked product (slug)</label>
            <input className={field} value={productSlug} onChange={(ev) => setProductSlug(ev.target.value)}
              placeholder={e.product_id ? "(linked — type to change)" : "e.g. herman-miller-aeron"} />
            <p className="text-[11px] text-muted-foreground mt-1">Enables the Amazon buy button.</p>
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

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft, ExternalLink, Save, Upload, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChairpediaEditor } from "@/components/admin/chairpedia-editor"
import { cn } from "@/lib/utils"

type Entry = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  hero_image_url: string | null
  excerpt: string | null
  content_html: string
  tier: string | null
  featured: boolean | null
  seo_title: string | null
  seo_description: string | null
  status: string
  gen_status: string | null
  gen_error: string | null
  gen_cost_usd: number | null
  gen_input_tokens: number | null
  gen_output_tokens: number | null
}

type ProductOption = { slug: string; name: string; brand: string }

export default function AdminComparisonEditor() {
  const { id } = useParams<{ id: string }>()
  const [e, setE] = useState<Entry | null>(null)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [aSlug, setASlug] = useState("")
  const [bSlug, setBSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [generating, setGenerating] = useState(false)
  const [aiError, setAiError] = useState("")
  const heroRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = <K extends keyof Entry>(k: K, v: Entry[K]) =>
    setE((prev) => (prev ? { ...prev, [k]: v } : prev))

  function startPolling() {
    if (pollRef.current) clearTimeout(pollRef.current)
    let elapsed = 0
    const tick = async () => {
      let entry: Entry | null = null
      try {
        const res = await fetch(`/api/admin/comparisons/${id}`, { cache: "no-store" })
        const data = await res.json()
        if (res.ok) entry = data.entry as Entry
      } catch { /* keep polling */ }

      if (entry?.gen_status === "done") {
        setGenerating(false)
        const done = entry
        setE((prev) => {
          const base = prev ?? done
          const isDefaultSlug = !base.slug || /^(untitled-comparison|comparison-)/.test(base.slug)
          return {
            ...base,
            title: done.title || base.title,
            subtitle: done.subtitle,
            excerpt: done.excerpt,
            seo_title: done.seo_title,
            seo_description: done.seo_description,
            tier: done.tier,
            content_html: done.content_html,
            gen_status: "done",
            gen_cost_usd: done.gen_cost_usd,
            gen_input_tokens: done.gen_input_tokens,
            gen_output_tokens: done.gen_output_tokens,
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
        setAiError("Generation is taking too long — refresh in a minute.")
        return
      }
      pollRef.current = setTimeout(() => void tick(), 4000)
    }
    pollRef.current = setTimeout(() => void tick(), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [cRes, pRes] = await Promise.all([
      fetch(`/api/admin/comparisons/${id}`),
      fetch("/api/admin/products"),
    ])
    const cData = await cRes.json()
    const pData = await pRes.json().catch(() => ({}))
    if (cRes.ok) {
      setE(cData.entry as Entry)
      setASlug(cData.productASlug ?? "")
      setBSlug(cData.productBSlug ?? "")
      if ((cData.entry as Entry).gen_status === "generating") {
        setGenerating(true)
        startPolling()
      }
    }
    setProducts(
      ((pData.products ?? []) as { slug: string; name: string; brand: string }[])
        .map((p) => ({ slug: p.slug, name: p.name, brand: p.brand }))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => { void load() }, [load])
  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current) }, [])

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90)
  }

  async function save(nextStatus?: "draft" | "published") {
    if (!e) return
    setSaving(true); setMsg("")
    const res = await fetch(`/api/admin/comparisons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: e.title, slug: e.slug, subtitle: e.subtitle, hero_image_url: e.hero_image_url,
        excerpt: e.excerpt, content_html: e.content_html, tier: e.tier ?? "mixed",
        featured: e.featured ?? false, seo_title: e.seo_title, seo_description: e.seo_description,
        product_a_slug: aSlug, product_b_slug: bSlug,
        status: nextStatus ?? e.status,
      }),
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

  async function generate() {
    if (!aSlug || !bSlug) { setAiError("Pick both chairs first."); return }
    if (aSlug === bSlug) { setAiError("Pick two different chairs."); return }
    setGenerating(true); setAiError("")
    try {
      const res = await fetch(`/api/admin/comparisons/${id}/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productASlug: aSlug, productBSlug: bSlug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Could not start generation")
      startPolling()
    } catch (err) {
      setGenerating(false)
      setAiError(err instanceof Error ? err.message : "Could not start generation")
    }
  }

  if (loading) return <div className="p-8 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
  if (!e) return <div className="p-8">Not found. <Link href="/admin/comparisons" className="underline">Back</Link></div>

  const field = "w-full rounded-lg border border-border px-3 py-2 text-sm"
  const label = "block text-xs font-semibold text-muted-foreground mb-1"
  const ProductSelect = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
    <select className={field} value={value} onChange={(ev) => onChange(ev.target.value)} disabled={generating}>
      <option value="">{placeholder}</option>
      {products.map((p) => (
        <option key={p.slug} value={p.slug}>{p.brand ? `${p.brand} — ${p.name}` : p.name}</option>
      ))}
    </select>
  )

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/comparisons" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Comparisons
        </Link>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm text-green-600">{msg}</span>}
          {e.status === "published" && (
            <a href={`/compare/${e.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
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
        <div className="lg:col-span-2 space-y-4">
          {/* AI generate */}
          <div className="rounded-xl border border-[#9a7b4f]/30 bg-[#9a7b4f]/5 p-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#9a7b4f] mb-3">
              <Sparkles className="h-4 w-4" /> Generate comparison (data-grounded)
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ProductSelect value={aSlug} onChange={setASlug} placeholder="Pick chair A…" />
              <ProductSelect value={bSlug} onChange={setBSlug} placeholder="Pick chair B…" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button onClick={() => void generate()} disabled={generating || !aSlug || !bSlug}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-1.5">{generating ? "Generating…" : "Generate"}</span>
              </Button>
            </div>
            {generating && <p className="text-xs text-muted-foreground mt-2">Writing the comparison from real specs + reviews (~60–90s). Keep this tab open.</p>}
            {!generating && e.gen_cost_usd != null && (
              <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 rounded-md bg-[#9a7b4f]/10 px-2.5 py-1.5 text-xs text-[#7a5f3a]">
                <span className="font-semibold">AI cost: ${e.gen_cost_usd.toFixed(4)}</span>
                {e.gen_input_tokens != null && e.gen_output_tokens != null && (
                  <span>· {(e.gen_input_tokens / 1000).toFixed(1)}k in / {(e.gen_output_tokens / 1000).toFixed(1)}k out</span>
                )}
              </div>
            )}
            {aiError && <p className="text-xs text-red-600 mt-2">{aiError}</p>}
            <p className="mt-2 text-[11px] text-muted-foreground">
              Uses only catalog specs + real review data — no invented facts. Review before publishing.
            </p>
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
            <p className="text-[11px] text-muted-foreground mt-1">/compare/{e.slug}</p>
          </div>
          <div>
            <label className={label}>Tier</label>
            <select className={field} value={e.tier ?? "mixed"} onChange={(ev) => set("tier", ev.target.value)}>
              <option value="premium">Premium</option>
              <option value="value">Value / bestseller</option>
              <option value="mixed">Mixed</option>
            </select>
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
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={Boolean(e.featured)} onChange={(ev) => set("featured", ev.target.checked)} />
            Featured
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

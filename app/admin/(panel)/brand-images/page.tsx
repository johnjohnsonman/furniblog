"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Trash2, Upload, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const MAX_IMAGES = 4

type BrandRow = {
  id: string
  slug: string
  name: string
  logo: string | null
  images: string[]
}

const PAGE_SIZE = 24

export default function AdminBrandImagesPage() {
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [search, setSearch] = useState("")
  const [missingOnly, setMissingOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/brands")
    const data = await res.json()
    setBrands(
      (data.brands ?? []).map((b: { id?: string; slug?: string; name?: string; logo_url?: string | null; images?: string[] }) => ({
        id: b.id ?? "",
        slug: b.slug ?? "",
        name: b.name ?? "",
        logo: b.logo_url ?? null,
        images: b.images ?? [],
      }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const isEmpty = (b: BrandRow) => !b.logo && b.images.length === 0
    return brands
      .filter((b) => {
        if (missingOnly && !isEmpty(b)) return false
        if (q && !b.name.toLowerCase().includes(q) && !b.slug.toLowerCase().includes(q)) return false
        return true
      })
      // Brands with nothing yet float to the top so they're easy to fill in.
      .sort((a, b) => {
        const ae = isEmpty(a), be = isEmpty(b)
        if (ae !== be) return ae ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  }, [brands, search, missingOnly])

  useEffect(() => setPage(1), [search, missingOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const missingCount = brands.filter((b) => !b.logo && b.images.length === 0).length

  function updateImages(slug: string, images: string[]) {
    setBrands((prev) => prev.map((b) => (b.slug === slug ? { ...b, images } : b)))
  }

  function updateLogo(slug: string, logo: string | null) {
    setBrands((prev) => prev.map((b) => (b.slug === slug ? { ...b, logo } : b)))
  }

  return (
    <div className="p-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium">Brand Images</h1>
        <span className="text-sm text-muted-foreground">
          {brands.length - missingCount}/{brands.length} have a logo or image
          {missingCount > 0 ? ` · ${missingCount} empty` : ""}
        </span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Add the official <b>logo</b> (shown on the brands grid &amp; cards) plus up to{" "}
        {MAX_IMAGES} photos for the brand-page carousel. Reorder photos with the arrows.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search brands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button variant={missingOnly ? "default" : "outline"} onClick={() => setMissingOnly((v) => !v)}>
          {missingOnly ? "✓ Empty only" : "Empty only"}
        </Button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
      ) : pageItems.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No brands match.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((b) => (
            <BrandImageCard key={b.id} brand={b} onChange={updateImages} onLogo={updateLogo} />
          ))}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="mt-8 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </Button>
            <span className="text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function BrandImageCard({
  brand,
  onChange,
  onLogo,
}: {
  brand: BrandRow
  onChange: (slug: string, images: string[]) => void
  onLogo: (slug: string, logo: string | null) => void
}) {
  const imgInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const full = brand.images.length >= MAX_IMAGES

  async function uploadImages(files: FileList) {
    setBusy(true)
    setError("")
    try {
      let latest = brand.images
      for (const file of Array.from(files)) {
        if (latest.length >= MAX_IMAGES) {
          setError(`Up to ${MAX_IMAGES} photos`)
          break
        }
        const form = new FormData()
        form.append("file", file)
        const res = await fetch(`/api/admin/brands/${brand.slug}/images`, {
          method: "POST",
          credentials: "include",
          body: form,
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? "Upload failed")
          break
        }
        latest = data.images ?? latest
        onChange(brand.slug, latest)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error")
    } finally {
      setBusy(false)
    }
  }

  async function setImages(images: string[]) {
    onChange(brand.slug, images) // optimistic
    setError("")
    const res = await fetch(`/api/admin/brands/${brand.slug}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ images }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error ?? "Update failed")
    else onChange(brand.slug, data.images ?? images)
  }

  async function uploadLogo(file: File) {
    setBusy(true)
    setError("")
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`/api/admin/brands/${brand.slug}/logo`, {
        method: "POST",
        credentials: "include",
        body: form,
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? "Logo upload failed")
      else onLogo(brand.slug, data.logo_url ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error")
    } finally {
      setBusy(false)
    }
  }

  async function removeLogo() {
    onLogo(brand.slug, null) // optimistic
    const res = await fetch(`/api/admin/brands/${brand.slug}/logo`, {
      method: "DELETE",
      credentials: "include",
    })
    if (!res.ok) setError("Could not remove logo")
  }

  const remove = (url: string) => setImages(brand.images.filter((u) => u !== url))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= brand.images.length) return
    const next = [...brand.images]
    ;[next[i], next[j]] = [next[j], next[i]]
    setImages(next)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4">
      <p className="font-medium leading-tight text-foreground">{brand.name}</p>

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
          {brand.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt="" className="h-full w-full object-contain p-1.5" />
          ) : (
            <span className="text-[10px] text-muted-foreground">No logo</span>
          )}
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => logoInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" />
            <span className="ml-1.5">{brand.logo ? "Replace logo" : "Add logo"}</span>
          </Button>
          {brand.logo && (
            <button type="button" onClick={() => void removeLogo()} className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
      </div>

      {/* Photos (up to MAX_IMAGES, reorderable) */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Photos {brand.images.length}/{MAX_IMAGES}
        </span>
        <Button size="sm" variant="outline" disabled={busy || full} onClick={() => imgInputRef.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="ml-1.5">{full ? "Full" : "Add"}</span>
        </Button>
      </div>

      {brand.images.length === 0 ? (
        <button
          type="button"
          onClick={() => imgInputRef.current?.click()}
          className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted"
        >
          {busy ? "Uploading…" : "No photos — click to upload"}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {brand.images.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                {i + 1}
              </span>
              <button
                type="button"
                title="Remove"
                onClick={() => remove(url)}
                className="absolute right-1 top-1 rounded bg-white/90 p-1 text-red-600 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  title="Move left"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="rounded bg-white/90 p-1 text-foreground hover:bg-white disabled:opacity-30"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Move right"
                  disabled={i === brand.images.length - 1}
                  onClick={() => move(i, 1)}
                  className="rounded bg-white/90 p-1 text-foreground hover:bg-white disabled:opacity-30"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={logoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void uploadLogo(f)
          e.target.value = ""
        }}
      />
      <input
        ref={imgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void uploadImages(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}

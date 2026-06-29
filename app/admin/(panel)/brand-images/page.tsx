"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Star, Trash2, Upload, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type BrandRow = {
  id: string
  slug: string
  name: string
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
      (data.brands ?? []).map((b: Partial<BrandRow>) => ({
        id: b.id ?? "",
        slug: b.slug ?? "",
        name: b.name ?? "",
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
    return brands
      .filter((b) => {
        if (missingOnly && b.images.length > 0) return false
        if (q && !b.name.toLowerCase().includes(q) && !b.slug.toLowerCase().includes(q)) return false
        return true
      })
      // Brands with no image float to the top so they're easy to fill in.
      .sort((a, b) => {
        const ae = a.images.length === 0, be = b.images.length === 0
        if (ae !== be) return ae ? -1 : 1
        return a.name.localeCompare(b.name)
      })
  }, [brands, search, missingOnly])

  useEffect(() => setPage(1), [search, missingOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const missingCount = brands.filter((b) => b.images.length === 0).length

  function updateImages(slug: string, images: string[]) {
    setBrands((prev) => prev.map((b) => (b.slug === slug ? { ...b, images } : b)))
  }

  return (
    <div className="p-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium">Brand Images</h1>
        <span className="text-sm text-muted-foreground">
          {brands.length - missingCount}/{brands.length} have images
          {missingCount > 0 ? ` · ${missingCount} empty` : ""}
        </span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload one or more photos per brand. The first image is the cover and powers the
        carousel on the public brand page. Use ★ to set the cover; drag isn&apos;t needed.
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
            <BrandImageCard key={b.id} brand={b} onChange={updateImages} />
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
}: {
  brand: BrandRow
  onChange: (slug: string, images: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function uploadFiles(files: FileList) {
    setBusy(true)
    setError("")
    try {
      let latest = brand.images
      for (const file of Array.from(files)) {
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
    if (!res.ok) {
      setError(data.error ?? "Update failed")
      void 0
    } else {
      onChange(brand.slug, data.images ?? images)
    }
  }

  const remove = (url: string) => setImages(brand.images.filter((u) => u !== url))
  const makeCover = (url: string) => setImages([url, ...brand.images.filter((u) => u !== url)])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium leading-tight text-foreground">{brand.name}</p>
          <p className="text-xs text-muted-foreground">
            {brand.images.length} image{brand.images.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="ml-1.5">Add</span>
        </Button>
      </div>

      {brand.images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted"
        >
          {busy ? "Uploading…" : "No images — click to upload"}
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {brand.images.map((url, i) => (
            <div key={url} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-contain p-2" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 ? (
                  <button
                    type="button"
                    title="Set as cover"
                    onClick={() => makeCover(url)}
                    className="rounded bg-white/90 p-1 text-foreground hover:bg-white"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                ) : <span />}
                <button
                  type="button"
                  title="Remove"
                  onClick={() => remove(url)}
                  className="rounded bg-white/90 p-1 text-red-600 hover:bg-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void uploadFiles(e.target.files)
          e.target.value = ""
        }}
      />
    </div>
  )
}

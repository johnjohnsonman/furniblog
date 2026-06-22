"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ProductRow = {
  id: string
  slug: string
  name: string
  brand: string
  brandSlug: string
  category: string
  thumbnailUrl: string | null
  hasImage: boolean
}

const PAGE_SIZE = 24

export default function AdminChairImagesPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [brands, setBrands] = useState<{ slug: string; name: string }[]>([])
  const [search, setSearch] = useState("")
  const [brand, setBrand] = useState("all")
  const [missingOnly, setMissingOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/products")
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []))
      .catch(() => {})
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products
      .filter((p) => {
        if (brand !== "all" && p.brandSlug !== brand) return false
        if (missingOnly && p.hasImage) return false
        if (
          q &&
          !p.name.toLowerCase().includes(q) &&
          !p.brand.toLowerCase().includes(q) &&
          !p.slug.toLowerCase().includes(q)
        )
          return false
        return true
      })
      // Chairs without an image float to the top so they're easy to fill in.
      .sort((a, b) => {
        if (a.hasImage !== b.hasImage) return a.hasImage ? 1 : -1
        return a.name.localeCompare(b.name)
      })
  }, [products, search, brand, missingOnly])

  // Reset to first page whenever the filter set changes.
  useEffect(() => {
    setPage(1)
  }, [search, brand, missingOnly])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const missingCount = products.filter((p) => !p.hasImage).length

  function handleUploaded(id: string, thumbnailUrl: string | null) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, thumbnailUrl, hasImage: Boolean(thumbnailUrl) }
          : p
      )
    )
  }

  return (
    <div className="p-8">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl font-medium">Chair Images</h1>
        <span className="text-sm text-muted-foreground">
          {products.length - missingCount}/{products.length} have an image
          {missingCount > 0 ? ` · ${missingCount} missing` : ""}
        </span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Upload a photo for each chair. The first image becomes the product
        thumbnail and shows on the public product cards immediately.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search chairs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.slug} value={b.slug}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={missingOnly ? "default" : "outline"}
          onClick={() => setMissingOnly((v) => !v)}
        >
          {missingOnly ? "✓ Missing only" : "Missing only"}
        </Button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : pageItems.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No chairs match the current filter.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((p) => (
            <ChairImageCard key={p.id} product={p} onUploaded={handleUploaded} />
          ))}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="mt-8 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <span className="text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ChairImageCard({
  product,
  onUploaded,
}: {
  product: ProductRow
  onUploaded: (id: string, thumbnailUrl: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function uploadFile(file: File) {
    setBusy(true)
    setError("")
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch(`/api/admin/products/${product.id}/images`, {
        method: "POST",
        credentials: "include",
        body: form,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Upload failed")
        return
      }
      const url: string | null =
        data.thumbnailUrl ?? data.images?.[0]?.url ?? null
      onUploaded(product.id, url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-white">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="relative block aspect-square w-full overflow-hidden bg-muted transition-opacity hover:opacity-90 disabled:opacity-60"
        title="Click to upload an image"
      >
        {product.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {busy ? "Uploading…" : "No image"}
          </span>
        )}
        {busy && product.thumbnailUrl ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white">
            Uploading…
          </span>
        ) : null}
      </button>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-h-[2.5rem]">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        </div>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-auto h-8 rounded-md border border-border text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
        >
          {product.thumbnailUrl ? "Replace image" : "Upload image"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void uploadFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}

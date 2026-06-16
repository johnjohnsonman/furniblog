"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BulkAmazonLinksButton } from "@/components/admin/BulkAmazonLinksButton"

type ProductRow = {
  id: string
  slug: string
  name: string
  brand: string
  brandSlug: string
  category: string
  priceUsd: number | null
  published: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [search, setSearch] = useState("")
  const [brand, setBrand] = useState("all")
  const [brands, setBrands] = useState<{ slug: string; name: string }[]>([])
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (brand !== "all") params.set("brand", brand)
    const res = await fetch(`/api/admin/products?${params}`)
    const data = await res.json()
    setProducts(data.products ?? [])
    setPage(1)
  }, [search, brand])

  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []))
    void load()
  }, [load])

  async function togglePublished(id: string, published: boolean) {
    const product = products.find((p) => p.id === id)
    if (!product) return
    await fetch(`/api/admin/products/${product.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, published, brandSlug: product.brandSlug }),
    })
    void load()
  }

  async function deleteProduct(slug: string) {
    if (!confirm("Delete this product?")) return
    await fetch(`/api/admin/products/${slug}`, { method: "DELETE" })
    void load()
  }

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-medium">Products</h1>
        <div className="flex flex-wrap gap-2">
          <BulkAmazonLinksButton mode="missing" />
          <BulkAmazonLinksButton mode="all" label="Amazon: replace all" />
          <Button asChild>
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search products…"
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
        <Button variant="outline" onClick={() => void load()}>
          Apply
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Brand</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Published</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
              .map((p, i) => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-3 px-4 text-muted-foreground">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="py-3 px-4 font-medium">{p.name}</td>
                <td className="py-3 px-4">{p.brand}</td>
                <td className="py-3 px-4 capitalize">{p.category}</td>
                <td className="py-3 px-4">
                  {p.priceUsd ? `$${p.priceUsd.toLocaleString()}` : "—"}
                </td>
                <td className="py-3 px-4">
                  <Switch
                    checked={p.published}
                    onCheckedChange={(v) => void togglePublished(p.id, v)}
                  />
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/products/${p.slug}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => void deleteProduct(p.slug)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, products.length)} of {products.length}
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
              {page} / {Math.ceil(products.length / PAGE_SIZE)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(products.length / PAGE_SIZE)}
              onClick={() =>
                setPage((p) =>
                  Math.min(Math.ceil(products.length / PAGE_SIZE), p + 1)
                )
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

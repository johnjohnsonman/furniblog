"use client"

import { useEffect, useState } from "react"

type Brand = { slug: string; name: string }

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []))
  }, [])

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-serif text-2xl font-medium mb-8">Brands</h1>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Slug</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b, i) => (
              <tr key={b.slug} className="border-b border-border">
                <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                <td className="py-3 px-4 font-medium">{b.name}</td>
                <td className="py-3 px-4 font-mono text-xs">{b.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

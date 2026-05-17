"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Stats = {
  totalProducts: number
  publishedProducts: number
  totalReviews: number
  clicksToday: number
  recentProducts: {
    slug: string
    name: string
    brand: string
    published: boolean
  }[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-serif text-2xl font-medium mb-8">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {[
          { label: "Total Products", value: stats?.totalProducts },
          { label: "Published", value: stats?.publishedProducts },
          { label: "Total Reviews", value: stats?.totalReviews },
          { label: "Affiliate Clicks Today", value: stats?.clicksToday },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-3xl font-semibold mt-2">{card.value ?? "—"}</p>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-medium mb-4">Recently added products</h2>
        <div className="border border-border rounded-lg divide-y divide-border">
          {(stats?.recentProducts ?? []).map((p) => (
            <div
              key={p.slug}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-muted-foreground">{p.brand}</p>
              </div>
              <span
                className={
                  p.published ? "text-green-600" : "text-muted-foreground"
                }
              >
                {p.published ? "Published" : "Draft"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/products/new">Add Product</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/reviews/new">Add Review</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/analytics">View Analytics</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

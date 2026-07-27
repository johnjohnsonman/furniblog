"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ComparisonCard = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  hero_image_url: string | null
  tier: string | null
}

const PAGE_SIZE = 12
const TIER_LABEL: Record<string, string> = {
  premium: "Premium",
  value: "Value",
  mixed: "Mixed",
}

function Card({ c }: { c: ComparisonCard }) {
  return (
    <Link
      href={`/compare/${c.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-[0_10px_34px_rgba(0,0,0,0.07)]"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        {c.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.hero_image_url} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Furniblog</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {c.tier && (
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-premium-accent">
            {TIER_LABEL[c.tier] ?? c.tier}
          </span>
        )}
        <h2 className="mt-1.5 font-serif text-xl font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
          {c.title}
        </h2>
        {(c.excerpt || c.subtitle) && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {c.excerpt || c.subtitle}
          </p>
        )}
      </div>
    </Link>
  )
}

export function ComparisonsIndex({ cards }: { cards: ComparisonCard[] }) {
  const [tier, setTier] = useState("All")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const tiers = useMemo(() => {
    const set = new Set<string>()
    for (const c of cards) if (c.tier) set.add(c.tier)
    return ["All", ...["premium", "value", "mixed"].filter((t) => set.has(t))]
  }, [cards])

  const q = search.trim().toLowerCase()
  const filtered = useMemo(() => {
    let list = tier === "All" ? cards : cards.filter((c) => c.tier === tier)
    if (q) {
      list = list.filter((c) =>
        [c.title, c.subtitle, c.excerpt].some((f) => f && f.toLowerCase().includes(q))
      )
    }
    return list
  }, [cards, tier, q])

  useEffect(() => setPage(1), [tier, search])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (cards.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">No comparisons yet.</p>
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {tiers.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {tiers.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  tier === t
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-foreground hover:border-foreground/30"
                )}
              >
                {t === "All" ? "All" : TIER_LABEL[t] ?? t}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comparisons…"
            aria-label="Search comparisons"
            className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-9 text-sm focus:border-foreground/30 focus:outline-none"
          />
          {search && (
            <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {pageItems.length > 0 ? (
        <>
          {q && (
            <p className="mb-5 text-sm text-muted-foreground">
              {filtered.length} result{filtered.length === 1 ? "" : "s"} for &ldquo;{search.trim()}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((c) => (
              <Card key={c.slug} c={c} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3 text-sm">
              <button type="button" disabled={page <= 1} onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }} className="rounded-md border border-border bg-background px-4 py-2 font-medium transition-colors hover:border-foreground/30 disabled:opacity-40">Prev</button>
              <span className="px-2 text-muted-foreground">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }} className="rounded-md border border-border bg-background px-4 py-2 font-medium transition-colors hover:border-foreground/30 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {q ? `No comparisons found for “${search.trim()}”.` : "No comparisons in this tier yet."}
        </p>
      )}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search, ArrowRight, ShieldCheck, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type ChairpediaCard = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  heroImage: string | null
  origin: string | null
  collections: string[]
  featured: boolean
  brand: string | null
  category: string | null
}

// Editor-curated collection rails. An entry joins a rail via its `collections` field.
const COLLECTIONS: { slug: string; label: string }[] = [
  { slug: "icons", label: "The Icons" },
  { slug: "japanese-premium", label: "Japanese Premium" },
  { slug: "ergonomic-milestones", label: "Ergonomic Milestones" },
  { slug: "buy-now", label: "Worth It — Buy Now" },
]

const CATEGORY_LABELS: Record<string, string> = {
  office: "Office",
  executive: "Executive",
  gaming: "Gaming",
  standing: "Standing",
  study: "Study",
  lounge: "Lounge",
  conference: "Conference",
}

function Card({ e, large = false }: { e: ChairpediaCard; large?: boolean }) {
  return (
    <Link
      href={`/chairpedia/${e.slug}`}
      className="group block rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow bg-white"
    >
      <div className={cn("bg-muted overflow-hidden", large ? "aspect-[16/10]" : "aspect-[4/3]")}>
        {e.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={e.heroImage}
            alt={e.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="p-4">
        {e.brand && (
          <div className="text-[11px] uppercase tracking-wider text-[#9a7b4f] font-semibold mb-1 line-clamp-1">
            {e.brand}
          </div>
        )}
        <h3 className={cn("font-serif font-medium text-foreground leading-snug", large ? "text-xl" : "text-base")}>
          {e.title}
        </h3>
        {(e.subtitle || e.excerpt) && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{e.subtitle || e.excerpt}</p>
        )}
      </div>
    </Link>
  )
}

export function ChairpediaLanding({
  entries,
  featuredSlug,
}: {
  entries: ChairpediaCard[]
  featuredSlug: string | null
}) {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("all")
  const [brand, setBrand] = useState("all")
  const [origin, setOrigin] = useState("all")

  // All editor-featured entries power the hero carousel (no cap). Start the
  // rotation on the server-picked entry (random per visit) for continuity, then
  // cycle through the rest. Falls back to a single entry when none are featured.
  const featuredItems = useMemo(() => {
    let f = entries.filter((e) => e.featured)
    if (f.length === 0) {
      const single = entries.find((e) => e.slug === featuredSlug) ?? entries[0]
      return single ? [single] : []
    }
    const start = f.findIndex((e) => e.slug === featuredSlug)
    if (start > 0) f = [...f.slice(start), ...f.slice(0, start)]
    return f
  }, [entries, featuredSlug])

  const categories = useMemo(
    () => Array.from(new Set(entries.map((e) => e.category).filter(Boolean))) as string[],
    [entries]
  )
  const brands = useMemo(
    () => Array.from(new Set(entries.map((e) => e.brand).filter(Boolean))).sort() as string[],
    [entries]
  )
  const origins = useMemo(
    () => Array.from(new Set(entries.map((e) => e.origin).filter(Boolean))).sort() as string[],
    [entries]
  )

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return entries.filter((e) => {
      if (cat !== "all" && e.category !== cat) return false
      if (brand !== "all" && e.brand !== brand) return false
      if (origin !== "all" && e.origin !== origin) return false
      if (query) {
        const hay = `${e.title} ${e.brand ?? ""} ${e.subtitle ?? ""} ${e.excerpt ?? ""}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [entries, q, cat, brand, origin])

  const rails = useMemo(
    () =>
      COLLECTIONS.map((c) => ({
        ...c,
        items: entries.filter((e) => e.collections?.includes(c.slug)),
      })).filter((r) => r.items.length > 0),
    [entries]
  )

  const azGroups = useMemo(() => {
    const map = new Map<string, ChairpediaCard[]>()
    for (const e of [...entries].sort((a, b) => a.title.localeCompare(b.title))) {
      const letter = (e.title[0] || "#").toUpperCase()
      const key = /[A-Z]/.test(letter) ? letter : "#"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return Array.from(map.entries())
  }, [entries])

  const filtering = q.trim() !== "" || cat !== "all" || brand !== "all" || origin !== "all"
  const empty = entries.length === 0

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Masthead */}
      <header className="text-center max-w-2xl mx-auto mb-10">
        <div className="text-xs tracking-[0.3em] text-[#9a7b4f] font-semibold">CHAIRPEDIA</div>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
          The chairs worth knowing
        </h1>
        <p className="mt-3 text-muted-foreground">
          In-depth, sourced guides to design, technology, history and honest verdicts.
        </p>
      </header>

      {empty ? (
        <p className="text-center text-muted-foreground py-20">New entries are on the way.</p>
      ) : (
        <>
          {/* Featured carousel */}
          <FeaturedCarousel items={featuredItems} />

          {/* Search */}
          <div className="relative mb-4 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${entries.length} chairs…`}
              className="w-full rounded-full border border-border bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-foreground/40"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
            <Chip active={cat === "all"} onClick={() => setCat("all")}>All</Chip>
            {categories.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {CATEGORY_LABELS[c] ?? c}
              </Chip>
            ))}
          </div>
          {(brands.length > 0 || origins.length > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-sm">
              {brands.length > 0 && (
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="rounded-lg border border-border bg-white px-3 py-1.5"
                >
                  <option value="all">All brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              )}
              {origins.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <Chip active={origin === "all"} onClick={() => setOrigin("all")}>All origins</Chip>
                  {origins.map((o) => (
                    <Chip key={o} active={origin === o} onClick={() => setOrigin(o)}>{o}</Chip>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Curated rails (hidden while actively filtering, to keep focus) */}
          {!filtering &&
            rails.map((r) => (
              <section key={r.slug} className="mb-12">
                <h2 className="font-serif text-2xl font-medium text-foreground mb-4">{r.label}</h2>
                <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
                  {r.items.map((e) => (
                    <div key={e.slug} className="min-w-[260px] max-w-[260px] snap-start">
                      <Card e={e} />
                    </div>
                  ))}
                </div>
              </section>
            ))}

          {/* Main grid */}
          <section className="mb-16">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
              {filtering ? `${filtered.length} result${filtered.length === 1 ? "" : "s"}` : "All entries"}
            </h2>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">
                Nothing matches that yet. <button className="underline" onClick={() => { setQ(""); setCat("all"); setBrand("all"); setOrigin("all") }}>Clear filters</button>
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((e) => (
                  <Card key={e.slug} e={e} />
                ))}
              </div>
            )}
          </section>

          {/* Trust band */}
          <section className="rounded-2xl bg-[#faf8f4] border border-border p-8 text-center mb-14">
            <ShieldCheck className="h-6 w-6 text-[#9a7b4f] mx-auto" />
            <h2 className="mt-3 font-serif text-2xl font-medium text-foreground">How we research</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
              Every Chairpedia entry is built from manufacturer documentation and reputable sources, cross-checked for accuracy. Where a fact can't be verified, we say so plainly — and we cover the trade-offs, not just the highlights.
            </p>
            <div className="mt-5 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span><b className="text-foreground">{entries.length}</b> chairs documented</span>
              <span><b className="text-foreground">{brands.length}</b> brands</span>
            </div>
          </section>

          {/* A–Z index */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#9a7b4f]" />
              <h2 className="font-serif text-2xl font-medium text-foreground">Browse A–Z</h2>
            </div>
            <div className="space-y-5">
              {azGroups.map(([letter, items]) => (
                <div key={letter} className="flex gap-4">
                  <div className="w-8 shrink-0 font-serif text-xl text-[#9a7b4f] font-semibold">{letter}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {items.map((e) => (
                      <Link key={e.slug} href={`/chairpedia/${e.slug}`} className="text-muted-foreground hover:text-foreground hover:underline">
                        {e.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function FeaturedCarousel({ items }: { items: ChairpediaCard[] }) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = items.length

  // Auto-advance every 6s; pause on hover. Single item = static (no timer).
  useEffect(() => {
    if (count <= 1 || paused) return
    const t = setInterval(() => setI((p) => (p + 1) % count), 6000)
    return () => clearInterval(t)
  }, [count, paused])

  if (count === 0) return null
  const e = items[Math.min(i, count - 1)]
  const go = (n: number) => setI(((n % count) + count) % count)

  return (
    <div
      className="relative mb-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Link
        key={e.slug}
        href={`/chairpedia/${e.slug}`}
        className="group grid md:grid-cols-2 gap-6 rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow animate-in fade-in duration-700"
      >
        <div className="aspect-[16/11] md:aspect-auto bg-muted overflow-hidden">
          {e.heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={e.heroImage}
              alt={e.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
        </div>
        <div className="flex flex-col justify-center p-6 md:p-10">
          <div className="text-xs uppercase tracking-wider text-[#9a7b4f] font-semibold">
            Featured{e.brand ? ` · ${e.brand}` : ""}
          </div>
          <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground">
            {e.title}
          </h2>
          {(e.subtitle || e.excerpt) && (
            <p className="mt-3 text-muted-foreground">{e.subtitle || e.excerpt}</p>
          )}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            Read the story <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous featured chair"
            onClick={() => go(i - 1)}
            className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 shadow-sm transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next featured chair"
            onClick={() => go(i + 1)}
            className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-white/90 shadow-sm transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex max-w-[70%] -translate-x-1/2 flex-wrap justify-center gap-2">
            {items.map((it, idx) => (
              <button
                key={it.slug}
                type="button"
                aria-label={`Show ${it.title}`}
                onClick={() => setI(idx)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === i ? "w-6 bg-foreground" : "w-2 bg-foreground/30 hover:bg-foreground/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 text-sm rounded-full border transition-colors",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-white text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

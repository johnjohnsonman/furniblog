"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { shuffle } from "@/lib/utils/shuffle"

const PAGE_SIZE = 9
const HERO_POOL_MAX = 5

export type BlogCard = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  hero_image_url: string | null
  published_at: string | null
  featured: boolean | null
  category: string | null
}

function fmtDate(s: string | null): string {
  if (!s) return ""
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function Badge({ category }: { category: string | null }) {
  if (!category) return null
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-premium-accent">
      {category}
    </span>
  )
}

function Card({ post }: { post: BlogCard }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-[0_10px_34px_rgba(0,0,0,0.07)]"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
        {post.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.hero_image_url}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Furniblog
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Badge category={post.category} />
        <h3 className="mt-1.5 font-serif text-xl font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
          {post.title}
        </h3>
        {(post.excerpt || post.subtitle) && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt || post.subtitle}
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">{fmtDate(post.published_at)}</p>
      </div>
    </Link>
  )
}

export function BlogIndex({ posts }: { posts: BlogCard[] }) {
  const [tab, setTab] = useState("All")
  const [page, setPage] = useState(1)

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of posts) if (p.category) set.add(p.category)
    return ["All", ...Array.from(set)]
  }, [posts])

  const isDefault = tab === "All"

  // Hero pool: flagged-featured posts, else the most recent few.
  const heroPool = useMemo(() => {
    const feat = posts.filter((p) => p.featured)
    return (feat.length >= 2 ? feat : posts).slice(0, HERO_POOL_MAX)
  }, [posts])

  // Shuffle order once on mount so the hero varies per visit (SSR renders in
  // order to avoid a hydration mismatch).
  const [heroOrder, setHeroOrder] = useState<BlogCard[] | null>(null)
  useEffect(() => setHeroOrder(shuffle(heroPool)), [heroPool])
  const heroList = heroOrder ?? heroPool

  // Auto-rotate the hero every 6s on the default view.
  const [heroIdx, setHeroIdx] = useState(0)
  useEffect(() => setHeroIdx(0), [heroList.length, tab])
  useEffect(() => {
    if (!isDefault || heroList.length < 2) return
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroList.length), 6000)
    return () => clearInterval(t)
  }, [isDefault, heroList.length])

  const featured =
    isDefault && heroList.length > 0 ? heroList[heroIdx % heroList.length] : null
  const heroSlugs = useMemo(() => new Set(heroList.map((p) => p.slug)), [heroList])

  const filtered = useMemo(() => {
    if (isDefault) return posts.filter((p) => !heroSlugs.has(p.slug))
    return posts.filter((p) => p.category === tab)
  }, [posts, isDefault, tab, heroSlugs])

  // Reset to the first page whenever the tab changes.
  useEffect(() => setPage(1), [tab])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (posts.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">No posts yet.</p>
  }

  return (
    <div>
      {/* Topic filter tabs */}
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === c
                  ? "bg-foreground text-background"
                  : "border border-border bg-background text-foreground hover:border-foreground/30"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Featured hero — rotates through several posts (default view only) */}
      {featured && (
        <div className="mb-12">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
                {featured.hero_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.hero_image_url}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                    Furniblog
                  </div>
                )}
              </div>
              <div>
                <Badge category={featured.category ?? "Featured"} />
                <h2 className="mt-2 font-serif text-3xl font-medium leading-tight text-foreground transition-colors group-hover:text-foreground/80 lg:text-4xl">
                  {featured.title}
                </h2>
                {(featured.excerpt || featured.subtitle) && (
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {featured.excerpt || featured.subtitle}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-premium-accent">
                  Read the story
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Rotation controls */}
          {heroList.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => setHeroIdx((i) => (i - 1 + heroList.length) % heroList.length)}
                className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {heroList.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    aria-label={`Go to featured ${i + 1}`}
                    onClick={() => setHeroIdx(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === heroIdx % heroList.length
                        ? "w-5 bg-foreground"
                        : "w-1.5 bg-border hover:bg-foreground/40"
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setHeroIdx((i) => (i + 1) % heroList.length)}
                className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      {pageItems.length > 0 ? (
        <>
          {isDefault && (
            <h2 className="mb-5 font-serif text-xl font-medium text-foreground">Latest</h2>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((p) => (
              <Card key={p.slug} post={p} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="rounded-md border border-border bg-background px-4 py-2 font-medium transition-colors hover:border-foreground/30 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1))
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
                className="rounded-md border border-border bg-background px-4 py-2 font-medium transition-colors hover:border-foreground/30 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        !featured && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No posts in this category yet.
          </p>
        )
      )}
    </div>
  )
}

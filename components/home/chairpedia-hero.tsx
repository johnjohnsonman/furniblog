"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { shuffle } from "@/lib/utils/shuffle"

export type HomeChairpediaEntry = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  heroImage: string | null
}

const HERO_MAX = 5

/**
 * Rotating Chairpedia hero for the homepage: the big featured card cycles
 * through several entries (shuffled per visit, auto-advancing), with a stable
 * "More from Chairpedia" rail below.
 */
export function ChairpediaHero({ entries }: { entries: HomeChairpediaEntry[] }) {
  // Shuffle once on mount for a fresh feel; SSR renders in order (no mismatch).
  const [order, setOrder] = useState<HomeChairpediaEntry[] | null>(null)
  useEffect(() => setOrder(shuffle(entries)), [entries])
  const list = order ?? entries

  const heroPool = list.slice(0, HERO_MAX)
  const rail = list.slice(heroPool.length)

  const [idx, setIdx] = useState(0)
  useEffect(() => setIdx(0), [heroPool.length])
  useEffect(() => {
    if (heroPool.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % heroPool.length), 6000)
    return () => clearInterval(t)
  }, [heroPool.length])

  if (heroPool.length === 0) return null
  const featured = heroPool[idx % heroPool.length]

  return (
    <div className="mt-9">
      <Link
        href={`/chairpedia/${featured.slug}`}
        className="group grid overflow-hidden rounded-2xl border border-premium-border bg-white md:grid-cols-2"
      >
        <div className="aspect-[4/3] overflow-hidden bg-premium-cream md:aspect-auto md:min-h-[360px]">
          {featured.heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featured.heroImage}
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-premium-accent">
            From Chairpedia
          </span>
          <h2 className="mt-2 font-serif text-2xl font-medium leading-snug text-premium-text sm:text-3xl">
            {featured.title}
          </h2>
          {(featured.excerpt || featured.subtitle) && (
            <p className="mt-3 line-clamp-3 text-base leading-relaxed text-premium-text-secondary">
              {featured.excerpt || featured.subtitle}
            </p>
          )}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-premium-accent">
            Read the deep-dive →
          </span>
        </div>
      </Link>

      {/* Rotation controls */}
      {heroPool.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => setIdx((i) => (i - 1 + heroPool.length) % heroPool.length)}
            className="rounded-full border border-premium-border p-1.5 text-premium-text-secondary transition-colors hover:bg-premium-cream hover:text-premium-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {heroPool.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                aria-label={`Go to featured ${i + 1}`}
                onClick={() => setIdx(i)}
                className={
                  i === idx % heroPool.length
                    ? "h-1.5 w-5 rounded-full bg-premium-text transition-all"
                    : "h-1.5 w-1.5 rounded-full bg-premium-border transition-all hover:bg-premium-text/40"
                }
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next"
            onClick={() => setIdx((i) => (i + 1) % heroPool.length)}
            className="rounded-full border border-premium-border p-1.5 text-premium-text-secondary transition-colors hover:bg-premium-cream hover:text-premium-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {rail.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between">
            <h3 className="font-serif text-lg font-medium text-premium-text">
              More from Chairpedia
            </h3>
            <Link href="/chairpedia" className="text-sm text-premium-text-secondary hover:text-premium-text">
              View all →
            </Link>
          </div>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
            {rail.map((c) => (
              <Link
                key={c.slug}
                href={`/chairpedia/${c.slug}`}
                className="group w-[240px] shrink-0 snap-start sm:w-[280px]"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-xl border border-premium-border bg-premium-cream">
                  {c.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.heroImage}
                      alt={c.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <h4 className="mt-2 line-clamp-2 font-serif text-base font-medium leading-snug text-premium-text">
                  {c.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

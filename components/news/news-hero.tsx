"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  type NewsItem,
  formatNewsDate,
  brandGradient,
  newsHref,
} from "@/components/news/news-card"

const ROTATE_MS = 5000

export function NewsHero({ items }: { items: NewsItem[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = items.length

  useEffect(() => {
    if (count <= 1 || paused) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, ROTATE_MS)
    return () => clearInterval(timer)
  }, [count, paused])

  if (count === 0) return null

  const go = (next: number) => setIndex(((next % count) + count) % count)
  const active = items[index]
  const title = active.title?.trim() || "Untitled article"
  const date = formatNewsDate(active.published_at)

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <a
        href={newsHref(active)}
        {...(active.slug ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="relative block aspect-[21/9] w-full sm:aspect-[3/1]"
      >
        {active.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={active.image_url}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${brandGradient(
              active.brand
            )}`}
          />
        )}
        {/* Readability scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-white backdrop-blur">
              Featured
            </span>
            {active.brand ? (
              <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur">
                {active.brand}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 max-w-3xl font-serif text-xl font-medium text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-xs text-white/80 sm:text-sm">
            {active.source_name || "News"}
            {date ? ` · ${date}` : ""}
          </p>
        </div>
      </a>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous featured article"
            onClick={() => go(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next featured article"
            onClick={() => go(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Go to featured article ${i + 1}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

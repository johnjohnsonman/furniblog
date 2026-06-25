"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUp, Sparkles, Loader2, RotateCcw } from "lucide-react"
import { ChairProductImage } from "@/components/chairs/ChairProductImage"
import { stripBrandPrefix } from "@/lib/product-name"

type Pick = {
  slug: string
  name: string
  brand: string
  category: string
  price: string
  thumbnailUrl: string | null
  reason: string
}

type Result = { intro: string; picks: Pick[] }

const SUGGESTIONS = [
  "Best chair for lower-back pain, ~$500, I sit 10 hours a day",
  "I'm 188cm and need something for a tall frame",
  "A premium leather executive chair for a home office",
  "Breathable mesh chair for a hot room, under $400",
]

export function ChairAI() {
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<Result | null>(null)
  const [asked, setAsked] = useState("")

  async function run(q: string) {
    const trimmed = q.trim()
    if (!trimmed || busy) return
    setBusy(true)
    setError("")
    setResult(null)
    setAsked(trimmed)
    try {
      const res = await fetch("/api/chair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.")
        return
      }
      setResult(data as Result)
    } catch {
      setError("Network error — please try again.")
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setResult(null)
    setError("")
    setAsked("")
    setQuery("")
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void run(query)
        }}
        className="relative"
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void run(query)
            }
          }}
          rows={3}
          disabled={busy}
          placeholder="Describe what you need — your budget, how long you sit, any back pain, your height, the look you want…"
          className="w-full resize-none rounded-2xl border border-premium-border bg-white px-5 py-4 pr-14 text-base leading-relaxed text-premium-text shadow-sm outline-none transition focus:border-premium-border-hover focus:ring-2 focus:ring-premium-accent/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !query.trim()}
          aria-label="Ask chA.I.r"
          className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-premium-accent text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
        </button>
      </form>

      {/* Suggestions (only before first result) */}
      {!result && !busy && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQuery(s)
                void run(s)
              }}
              className="rounded-full border border-premium-border bg-white px-3.5 py-1.5 text-left text-sm text-premium-text-secondary transition hover:border-premium-border-hover hover:text-premium-text"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Busy state */}
      {busy && (
        <div className="mt-8 flex items-center justify-center gap-2 text-premium-text-secondary">
          <Sparkles className="h-4 w-4 animate-pulse text-premium-accent" />
          <span className="text-sm">Reading the catalog and matching chairs to you…</span>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8">
          {asked && (
            <p className="mb-4 text-sm text-premium-text-tertiary">
              You asked: <span className="text-premium-text-secondary">{asked}</span>
            </p>
          )}
          {result.intro && (
            <p className="mb-6 font-serif text-lg leading-relaxed text-premium-text">
              {result.intro}
            </p>
          )}

          <div className="space-y-4">
            {result.picks.map((p, i) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group flex gap-4 rounded-xl border border-premium-border bg-white p-4 transition hover:border-premium-border-hover hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-premium-cream">
                  <ChairProductImage
                    src={p.thumbnailUrl}
                    alt={p.name}
                    category={p.category}
                    className="object-contain p-2"
                  />
                  <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-premium-accent text-[11px] font-semibold text-white">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-premium-text-tertiary">
                    {p.brand}
                  </p>
                  <h3 className="font-serif text-lg font-medium leading-snug text-premium-text">
                    {stripBrandPrefix(p.name, p.brand)}
                  </h3>
                  <p className="mt-1 text-sm text-premium-text-secondary">{p.reason}</p>
                  <p className="mt-1.5 text-sm font-medium text-premium-text">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-premium-accent transition hover:underline"
          >
            <RotateCcw className="h-4 w-4" />
            Ask something else
          </button>

          <p className="mt-4 text-xs text-premium-text-tertiary">
            chA.I.r suggests from Furniblog&apos;s catalog based on your description. Always
            double-check fit and specs before buying.
          </p>
        </div>
      )}
    </div>
  )
}

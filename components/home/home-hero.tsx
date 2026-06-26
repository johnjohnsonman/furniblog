"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, ArrowUp, ArrowRight } from "lucide-react"

const CHIPS = [
  "Back pain, ~$500, 10 hrs a day",
  "I'm 188cm — need a tall fit",
  "Premium leather executive chair",
  "Breathable mesh under $400",
]

export function HomeHero({
  productCount,
  reviewCount,
}: {
  productCount: number
  reviewCount: number
}) {
  const router = useRouter()
  const [q, setQ] = useState("")

  function go(query: string) {
    const t = query.trim()
    if (!t) return
    router.push(`/chair?q=${encodeURIComponent(t)}`)
  }

  return (
    <section className="relative overflow-hidden border-b border-premium-border">
      {/* premium ambient gradient (no image asset needed) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 0%, rgba(154,123,79,0.10), transparent 70%), radial-gradient(40% 40% at 85% 30%, rgba(0,0,0,0.04), transparent 70%)",
        }}
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-premium-border bg-white/70 px-3 py-1 text-xs font-medium text-premium-text-secondary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-premium-accent" />
            {productCount}+ chairs · {reviewCount.toLocaleString()}+ real reviews
          </div>
          <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-premium-text sm:text-5xl lg:text-6xl text-balance">
            Real reviews &amp; real data
            <br />
            for premium chairs
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-premium-text-secondary">
            Tell <span className="font-medium text-premium-text">chA.I.r</span>{" "}
            how you sit — it matches you from {productCount}+ reviewed chairs. Or
            dive into honest reviews, videos and specs.
          </p>
        </motion.div>

        {/* chA.I.r natural-language input */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={(e) => {
            e.preventDefault()
            go(q)
          }}
          className="relative mt-8 w-full max-w-xl"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Describe how you sit — budget, hours, back pain, height…"
            className="h-16 w-full rounded-full border border-premium-border bg-white pl-6 pr-16 text-base text-premium-text shadow-[0_4px_24px_rgba(0,0,0,0.06)] outline-none transition focus:border-premium-border-hover focus:ring-2 focus:ring-premium-accent/20"
          />
          <button
            type="submit"
            aria-label="Ask chA.I.r"
            disabled={!q.trim()}
            className="absolute right-2.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-premium-accent text-white transition hover:opacity-90 disabled:opacity-40"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => go(c)}
              className="rounded-full border border-premium-border bg-white/70 px-3.5 py-1.5 text-sm text-premium-text-secondary backdrop-blur transition hover:border-premium-border-hover hover:text-premium-text"
            >
              {c}
            </button>
          ))}
        </motion.div>

        <Link
          href="/products"
          className="mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-premium-text-secondary transition-colors hover:text-premium-text"
        >
          Or browse the full chair database
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

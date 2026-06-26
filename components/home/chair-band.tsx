"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, ArrowUp } from "lucide-react"

const CHIPS = [
  "Back pain, ~$500, 10 hrs a day",
  "I'm 188cm — need a tall fit",
  "Premium leather executive",
  "Breathable mesh under $400",
]

export function ChairBand() {
  const router = useRouter()
  const [q, setQ] = useState("")

  function go(query: string) {
    const t = query.trim()
    if (!t) return
    router.push(`/chair?q=${encodeURIComponent(t)}`)
  }

  return (
    <section className="border-y border-premium-border bg-premium-text text-white">
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-xs font-medium text-white/80">
            <Sparkles className="h-3.5 w-3.5" />
            chA.I.r — AI chair finder
          </div>
          <h2 className="font-serif text-3xl font-medium leading-tight sm:text-4xl">
            Not sure which chair fits you?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/70">
            Describe how you sit — budget, hours, back pain, height — and let AI
            match you from our reviewed catalog.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              go(q)
            }}
            className="relative mx-auto mt-7 max-w-xl"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. lower-back pain, ~$500, I sit 10 hours a day…"
              className="h-14 w-full rounded-full border border-white/20 bg-white/10 pl-6 pr-14 text-base text-white placeholder:text-white/45 outline-none backdrop-blur transition focus:border-white/40 focus:bg-white/15"
            />
            <button
              type="submit"
              aria-label="Ask chA.I.r"
              disabled={!q.trim()}
              className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white text-premium-text transition hover:opacity-90 disabled:opacity-40"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => go(c)}
                className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm text-white/75 transition hover:border-white/40 hover:text-white"
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

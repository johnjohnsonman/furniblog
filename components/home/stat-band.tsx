"use client"

import { useEffect, useRef, useState } from "react"

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !done.current) {
          done.current = true
          const duration = 1100
          const start = performance.now()
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / duration)
            // easeOutCubic
            const eased = 1 - Math.pow(1 - p, 3)
            setN(Math.round(value * eased))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  return <span ref={ref}>{n.toLocaleString()}</span>
}

type Stat = { value: number; label: string; suffix?: string }

export function StatBand({ stats }: { stats: Stat[] }) {
  return (
    <section className="border-b border-premium-border bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-premium-text-tertiary">
          Two generations in chairs · 26 years in the trade · hands-on, data-driven
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-3xl font-medium text-premium-text sm:text-4xl">
                <CountUp value={s.value} />
                {s.suffix}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-premium-text-tertiary">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

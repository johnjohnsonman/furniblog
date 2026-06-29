"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  images: string[]
  name: string
  colorPrimary?: string
  colorSecondary?: string
}

/**
 * Brand hero visual. Multiple images become an arrow-navigable carousel;
 * with none, falls back to a brand-colour gradient + wordmark (no stock photo).
 */
export function BrandHeroCarousel({ images, name, colorPrimary, colorSecondary }: Props) {
  const [i, setI] = useState(0)
  const count = images.length

  if (count === 0) {
    return (
      <div
        className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl p-8"
        style={{
          background: `linear-gradient(135deg, ${colorPrimary ?? "#1A1A1A"} 0%, ${colorSecondary ?? "#4A4A4A"} 100%)`,
        }}
      >
        <span className="text-center font-serif text-3xl font-medium text-white/95 md:text-4xl">
          {name}
        </span>
      </div>
    )
  }

  const go = (d: number) => setI((p) => (p + d + count) % count)

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[i]}
        alt={`${name} — ${i + 1} of ${count}`}
        className="h-full w-full object-cover"
      />

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-gray-900 shadow-sm transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-gray-900 shadow-sm transition-opacity hover:bg-white md:opacity-0 md:group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, d) => (
              <button
                key={d}
                type="button"
                aria-label={`Go to image ${d + 1}`}
                onClick={() => setI(d)}
                className={`h-1.5 rounded-full transition-all ${
                  d === i ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

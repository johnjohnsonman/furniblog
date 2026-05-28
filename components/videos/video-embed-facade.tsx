"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"

type Props = {
  youtubeId: string
  title: string
  thumbnailUrl?: string | null
}

function fallbackThumb(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
}

export function VideoEmbedFacade({ youtubeId, title, thumbnailUrl }: Props) {
  const [active, setActive] = useState(false)

  if (active) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="group relative block w-full overflow-hidden rounded-xl border border-border bg-muted text-left"
      aria-label={`Play ${title}`}
    >
      <div className="relative aspect-video">
        <Image
          src={thumbnailUrl || fallbackThumb(youtubeId)}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black shadow">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </span>
        </div>
      </div>
    </button>
  )
}

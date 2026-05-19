"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { getChairPlaceholderImage } from "@/lib/chair-placeholder-images"

type ProductImageGalleryProps = {
  images: string[]
  alt: string
  category: string
  badge?: React.ReactNode
  className?: string
}

export function ProductImageGallery({
  images,
  alt,
  category,
  badge,
  className,
}: ProductImageGalleryProps) {
  const placeholder = getChairPlaceholderImage(category)
  const gallery = images.length > 0 ? images : [placeholder]
  const [activeIndex, setActiveIndex] = useState(0)
  const mainImage = gallery[activeIndex] ?? placeholder

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={mainImage}
          alt={alt}
          className="h-full w-full object-cover"
        />
        {badge}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex
                  ? "border-foreground"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

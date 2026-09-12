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
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#eaf3ff]">
        <img
          src={mainImage}
          alt={alt}
          className="h-full max-h-[520px] w-full object-contain p-6 transition-transform duration-500 hover:scale-[1.025]"
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
                "relative h-16 w-16 shrink-0 overflow-hidden border-2 bg-white transition-colors",
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
                className="h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GALLERY_CATEGORIES, type GalleryCategoryId } from "@/lib/gallery/constants"

export type GalleryImage = {
  id: string
  url: string
  caption: string | null
  category: string
  width: number | null
  height: number | null
  product: { slug: string; name: string } | null
}

export function GalleryPageClient({
  initialImages = [],
}: {
  initialImages?: GalleryImage[]
}) {
  const [category, setCategory] = useState<GalleryCategoryId>("all")
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [loading, setLoading] = useState(initialImages.length === 0)
  // First page ("all") is server-rendered; skip the initial client fetch so the
  // SSR images stay in the HTML (a failed fetch would otherwise blank the grid).
  const skipInitialFetch = useRef(initialImages.length > 0)

  const loadImages = useCallback(async () => {
    setLoading(true)
    try {
      const cat = GALLERY_CATEGORIES.find((c) => c.id === category)
      const params = new URLSearchParams({ limit: "60", page: "1" })
      if (cat?.db) params.set("category", cat.db)

      const res = await fetch(`/api/gallery?${params}`)
      const data = await res.json()
      setImages(data.images ?? [])
    } catch {
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false
      return
    }
    void loadImages()
  }, [loadImages])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={cn(
              "px-4 py-2 text-sm rounded-full border transition-colors",
              category === cat.id
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          Loading gallery…
        </p>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          No images in this category yet.
        </p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {images.map((img) => (
            <article
              key={img.id}
              className="break-inside-avoid mb-4 group relative rounded-xl overflow-hidden bg-muted"
            >
              <div className="relative w-full">
                <Image
                  src={img.url}
                  alt={img.caption ?? "Gallery image"}
                  width={img.width ?? 800}
                  height={img.height ?? 1000}
                  className="w-full h-auto object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  {img.product && (
                    <p className="text-white font-medium text-sm mb-1">
                      {img.product.name}
                    </p>
                  )}
                  {img.caption && !img.product && (
                    <p className="text-white/90 text-sm mb-1">{img.caption}</p>
                  )}
                  {img.product && (
                    <Link
                      href={`/products/${img.product.slug}`}
                      className="text-white/90 text-sm hover:text-white underline-offset-2 hover:underline"
                    >
                      View Chair →
                    </Link>
                  )}
                </div>
              </div>
              {img.product && (
                <div className="p-3 border-t border-border bg-card lg:hidden">
                  <p className="text-sm font-medium text-foreground">
                    {img.product.name}
                  </p>
                  <Link
                    href={`/products/${img.product.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    View Chair →
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

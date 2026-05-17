"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { GalleryUploader } from "@/components/admin/GalleryUploader"
import { ADMIN_GALLERY_CATEGORIES } from "@/lib/gallery/constants"

type GalleryImage = {
  id: string
  url: string
  caption: string | null
  category: string
  productId: string | null
  published: boolean
  product: { slug: string; name: string } | null
}

export default function AdminGalleryPage() {
  const { toast } = useToast()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)

  const loadImages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/gallery")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to load")
      setImages(data.images ?? [])
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to load",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadImages()
  }, [loadImages])

  async function updateImage(
    id: string,
    patch: Partial<{
      published: boolean
      category: string
      productId: string | null
    }>
  ) {
    const res = await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({
        title: "Update failed",
        description: data.error,
        variant: "destructive",
      })
      return
    }
    const updated = data.image as GalleryImage
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? {
              ...img,
              published: updated.published,
              category: updated.category,
              productId: updated.productId,
              product: updated.product,
              caption: updated.caption,
            }
          : img
      )
    )
  }

  async function deleteImage(id: string) {
    if (!confirm("Delete this gallery image?")) return
    const res = await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json()
      toast({
        title: "Delete failed",
        description: data.error,
        variant: "destructive",
      })
      return
    }
    setImages((prev) => prev.filter((img) => img.id !== id))
    toast({ title: "Image deleted" })
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-medium">Gallery</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage inspiration photos and link chairs to featured spaces.
        </p>
      </div>

      <GalleryUploader onUploaded={() => void loadImages()} />

      <div className="mt-10">
        <h2 className="text-sm font-medium mb-4">
          All images ({images.length})
        </h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No gallery images yet. Upload one above or run{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              npm run seed:gallery
            </code>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((img) => (
              <article
                key={img.id}
                className="border border-border rounded-xl overflow-hidden bg-card"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <Image
                    src={img.url}
                    alt={img.caption ?? "Gallery"}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
                <div className="p-4 space-y-3">
                  {img.caption && (
                    <p className="text-sm text-foreground">{img.caption}</p>
                  )}
                  {img.product && (
                    <p className="text-xs text-muted-foreground">
                      Chair: {img.product.name}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Category</span>
                    <Select
                      value={img.category}
                      onValueChange={(v) => void updateImage(img.id, { category: v })}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADMIN_GALLERY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.db!}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={img.published}
                        onCheckedChange={(v) =>
                          void updateImage(img.id, { published: v })
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {img.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void deleteImage(img.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

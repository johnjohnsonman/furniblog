"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { GripVertical, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export type ProductImageItem = {
  id: string
  url: string
  sortOrder: number
  isThumbnail: boolean
}

type ImageUploaderProps = {
  productId: string
}

export function ImageUploader({ productId }: ImageUploaderProps) {
  const [images, setImages] = useState<ProductImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`)
      const text = await res.text()
      let data: { images?: ProductImageItem[]; error?: string }
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Invalid response from server")
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to load images")
      setImages(
        (data.images ?? []).map((img) => ({
          id: img.id,
          url: img.url,
          sortOrder: img.sortOrder,
          isThumbnail: img.isThumbnail,
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images")
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void loadImages()
  }, [loadImages])

  async function persistOrder(next: ProductImageItem[]) {
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: next.map((img, index) => ({
          id: img.id,
          sortOrder: index,
          isThumbnail: index === 0,
        })),
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Failed to save order")
    setImages(
      (data.images ?? next).map((img: ProductImageItem, index: number) => ({
        ...img,
        sortOrder: index,
        isThumbnail: index === 0,
      }))
    )
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: formData,
      })

      setProgress(90)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")

      await loadImages()
      setProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 400)
    }
  }

  async function deleteImage(imageId: string) {
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/images?imageId=${imageId}`,
        { method: "DELETE" }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Delete failed")
      await loadImages()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed")
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) {
      void uploadFiles(e.dataTransfer.files)
    }
  }

  function handleReorder(from: number, to: number) {
    if (from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    const normalized = next.map((img, index) => ({
      ...img,
      sortOrder: index,
      isThumbnail: index === 0,
    }))
    setImages(normalized)
    void persistOrder(normalized).catch((err) => {
      setError(err instanceof Error ? err.message : "Reorder failed")
      void loadImages()
    })
  }

  return (
    <div className="space-y-4 border border-border rounded-xl p-5">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Product images</h3>
        <p className="text-xs text-muted-foreground">
          First image is used as the thumbnail. Drag to reorder.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading images…
        </p>
      ) : (
        <>
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex != null) handleReorder(dragIndex, index)
                    setDragIndex(null)
                  }}
                  className={cn(
                    "relative group aspect-square rounded-lg border overflow-hidden bg-muted",
                    index === 0 && "ring-2 ring-foreground ring-offset-2"
                  )}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="160px"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => void deleteImage(img.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute bottom-1 left-1 flex items-center gap-1 text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded">
                    <GripVertical className="h-3 w-3" />
                    {index === 0 ? "Thumbnail" : `#${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
              dragOver
                ? "border-foreground bg-muted"
                : "border-border hover:border-foreground/40 hover:bg-muted/50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) void uploadFiles(e.target.files)
                e.target.value = ""
              }}
            />
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <Progress value={progress} className="w-full max-w-xs" />
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Add images</p>
                <p className="text-xs text-muted-foreground text-center">
                  Drag & drop or click · JPG, PNG, WebP · Max 5MB each
                </p>
              </>
            )}
          </div>
        </>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void loadImages()}
        disabled={loading}
      >
        Refresh images
      </Button>
    </div>
  )
}

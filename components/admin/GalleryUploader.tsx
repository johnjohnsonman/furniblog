"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ADMIN_GALLERY_CATEGORIES } from "@/lib/gallery/constants"

type ProductOption = { id: string; name: string; slug: string }

type GalleryUploaderProps = {
  onUploaded: () => void
}

export function GalleryUploader({ onUploaded }: GalleryUploaderProps) {
  const [caption, setCaption] = useState("")
  const [category, setCategory] = useState("office")
  const [productId, setProductId] = useState<string>("")
  const [published, setPublished] = useState(false)
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => {
        const items = (d.products ?? d.items ?? []) as Array<{
          id: string
          name: string
          slug: string
        }>
        setProducts(
          items.map((p) => ({ id: p.id, name: p.name, slug: p.slug }))
        )
      })
      .catch(() => {})
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(productSearch.toLowerCase())
  )

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true)
      setProgress(10)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("caption", caption)
        formData.append("category", category)
        if (productId) formData.append("productId", productId)
        formData.append("published", published ? "true" : "false")

        setProgress(40)
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          body: formData,
        })
        setProgress(90)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Upload failed")

        setProgress(100)
        setCaption("")
        setProductId("")
        setPublished(false)
        onUploaded()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setUploading(false)
        setTimeout(() => setProgress(0), 400)
      }
    },
    [caption, category, productId, published, onUploaded]
  )

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList)
    for (const file of files) {
      await uploadFile(file)
    }
  }

  return (
    <div className="border border-border rounded-xl p-5 space-y-4 bg-card">
      <h2 className="text-sm font-medium text-foreground">Add gallery image</h2>

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
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-10 px-4 cursor-pointer transition-colors",
          dragOver
            ? "border-foreground bg-muted"
            : "border-border hover:border-foreground/40 hover:bg-muted/50"
        )}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium text-foreground">+ Add image</p>
        <p className="text-xs text-muted-foreground">
          Drag & drop or click · JPG, PNG, WebP · 5MB max
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>

      {progress > 0 && <Progress value={progress} className="h-1.5" />}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gallery-caption">Caption</Label>
          <Input
            id="gallery-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Describe the space…"
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
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
      </div>

      <div className="space-y-2">
        <Label>Link chair (optional)</Label>
        <Input
          placeholder="Search chairs…"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
        />
        {productSearch && (
          <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-background">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
              onClick={() => {
                setProductId("")
                setProductSearch("")
              }}
            >
              None
            </button>
            {filteredProducts.slice(0, 8).map((p) => (
              <button
                key={p.id}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-muted",
                  productId === p.id && "bg-muted font-medium"
                )}
                onClick={() => {
                  setProductId(p.id)
                  setProductSearch(p.name)
                }}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="gallery-published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="gallery-published">Publish immediately</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
      </div>
    </div>
  )
}

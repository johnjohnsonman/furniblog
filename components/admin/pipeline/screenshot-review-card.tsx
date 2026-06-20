"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Upload, X, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChairSearchCombobox } from "@/components/admin/pipeline/chair-search-combobox"
import { fetchJson } from "@/lib/admin/fetch-json"

type ProductOption = { id: string; slug: string; name: string }

const MAX_IMAGES = 10
const MAX_EDGE = 1568 // matches Anthropic's image downscale — keeps payload small & legible

// Downscale a screenshot to <=1568px long edge and re-encode as JPEG so several
// fit under the serverless request body limit (and match the model's own resize).
function downscaleToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("canvas unsupported"))
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("bad image"))
    }
    img.src = url
  })
}

export function ScreenshotReviewCard({ products }: { products: ProductOption[] }) {
  const [chairSlug, setChairSlug] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{
    ok: boolean
    msg: string
    samples?: { overall: number; summary: string }[]
  } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function addFiles(files: FileList | File[]) {
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!imgs.length) return
    const dataUrls = await Promise.all(imgs.map((f) => downscaleToDataUrl(f).catch(() => null)))
    setImages((prev) =>
      [...prev, ...dataUrls.filter((d): d is string => Boolean(d))].slice(0, MAX_IMAGES)
    )
  }

  // Paste a screenshot (Ctrl/Cmd+V) anywhere on the page → adds it here.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = e.clipboardData?.files
      if (files?.length && Array.from(files).some((f) => f.type.startsWith("image/"))) {
        void addFiles(files)
      }
    }
    window.addEventListener("paste", onPaste)
    return () => window.removeEventListener("paste", onPaste)
  }, [])

  async function extract() {
    if (!chairSlug) {
      setResult({ ok: false, msg: "Select a chair first." })
      return
    }
    if (!images.length) {
      setResult({ ok: false, msg: "Add at least one screenshot." })
      return
    }
    setBusy(true)
    setResult(null)
    try {
      const res = await fetchJson<{
        added: number
        chair?: { name: string }
        samples?: { overall: number; summary: string }[]
      }>("/api/admin/reviews/from-screenshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chairSlug, images }),
      })
      if (!res.ok) {
        setResult({ ok: false, msg: res.error })
      } else {
        setResult({
          ok: true,
          msg: `Added ${res.data.added} review${res.data.added === 1 ? "" : "s"} to ${
            res.data.chair?.name ?? "chair"
          }`,
          samples: res.data.samples,
        })
        setImages([])
      }
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed to extract." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mb-8 space-y-4 rounded-xl border-2 border-foreground/15 bg-muted/20 p-6">
      <div>
        <h2 className="text-lg font-medium">Add reviews from a screenshot</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a chair, then drop / paste / upload screenshot(s) of a Reddit or forum thread.
          Claude reads the post + comments and turns each real opinion into its own review
          (up to 100), negatives included, with no source shown. Tip: use a few normal-width
          screenshots (not one huge tall one) so the text stays readable.
        </p>
      </div>

      <ChairSearchCombobox products={products} value={chairSlug} onChange={setChairSlug} disabled={busy} />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files)
        }}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground hover:border-foreground/40"
      >
        <ImagePlus className="h-5 w-5" />
        <span>Drop, paste (Ctrl/Cmd+V), or click to add screenshots</span>
        <span className="text-xs">
          {images.length}/{MAX_IMAGES} added
        </span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files)
          e.target.value = ""
        }}
      />

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-20 rounded border border-border object-cover" />
              <button
                type="button"
                aria-label="Remove screenshot"
                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-foreground p-0.5 text-background"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => void extract()} disabled={busy || !chairSlug || !images.length}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {busy ? "Reading…" : "Extract & add reviews"}
      </Button>

      {result && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            result.ok ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"
          }`}
        >
          <p className={result.ok ? "text-green-700" : "text-red-700"}>
            {result.ok ? "✓ " : "✗ "}
            {result.msg}
          </p>
          {result.ok && result.samples && result.samples.length > 0 && (
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {result.samples.map((s, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground">{s.overall}/5</span> — {s.summary}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

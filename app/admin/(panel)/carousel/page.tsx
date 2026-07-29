"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, Sparkles, Download, Upload, Copy, Check } from "lucide-react"
import {
  RATIO_LABEL,
  type Ratio,
  type Slide,
  type SlideLayout,
} from "@/lib/carousel/types"

type PostRow = { id: string; title: string; status: string }
type RatioMode = Ratio | "both"

const LAYOUTS: SlideLayout[] = ["cover", "text", "stat", "cta"]

function slideUrl(slide: Slide, ratio: Ratio, i: number, n: number): string {
  const d = encodeURIComponent(JSON.stringify(slide))
  return `/api/admin/carousel/slide?d=${d}&ratio=${ratio}&i=${i}&n=${n}`
}

async function downloadImage(url: string, filename: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("render failed")
  const blob = await res.blob()
  const objUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = objUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objUrl)
}

export default function AdminCarouselPage() {
  const [posts, setPosts] = useState<PostRow[]>([])
  const [mode, setMode] = useState<"blog" | "text">("blog")
  const [blogId, setBlogId] = useState("")
  const [text, setText] = useState("")
  const [title, setTitle] = useState("")

  const [ratioMode, setRatioMode] = useState<RatioMode>("both")
  const [activeRatio, setActiveRatio] = useState<Ratio>("4x5")

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")

  const [slides, setSlides] = useState<Slide[]>([])
  const [rendered, setRendered] = useState<Slide[]>([])
  const [caption, setCaption] = useState("")
  const [hashtags, setHashtags] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [cost, setCost] = useState<number | null>(null)

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load blog posts for the picker.
  useEffect(() => {
    void fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => {
        const rows = (d.posts ?? []) as PostRow[]
        setPosts(rows)
        if (rows[0]) setBlogId(rows[0].id)
      })
      .catch(() => {})
  }, [])

  // Debounce edits → committed "rendered" slides so we don't re-render the
  // server image on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setRendered(slides), 400)
    return () => clearTimeout(t)
  }, [slides])

  const ratios: Ratio[] = ratioMode === "both" ? ["1x1", "4x5"] : [ratioMode]
  // Keep the active preview ratio valid for the chosen mode.
  useEffect(() => {
    if (!ratios.includes(activeRatio)) setActiveRatio(ratios[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratioMode])

  async function generate() {
    if (generating) return
    setGenerating(true)
    setError("")
    try {
      const payload =
        mode === "blog" ? { blogId } : { title: title.trim(), text: text.trim() }
      const res = await fetch("/api/admin/carousel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Generation failed")
        return
      }
      setSlides(data.slides ?? [])
      setRendered(data.slides ?? [])
      setCaption(data.caption ?? "")
      setHashtags(data.hashtags ?? [])
      setImages(data.images ?? [])
      setCost(typeof data.usage?.costUsd === "number" ? data.usage.costUsd : null)
    } catch {
      setError("Network error")
    } finally {
      setGenerating(false)
    }
  }

  function patchSlide(i: number, patch: Partial<Slide>) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }
  function patchStat(i: number, patch: Partial<NonNullable<Slide["stat"]>>) {
    setSlides((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, stat: { ...s.stat, ...patch } } : s))
    )
  }

  async function uploadFor(i: number, file: File) {
    setUploadingIdx(i)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/chairpedia/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        patchSlide(i, { image: data.url })
        setImages((prev) => (prev.includes(data.url) ? prev : [data.url, ...prev]))
      }
    } finally {
      setUploadingIdx(null)
    }
  }

  const fullCaption = caption + (hashtags.length ? "\n\n" + hashtags.map((h) => `#${h}`).join(" ") : "")

  async function copyCaption() {
    await navigator.clipboard.writeText(fullCaption)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function downloadAll() {
    if (downloading || !rendered.length) return
    setDownloading(true)
    try {
      for (const r of ratios) {
        for (let i = 0; i < rendered.length; i++) {
          await downloadImage(
            slideUrl(rendered[i], r, i, rendered.length),
            `carousel-${String(i + 1).padStart(2, "0")}-${r}.png`
          )
        }
      }
    } catch {
      setError("Some images failed to render. Try again.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-6xl p-8">
      <h1 className="mb-2 font-serif text-2xl font-medium">Instagram Carousel</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Turn a blog post into ready-to-upload Instagram slides (1:1 and/or 4:5) plus a caption.
        AI drafts it from the article — edit, assign images, then download the PNGs.
      </p>

      {/* Source + options */}
      <div className="mb-8 rounded-lg border border-[#9a7b4f]/30 bg-[#9a7b4f]/5 p-5">
        <div className="mb-3 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("blog")}
            className={`rounded-md px-3 py-1.5 ${mode === "blog" ? "bg-foreground text-background" : "bg-muted"}`}
          >
            From a blog post
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`rounded-md px-3 py-1.5 ${mode === "text" ? "bg-foreground text-background" : "bg-muted"}`}
          >
            Paste text
          </button>
        </div>

        {mode === "blog" ? (
          <select
            value={blogId}
            onChange={(e) => setBlogId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {posts.length === 0 && <option value="">No blog posts</option>}
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} {p.status !== "published" ? `(${p.status})` : ""}
              </option>
            ))}
          </select>
        ) : (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the article text here…"
              rows={5}
              className="w-full rounded-md border border-input bg-background p-3 text-sm"
            />
          </div>
        )}

        {/* Ratio */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Format</span>
          {(["1x1", "4x5", "both"] as RatioMode[]).map((r) => (
            <label key={r} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="ratio"
                checked={ratioMode === r}
                onChange={() => setRatioMode(r)}
              />
              {r === "both" ? "Both" : RATIO_LABEL[r]}
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={generating || (mode === "blog" ? !blogId : text.trim().length < 60)}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? "Generating…" : "Generate carousel"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {cost != null && (
          <p className="mt-2 text-xs text-muted-foreground">AI cost: ${cost.toFixed(4)}</p>
        )}
      </div>

      {slides.length > 0 && (
        <>
          {/* Preview ratio switch (only meaningful when both) + download all */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {ratios.length > 1 &&
                ratios.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveRatio(r)}
                    className={`rounded-md px-3 py-1.5 text-sm ${activeRatio === r ? "bg-foreground text-background" : "bg-muted"}`}
                  >
                    {RATIO_LABEL[r]}
                  </button>
                ))}
              <span className="text-sm text-muted-foreground">{slides.length} slides</span>
            </div>
            <button
              type="button"
              onClick={downloadAll}
              disabled={downloading}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background disabled:opacity-40"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download all {ratioMode === "both" ? "(both formats)" : ""}
            </button>
          </div>

          {/* Caption */}
          <div className="mb-8 rounded-lg border border-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Caption</span>
              <button
                type="button"
                onClick={copyCaption}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy caption + tags"}
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-input bg-background p-3 text-sm"
            />
            {hashtags.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">{hashtags.map((h) => `#${h}`).join(" ")}</p>
            )}
          </div>

          {/* Slides */}
          <div className="space-y-5">
            {slides.map((slide, i) => (
              <SlideCard
                key={i}
                slide={slide}
                rendered={rendered[i] ?? slide}
                index={i}
                total={slides.length}
                ratio={activeRatio}
                images={images}
                uploading={uploadingIdx === i}
                onPatch={(patch) => patchSlide(i, patch)}
                onPatchStat={(patch) => patchStat(i, patch)}
                onUpload={(file) => uploadFor(i, file)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SlideCard({
  slide,
  rendered,
  index,
  total,
  ratio,
  images,
  uploading,
  onPatch,
  onPatchStat,
  onUpload,
}: {
  slide: Slide
  rendered: Slide
  index: number
  total: number
  ratio: Ratio
  images: string[]
  uploading: boolean
  onPatch: (patch: Partial<Slide>) => void
  onPatchStat: (patch: Partial<NonNullable<Slide["stat"]>>) => void
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const showImage = slide.layout === "cover" || slide.layout === "text"
  const isStat = slide.layout === "stat"
  const previewW = ratio === "1x1" ? 260 : 208 // keep both previews a similar height (~260)

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row">
      {/* Preview */}
      <div className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slideUrl(rendered, ratio, index, total)}
          alt={`Slide ${index + 1}`}
          width={previewW}
          style={{ width: previewW, height: "auto", borderRadius: 8, background: "#14110E" }}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Slide {index + 1}</span>
          <button
            type="button"
            onClick={() =>
              downloadImage(
                slideUrl(rendered, ratio, index, total),
                `carousel-${String(index + 1).padStart(2, "0")}-${ratio}.png`
              )
            }
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" /> PNG
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <select
            value={slide.layout}
            onChange={(e) => onPatch({ layout: e.target.value as SlideLayout })}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            {LAYOUTS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <input
            value={slide.eyebrow ?? ""}
            onChange={(e) => onPatch({ eyebrow: e.target.value })}
            placeholder="Eyebrow / kicker"
            className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs uppercase tracking-wide"
          />
        </div>

        <textarea
          value={slide.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="Title"
          rows={2}
          className="w-full rounded-md border border-input bg-background p-2 text-sm font-medium"
        />

        {!isStat && slide.layout !== "cta" && (
          <textarea
            value={slide.body ?? ""}
            onChange={(e) => onPatch({ body: e.target.value })}
            placeholder="Supporting sentence"
            rows={2}
            className="w-full rounded-md border border-input bg-background p-2 text-sm"
          />
        )}

        {isStat && (
          <div className="grid grid-cols-2 gap-2">
            <input
              value={slide.stat?.before ?? ""}
              onChange={(e) => onPatchStat({ before: e.target.value })}
              placeholder="Before (e.g. 110)"
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            />
            <input
              value={slide.stat?.after ?? ""}
              onChange={(e) => onPatchStat({ after: e.target.value })}
              placeholder="After (e.g. 43)"
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            />
            <input
              value={slide.stat?.value ?? ""}
              onChange={(e) => onPatchStat({ value: e.target.value })}
              placeholder="Single value (e.g. 360)"
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            />
            <input
              value={slide.stat?.label ?? ""}
              onChange={(e) => onPatchStat({ label: e.target.value })}
              placeholder="Label"
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            />
          </div>
        )}

        {showImage && (
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Background image</span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload
              </button>
              {slide.image && (
                <button
                  type="button"
                  onClick={() => onPatch({ image: null })}
                  className="text-xs text-muted-foreground hover:text-red-600"
                >
                  Clear
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onUpload(f)
                  e.target.value = ""
                }}
              />
            </div>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {images.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    onClick={() => onPatch({ image: url })}
                    className={`h-12 w-12 cursor-pointer rounded object-cover ${
                      slide.image === url ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            )}
            <input
              value={slide.image ?? ""}
              onChange={(e) => onPatch({ image: e.target.value || null })}
              placeholder="…or paste an image URL"
              className="mt-1.5 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
            />
          </div>
        )}
      </div>
    </div>
  )
}

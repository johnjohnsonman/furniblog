"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Product = {
  id: string
  name: string
  brand: string | null
  category: string | null
  priceRange: string | null
  ratingOverall: number | null
  ratingComfort: number | null
  ratingErgonomics: number | null
}

type Edit = { overall: string; comfort: string; ergonomics: string }

const FILTERS = [
  { value: "all", label: "All" },
  { value: "rated", label: "Rated" },
  { value: "unrated", label: "Unrated" },
] as const

function toStr(v: number | null): string {
  return v == null ? "" : String(v)
}

function editFrom(p: Product): Edit {
  return {
    overall: toStr(p.ratingOverall),
    comfort: toStr(p.ratingComfort),
    ergonomics: toStr(p.ratingErgonomics),
  }
}

function isRated(p: Product): boolean {
  return (
    p.ratingOverall != null ||
    p.ratingComfort != null ||
    p.ratingErgonomics != null
  )
}

export default function EditorialRatingsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [edits, setEdits] = useState<Record<string, Edit>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all")

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/editorial")
    const data = await res.json()
    if (!res.ok) {
      toast({ title: "불러오기 실패", description: data.error, variant: "destructive" })
      setLoading(false)
      return
    }
    const list: Product[] = data.products ?? []
    setProducts(list)
    setEdits(Object.fromEntries(list.map((p) => [p.id, editFrom(p)])))
    setLoading(false)
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const ratedCount = useMemo(() => products.filter(isRated).length, [products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (filter === "rated" && !isRated(p)) return false
      if (filter === "unrated" && isRated(p)) return false
      if (q) {
        const hay = `${p.name} ${p.brand ?? ""}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [products, search, filter])

  function setField(id: string, field: keyof Edit, value: string) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  function changed(p: Product): boolean {
    const e = edits[p.id]
    if (!e) return false
    const o = editFrom(p)
    return (
      e.overall !== o.overall ||
      e.comfort !== o.comfort ||
      e.ergonomics !== o.ergonomics
    )
  }

  async function save(p: Product) {
    const e = edits[p.id]
    if (!e) return
    const num = (s: string) => (s.trim() === "" ? null : Number(s))
    const payload = {
      id: p.id,
      rating_overall: num(e.overall),
      rating_comfort: num(e.comfort),
      rating_ergonomics: num(e.ergonomics),
    }
    for (const v of [payload.rating_overall, payload.rating_comfort, payload.rating_ergonomics]) {
      if (v != null && (Number.isNaN(v) || v < 0 || v > 10)) {
        toast({ title: "0–10 사이 숫자만 입력하세요", variant: "destructive" })
        return
      }
    }
    setSaving(p.id)
    const res = await fetch("/api/admin/editorial", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(null)
    if (!res.ok) {
      toast({ title: "저장 실패", description: data.error, variant: "destructive" })
      return
    }
    setProducts((prev) =>
      prev.map((x) =>
        x.id === p.id
          ? {
              ...x,
              ratingOverall: data.product.rating_overall,
              ratingComfort: data.product.rating_comfort,
              ratingErgonomics: data.product.rating_ergonomics,
            }
          : x
      )
    )
    toast({ title: "저장됨", description: p.name })
  }

  return (
    <div className="max-w-4xl p-8">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-medium">Editorial Ratings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          쇼룸에서 직접 앉아본 평가를 <strong>0–10</strong>으로 입력하세요. 리뷰가 적은
          신상·명품 의자를 추천 엔진이 끌어올리는 데 쓰입니다. (리뷰가 쌓일수록 실제
          리뷰 신호가 주도)
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          평가됨 {ratedCount} / 전체 {products.length}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제품·브랜드 검색 (Itoki, Kokuyo…)"
          className="h-10 w-64 rounded-md border border-input bg-background px-3 text-sm"
        />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-muted-foreground">불러오는 중…</p>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">제품이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((p) => {
            const e = edits[p.id]
            const dirty = changed(p)
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{p.name}</span>
                    {isRated(p) && (
                      <span className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-xs text-emerald-700">
                        rated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {[p.brand, p.category, p.priceRange].filter(Boolean).join(" · ")}
                  </p>
                </div>

                <RatingInput
                  label="Overall"
                  value={e?.overall ?? ""}
                  onChange={(v) => setField(p.id, "overall", v)}
                />
                <RatingInput
                  label="Comfort"
                  value={e?.comfort ?? ""}
                  onChange={(v) => setField(p.id, "comfort", v)}
                />
                <RatingInput
                  label="Ergo"
                  value={e?.ergonomics ?? ""}
                  onChange={(v) => setField(p.id, "ergonomics", v)}
                />

                <button
                  type="button"
                  disabled={!dirty || saving === p.id}
                  onClick={() => void save(p)}
                  className="h-9 shrink-0 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  {saving === p.id ? "…" : "Save"}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex shrink-0 flex-col items-center gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="–"
        className="h-9 w-16 rounded-md border border-input bg-background px-2 text-center text-sm"
      />
    </label>
  )
}

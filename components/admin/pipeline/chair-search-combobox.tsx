"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ChairOption = { id: string; slug: string; name: string }

type ChairSearchComboboxProps = {
  products: ChairOption[]
  value: string
  onChange: (slug: string) => void
  disabled?: boolean
}

export function ChairSearchCombobox({
  products,
  value,
  onChange,
  disabled,
}: ChairSearchComboboxProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = products.find((p) => p.slug === value)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    )
  }, [products, search])

  useEffect(() => {
    if (selected && !open) {
      setSearch(selected.name)
    }
  }, [selected, open])

  useEffect(() => {
    setHighlightIndex(0)
  }, [search, open])

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  const selectProduct = useCallback(
    (product: ChairOption) => {
      onChange(product.slug)
      setSearch(product.name)
      setOpen(false)
    },
    [onChange]
  )

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true)
      return
    }
    if (e.key === "Escape") {
      setOpen(false)
      if (selected) setSearch(selected.name)
      return
    }
    if (!open || filtered.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      const pick = filtered[highlightIndex]
      if (pick) selectProduct(pick)
    }
  }

  useEffect(() => {
    const el = listRef.current?.children[highlightIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: "nearest" })
  }, [highlightIndex])

  return (
    <div className="space-y-2 max-w-md" ref={containerRef}>
      <Label>Chair</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          disabled={disabled}
          placeholder="Search chair..."
          className="pl-9"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value)
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
        />
        {open && (
          <div
            ref={listRef}
            className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-background shadow-lg"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No chairs found
              </p>
            ) : (
              filtered.map((product, index) => (
                <button
                  key={product.slug}
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                    value === product.slug && "bg-muted/60",
                    highlightIndex === index && "bg-muted"
                  )}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectProduct(product)}
                >
                  {product.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type BulkResult = {
  filled: number
  skipped: number
  catalog: number
  search: number
}

type Props = {
  mode?: "all" | "missing"
  productSlug?: string
  variant?: "default" | "outline"
  label?: string
  onComplete?: (result: BulkResult) => void
}

export function BulkAmazonLinksButton({
  mode = "missing",
  productSlug,
  variant = "outline",
  label,
  onComplete,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function run() {
    const confirmMsg = productSlug
      ? "Fill Amazon affiliate link for this product?"
      : mode === "all"
        ? "Replace affiliate links on ALL products with Amazon links?"
        : "Fill Amazon links for products that have no affiliate links yet?"

    if (!confirm(confirmMsg)) return

    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/affiliate/bulk-amazon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: productSlug ? "all" : mode,
          productSlug,
          replaceExisting: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed")

      const result: BulkResult = {
        filled: data.filled ?? 0,
        skipped: data.skipped ?? 0,
        catalog: data.catalog ?? 0,
        search: data.search ?? 0,
      }
      setMessage(
        productSlug
          ? "Amazon link saved."
          : `Done: ${result.filled} filled (${result.catalog} from catalog, ${result.search} search). ${result.skipped} skipped.`
      )
      onComplete?.(result)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed")
    } finally {
      setLoading(false)
    }
  }

  const defaultLabel = productSlug
    ? "Auto-fill Amazon"
    : mode === "all"
      ? "Fill all (Amazon)"
      : "Fill missing (Amazon)"

  return (
    <div className="flex flex-col items-start gap-2">
      <Button type="button" variant={variant} onClick={() => void run()} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {label ?? defaultLabel}
      </Button>
      {message && (
        <p className="text-xs text-muted-foreground max-w-md">{message}</p>
      )}
    </div>
  )
}


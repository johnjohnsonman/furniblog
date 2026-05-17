"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminReview, ProductOption } from "./admin-review-types"

interface AdminReviewEditDialogProps {
  review: AdminReview | null
  products: ProductOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (review: AdminReview) => void
  onError: (message: string) => void
}

function TagEditor({
  label,
  tags,
  onChange,
}: {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState("")

  function addTag() {
    const trimmed = input.trim()
    if (!trimmed || tags.includes(trimmed)) return
    onChange([...tags, trimmed])
    setInput("")
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder="Add item and press Enter"
        />
        <Button type="button" variant="outline" onClick={addTag}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export function AdminReviewEditDialog({
  review,
  products,
  open,
  onOpenChange,
  onSaved,
  onError,
}: AdminReviewEditDialogProps) {
  const [summary, setSummary] = useState("")
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [overall, setOverall] = useState(3)
  const [verified, setVerified] = useState(false)
  const [productId, setProductId] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!review) return
    setSummary(review.summary)
    setPros(review.pros)
    setCons(review.cons)
    setOverall(review.score || 3)
    setVerified(review.verified)
    setProductId(review.productId)
  }, [review])

  async function handleSave() {
    if (!review) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          pros,
          cons,
          overall,
          verified,
          productId,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        onError(data.error ?? "Failed to save review")
        return
      }
      onSaved(data.review)
      onOpenChange(false)
    } catch {
      onError("Failed to save review")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>

        {review && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={5}
              />
            </div>

            <TagEditor label="Pros" tags={pros} onChange={setPros} />
            <TagEditor label="Cons" tags={cons} onChange={setCons} />

            <div className="space-y-3">
              <Label>Overall score: {overall}/5</Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[overall]}
                onValueChange={(v) => setOverall(v[0] ?? 3)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="verified"
                checked={verified}
                onCheckedChange={(v) => setVerified(v === true)}
              />
              <Label htmlFor="verified">Verified</Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


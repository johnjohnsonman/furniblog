"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const SOURCES = [
  "chairpark",
  "reddit",
  "youtube",
  "dcinside",
  "naver",
  "japan_community",
  "google",
] as const

type ProductOption = { slug: string; name: string }

export default function AdminNewReviewPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductOption[]>([])
  const [productSlug, setProductSlug] = useState("")
  const [source, setSource] = useState<string>("reddit")
  const [sourceUrl, setSourceUrl] = useState("")
  const [summary, setSummary] = useState("")
  const [pros, setPros] = useState<string[]>([])
  const [cons, setCons] = useState<string[]>([])
  const [proInput, setProInput] = useState("")
  const [conInput, setConInput] = useState("")
  const [scores, setScores] = useState({
    overall: 80,
    comfort: 80,
    ergonomics: 80,
    buildQuality: 80,
    value: 80,
  })
  const [reviewerHeightCm, setReviewerHeightCm] = useState<number>()
  const [reviewerWeightKg, setReviewerWeightKg] = useState<number>()
  const [usageHoursPerDay, setUsageHoursPerDay] = useState<number>()
  const [usagePurpose, setUsagePurpose] = useState("")
  const [verified, setVerified] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) =>
        setProducts(
          (d.products ?? []).map((p: { slug: string; name: string }) => ({
            slug: p.slug,
            name: p.name,
          }))
        )
      )
  }, [])

  function addTag(kind: "pros" | "cons") {
    const input = kind === "pros" ? proInput : conInput
    if (!input.trim()) return
    if (kind === "pros") {
      setPros((p) => [...p, input.trim()])
      setProInput("")
    } else {
      setCons((c) => [...c, input.trim()])
      setConInput("")
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          source,
          sourceUrl,
          summary,
          pros,
          cons,
          scores,
          reviewerHeightCm,
          reviewerWeightKg,
          usageHoursPerDay,
          usagePurpose,
          verified,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Save failed")
      }
      router.push("/admin/reviews")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const scoreFields = [
    ["overall", "Overall"],
    ["comfort", "Comfort"],
    ["ergonomics", "Ergonomics"],
    ["buildQuality", "Build Quality"],
    ["value", "Value"],
  ] as const

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-serif text-2xl font-medium mb-8">Add Review</h1>
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label>Product</Label>
          <Select value={productSlug} onValueChange={setProductSlug} required>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Source</Label>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Source URL</Label>
          <Input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Summary</Label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Pros</Label>
          <div className="flex gap-2">
            <Input
              value={proInput}
              onChange={(e) => setProInput(e.target.value)}
              placeholder="Add a pro"
            />
            <Button type="button" variant="outline" onClick={() => addTag("pros")}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {pros.map((tag, i) => (
              <Badge key={i} variant="secondary" className="gap-1">
                {tag}
                <button type="button" onClick={() => setPros(pros.filter((_, j) => j !== i))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cons</Label>
          <div className="flex gap-2">
            <Input
              value={conInput}
              onChange={(e) => setConInput(e.target.value)}
              placeholder="Add a con"
            />
            <Button type="button" variant="outline" onClick={() => addTag("cons")}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cons.map((tag, i) => (
              <Badge key={i} variant="outline" className="gap-1">
                {tag}
                <button type="button" onClick={() => setCons(cons.filter((_, j) => j !== i))}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <section className="space-y-6">
          <h2 className="text-lg font-medium">Scores</h2>
          {scoreFields.map(([key, label]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>{label}</Label>
                <span>{scores[key]}</span>
              </div>
              <Slider
                value={[scores[key]]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) =>
                  setScores((s) => ({ ...s, [key]: v }))
                }
              />
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Height (cm)</Label>
            <Input
              type="number"
              value={reviewerHeightCm ?? ""}
              onChange={(e) =>
                setReviewerHeightCm(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              value={reviewerWeightKg ?? ""}
              onChange={(e) =>
                setReviewerWeightKg(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Hours per day</Label>
            <Input
              type="number"
              value={usageHoursPerDay ?? ""}
              onChange={(e) =>
                setUsageHoursPerDay(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Occupation</Label>
            <Input value={usagePurpose} onChange={(e) => setUsagePurpose(e.target.value)} />
          </div>
        </section>

        <div className="flex items-center gap-2">
          <Switch checked={verified} onCheckedChange={setVerified} />
          <Label>Verified review</Label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={saving || !productSlug}>
          {saving ? "Saving…" : "Save Review"}
        </Button>
      </form>
    </div>
  )
}

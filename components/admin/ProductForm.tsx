"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CHAIR_CATEGORIES } from "@/lib/chair-categories"
import { Plus, Trash2 } from "lucide-react"
import { BulkAmazonLinksButton } from "@/components/admin/BulkAmazonLinksButton"

type AffiliateLinkInput = {
  retailerName: string
  url: string
  priceUsd?: number
  priceKrw?: number
  isOfficial: boolean
}

export type ProductFormValues = {
  slug: string
  name: string
  brandSlug: string
  category: string
  priceUsd?: number
  priceKrw?: number
  description?: string
  thumbnailUrl?: string
  chairSpecs?: Record<string, unknown>
  seoTitle?: string
  seoDescription?: string
  published: boolean
  affiliateLinks: AffiliateLinkInput[]
}

type BrandOption = { slug: string; name: string }

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

export function ProductForm({
  initial,
  productId,
  thumbnailFromImages,
  stayOnPage = false,
}: {
  initial?: Partial<ProductFormValues>
  productId?: string
  /** Synced from ImageUploader — first product image URL */
  thumbnailFromImages?: string | null
  /** When true, do not redirect after save (edit page) */
  stayOnPage?: boolean
}) {
  const router = useRouter()
  const [brands, setBrands] = useState<BrandOption[]>([])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const [values, setValues] = useState<ProductFormValues>({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    brandSlug: initial?.brandSlug ?? "",
    category: initial?.category ?? "office",
    priceUsd: initial?.priceUsd,
    priceKrw: initial?.priceKrw,
    description: initial?.description ?? "",
    thumbnailUrl: initial?.thumbnailUrl ?? "",
    chairSpecs: (initial?.chairSpecs as Record<string, unknown>) ?? {},
    seoTitle: initial?.seoTitle ?? "",
    seoDescription: initial?.seoDescription ?? "",
    published: initial?.published ?? false,
    affiliateLinks: initial?.affiliateLinks ?? [],
  })

  const specs = (values.chairSpecs ?? {}) as Record<string, unknown>

  useEffect(() => {
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []))
      .catch(() => setBrands([]))
  }, [])

  useEffect(() => {
    if (!initial) return
    setValues({
      slug: initial.slug ?? "",
      name: initial.name ?? "",
      brandSlug: initial.brandSlug ?? "",
      category: initial.category ?? "office",
      priceUsd: initial.priceUsd,
      priceKrw: initial.priceKrw,
      description: initial.description ?? "",
      thumbnailUrl: initial.thumbnailUrl ?? "",
      chairSpecs: (initial.chairSpecs as Record<string, unknown>) ?? {},
      seoTitle: initial.seoTitle ?? "",
      seoDescription: initial.seoDescription ?? "",
      published: initial.published ?? false,
      affiliateLinks: initial.affiliateLinks ?? [],
    })
  }, [initial])

  useEffect(() => {
    if (!thumbnailFromImages) return
    setValues((v) => ({ ...v, thumbnailUrl: thumbnailFromImages }))
  }, [thumbnailFromImages])

  useEffect(() => {
    if (saveStatus !== "saved") return
    const timer = setTimeout(() => setSaveStatus("idle"), 2000)
    return () => clearTimeout(timer)
  }, [saveStatus])

  function updateSpec(key: string, val: unknown) {
    setValues((v) => ({
      ...v,
      chairSpecs: { ...((v.chairSpecs ?? {}) as object), [key]: val },
    }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus("saving")
    setError(null)
    try {
      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products"
      const method = productId ? "PUT" : "POST"
      const payload = {
        ...values,
        thumbnailUrl: thumbnailFromImages || values.thumbnailUrl || undefined,
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Save failed")
      }
      setSaveStatus("saved")
      if (stayOnPage) {
        router.refresh()
      } else {
        router.push("/admin/products")
        router.refresh()
      }
    } catch (err) {
      setSaveStatus("error")
      setError(err instanceof Error ? err.message : "Save failed")
    }
  }

  const isSaving = saveStatus === "saving"
  const submitLabel =
    saveStatus === "saving"
      ? "Saving..."
      : saveStatus === "saved"
        ? "✓ Saved"
        : saveStatus === "error"
          ? "Error - Try again"
          : "Save Product"

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-10 pb-16">
      {saveStatus === "saved" && (
        <div className="fixed top-4 right-4 z-50 rounded bg-green-500 px-4 py-2 text-white shadow-lg">
          ✓ Product saved successfully
        </div>
      )}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Name</Label>
            <Input
              value={values.name}
              onChange={(e) => {
                const name = e.target.value
                setValues((v) => ({
                  ...v,
                  name,
                  slug: v.slug || slugify(name),
                }))
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={values.slug}
              onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select
              value={values.brandSlug}
              onValueChange={(brandSlug) => setValues((v) => ({ ...v, brandSlug }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.slug} value={b.slug}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={values.category}
              onValueChange={(category) => setValues((v) => ({ ...v, category }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAIR_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Price USD</Label>
            <Input
              type="number"
              value={values.priceUsd ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  priceUsd: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Price KRW</Label>
            <Input
              type="number"
              value={values.priceKrw ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  priceKrw: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              rows={4}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Thumbnail URL</Label>
            <Input
              value={values.thumbnailUrl}
              onChange={(e) => setValues((v) => ({ ...v, thumbnailUrl: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={values.published}
              onCheckedChange={(published) => setValues((v) => ({ ...v, published }))}
            />
            <Label>Published</Label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Chair Specs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["recommendedHeightMin", "Height min (cm)"],
            ["recommendedHeightMax", "Height max (cm)"],
            ["seatHeightMin", "Seat height min (cm)"],
            ["seatHeightMax", "Seat height max (cm)"],
            ["weightCapacityKg", "Weight capacity (kg)"],
            ["chairWeightKg", "Chair weight (kg)"],
            ["warrantyYears", "Warranty (years)"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                type="number"
                value={(specs[key] as number | undefined) ?? ""}
                onChange={(e) =>
                  updateSpec(key, e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label>Armrest type</Label>
            <Select
              value={(specs.armrestType as string) ?? "none"}
              onValueChange={(v) => updateSpec("armrestType", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["4D", "3D", "2D", "fixed", "none"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={Boolean(specs.hasLumbarSupport)}
              onCheckedChange={(v) => updateSpec("hasLumbarSupport", v)}
            />
            <Label>Lumbar support</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={Boolean(specs.hasHeadrest)}
              onCheckedChange={(v) => updateSpec("hasHeadrest", v)}
            />
            <Label>Headrest</Label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">SEO</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>SEO Title</Label>
            <Input
              value={values.seoTitle}
              onChange={(e) => setValues((v) => ({ ...v, seoTitle: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>SEO Description</Label>
            <Textarea
              value={values.seoDescription}
              onChange={(e) =>
                setValues((v) => ({ ...v, seoDescription: e.target.value }))
              }
              rows={3}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Affiliate Links</h2>
          <div className="flex flex-wrap items-center gap-2">
            {(productId || values.slug) && (
              <BulkAmazonLinksButton
                productSlug={productId ?? values.slug}
                onComplete={async () => {
                  const id = productId ?? values.slug
                  if (!id) return
                  const res = await fetch(`/api/admin/products/${id}`)
                  const data = await res.json()
                  if (data.product?.affiliateLinks) {
                    setValues((v) => ({
                      ...v,
                      affiliateLinks: data.product.affiliateLinks,
                    }))
                  }
                }}
              />
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setValues((v) => ({
                  ...v,
                  affiliateLinks: [
                    ...v.affiliateLinks,
                    {
                      retailerName: "",
                      url: "",
                      isOfficial: false,
                    },
                  ],
                }))
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Add Link
            </Button>
          </div>
        </div>
        {values.affiliateLinks.map((link, i) => (
          <div
            key={i}
            className="grid gap-3 sm:grid-cols-2 border border-border rounded-lg p-4 relative"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() =>
                setValues((v) => ({
                  ...v,
                  affiliateLinks: v.affiliateLinks.filter((_, idx) => idx !== i),
                }))
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="space-y-2">
              <Label>Retailer</Label>
              <Input
                value={link.retailerName}
                onChange={(e) => {
                  const affiliateLinks = [...values.affiliateLinks]
                  affiliateLinks[i] = { ...link, retailerName: e.target.value }
                  setValues((v) => ({ ...v, affiliateLinks }))
                }}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>URL</Label>
              <Input
                value={link.url}
                onChange={(e) => {
                  const affiliateLinks = [...values.affiliateLinks]
                  affiliateLinks[i] = { ...link, url: e.target.value }
                  setValues((v) => ({ ...v, affiliateLinks }))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Price USD</Label>
              <Input
                type="number"
                value={link.priceUsd ?? ""}
                onChange={(e) => {
                  const affiliateLinks = [...values.affiliateLinks]
                  affiliateLinks[i] = {
                    ...link,
                    priceUsd: e.target.value ? Number(e.target.value) : undefined,
                  }
                  setValues((v) => ({ ...v, affiliateLinks }))
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Price KRW</Label>
              <Input
                type="number"
                value={link.priceKrw ?? ""}
                onChange={(e) => {
                  const affiliateLinks = [...values.affiliateLinks]
                  affiliateLinks[i] = {
                    ...link,
                    priceKrw: e.target.value ? Number(e.target.value) : undefined,
                  }
                  setValues((v) => ({ ...v, affiliateLinks }))
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={link.isOfficial}
                onCheckedChange={(isOfficial) => {
                  const affiliateLinks = [...values.affiliateLinks]
                  affiliateLinks[i] = { ...link, isOfficial }
                  setValues((v) => ({ ...v, affiliateLinks }))
                }}
              />
              <Label>Official store</Label>
            </div>
          </div>
        ))}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={isSaving}
        className={cn(
          saveStatus === "saved" &&
            "bg-green-600 text-white hover:bg-green-600",
          saveStatus === "error" && "bg-red-600 text-white hover:bg-red-600"
        )}
      >
        {submitLabel}
      </Button>
    </form>
  )
}


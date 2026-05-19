"use client"

import { useEffect, useState } from "react"
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm"
import { ImageUploader } from "@/components/admin/ImageUploader"

export default function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [initial, setInitial] = useState<Partial<ProductFormValues>>()
  const [slug, setSlug] = useState<string>("")
  const [thumbnailFromImages, setThumbnailFromImages] = useState<string | null>(
    null
  )

  useEffect(() => {
    void params.then(async ({ id }) => {
      setSlug(id)
      const res = await fetch(`/api/admin/products/${id}`)
      const data = await res.json()
      if (data.product) setInitial(data.product)
    })
  }, [params])

  if (!initial) {
    return <div className="p-8 text-muted-foreground">Loading…</div>
  }

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-medium mb-8">Edit Product</h1>
      <ImageUploader
        productId={slug}
        onPrimaryImageChange={setThumbnailFromImages}
      />
      <div className="mt-8">
        <ProductForm
          initial={initial}
          productId={slug}
          thumbnailFromImages={thumbnailFromImages}
          stayOnPage
        />
      </div>
    </div>
  )
}

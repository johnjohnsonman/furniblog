import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { resolveProductByIdOrSlug } from "@/lib/admin/resolve-product"
import { syncProductThumbnail } from "@/lib/admin/product-thumbnail"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  deleteStorageObject,
  uploadProductImageServer,
} from "@/lib/supabase/storage-server"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

type ProductImageRow = {
  id: string
  product_id: string
  url: string
  sort_order: number
  is_thumbnail: boolean
  created_at: string
  alt?: string | null
  caption?: string | null
  source?: string | null
  source_url?: string | null
  rights?: string | null
  model_status?: string | null
}

function toImagePayload(row: ProductImageRow) {
  return {
    id: row.id,
    url: row.url,
    sortOrder: row.sort_order,
    isThumbnail: row.is_thumbnail,
    alt: row.alt ?? null,
    caption: row.caption ?? null,
    source: row.source ?? null,
    sourceUrl: row.source_url ?? null,
    rights: row.rights ?? null,
    modelStatus: row.model_status ?? null,
    createdAt: row.created_at,
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params

  try {
    const supabase = createAdminClient()
    const product = await resolveProductByIdOrSlug(supabase, id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })

    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205") {
        return NextResponse.json({ images: [], productSlug: product.slug })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      images: (data ?? []).map((row: ProductImageRow) => toImagePayload(row)),
      productSlug: product.slug,
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params

  try {
    const supabase = createAdminClient()
    const product = await resolveProductByIdOrSlug(supabase, id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files").filter((f): f is File => f instanceof File)

    if (files.length === 0) {
      const file = formData.get("file")
      if (file instanceof File) files.push(file)
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    console.log(
      "[API] Product image upload:",
      product.slug,
      files.map((f) => `${f.name} (${f.size}b)`)
    )

    const { data: existingImages } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", product.id)

    const existingCount = existingImages?.length ?? 0
    let nextOrder = existingCount
    const inserted: ProductImageRow[] = []

    for (const file of files) {
      let url: string
      try {
        url = await uploadProductImageServer(file, product.slug)
      } catch (uploadErr) {
        const message =
          uploadErr instanceof Error ? uploadErr.message : "Storage upload failed"
        console.error("[API] Upload error:", message)
        return NextResponse.json({ error: message }, { status: 500 })
      }

      const isFirst = existingCount === 0 && inserted.length === 0

      const { data: row, error } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          url,
          sort_order: isFirst ? 0 : nextOrder,
          is_thumbnail: isFirst,
        })
        .select("*")
        .single()

      if (error) {
        console.error("[API] product_images insert error:", error)
        return NextResponse.json(
          {
            error: error.message,
            hint: "Run migration 007_product_images.sql if the table is missing",
          },
          { status: 500 }
        )
      }

      inserted.push(row as ProductImageRow)
      nextOrder += 1
    }

    const thumbnailUrl = await syncProductThumbnail(supabase, product.id)

    return NextResponse.json({
      thumbnailUrl,
      images: inserted.map((row) => toImagePayload(row)),
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params

  try {
    const body = await request.json()
    const supabase = createAdminClient()
    const product = await resolveProductByIdOrSlug(supabase, id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const images = body.images as Array<{
      id: string
      sortOrder: number
      isThumbnail?: boolean
      alt?: string | null
      caption?: string | null
      source?: string | null
      rights?: string | null
      modelStatus?: string | null
    }>

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid images payload" }, { status: 400 })
    }

    await supabase
      .from("product_images")
      .update({ is_thumbnail: false })
      .eq("product_id", product.id)

    // Include alt/caption/source only when the editor sent them. If the 044
    // metadata columns aren't applied yet, retry once without them so ordering
    // and thumbnail selection still save.
    let metaSupported = true
    for (const img of images) {
      const base: Record<string, unknown> = {
        sort_order: img.sortOrder,
        is_thumbnail: Boolean(img.isThumbnail),
      }
      const withMeta: Record<string, unknown> = { ...base }
      if ("alt" in img) withMeta.alt = img.alt ?? null
      if ("caption" in img) withMeta.caption = img.caption ?? null
      if ("source" in img) withMeta.source = img.source ?? null
      if ("rights" in img && img.rights) withMeta.rights = img.rights
      if ("modelStatus" in img && img.modelStatus) withMeta.model_status = img.modelStatus

      if (metaSupported && Object.keys(withMeta).length > Object.keys(base).length) {
        const { error } = await supabase
          .from("product_images")
          .update(withMeta)
          .eq("id", img.id)
          .eq("product_id", product.id)
        if (error?.code === "42703") {
          metaSupported = false
          await supabase
            .from("product_images")
            .update(base)
            .eq("id", img.id)
            .eq("product_id", product.id)
        }
      } else {
        await supabase
          .from("product_images")
          .update(base)
          .eq("id", img.id)
          .eq("product_id", product.id)
      }
    }

    const thumbnailUrl = await syncProductThumbnail(supabase, product.id)

    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })

    return NextResponse.json({
      thumbnailUrl,
      images: (data ?? []).map((row: ProductImageRow) => toImagePayload(row)),
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  const imageId = request.nextUrl.searchParams.get("imageId")

  if (!imageId) {
    return NextResponse.json({ error: "imageId is required" }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const product = await resolveProductByIdOrSlug(supabase, id)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data: row, error: fetchError } = await supabase
      .from("product_images")
      .select("*")
      .eq("id", imageId)
      .eq("product_id", product.id)
      .maybeSingle()

    if (fetchError || !row) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    await deleteStorageObject("product-images", row.url)
    await supabase.from("product_images").delete().eq("id", imageId)

    const { data: remaining } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })

    if (remaining && remaining.length > 0) {
      let order = 0
      for (const img of remaining) {
        await supabase
          .from("product_images")
          .update({ sort_order: order, is_thumbnail: order === 0 })
          .eq("id", img.id)
        order += 1
      }
    }

    await syncProductThumbnail(supabase, product.id)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

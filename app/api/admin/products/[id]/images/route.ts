import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { resolveProductByIdOrSlug } from "@/lib/admin/resolve-product"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  deleteStorageObject,
  uploadProductImageServer,
} from "@/lib/supabase/storage-server"

type RouteContext = { params: Promise<{ id: string }> }

type ProductImageRow = {
  id: string
  product_id: string
  url: string
  sort_order: number
  is_thumbnail: boolean
  created_at: string
}

async function syncProductThumbnail(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string
) {
  const { data: thumb } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", productId)
    .eq("is_thumbnail", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: first } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle()

  const url = thumb?.url ?? first?.url ?? null
  await supabase
    .from("products")
    .update({ thumbnail_url: url })
    .eq("id", productId)
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
      images: (data ?? []).map((row: ProductImageRow) => ({
        id: row.id,
        url: row.url,
        sortOrder: row.sort_order,
        isThumbnail: row.is_thumbnail,
        createdAt: row.created_at,
      })),
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

    const { count } = await supabase
      .from("product_images")
      .select("*", { count: "exact", head: true })
      .eq("product_id", product.id)

    let nextOrder = count ?? 0
    const inserted: ProductImageRow[] = []

    for (const file of files) {
      const url = await uploadProductImageServer(file, product.slug)
      const isFirst = nextOrder === 0 && (count ?? 0) === 0

      const { data: row, error } = await supabase
        .from("product_images")
        .insert({
          product_id: product.id,
          url,
          sort_order: nextOrder,
          is_thumbnail: isFirst,
        })
        .select("*")
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      inserted.push(row as ProductImageRow)
      nextOrder += 1
    }

    await syncProductThumbnail(supabase, product.id)

    return NextResponse.json({
      images: inserted.map((row) => ({
        id: row.id,
        url: row.url,
        sortOrder: row.sort_order,
        isThumbnail: row.is_thumbnail,
        createdAt: row.created_at,
      })),
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
    }>

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid images payload" }, { status: 400 })
    }

    await supabase
      .from("product_images")
      .update({ is_thumbnail: false })
      .eq("product_id", product.id)

    for (const img of images) {
      await supabase
        .from("product_images")
        .update({
          sort_order: img.sortOrder,
          is_thumbnail: Boolean(img.isThumbnail),
        })
        .eq("id", img.id)
        .eq("product_id", product.id)
    }

    await syncProductThumbnail(supabase, product.id)

    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order", { ascending: true })

    return NextResponse.json({
      images: (data ?? []).map((row: ProductImageRow) => ({
        id: row.id,
        url: row.url,
        sortOrder: row.sort_order,
        isThumbnail: row.is_thumbnail,
        createdAt: row.created_at,
      })),
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

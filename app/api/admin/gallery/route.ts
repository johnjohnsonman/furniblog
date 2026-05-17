import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { isMissingTableError, jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  deleteStorageObject,
  uploadGalleryImageServer,
} from "@/lib/supabase/storage-server"

type GalleryRow = {
  id: string
  url: string
  caption: string | null
  category: string
  product_id: string | null
  published: boolean
  sort_order: number
  width: number | null
  height: number | null
  created_at: string
  products: { slug: string; name: string } | { slug: string; name: string }[] | null
}

function mapGalleryRow(row: GalleryRow) {
  const product = Array.isArray(row.products) ? row.products[0] : row.products
  return {
    id: row.id,
    url: row.url,
    caption: row.caption,
    category: row.category,
    productId: row.product_id,
    published: row.published,
    sortOrder: row.sort_order,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    product: product ? { slug: product.slug, name: product.name } : null,
  }
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("gallery_images")
      .select(
        "id, url, caption, category, product_id, published, sort_order, width, height, created_at, products(slug, name)"
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ images: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      images: (data ?? []).map((row) => mapGalleryRow(row as GalleryRow)),
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const supabase = createAdminClient()
    const contentType = request.headers.get("content-type") ?? ""

    let url: string | null = null
    let caption: string | null = null
    let category = "office"
    let productId: string | null = null
    let published = false
    let width: number | null = null
    let height: number | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file")
      caption = (formData.get("caption") as string | null)?.trim() || null
      category = (formData.get("category") as string) || "office"
      const pid = formData.get("productId")
      productId = typeof pid === "string" && pid ? pid : null
      published = formData.get("published") === "true"
      const w = formData.get("width")
      const h = formData.get("height")
      width = w ? Number(w) : null
      height = h ? Number(h) : null

      if (file instanceof File) {
        url = await uploadGalleryImageServer(file)
      } else {
        const urlField = formData.get("url")
        if (typeof urlField === "string" && urlField) url = urlField
      }
    } else {
      const body = await request.json()
      url = body.url ?? null
      caption = body.caption ?? null
      category = body.category ?? "office"
      productId = body.productId ?? null
      published = Boolean(body.published)
      width = body.width ?? null
      height = body.height ?? null
    }

    if (!url) {
      return NextResponse.json({ error: "Image file or URL is required" }, { status: 400 })
    }

    const { count } = await supabase
      .from("gallery_images")
      .select("*", { count: "exact", head: true })

    const { data: row, error } = await supabase
      .from("gallery_images")
      .insert({
        url,
        caption,
        category,
        product_id: productId,
        published,
        sort_order: count ?? 0,
        width,
        height,
      })
      .select(
        "id, url, caption, category, product_id, published, sort_order, width, height, created_at, products(slug, name)"
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ image: mapGalleryRow(row as GalleryRow) })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const id = body.id as string | undefined
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const updates: Record<string, unknown> = {}

    if ("caption" in body) updates.caption = body.caption
    if ("category" in body) updates.category = body.category
    if ("productId" in body) updates.product_id = body.productId
    if ("published" in body) updates.published = body.published
    if ("sortOrder" in body) updates.sort_order = body.sortOrder
    if ("width" in body) updates.width = body.width
    if ("height" in body) updates.height = body.height

    const { data: row, error } = await supabase
      .from("gallery_images")
      .update(updates)
      .eq("id", id)
      .select(
        "id, url, caption, category, product_id, published, sort_order, width, height, created_at, products(slug, name)"
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ image: mapGalleryRow(row as GalleryRow) })
  } catch (error) {
    return jsonInternalError(error)
  }
}

export async function DELETE(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const { data: row, error: fetchError } = await supabase
      .from("gallery_images")
      .select("url")
      .eq("id", id)
      .maybeSingle()

    if (fetchError || !row) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    if (row.url.includes("/storage/v1/object/public/gallery/")) {
      await deleteStorageObject("gallery", row.url)
    }

    const { error } = await supabase.from("gallery_images").delete().eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

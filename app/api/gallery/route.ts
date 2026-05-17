import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isMissingTableError, jsonInternalError } from "@/lib/admin/api-response"

type GalleryRow = {
  id: string
  url: string
  caption: string | null
  category: string
  width: number | null
  height: number | null
  sort_order: number
  products: { slug: string; name: string } | { slug: string; name: string }[] | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")?.trim()
  const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 20), 1), 100)
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1)
  const offset = (page - 1) * limit

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from("gallery_images")
      .select(
        "id, url, caption, category, width, height, sort_order, products(slug, name)",
        { count: "exact" }
      )
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error, count } = await query

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({
          images: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const images = (data ?? []).map((row: GalleryRow) => {
      const product = Array.isArray(row.products)
        ? row.products[0]
        : row.products
      return {
        id: row.id,
        url: row.url,
        caption: row.caption,
        category: row.category,
        width: row.width,
        height: row.height,
        sortOrder: row.sort_order,
        product: product
          ? { slug: product.slug, name: product.name }
          : null,
      }
    })

    const total = count ?? 0
    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    })
  } catch (error) {
    return jsonInternalError(error)
  }
}

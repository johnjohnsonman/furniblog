import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.trim()
  const brand = searchParams.get("brand")?.trim()
  const publishedOnly = searchParams.get("published") === "true"
  const limit = parseInt(searchParams.get("limit") ?? "0", 10)

  try {
    const supabase = createAdminClient()
    let query = supabase
      .from("products")
      .select(
        "id, slug, name, category, price_usd, price_krw, published, created_at, brands(slug, name)"
      )
      .eq("track", "chair")
      .order("name")

    if (publishedOnly) {
      query = query.eq("published", true)
    }

    if (limit > 0) {
      query = query.limit(limit)
    }

    if (brand) {
      const { data: brandRow } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", brand)
        .maybeSingle()
      if (brandRow) query = query.eq("brand_id", brandRow.id)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    let items = (data ?? []).map((row) => {
      const b = Array.isArray(row.brands) ? row.brands[0] : row.brands
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        brand: b?.name ?? "",
        brandSlug: b?.slug ?? "",
        category: row.category,
        priceUsd: row.price_usd,
        priceKrw: row.price_krw,
        published: row.published,
      }
    })

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({ products: items })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load products"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const supabase = createAdminClient()

    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", body.brandSlug)
      .maybeSingle()

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 400 })
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        slug: body.slug,
        name: body.name,
        brand_id: brand.id,
        category: body.category,
        track: "chair",
        price_usd: body.priceUsd ?? null,
        price_krw: body.priceKrw ?? null,
        description_ko: body.description ?? "",
        description_en: body.description ?? "",
        thumbnail_url: body.thumbnailUrl ?? null,
        chair_specs: body.chairSpecs ?? null,
        seo_title: body.seoTitle ?? null,
        seo_description: body.seoDescription ?? null,
        published: body.published ?? false,
        pros: body.pros ?? [],
        cons: body.cons ?? [],
      })
      .select("id, slug")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (body.affiliateLinks?.length) {
      await supabase.from("affiliate_links").insert(
        body.affiliateLinks.map(
          (link: {
            retailerName: string
            url: string
            priceUsd?: number
            priceKrw?: number
            isOfficial?: boolean
          }) => ({
            product_id: product.id,
            retailer_name: link.retailerName,
            url: link.url,
            price_usd: link.priceUsd ?? null,
            price_krw: link.priceKrw ?? null,
            is_official: link.isOfficial ?? false,
            is_active: true,
          })
        )
      )
    }

    return NextResponse.json({ product })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

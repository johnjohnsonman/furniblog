import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { createAdminClient } from "@/lib/supabase/admin"

type RouteContext = { params: Promise<{ id: string }> }

async function resolveProduct(supabase: ReturnType<typeof createAdminClient>, id: string) {
  const isUuid = id.includes("-") && id.length === 36
  let query = supabase
    .from("products")
    .select("*, brands(slug, name)")
    .eq("track", "chair")

  query = isUuid ? query.eq("id", id) : query.eq("slug", id)
  return query.maybeSingle()
}

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { data, error } = await resolveProduct(supabase, id)
    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { data: links } = await supabase
      .from("affiliate_links")
      .select("*")
      .eq("product_id", data.id)

    const brand = Array.isArray(data.brands) ? data.brands[0] : data.brands

    return NextResponse.json({
      product: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        brandSlug: brand?.slug ?? "",
        category: data.category,
        priceUsd: data.price_usd,
        priceKrw: data.price_krw,
        description: data.description_ko,
        thumbnailUrl: data.thumbnail_url,
        chairSpecs: data.chair_specs,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        published: data.published,
        affiliateLinks: (links ?? []).map((l) => ({
          id: l.id,
          retailerName: l.retailer_name,
          url: l.url,
          priceUsd: l.price_usd,
          priceKrw: l.price_krw,
          isOfficial: l.is_official,
        })),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Load failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const body = await request.json()
    const supabase = createAdminClient()
    const { data: existing } = await resolveProduct(supabase, id)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", body.brandSlug)
      .maybeSingle()

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 400 })
    }

    const { error } = await supabase
      .from("products")
      .update({
        slug: body.slug,
        name: body.name,
        brand_id: brand.id,
        category: body.category,
        price_usd: body.priceUsd ?? null,
        price_krw: body.priceKrw ?? null,
        description_ko: body.description ?? "",
        description_en: body.description ?? "",
        thumbnail_url: body.thumbnailUrl ?? null,
        chair_specs: body.chairSpecs ?? null,
        seo_title: body.seoTitle ?? null,
        seo_description: body.seoDescription ?? null,
        published: body.published ?? false,
      })
      .eq("id", existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (body.affiliateLinks) {
      await supabase.from("affiliate_links").delete().eq("product_id", existing.id)
      if (body.affiliateLinks.length) {
        await supabase.from("affiliate_links").insert(
          body.affiliateLinks.map(
            (link: {
              retailerName: string
              url: string
              priceUsd?: number
              priceKrw?: number
              isOfficial?: boolean
            }) => ({
              product_id: existing.id,
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
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params
  try {
    const supabase = createAdminClient()
    const { data: existing } = await resolveProduct(supabase, id)
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const { error } = await supabase.from("products").delete().eq("id", existing.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

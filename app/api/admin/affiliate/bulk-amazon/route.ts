import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link"
import { createAdminClient } from "@/lib/supabase/admin"

type Body = {
  /** all = every chair product; missing = only products with no affiliate_links */
  mode?: "all" | "missing"
  productSlug?: string
  /** If true, replace existing links with a single Amazon link */
  replaceExisting?: boolean
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  let body: Body = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const mode = body.mode ?? "missing"
  const replaceExisting = body.replaceExisting ?? true

  try {
    const supabase = createAdminClient()

    let query = supabase
      .from("products")
      .select("id, slug, name, price_usd, brands(name)")
      .eq("track", "chair")
      .order("name")

    if (body.productSlug) {
      query = query.eq("slug", body.productSlug)
    }

    const { data: products, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results: {
      slug: string
      name: string
      source: "catalog" | "search"
      skipped?: boolean
    }[] = []

    for (const row of products ?? []) {
      const brand = Array.isArray(row.brands) ? row.brands[0] : row.brands
      const brandName = brand?.name as string | undefined

      if (mode === "missing" && !body.productSlug) {
        const { count } = await supabase
          .from("affiliate_links")
          .select("*", { count: "exact", head: true })
          .eq("product_id", row.id)

        if ((count ?? 0) > 0) {
          results.push({
            slug: row.slug,
            name: row.name,
            source: "search",
            skipped: true,
          })
          continue
        }
      }

      const amazon = resolveAmazonAffiliateLink(row.slug, row.name, brandName)

      if (replaceExisting) {
        await supabase.from("affiliate_links").delete().eq("product_id", row.id)
      }

      const { error: insertError } = await supabase.from("affiliate_links").insert({
        product_id: row.id,
        retailer_name: amazon.retailerName,
        channel: "amazon",
        url: amazon.url,
        price_usd: amazon.priceUsd ?? row.price_usd ?? null,
        is_official: false,
        is_active: true,
      })

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message, slug: row.slug },
          { status: 500 }
        )
      }

      results.push({
        slug: row.slug,
        name: row.name,
        source: amazon.source,
      })
    }

    const filled = results.filter((r) => !r.skipped)
    return NextResponse.json({
      ok: true,
      filled: filled.length,
      skipped: results.filter((r) => r.skipped).length,
      catalog: filled.filter((r) => r.source === "catalog").length,
      search: filled.filter((r) => r.source === "search").length,
      results,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bulk fill failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

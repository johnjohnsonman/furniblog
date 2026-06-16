import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const RATING_FIELDS = [
  "rating_overall",
  "rating_comfort",
  "rating_ergonomics",
] as const

type ProductRow = {
  id: string
  name: string
  category: string | null
  price_range: string | null
  rating_overall: number | null
  rating_comfort: number | null
  rating_ergonomics: number | null
  brands: { name: string } | { name: string }[] | null
}

function brandName(b: ProductRow["brands"]): string | null {
  if (!b) return null
  return Array.isArray(b) ? (b[0]?.name ?? null) : b.name
}

/** List products with their editorial ratings. */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, category, price_range, rating_overall, rating_comfort, rating_ergonomics, brands(name)"
      )
      .order("name", { ascending: true })
      .limit(1000)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const products = ((data ?? []) as ProductRow[]).map((p) => ({
      id: p.id,
      name: p.name,
      brand: brandName(p.brands),
      category: p.category,
      priceRange: p.price_range,
      ratingOverall: p.rating_overall,
      ratingComfort: p.rating_comfort,
      ratingErgonomics: p.rating_ergonomics,
    }))
    return NextResponse.json({ products })
  } catch (error) {
    return jsonInternalError(error)
  }
}

/** Update one product's editorial ratings (0–10, or null to clear). */
export async function PATCH(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json()
    const id = typeof body.id === "string" ? body.id : null
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const update: Record<string, number | null> = {}
    for (const f of RATING_FIELDS) {
      if (!(f in body)) continue
      const v = body[f]
      if (v === null || v === "") {
        update[f] = null
      } else {
        const n = Number(v)
        if (Number.isNaN(n) || n < 0 || n > 10) {
          return NextResponse.json(
            { error: `${f} must be between 0 and 10` },
            { status: 400 }
          )
        }
        // rating_comfort / rating_ergonomics are smallint columns — store whole
        // numbers (0–10 granularity is plenty for the editorial signal).
        update[f] = Math.round(n)
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No ratings to update" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("products")
      .update(update)
      .eq("id", id)
      .select("id, rating_overall, rating_comfort, rating_ergonomics")
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ product: data })
  } catch (error) {
    return jsonInternalError(error)
  }
}

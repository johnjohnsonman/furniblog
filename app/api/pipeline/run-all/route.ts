import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 30

/** Returns chair batch metadata for client-side browser collection loops. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  try {
    const body = await request.json().catch(() => ({}))
    const index = Math.max(0, Number(body.index ?? 0) || 0)

    const supabase = createAdminClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("id, slug, name")
      .eq("track", "chair")
      .order("name")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const list = products ?? []
    const total = list.length

    if (total === 0 || index >= total) {
      return NextResponse.json({
        done: true,
        next: total,
        total,
        product: null,
      })
    }

    const product = list[index]
    const nextIndex = index + 1

    return NextResponse.json({
      done: nextIndex >= total,
      next: nextIndex,
      total,
      index,
      product: {
        id: product.id,
        slug: product.slug,
        name: product.name,
      },
    })
  } catch (error) {
    console.error("[pipeline/run-all]", error)
    return jsonInternalError(error)
  }
}

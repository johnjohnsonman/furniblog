import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  uploadGalleryImageServer,
  deleteStorageObject,
} from "@/lib/supabase/storage-server"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

async function loadBrand(slug: string): Promise<{ id: string; logo_url: string | null } | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("brands")
    .select("id, logo_url")
    .eq("slug", slug)
    .maybeSingle()
  if (!data) return null
  return { id: data.id as string, logo_url: (data.logo_url as string | null) ?? null }
}

// Upload / replace the brand's official logo (stored in logo_url).
export async function POST(request: NextRequest, context: Ctx) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { slug } = await context.params
  try {
    const current = await loadBrand(slug)
    if (!current) return NextResponse.json({ error: "Brand not found" }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    const url = await uploadGalleryImageServer(file, `brand-logo-${slug}`)

    const supabase = createAdminClient()
    const { error } = await supabase.from("brands").update({ logo_url: url }).eq("id", current.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Best-effort cleanup of the old logo file.
    if (current.logo_url && current.logo_url !== url) {
      await deleteStorageObject("gallery", current.logo_url).catch(() => {})
    }
    return NextResponse.json({ logo_url: url })
  } catch (error) {
    return jsonInternalError(error)
  }
}

// Remove the brand's logo.
export async function DELETE(request: NextRequest, context: Ctx) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { slug } = await context.params
  try {
    const current = await loadBrand(slug)
    if (!current) return NextResponse.json({ error: "Brand not found" }, { status: 404 })

    const supabase = createAdminClient()
    const { error } = await supabase.from("brands").update({ logo_url: null }).eq("id", current.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (current.logo_url) {
      await deleteStorageObject("gallery", current.logo_url).catch(() => {})
    }
    return NextResponse.json({ logo_url: null })
  } catch (error) {
    return jsonInternalError(error)
  }
}

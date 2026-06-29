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

async function loadImages(slug: string): Promise<{ id: string; images: string[] } | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("brands")
    .select("id, images")
    .eq("slug", slug)
    .maybeSingle()
  if (!data) return null
  return { id: data.id as string, images: (data.images as string[] | null) ?? [] }
}

// Upload a new image and append it to the brand's images array.
export async function POST(request: NextRequest, context: Ctx) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { slug } = await context.params
  try {
    const current = await loadImages(slug)
    if (!current) return NextResponse.json({ error: "Brand not found" }, { status: 404 })

    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    const url = await uploadGalleryImageServer(file, `brand-${slug}`)
    const images = [...current.images, url]

    const supabase = createAdminClient()
    const { error } = await supabase.from("brands").update({ images }).eq("id", current.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ images })
  } catch (error) {
    return jsonInternalError(error)
  }
}

// Replace the whole images array (reorder / set cover / delete).
export async function PATCH(request: NextRequest, context: Ctx) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const { slug } = await context.params
  try {
    const current = await loadImages(slug)
    if (!current) return NextResponse.json({ error: "Brand not found" }, { status: 404 })

    const body = await request.json()
    const next = Array.isArray(body.images)
      ? (body.images as unknown[]).filter((u): u is string => typeof u === "string" && Boolean(u.trim()))
      : null
    if (!next) return NextResponse.json({ error: "images array required" }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from("brands").update({ images: next }).eq("id", current.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Best-effort cleanup of removed files from storage.
    const removed = current.images.filter((u) => !next.includes(u))
    await Promise.all(removed.map((u) => deleteStorageObject("gallery", u).catch(() => {})))

    return NextResponse.json({ images: next })
  } catch (error) {
    return jsonInternalError(error)
  }
}

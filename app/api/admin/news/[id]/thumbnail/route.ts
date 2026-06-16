import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  deleteStorageObject,
  uploadGalleryImageServer,
} from "@/lib/supabase/storage-server"

export const runtime = "nodejs"

type RouteContext = { params: Promise<{ id: string }> }

/** True when a URL points at our own Supabase storage (safe to delete). */
function isOwnStorageUrl(url: string | null): boolean {
  return !!url && url.includes("/storage/v1/object/public/gallery/")
}

/** Upload a custom thumbnail for a news article and set it as image_url. */
export async function POST(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params

  try {
    const supabase = createAdminClient()

    const { data: news, error: findError } = await supabase
      .from("news")
      .select("id, image_url")
      .eq("id", id)
      .maybeSingle()
    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 })
    }
    if (!news) {
      return NextResponse.json({ error: "News item not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file =
      (formData.get("file") as File | null) ??
      (formData.getAll("files").find((f): f is File => f instanceof File) ?? null)

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    let url: string
    try {
      url = await uploadGalleryImageServer(file, "news")
    } catch (uploadErr) {
      const message =
        uploadErr instanceof Error ? uploadErr.message : "Storage upload failed"
      return NextResponse.json({ error: message }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from("news")
      .update({ image_url: url })
      .eq("id", id)
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Clean up a previously uploaded thumbnail (don't orphan storage objects).
    if (isOwnStorageUrl(news.image_url) && news.image_url !== url) {
      await deleteStorageObject("gallery", news.image_url as string)
    }

    return NextResponse.json({ image_url: url })
  } catch (error) {
    return jsonInternalError(error)
  }
}

/** Clear a news article's thumbnail (back to the brand/gradient fallback). */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await context.params

  try {
    const supabase = createAdminClient()

    const { data: news, error: findError } = await supabase
      .from("news")
      .select("id, image_url")
      .eq("id", id)
      .maybeSingle()
    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 })
    }
    if (!news) {
      return NextResponse.json({ error: "News item not found" }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from("news")
      .update({ image_url: null })
      .eq("id", id)
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    if (isOwnStorageUrl(news.image_url)) {
      await deleteStorageObject("gallery", news.image_url as string)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonInternalError(error)
  }
}

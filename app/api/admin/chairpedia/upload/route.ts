import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin/api-auth"
import { jsonInternalError } from "@/lib/admin/api-response"
import { uploadGalleryImageServer } from "@/lib/supabase/storage-server"

export const runtime = "nodejs"

// Generic image upload for the Chairpedia editor (hero + in-body images).
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    const url = await uploadGalleryImageServer(file, "chairpedia")
    return NextResponse.json({ url })
  } catch (error) {
    return jsonInternalError(error)
  }
}

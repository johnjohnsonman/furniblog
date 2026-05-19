import { createAdminClient } from "@/lib/supabase/admin"
import { validateImageFile } from "@/lib/supabase/storage"

const PRODUCT_BUCKET = "product-images"
const GALLERY_BUCKET = "gallery"

function storagePathFromPublicUrl(
  bucket: string,
  publicUrl: string
): string | null {
  try {
    const url = new URL(publicUrl)
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

export async function uploadProductImageServer(
  file: File,
  productSlug: string
): Promise<string> {
  const ext = validateImageFile(file)
  const supabase = createAdminClient()
  const path = `${productSlug}-${Date.now()}.${ext}`

  console.log("[STORAGE] Uploading:", path, "size:", file.size, "type:", file.type)

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

  if (error) {
    console.error("[STORAGE] Upload error:", error)
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path)
  console.log("[STORAGE] Public URL:", data.publicUrl)
  return data.publicUrl
}

export async function uploadGalleryImageServer(
  file: File,
  prefix = "gallery"
): Promise<string> {
  const ext = validateImageFile(file)
  const supabase = createAdminClient()
  const path = `${prefix}-${Date.now()}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteStorageObject(
  bucket: "product-images" | "gallery",
  url: string
): Promise<void> {
  const path = storagePathFromPublicUrl(bucket, url)
  if (!path) return
  const supabase = createAdminClient()
  await supabase.storage.from(bucket).remove([path])
}

import { createClient } from "@/lib/supabase/client"

const PRODUCT_BUCKET = "product-images"
const GALLERY_BUCKET = "gallery"
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"])

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StorageValidationError"
  }
}

function getExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase()
  if (fromName && ALLOWED_EXT.has(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName
  }
  if (file.type === "image/jpeg") return "jpg"
  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"
  throw new StorageValidationError("Only JPG, PNG, and WebP files are allowed")
}

export function validateImageFile(file: File): string {
  if (file.size > MAX_BYTES) {
    throw new StorageValidationError("File must be 5MB or smaller")
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new StorageValidationError("Only JPG, PNG, and WebP files are allowed")
  }
  return getExtension(file)
}

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

/**
 * Client-side upload uses the anon key and often fails without storage RLS for authenticated users.
 * Use POST /api/admin/products/[id]/images from the admin UI instead.
 */
export async function uploadProductImage(
  file: File,
  productSlug: string
): Promise<string | null> {
  void file
  void productSlug
  console.warn(
    "[uploadProductImage] Client-side storage upload is disabled. Use the admin API route."
  )
  return null
}

export async function uploadGalleryImage(
  file: File,
  prefix = "gallery"
): Promise<string | null> {
  try {
    const ext = validateImageFile(file)
    const supabase = createClient()
    const path = `${prefix}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      console.error("[uploadGalleryImage]", error.message)
      return null
    }

    const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path)
    return data.publicUrl
  } catch (err) {
    console.error("[uploadGalleryImage]", err)
    return null
  }
}

export async function deleteProductImage(url: string): Promise<void> {
  const path = storagePathFromPublicUrl(PRODUCT_BUCKET, url)
  if (!path) return
  const supabase = createClient()
  await supabase.storage.from(PRODUCT_BUCKET).remove([path])
}

export async function deleteGalleryImage(url: string): Promise<void> {
  const path = storagePathFromPublicUrl(GALLERY_BUCKET, url)
  if (!path) return
  const supabase = createClient()
  await supabase.storage.from(GALLERY_BUCKET).remove([path])
}

export async function getProductImages(productSlug: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(PRODUCT_BUCKET).list("", {
    limit: 100,
    search: productSlug,
  })

  if (error || !data) return []

  return data
    .filter((item) => item.name.startsWith(`${productSlug}-`))
    .map((item) => {
      const { data: urlData } = supabase.storage
        .from(PRODUCT_BUCKET)
        .getPublicUrl(item.name)
      return urlData.publicUrl
    })
}

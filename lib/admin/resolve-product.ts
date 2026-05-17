import type { createAdminClient } from "@/lib/supabase/admin"

export async function resolveProductByIdOrSlug(
  supabase: ReturnType<typeof createAdminClient>,
  idOrSlug: string
) {
  const isUuid = idOrSlug.includes("-") && idOrSlug.length === 36
  let query = supabase
    .from("products")
    .select("id, slug, name, thumbnail_url")
    .eq("track", "chair")

  query = isUuid ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug)
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  return data
}

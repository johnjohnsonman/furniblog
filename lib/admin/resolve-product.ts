import type { createAdminClient } from "@/lib/supabase/admin"

export async function resolveProductByIdOrSlug(
  supabase: ReturnType<typeof createAdminClient>,
  idOrSlug: string
) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug
    )
  let query = supabase
    .from("products")
    .select("id, slug, name, thumbnail_url")
    .eq("track", "chair")

  query = isUuid ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug)
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  return data
}

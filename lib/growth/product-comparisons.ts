import { createPublicServerClient } from "@/lib/supabase/public-server"

export type ProductComparisonLink = { slug: string; title: string }

export async function getPublishedProductComparisons(
  productSlug: string,
  limit = 6
): Promise<ProductComparisonLink[]> {
  try {
    const supabase = createPublicServerClient()
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .maybeSingle()
    if (!product?.id) return []

    const { data } = await supabase
      .from("comparisons")
      .select("slug,title")
      .eq("status", "published")
      .or(`product_a_id.eq.${product.id},product_b_id.eq.${product.id}`)
      .limit(limit)

    return (data as ProductComparisonLink[] | null) ?? []
  } catch {
    return []
  }
}

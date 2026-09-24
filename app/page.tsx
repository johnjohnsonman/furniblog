import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { ReferenceHome } from "@/components/home/reference-home"
import { CHAIR_CATEGORIES, countByChairCategory } from "@/lib/chair-categories"
import { getAllProductFitEvidenceFields } from "@/lib/data/product-fit-evidence"
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schemas"
import { getProducts } from "@/lib/supabase/queries"
import { randomOrder } from "@/lib/random-order"

export const dynamic = "force-dynamic"
export const metadata = {
  title: { absolute: "Chairpedia | The Global Chair Reference" },
  description: "Explore chairs, source-linked specifications, exact configurations, comparisons and places to try chairs around the world.",
  alternates: { canonical: "/" },
}

export default async function HomePage() {
  const [products, evidenceFields] = await Promise.all([getProducts(), getAllProductFitEvidenceFields()])
  const ordered = randomOrder(products)
  const counts = countByChairCategory(products)
  const brands = new Set(products.map((product) => product.brand).filter(Boolean))
  const cards = ordered.map((product) => ({
    slug: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    categoryLabel: product.categoryLabel,
    image: product.images?.[0] ?? product.image ?? null,
    sourcedFields: evidenceFields.get(product.id)?.size ?? 0,
  }))

  return <div className="min-h-screen bg-[#faf8f4] text-[#1b1a19]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([generateOrganizationSchema(), generateWebsiteSchema()]) }} />
    <Header />
    <main><ReferenceHome products={cards} categories={CHAIR_CATEGORIES.map((category) => ({ id: category.id, label: category.label, count: counts[category.id] }))} totals={{ chairs: products.length, brands: brands.size, categories: CHAIR_CATEGORIES.filter((category) => counts[category.id] > 0).length }} /></main>
    <Footer />
  </div>
}

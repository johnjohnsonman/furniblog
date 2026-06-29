import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, ChevronDown } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BrandProductsGrid } from "@/components/brands/brand-products-grid"
import { BrandHeroCarousel } from "@/components/brands/brand-hero-carousel"
import {
  getBrandBySlug,
  getBrandsWithCounts,
  getProductsByBrandSlug,
  getReviewCounts,
} from "@/lib/supabase/queries"
import {
  getBrandLongDescription,
  getBrandWarrantyLabel,
} from "@/lib/brand-assets"

interface BrandPageProps {
  params: Promise<{ id: string }>
}

// Statically generated per brand, but re-validate every 10 min so product
// prices on the brand grid stay in sync with the DB after catalog updates.
export const revalidate = 600

export async function generateStaticParams() {
  const brands = await getBrandsWithCounts()
  return brands.map((brand) => ({ id: brand.slug }))
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { id } = await params
  const brand = await getBrandBySlug(id)
  if (!brand) return {}
  const description = `${brand.name} office chairs — specs, real reviews, videos and prices. ${brand.country ? `From ${brand.country}.` : ""}`.trim()
  // A brand page with no products is thin/soft-404 — keep it reachable but noindex.
  const products = await getProductsByBrandSlug(brand.slug)
  return {
    title: `${brand.name} Chairs — Reviews & Specs`,
    description,
    alternates: { canonical: `/brands/${brand.slug}` },
    ...(products.length === 0 ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${brand.name} Chairs — Reviews & Specs`,
      description,
      url: `/brands/${brand.slug}`,
    },
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { id } = await params
  const brand = await getBrandBySlug(id)

  if (!brand) {
    notFound()
  }

  const products = await getProductsByBrandSlug(brand.slug)
  const reviewCounts = await getReviewCounts(products.map((p) => p.id))

  const longDescription = getBrandLongDescription(brand)
  const warrantyLabel = getBrandWarrantyLabel(brand.slug)
  const images = brand.images ?? []
  // A short philosophy line for the hero quote (first 1–2 sentences).
  const quote = longDescription.split(/(?<=\.)\s+/).slice(0, 2).join(" ")

  const stats = [
    { label: `${products.length} ${products.length === 1 ? "Chair" : "Chairs"}` },
    ...(brand.founded > 0 ? [{ label: `Est. ${brand.founded}` }] : []),
    ...(brand.country ? [{ label: brand.country }] : []),
    ...(warrantyLabel ? [{ label: warrantyLabel }] : []),
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero — editorial two-column (text + image carousel) */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
            <Link
              href="/brands"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All brands
            </Link>

            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {brand.country}
                  {brand.founded > 0 && <> · Est. {brand.founded}</>}
                </p>
                <h1 className="mt-3 font-serif text-4xl font-medium text-foreground md:text-5xl">
                  {brand.name}
                </h1>
                <blockquote className="mt-5 border-l-2 border-foreground/15 pl-4 font-serif text-lg italic leading-relaxed text-foreground/80">
                  {quote}
                </blockquote>

                <div className="mt-6 flex flex-wrap gap-2">
                  {stats.map((stat) => (
                    <span
                      key={stat.label}
                      className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
                    >
                      {stat.label}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#chairs"
                    className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    View all chairs
                    <ChevronDown className="h-4 w-4" />
                  </a>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Official site
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              <BrandHeroCarousel
                images={images}
                name={brand.name}
                colorPrimary={brand.colorPrimary}
                colorSecondary={brand.colorSecondary}
              />
            </div>
          </div>
        </section>

        {/* Long description */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
            <p className="text-base leading-relaxed text-muted-foreground">
              {longDescription}
            </p>
          </div>
        </section>

        <BrandProductsGrid
          products={products}
          reviewCounts={reviewCounts}
          brandName={brand.name}
        />

        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All brands
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

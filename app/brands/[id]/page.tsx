import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowUpRight, ChevronDown } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BrandProductsGrid } from "@/components/brands/brand-products-grid"
import {
  getBrandBySlug,
  getBrandsWithCounts,
  getProductsByBrandSlug,
  getReviewCounts,
} from "@/lib/supabase/queries"
import {
  getBrandGradientStyle,
  getBrandHeroImage,
  getBrandLogoInitials,
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

  const heroImage = getBrandHeroImage(brand.slug, brand.heroImageUrl)
  const gradientStyle = getBrandGradientStyle(
    brand.colorPrimary,
    brand.colorSecondary
  )
  const longDescription = getBrandLongDescription(brand)
  const warrantyLabel = getBrandWarrantyLabel(brand.slug)
  const isLightHero =
    brand.slug === "hag-flokk" || brand.slug === "vitra"
  const textClass = isLightHero ? "text-gray-900" : "text-white"
  const mutedClass = isLightHero
    ? "text-gray-700/90"
    : "text-white/80"

  const stats = [
    {
      label: `${products.length} ${products.length === 1 ? "Chair" : "Chairs"}`,
    },
    ...(brand.founded > 0
      ? [{ label: `Est. ${brand.founded}` }]
      : []),
    { label: brand.country },
    ...(warrantyLabel ? [{ label: warrantyLabel }] : []),
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[400px] w-full overflow-hidden">
          <div className="absolute inset-0" style={gradientStyle} />
          <Image
            src={heroImage}
            alt=""
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-10 lg:px-8">
            <Link
              href="/brands"
              className={`mb-6 inline-flex items-center gap-2 text-sm ${mutedClass} transition-colors hover:opacity-100`}
            >
              <ArrowLeft className="h-4 w-4" />
              All brands
            </Link>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-end gap-5">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border text-xl font-bold backdrop-blur-sm ${
                    isLightHero
                      ? "border-gray-900/20 bg-white/60 text-gray-900"
                      : "border-white/20 bg-white/10 text-white"
                  }`}
                >
                  {getBrandLogoInitials(brand.name)}
                </div>
                <div>
                  <h1
                    className={`font-serif text-4xl font-medium md:text-5xl ${textClass}`}
                  >
                    {brand.name}
                  </h1>
                  <p className={`mt-2 text-sm md:text-base ${mutedClass}`}>
                    {brand.country}
                    {brand.founded > 0 && (
                      <>
                        {" "}
                        · Est. {brand.founded}
                      </>
                    )}
                  </p>
                  <p
                    className={`mt-3 max-w-xl text-sm md:text-base ${mutedClass} line-clamp-2`}
                  >
                    {longDescription.split(".").slice(0, 1).join(".")}.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-sm border px-4 py-2.5 text-sm font-medium transition-colors ${
                      isLightHero
                        ? "border-gray-900/30 bg-white/80 text-gray-900 hover:bg-white"
                        : "border-white/30 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Official site
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <a
                  href="#chairs"
                  className={`inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-medium transition-colors ${
                    isLightHero
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-white text-gray-900 hover:bg-white/90"
                  }`}
                >
                  View all chairs
                  <ChevronDown className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 py-4 lg:px-8">
            {stats.map((stat) => (
              <span
                key={stat.label}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-foreground"
              >
                {stat.label}
              </span>
            ))}
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

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Star, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products, getSimilarProducts } from "@/lib/data"
import { getChairReviewsForProduct } from "@/lib/data/chair-reviews"
import {
  getProductBySlug,
  getProductReviews,
  isSupabaseConfigured,
} from "@/lib/supabase/queries"
import { ProductChairTabs } from "@/components/chairs/ProductChairTabs"
import { getProductAffiliateLinks } from "@/lib/data/affiliate-links"
import { urlsFromCatalog } from "@/lib/affiliate/catalog-price-rows"
import { ChairProductOverview } from "@/components/chairs/ChairProductOverview"
import { ChairProductSpecs } from "@/components/chairs/ChairProductSpecs"
import { ProductImageGallery } from "@/components/chairs/ProductImageGallery"
import { ProductVideosSection } from "@/components/videos/product-videos-section"
import { fetchProductVideos } from "@/lib/videos/product-videos"
import { BuyButtonGroup } from "@/components/affiliate/BuyButton"
import {
  generateBreadcrumbSchema,
  generateChairSchema,
} from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function resolveProduct(slug: string) {
  const fromDb = await getProductBySlug(slug)
  if (fromDb) return fromDb
  return products.find((p) => p.id === slug || p.slug === slug)
}

export async function generateStaticParams() {
  if (isSupabaseConfigured()) {
    return []
  }
  return products.map((product) => ({ id: product.slug }))
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await resolveProduct(id)

  if (!product) {
    return {
      title: "Product Not Found | Furniblog",
    }
  }

  return {
    title: `${product.name} | Furniblog`,
    description:
      product.description ??
      product.overview ??
      `Specs, reviews, and where to buy the ${product.name}.`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await resolveProduct(id)

  if (!product) {
    notFound()
  }

  const supabaseReviews = isSupabaseConfigured()
    ? await getProductReviews(product.id)
    : []
  const {
    videos: productVideos,
    total: productVideoTotal,
    chairId: productVideoChairId,
  } = isSupabaseConfigured()
    ? await fetchProductVideos(product.id)
    : { videos: [], total: 0, chairId: null }
  const chairReviews =
    supabaseReviews.length > 0
      ? supabaseReviews
      : getChairReviewsForProduct(product.id)

  const slug = product.slug ?? product.id
  const catalogLinks = getProductAffiliateLinks(slug, product.name)
  const buyUrls = urlsFromCatalog(catalogLinks)

  const productWithLinks = { ...product, affiliateLinks: product.affiliateLinks ?? [] }
  const similarProducts = getSimilarProducts(productWithLinks, 3)
  const reviewCount =
    chairReviews.length > 0
      ? chairReviews.length
      : product.reviewCount ?? 0
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : []

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: product.brand, url: `/brands/${product.brandId}` },
    { name: product.name, url: `/products/${product.slug ?? product.id}` },
  ])

  const chairSchema = generateChairSchema(productWithLinks, chairReviews, [])

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(chairSchema),
        }}
      />

      <Header />

      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/brands/${product.brandId}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-10">
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-8 md:flex-row md:gap-10">
                <ProductImageGallery
                  images={galleryImages}
                  alt={product.name}
                  category={product.category}
                  className="w-full md:w-80 shrink-0"
                  badge={
                    product.availableInKorea ? (
                      <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
                        <MapPin className="h-3 w-3" />
                        Available in Korea
                      </div>
                    ) : undefined
                  }
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={`/brands/${product.brandId}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
                    <span>·</span>
                    <span>{product.categoryLabel ?? product.category}</span>
                  </div>

                  <h1 className="font-serif text-3xl font-medium text-foreground mt-2">{product.name}</h1>

                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <span>
                      {reviewCount.toLocaleString()}{" "}
                      {reviewCount === 1 ? "review" : "reviews"}
                    </span>
                    {productVideos.length > 0 && (
                      <>
                        <span>·</span>
                        <span>
                          {productVideos.length}{" "}
                          {productVideos.length === 1 ? "video" : "videos"}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-2xl font-semibold text-foreground mt-4">{product.price}</p>

                  <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{product.description}</p>

                  {product.bestFor && (
                    <p className="mt-3 text-sm">
                      <span className="text-muted-foreground">Best for: </span>
                      <span className="font-medium text-foreground">{product.bestFor}</span>
                    </p>
                  )}
                </div>
              </div>

              <ProductChairTabs
                productId={product.id}
                productName={product.name}
                catalogLinks={catalogLinks}
                reviews={chairReviews}
                reviewCount={reviewCount}
                defaultPrice={product.price}
                overview={
                  <ChairProductOverview
                    product={productWithLinks}
                    similarProducts={similarProducts}
                  />
                }
                specs={<ChairProductSpecs product={productWithLinks} />}
                videoCount={productVideos.length}
                videos={
                  productVideos.length > 0 ? (
                    <ProductVideosSection
                      videos={productVideos}
                      total={productVideoTotal}
                      chairName={product.name}
                      chairId={productVideoChairId ?? product.id}
                      amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
                      reviewCount={reviewCount}
                    />
                  ) : null
                }
              />
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-6 space-y-6">
                <div className="p-5 bg-card rounded-xl border border-border">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price Range</span>
                      <span className="font-medium text-foreground">{product.priceRange}</span>
                    </div>
                    {product.bestFor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best For</span>
                        <span className="font-medium text-foreground">{product.bestFor}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-medium text-foreground">{product.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand</span>
                      <Link href={`/brands/${product.brandId}`} className="font-medium text-foreground hover:underline">{product.brand}</Link>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-card rounded-xl border border-border">
                  <h3 className="font-medium text-foreground mb-4">Where to Buy</h3>
                  <BuyButtonGroup
                    productId={product.id}
                    officialUrl={buyUrls.officialUrl ?? product.officialUrl}
                    amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
                    coupangUrl={buyUrls.coupangUrl ?? product.coupangUrl}
                  />
                </div>

                {product.tryAtChairpark && product.chairparkUrl && (
                  <div className="p-5 bg-foreground text-background rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">Available in Korea</span>
                    </div>
                    <h3 className="font-serif text-lg font-medium mb-2">Try at Chairpark</h3>
                    <p className="text-sm text-background/70 mb-4">
                      Experience this chair in person at Chairpark showroom before you buy.
                    </p>
                    <a href={product.chairparkUrl} target="_blank" rel="noopener noreferrer" className="block w-full p-3 bg-background text-foreground rounded-lg text-center font-medium text-sm hover:bg-background/90 transition-colors">
                      Book Showroom Visit
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border lg:hidden z-50">
            <div className="flex gap-3">
              {(buyUrls.officialUrl ?? product.officialUrl) && (
                <a href={buyUrls.officialUrl ?? product.officialUrl} target="_blank" rel="nofollow sponsored noopener noreferrer" className="flex-1 p-3 bg-foreground text-background rounded-lg text-center font-medium text-sm">
                  Check price
                </a>
              )}
            </div>
          </div>

          <div className="h-20 lg:hidden" />
        </div>
      </main>

      <Footer />
    </div>
  )
}

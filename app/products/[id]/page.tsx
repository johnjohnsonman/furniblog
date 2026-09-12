import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, BookOpen, ArrowUpRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
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
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"
import { BuyingGuideRail } from "@/components/growth/BuyingGuideRail"
import { ProductComparisonRail } from "@/components/growth/ProductComparisonRail"
import { ContentStandardsNote } from "@/components/editorial/ContentStandardsNote"
import { getPublishedProductComparisons } from "@/lib/growth/product-comparisons"
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

/**
 * Published Chairpedia deep-dive linked to this product, if any.
 * NOTE: the page's `product.id` is the SLUG (ProductView convention), not the
 * UUID — so resolve the real product UUID first, then match chairpedia.product_id.
 */
async function getChairpediaSlug(productSlug: string): Promise<string | null> {
  try {
    const supabase = createPublicServerClient()
    const { data: prod } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .maybeSingle()
    const productId = (prod as { id: string } | null)?.id
    if (!productId) return null
    const { data } = await supabase
      .from("chairpedia")
      .select("slug")
      .eq("product_id", productId)
      .eq("status", "published")
      .limit(1)
      .maybeSingle()
    return (data as { slug: string } | null)?.slug ?? null
  } catch {
    return null
  }
}

type RecentPost = { slug: string; title: string; hero_image_url: string | null }

/** A few recent blog posts — internal links from product pages into the blog. */
async function getRecentBlogPosts(limit = 3): Promise<RecentPost[]> {
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("blog_posts")
      .select("slug,title,hero_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit)
    return (data as RecentPost[] | null) ?? []
  } catch {
    return []
  }
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
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name}: Specs, Reviews & Where to Buy`,
    description: `Compare ${product.name} specifications, fit, reviews, alternatives and current buying options. Check the exact model, seller, warranty and returns before ordering.`,
    alternates: { canonical: `/products/${product.slug ?? product.id}` },
    openGraph: {
      type: "website",
      title: `${product.name}: Specs, Reviews & Where to Buy`,
      description: `Research ${product.name} specifications, fit, alternatives and current buying options.`,
      url: `/products/${product.slug ?? product.id}`,
      images: product.image ? [product.image] : undefined,
    },
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
    isSupabaseConfigured()
      ? supabaseReviews
      : getChairReviewsForProduct(product.id)

  const slug = product.slug ?? product.id
  const chairpediaSlug = await getChairpediaSlug(slug)
  const recentBlog = isSupabaseConfigured() ? await getRecentBlogPosts(3) : []
  const productComparisons = isSupabaseConfigured() ? await getPublishedProductComparisons(slug) : []
  const catalogLinks = getProductAffiliateLinks(slug, product.name)
  const buyUrls = urlsFromCatalog(catalogLinks)

  const productWithLinks = { ...product, affiliateLinks: product.affiliateLinks ?? [] }
  const similarProducts = getSimilarProducts(productWithLinks, 3)
  const reviewCount =
    isSupabaseConfigured() || chairReviews.length > 0
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
    <div className="min-h-screen flex flex-col bg-white text-[#171717]">
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
        <div className="border-b border-[#171717] bg-[#f5f1e8]">
          <div className="mx-auto max-w-7xl px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-[#66707a]">
              <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/brands/${product.brandId}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-8 lg:py-12">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-8">
            <div>
              <div className="grid overflow-hidden border border-[#171717] bg-white md:grid-cols-[1.08fr_.92fr]">
                <ProductImageGallery
                  images={galleryImages}
                  alt={product.name}
                  category={product.category}
                  className="min-h-[420px] w-full bg-[#eaf3ff] p-5 md:min-h-[560px]"
                />

                <div className="flex flex-col justify-center border-t border-[#171717] p-6 md:border-l md:border-t-0 lg:p-9">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#52606d]">
                    <Link href={`/brands/${product.brandId}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
                    <span>·</span>
                    <span>{product.categoryLabel ?? product.category}</span>
                  </div>

                  <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.02] text-foreground sm:text-5xl">{product.name}</h1>

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
                    <span>·</span>
                    <Link
                      href={`/reviews/new?product=${slug}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Write a review
                    </Link>
                  </div>

                  <p className="mt-6 text-3xl font-semibold text-foreground">{product.price}</p>

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.description}</p>

                  {product.bestFor && (
                    <p className="mt-3 text-sm">
                      <span className="text-muted-foreground">Best for: </span>
                      <span className="font-medium text-foreground">{product.bestFor}</span>
                    </p>
                  )}

                  {chairpediaSlug && (
                    <Link
                      href={`/chairpedia/${chairpediaSlug}`}
                      className="mt-6 inline-flex items-center gap-1.5 border border-[#17676b] bg-[#cdeff0] px-4 py-3 text-sm font-bold text-[#174d50] transition-colors hover:bg-[#b8e5e7]"
                    >
                      <BookOpen className="h-4 w-4 text-[#9a7b4f]" />
                      Read the Chairpedia deep-dive
                      <ArrowUpRight className="h-4 w-4 opacity-70" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-8 border-t border-[#171717] pt-2"><ProductChairTabs
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
              /></div>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                <div className="border border-[#171717] bg-[#f5f1e8] p-5">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[.14em] text-[#52606d]">At a glance</p>
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

                <div className="border border-[#171717] bg-[#fff0c7] p-5 shadow-[6px_6px_0_#171717]">
                  <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#7a5a00]">Buying options</p>
                  <h3 className="mb-4 mt-1 font-serif text-2xl text-foreground">Where to buy</h3>
                  <SmartBuyLink
                    variant="block"
                    productId={slug}
                    name={product.name}
                    amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
                    placement="product-sidebar"
                    showDisclaimer
                  />
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Amazon returns are typically 30 days of delivery but set per listing — check
                    before ordering.{" "}
                    <Link
                      href="/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon"
                      className="underline underline-offset-2"
                    >
                      What returns cost across stores →
                    </Link>
                  </p>
                </div>

              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#171717] bg-white p-3 shadow-[0_-8px_24px_rgba(0,0,0,.12)] lg:hidden">
            <SmartBuyLink
              variant="block"
              productId={slug}
              name={product.name}
              amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
              placement="product-mobile-sticky"
            />
          </div>

          <ProductComparisonRail productName={product.name} comparisons={productComparisons} />

          <BuyingGuideRail category={product.category} priceUsd={product.priceUsd} />
          <ContentStandardsNote kind="catalog" />

          <div className="h-20 lg:hidden" />
        </div>

        {recentBlog.length > 0 && (
          <section className="border-t border-[#171717] bg-[#f5f1e8]">
            <div className="mx-auto max-w-7xl px-5 py-14">
              <div className="mb-5 flex items-baseline justify-between">
                <h2 className="font-serif text-xl font-medium text-foreground">
                  From the Furniblog blog
                </h2>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-premium-accent transition-opacity hover:opacity-80"
                >
                  All posts →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {recentBlog.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/blog/${b.slug}`}
                    className="group flex flex-col overflow-hidden border border-[#171717] bg-white transition-transform hover:-translate-y-1"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                      {b.hero_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.hero_image_url}
                          alt={b.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Furniblog
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-base font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
                        {b.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

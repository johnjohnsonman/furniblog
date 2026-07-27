import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Star, ChevronRight, BookOpen, ArrowUpRight } from "lucide-react"
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

/** Published comparisons that feature this product (internal links + crawl). */
async function getProductComparisons(productSlug: string): Promise<{ slug: string; title: string }[]> {
  try {
    const supabase = createPublicServerClient()
    const { data: prod } = await supabase.from("products").select("id").eq("slug", productSlug).maybeSingle()
    const pid = (prod as { id: string } | null)?.id
    if (!pid) return []
    const { data } = await supabase
      .from("comparisons")
      .select("slug,title")
      .eq("status", "published")
      .or(`product_a_id.eq.${pid},product_b_id.eq.${pid}`)
      .limit(6)
    return (data as { slug: string; title: string }[] | null) ?? []
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
    title: product.name,
    description:
      product.description ??
      product.overview ??
      `Specs, reviews, and where to buy the ${product.name}.`,
    alternates: { canonical: `/products/${product.slug ?? product.id}` },
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
  const chairpediaSlug = await getChairpediaSlug(slug)
  const recentBlog = isSupabaseConfigured() ? await getRecentBlogPosts(3) : []
  const productComparisons = isSupabaseConfigured() ? await getProductComparisons(slug) : []
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
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={`/brands/${product.brandId}`} className="hover:text-foreground transition-colors">{product.brand}</Link>
                    <span>·</span>
                    <span>{product.categoryLabel ?? product.category}</span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mt-2">{product.name}</h1>

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

                  <p className="text-2xl font-semibold text-foreground mt-4">{product.price}</p>

                  <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{product.description}</p>

                  {product.bestFor && (
                    <p className="mt-3 text-sm">
                      <span className="text-muted-foreground">Best for: </span>
                      <span className="font-medium text-foreground">{product.bestFor}</span>
                    </p>
                  )}

                  {chairpediaSlug && (
                    <Link
                      href={`/chairpedia/${chairpediaSlug}`}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <BookOpen className="h-4 w-4 text-[#9a7b4f]" />
                      Read the Chairpedia deep-dive
                      <ArrowUpRight className="h-4 w-4 opacity-70" />
                    </Link>
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
                    amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
                  />
                </div>

              </div>
            </div>
          </div>

          {(buyUrls.amazonUrl ?? product.amazonUrl) && (
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t border-border lg:hidden z-50">
              <BuyButtonGroup
                productId={product.id}
                amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
              />
            </div>
          )}

          {productComparisons.length > 0 && (
            <div className="mt-10 border-t border-border pt-6">
              <h2 className="font-serif text-lg font-medium text-foreground">
                Compare {product.name}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {productComparisons.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/compare/${c.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {c.title}
                    <ArrowUpRight className="h-4 w-4 opacity-60" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="h-20 lg:hidden" />
        </div>

        {recentBlog.length > 0 && (
          <section className="border-t border-border bg-card">
            <div className="mx-auto max-w-6xl px-4 py-10">
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
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-foreground/20"
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

import { cache } from "react"
import { getProductRelatedBlogPosts } from "@/lib/growth/related-blog-server"
import { guideIntent } from "@/lib/growth/related-blog"
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
  getProducts,
  getProductBySlug,
  getProductReviews,
  isSupabaseConfigured,
} from "@/lib/supabase/queries"
import { ProductJumpNav, type JumpNavItem } from "@/components/products/ProductJumpNav"
import { ProductSection } from "@/components/products/ProductSection"
import { ProductReviewsSection } from "@/components/products/ProductReviewsSection"
import { WhereToBuySection } from "@/components/affiliate/WhereToBuySection"
import { getOfficialChannel } from "@/lib/products/official-channels"
import { getProductAffiliateLinks } from "@/lib/data/affiliate-links"
import { urlsFromCatalog } from "@/lib/affiliate/catalog-price-rows"
import { ChairProductOverview } from "@/components/chairs/ChairProductOverview"
import { ChairProductSpecs } from "@/components/chairs/ChairProductSpecs"
import { ProductImageGallery } from "@/components/chairs/ProductImageGallery"
import { ProductVideosSection } from "@/components/videos/product-videos-section"
import { fetchProductVideos } from "@/lib/videos/product-videos"
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"
import { BuyingGuideRail } from "@/components/growth/BuyingGuideRail"
import { ContentStandardsNote } from "@/components/editorial/ContentStandardsNote"
import { getPublishedProductComparisons } from "@/lib/growth/product-comparisons"
import { getProductDecisionGuide } from "@/lib/growth/product-decision-guides"
import { ProductDecisionGuide } from "@/components/growth/ProductDecisionGuide"
import { DocumentedProductResearch, documentedComparisonLinks } from "@/components/chairs/DocumentedProductResearch"
import { ProductDataConfidence } from "@/components/chairs/ProductDataConfidence"
import { HubKeyFacts, HubVersions, LinkCards, hubGuideGroups, hubHasVersions } from "@/components/products/ProductContentHub"
import { getProductContentHub } from "@/lib/products/content-hubs"
import { formatPriceAmount, formatPriceNote, getPriceProvenance } from "@/lib/products/price-provenance"
import { filterChairSpecsByEvidence, getProductFitEvidence, getProductFitTrustSummary } from "@/lib/data/product-fit-evidence"
import {
  generateBreadcrumbSchema,
  generateChairSchema,
} from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

const resolveProduct = cache(async (slug: string) => {
  const fromDb = await getProductBySlug(slug)
  if (fromDb) return fromDb
  return products.find((p) => p.id === slug || p.slug === slug)
})

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
      .neq("slug", "herman-miller-caper-multipurpose-chair")
      .eq("status", "published")
      .limit(1)
      .maybeSingle()
    return (data as { slug: string } | null)?.slug ?? null
  } catch {
    return null
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
    // The 404 response already carries Next's noindex; drop the layout default.
    return {
      title: "Product Not Found",
      robots: null,
    }
  }

  const hub = getProductContentHub(product.slug ?? product.id)
  return {
    title: hub ? `${product.name}: Versions, Fit & Buying Checks` : `${product.name}: Specs, Reviews & Where to Buy`,
    description: hub ? `Research ${product.name} versions, fit checks, official sources, direct comparisons and buying guides.` : `Compare ${product.name} specifications, fit, reviews, alternatives and current buying options. Check the exact model, seller, warranty and returns before ordering.`,
    alternates: { canonical: `/products/${product.slug ?? product.id}` },
    openGraph: {
      type: "website",
      title: hub ? `${product.name}: Versions, Fit & Buying Checks` : `${product.name}: Specs, Reviews & Where to Buy`,
      description: hub ? `Research ${product.name} versions, fit checks, official sources and direct comparisons.` : `Research ${product.name} specifications, fit, alternatives and current buying options.`,
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

  const slug = product.slug ?? product.id
  const contentHub = getProductContentHub(slug)
  const priceInfo = getPriceProvenance(slug)
  const priceParts = priceInfo ? { amount: formatPriceAmount(priceInfo), note: formatPriceNote(priceInfo) } : null
  const configured = isSupabaseConfigured()
  // Independent public lookups run together; prices remain fresh per request.
  const [supabaseReviews, videoResult, chairpediaSlug, relatedBlog, productComparisons, similarPool, fitEvidence, fitTrust] = await Promise.all([
    configured ? getProductReviews(product.id) : Promise.resolve([]),
    configured ? fetchProductVideos(product.id) : Promise.resolve({ videos: [], total: 0, chairId: null }),
    getChairpediaSlug(slug),
    configured ? getProductRelatedBlogPosts(slug, 3) : Promise.resolve([]),
    configured ? getPublishedProductComparisons(slug) : Promise.resolve([]),
    configured ? getProducts({ category: product.category }) : Promise.resolve([]),
    configured ? getProductFitEvidence(slug) : Promise.resolve([]),
    configured ? getProductFitTrustSummary(slug) : Promise.resolve({ verifiedConfigurations: 0, markets: [], lastCheckedOn: null }),
  ])
  const { videos: productVideos, total: productVideoTotal, chairId: productVideoChairId } = videoResult
  const chairReviews = configured ? supabaseReviews : getChairReviewsForProduct(product.id)
  // Chairs without a buyable Amazon US listing would otherwise fall back to an
  // unrelated Amazon search; send them to the sourced official channel instead.
  const officialChannel = getOfficialChannel(slug, priceInfo, contentHub)
  const catalogLinks = officialChannel
    ? [{ retailer: officialChannel.retailer, url: officialChannel.url, isOfficial: true }]
    : getProductAffiliateLinks(slug, product.name)
  const buyUrls = urlsFromCatalog(catalogLinks)
  const hasDirectAmazon = Boolean(buyUrls.amazonUrl?.includes("/dp/"))
  const hubOfficialStoreUrl = contentHub?.notOnAmazon ? officialChannel?.url ?? null : null
  // "Check current price" target: official store for non-Amazon hubs, the tracked
  // Amazon link when there is a direct listing, otherwise the price source page.
  // Converted (≈) prices point at a foreign store, so they get no button here.
  const priceActionUrl = hubOfficialStoreUrl ?? (priceInfo && priceInfo.priceType !== "converted" ? priceInfo.sourceUrl : undefined)
  const productWithLinks = { ...product, affiliateLinks: product.affiliateLinks ?? [] }
  const similarProducts = configured
    ? similarPool.filter(p => p.id !== product.id).sort((a, b) => Math.abs((a.priceUsd ?? Infinity) - (product.priceUsd ?? 0)) - Math.abs((b.priceUsd ?? Infinity) - (product.priceUsd ?? 0))).slice(0, 3)
    : getSimilarProducts(productWithLinks, 3)
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

  const chairSchema = generateChairSchema({
    ...productWithLinks,
    chairSpecs: filterChairSpecsByEvidence(
      productWithLinks.chairSpecs as Record<string, unknown> | undefined,
      new Set(fitEvidence.map((row) => row.fieldKey))
    ),
  }, chairReviews, [])
  const decisionGuide = getProductDecisionGuide(slug, product)
  const hasFitEvidence = fitEvidence.length > 0

  // One-page layout: every section is server-rendered; the jump menu lists only
  // sections that have content. Each guide/comparison/source URL appears once.
  const hubGuides = contentHub ? hubGuideGroups(contentHub) : null
  const blogGuides = relatedBlog.filter((b) => !hubGuides?.hrefs.has(`/blog/${b.slug}`))
  const hasVersions = contentHub ? hubHasVersions(contentHub) : false
  const hasGuides = Boolean(hubGuides && hubGuides.steps.length + hubGuides.more.length > 0) || blogGuides.length > 0
  const uniqueByHref = <T extends { href: string }>(items: T[]) => items.filter((item, i) => items.findIndex((x) => x.href === item.href) === i)
  const compareLinks = uniqueByHref([
    ...(contentHub?.comparisons ?? []).map((c) => ({ href: c.href, label: c.label, description: c.description })),
    ...documentedComparisonLinks(slug).map((c) => ({ ...c, description: "Source-linked comparison" })),
    ...productComparisons.map((c) => ({ href: `/compare/${c.slug}`, label: c.title, description: "Side-by-side comparison" })),
  ]).slice(0, 6)
  const officialSources = uniqueByHref([
    ...(contentHub?.officialSources ?? []),
    ...(priceInfo?.sourceUrl ? [{ href: priceInfo.sourceUrl, label: priceInfo.sourceLabel, description: `Price source, checked ${priceInfo.checkedOn}.` }] : []),
  ])
  const overviewProduct = priceParts ? { ...productWithLinks, price: priceParts.amount } : contentHub ? { ...productWithLinks, price: "Check current configuration" } : productWithLinks
  const navItems: JumpNavItem[] = [
    { id: "overview", label: "Overview" },
    ...(hasVersions ? [{ id: "versions", label: "Versions" }] : []),
    ...(hasGuides ? [{ id: "guides", label: "Guides" }] : []),
    { id: "specs", label: "Specs" },
    ...(productVideos.length > 0 ? [{ id: "videos", label: "Videos" }] : []),
    ...(chairReviews.length > 0 ? [{ id: "reviews", label: "Reviews" }] : []),
    { id: "buy", label: "Where to buy" },
  ]

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

                  {contentHub && <p className="mt-3 text-sm font-semibold text-[#3157e8]">{contentHub.edition}</p>}

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-sm text-muted-foreground">
                    {reviewCount > 0 && <span>
                      Summarized from {reviewCount.toLocaleString()}{" "}
                      {reviewCount === 1 ? "review" : "reviews"} worldwide
                    </span>}
                    {productVideos.length > 0 && (
                      <>
                        {reviewCount > 0 && <span>·</span>}
                        <span className="whitespace-nowrap">
                          {productVideos.length}{" "}
                          {productVideos.length === 1 ? "video" : "videos"}
                        </span>
                      </>
                    )}
                    {(reviewCount > 0 || productVideos.length > 0) && <span>·</span>}
                    <Link
                      href={`/reviews/new?product=${slug}`}
                      className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      Write a review
                    </Link>
                  </div>

                  {priceInfo && priceParts ? (
                    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                      <div>
                        <p className={priceInfo.variants?.length ? "text-xl font-semibold text-foreground sm:text-2xl" : "text-2xl font-semibold text-foreground sm:text-3xl"}>{priceParts.amount}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {priceParts.note} ·{" "}
                          {priceInfo.sourceUrl ? (
                            <a href={priceInfo.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{priceInfo.sourceLabel}</a>
                          ) : priceInfo.sourceLabel}
                          {priceInfo.priceType === "converted" && <> · FX {priceInfo.fxSource}, {priceInfo.fxDate}</>}
                        </p>
                      </div>
                      {!officialChannel && hasDirectAmazon ? (
                        <SmartBuyLink variant="inline" productId={slug} name={product.name} amazonUrl={buyUrls.amazonUrl} amazonLabel="Check current price" placement="product-price-range" />
                      ) : priceActionUrl ? (
                        <a href={priceActionUrl} target="_blank" rel="noopener noreferrer" className="inline-block border border-[#171717] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f5f1e8]">{priceInfo.priceType === "on_request" ? "Ask for a quote ↗" : "Check current price ↗"}</a>
                      ) : null}
                    </div>
                  ) : contentHub ? (
                    <p className="mt-6 text-sm font-semibold text-foreground">Price varies by market and configuration. Check the official product page and the exact seller listing.</p>
                  ) : (
                    <p className="mt-6 text-3xl font-semibold text-foreground">{product.price}</p>
                  )}

                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.description}</p>

                  {product.bestFor && hasFitEvidence && (
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

              <ProductJumpNav items={navItems} />

              <ProductSection id="overview" eyebrow="Overview">
                <div className="space-y-8">
                  {contentHub && <HubKeyFacts hub={contentHub} />}
                  <ProductDecisionGuide productName={product.name} slug={slug} guide={decisionGuide} videoCount={productVideos.length} evidenceCount={new Set(fitEvidence.map(item => item.fieldKey)).size} hasBuyingLink={catalogLinks.length > 0} />
                  <ChairProductOverview part="main" product={overviewProduct} similarProducts={similarProducts} claimsVerified={hasFitEvidence} />
                </div>
              </ProductSection>

              {contentHub && hasVersions && (
                <ProductSection id="versions" eyebrow="Versions">
                  <HubVersions hub={contentHub} productName={product.name} />
                </ProductSection>
              )}

              {hasGuides && (
                <ProductSection id="guides" eyebrow="Guides" title={`Guides for ${contentHub?.shortName ?? product.name}`}>
                  <div className="space-y-8">
                    {hubGuides && hubGuides.steps.length > 0 && <div><h3 className="font-serif text-2xl">Choose the right {contentHub?.shortName ?? product.name}</h3><div className="mt-4"><LinkCards items={hubGuides.steps} /></div></div>}
                    {hubGuides && hubGuides.more.length > 0 && <div><h3 className="font-serif text-2xl">{hubGuides.steps.length > 0 ? "More guides" : "Before you buy"}</h3><div className="mt-4"><LinkCards items={hubGuides.more} /></div></div>}
                    {blogGuides.length > 0 && (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        {blogGuides.map((b) => (
                          <Link key={b.slug} href={`/blog/${b.slug}`} className="group flex flex-col overflow-hidden border border-[#171717] bg-white transition-transform hover:-translate-y-1">
                            <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                              {b.hero_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={b.hero_image_url} alt={b.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Chairpedia</div>
                              )}
                            </div>
                            <div className="p-4">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{guideIntent(b.slug)}</p>
                              <h3 className="font-serif text-base font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">{b.title}</h3>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </ProductSection>
              )}

              <ProductSection id="specs" eyebrow="Specs">
                <ChairProductSpecs product={productWithLinks} fitEvidence={fitEvidence} officialSource={null} />
                <DocumentedProductResearch slug={slug} inSpecs />
                <ProductDataConfidence evidence={fitEvidence} trust={fitTrust} />
                {officialSources.length > 0 && (
                  <div className="mt-8 border border-[#171717] bg-[#f5f1e8] p-6">
                    <h3 className="font-serif text-2xl">Sources</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Official pages used for the product, option and price details on this page. Current price, stock and the delivered configuration still need checking with the seller.</p>
                    <ul className="mt-4 space-y-3">{officialSources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">{source.label} ↗</a><span className="ml-2 text-sm text-muted-foreground">{source.description}</span></li>)}</ul>
                  </div>
                )}
              </ProductSection>

              {productVideos.length > 0 && (
                <ProductSection id="videos" eyebrow="Videos">
                  <ProductVideosSection
                    videos={productVideos}
                    total={productVideoTotal}
                    chairName={product.name}
                    chairId={productVideoChairId ?? product.id}
                    amazonUrl={officialChannel ? null : buyUrls.amazonUrl ?? product.amazonUrl}
                    reviewCount={reviewCount}
                    initialVisible={2}
                  />
                </ProductSection>
              )}

              {chairReviews.length > 0 && (
                <ProductSection id="reviews" eyebrow="Reviews" title={`${product.name} owner reviews`}>
                  <ProductReviewsSection reviews={chairReviews} productId={product.id} productSlug={slug} productName={product.name} />
                </ProductSection>
              )}

              <ProductSection id="buy" eyebrow="Buying options" title="Where to buy">
                <div className="border border-[#171717] bg-[#fff0c7] p-5">
                  {priceInfo && priceParts && (
                    <p className="mb-4 text-sm">
                      <span className="text-lg font-semibold">{priceParts.amount}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{priceParts.note} · {priceInfo.sourceLabel}</span>
                    </p>
                  )}
                  <div className="max-w-md">
                    {officialChannel ? (
                      <a href={officialChannel.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90">{officialChannel.label} ↗</a>
                    ) : (
                      <SmartBuyLink variant="block" productId={slug} name={product.name} amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl} placement="product-buy-section" showDisclaimer />
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {officialChannel ? officialChannel.note : "Amazon returns are typically 30 days of delivery but set per listing — check before ordering."}{" "}
                    <Link href="/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" className="underline underline-offset-2">What returns cost across stores →</Link>
                  </p>
                  <p className="mt-3 text-sm"><Link href={`/stores?model=${encodeURIComponent(slug)}`} className="font-semibold underline underline-offset-4">Find places to try {product.name}</Link></p>
                </div>
                {catalogLinks.length > 1 && <div className="mt-6"><WhereToBuySection productId={product.id} productName={product.name} catalogLinks={catalogLinks} defaultPrice={priceParts?.amount ?? (contentHub ? undefined : product.price)} /></div>}
              </ProductSection>

              {(compareLinks.length > 0 || similarProducts.length > 0) && (
                <ProductSection id="compare" eyebrow="Compare" title={`Compare ${product.name}`}>
                  {compareLinks.length > 0 && <LinkCards items={compareLinks} />}
                  <ChairProductOverview part="similar" product={overviewProduct} similarProducts={similarProducts} />
                </ProductSection>
              )}
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
                    {product.bestFor && hasFitEvidence && (
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
                  {officialChannel ? (
                    <a href={officialChannel.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90">{officialChannel.label} ↗</a>
                  ) : (
                    <SmartBuyLink
                      variant="block"
                      productId={slug}
                      name={product.name}
                      amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
                      placement="product-sidebar"
                      showDisclaimer
                    />
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {officialChannel ? officialChannel.note : "Amazon returns are typically 30 days of delivery but set per listing — check before ordering."}{" "}
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
            {officialChannel ? (
              <a href={officialChannel.url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 bg-foreground px-4 py-3 text-sm font-semibold text-background hover:bg-foreground/90">{officialChannel.label} ↗</a>
            ) : (
              <SmartBuyLink
                variant="block"
                productId={slug}
                name={product.name}
                amazonUrl={buyUrls.amazonUrl ?? product.amazonUrl}
                placement="product-mobile-sticky"
              />
            )}
          </div>

          <BuyingGuideRail category={product.category} priceUsd={product.priceUsd} />
          <ContentStandardsNote kind="catalog" />

          <div className="h-20 lg:hidden" />
        </div>

      </main>

      <Footer />
    </div>
  )
}

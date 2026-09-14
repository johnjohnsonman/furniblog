import { rewriteOwnedSiteLinks } from "@/lib/blog/site-links"
import { PurchaseDecisionCard } from "@/components/growth/PurchaseDecisionCard"
import { getProductImageBundle } from "@/lib/supabase/queries"
import { enrichBlogPosts } from "@/lib/blog/media-server"
import { bodyContainsImage } from "@/lib/blog/media"
import { prepareArticleReading } from "@/lib/blog/reading"
import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo/schemas"
import { wrapTables } from "@/lib/blog/postprocess"
import { getBlogBuyingNotes } from "@/lib/blog/buying-notes"
import { isBlogPostGoogleSearchable, GOOGLEBOT_NOINDEX } from "@/lib/seo/search-visibility"
import { rewriteAmazonHrefs } from "@/lib/affiliate/content-links"
import { pageSubtag } from "@/lib/affiliate/links"
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link"
import { BuyingGuideRail } from "@/components/growth/BuyingGuideRail"
import { ProductComparisonRail } from "@/components/growth/ProductComparisonRail"
import { ContentStandardsNote } from "@/components/editorial/ContentStandardsNote"
import { getPublishedProductComparisons } from "@/lib/growth/product-comparisons"

export const dynamic = "force-dynamic"

type Post = {
  slug: string
  title: string
  subtitle: string | null
  hero_image_url: string | null
  excerpt: string | null
  content_html: string
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  updated_at: string | null
  source_url: string | null
  category: string | null
}

const BASE_COLS =
  "slug,title,subtitle,hero_image_url,excerpt,content_html,seo_title,seo_description,published_at,updated_at,source_url"

const getPost = cache(async (slug: string): Promise<Post | null> => {
  const supabase = createPublicServerClient()
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(`${BASE_COLS},category`)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (error) throw error
    return data ? (await enrichBlogPosts([data as Post]))[0] : null
  } catch {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select(BASE_COLS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle()
      return data ? (await enrichBlogPosts([{ ...(data as Omit<Post, "category">), category: null }]))[0] : null
    } catch {
      return null
    }
  }
})

function readMinutes(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: "Blog" }
  // Strip a baked-in "| Chairpedia" suffix: the layout template already appends
  // it, so seo_titles that include it rendered as "… | Chairpedia | Chairpedia".
  const title = (post.seo_title?.trim() || post.title).replace(/\s*\|\s*(?:Furniblog|Chairpedia)\s*$/i, "")
  const description =
    post.seo_description?.trim() || post.excerpt?.trim() || post.subtitle?.trim() || undefined
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    ...(isBlogPostGoogleSearchable(post) ? {} : GOOGLEBOT_NOINDEX),
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      images: post.hero_image_url ? [post.hero_image_url] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const buying = getBlogBuyingNotes(post.slug)
  const reading = prepareArticleReading(wrapTables(rewriteAmazonHrefs(rewriteOwnedSiteLinks(post.content_html), pageSubtag(`/blog/${post.slug}`))))
  const productComparisons = buying
    ? await getPublishedProductComparisons(buying.productId)
    : []

  const buyingProducts = buying ? [buying, ...(buying.additionalProducts ?? [])] : []
  const buyingImages = await Promise.all(buyingProducts.map(product => getProductImageBundle(product.productId, product.name)))

  const articleSchema = generateArticleSchema({
    headline: post.title,
    description: post.excerpt ?? post.subtitle ?? null,
    path: `/blog/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    image: post.hero_image_url,
  })
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
          </nav>

          <header className="mb-8">
            {post.category && (
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-premium-accent">
                {post.category}
              </p>
            )}
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">{post.subtitle}</p>
            )}
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>By the{" "}
                <Link href="/about" className="font-medium text-foreground hover:underline">
                  Chairpedia Editorial Team
                </Link>
              </span>
              <span>·</span>
              {post.published_at && (
                <span>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {post.published_at && <span>·</span>}
              <span>{readMinutes(post.content_html)} min read</span>
            </p>
          </header>

          {post.hero_image_url && !bodyContainsImage(post.content_html, post.hero_image_url) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.hero_image_url} alt={post.title} className="mb-8 w-full rounded-xl" />
          )}

          {(reading.headings.length >= 3 || buying) && (
            <nav aria-label="Article navigation" data-testid="article-navigation" className="mb-8 rounded-lg border border-border bg-[#f8f5ef] p-4">
              {reading.headings.length >= 3 && <details>
                <summary id="article-contents-heading" className="cursor-pointer font-semibold">On this page</summary>
                <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  {reading.headings.map(heading => <li key={heading.id}><a className="underline underline-offset-4" href={`#${encodeURIComponent(heading.id)}`}>{heading.text}</a></li>)}
                </ol>
              </details>}
              {buying && <a href="#blog-buying-heading" className={`inline-block text-sm font-semibold underline underline-offset-4 ${reading.headings.length >= 3 ? "mt-3" : ""}`}>Compare buying options</a>}
            </nav>
          )}

          <div
            className="chairpedia-body article-reading"
            dangerouslySetInnerHTML={{ __html: reading.html }}
          />

          {buying && (
            <section aria-labelledby="blog-buying-heading" data-testid="blog-buying" className="mt-10 space-y-4 border-t border-border pt-6">
              <h2 id="blog-buying-heading" className="scroll-mt-24 text-xl font-semibold">{buying.heading}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{buying.description}</p>
              <p className="text-xs text-muted-foreground">As an Amazon Associate, Chairpedia earns from qualifying purchases.</p>
              <div className={buying.additionalProducts?.length ? "grid gap-6 sm:grid-cols-2" : undefined}>
                {buyingProducts.map((product, index) => (
                  <PurchaseDecisionCard
                    key={product.productId}
                    productId={product.productId}
                    name={product.name}
                    image={buyingImages[index].hero}
                    amazonUrl={resolveAmazonAffiliateLink(product.productId, product.name).url}
                    placement="blog-buying"
                    currentPath={`/blog/${post.slug}`}
                    comparison={productComparisons.find(item => item.slug.includes(product.productId))}
                  />
                ))}
              </div>
              <ul className="space-y-2 text-sm">
                {buying.related.map(link => (
                  <li key={link.href}><Link href={link.href} className="underline underline-offset-4">{link.label}</Link></li>
                ))}
              </ul>
            </section>
          )}

          {buying && (
            <ProductComparisonRail productName={buying.name} comparisons={productComparisons} />
          )}
          <BuyingGuideRail category={post.category} />
          <ContentStandardsNote kind="guide" />
        </article>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </div>
  )
}

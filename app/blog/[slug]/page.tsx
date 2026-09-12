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
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"
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

async function getPost(slug: string): Promise<Post | null> {
  const supabase = createPublicServerClient()
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(`${BASE_COLS},category`)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    if (error) throw error
    return (data as Post | null) ?? null
  } catch {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select(BASE_COLS)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle()
      return data ? ({ ...(data as Omit<Post, "category">), category: null }) : null
    } catch {
      return null
    }
  }
}

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
  // Strip a baked-in "| Furniblog" suffix: the layout template already appends
  // it, so seo_titles that include it rendered as "… | Furniblog | Furniblog".
  const title = (post.seo_title?.trim() || post.title).replace(/\s*\|\s*Furniblog\s*$/i, "")
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
  const productComparisons = buying
    ? await getPublishedProductComparisons(buying.productId)
    : []

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
                  Furniblog Editorial Team
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

          {post.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.hero_image_url} alt={post.title} className="mb-8 w-full rounded-xl" />
          )}

          <div
            className="chairpedia-body"
            dangerouslySetInnerHTML={{ __html: wrapTables(rewriteAmazonHrefs(post.content_html, pageSubtag(`/blog/${post.slug}`))) }}
          />

          {buying && (
            <section aria-labelledby="blog-buying-heading" data-testid="blog-buying" className="mt-10 space-y-4 border-t border-border pt-6">
              <h2 id="blog-buying-heading" className="text-xl font-semibold">{buying.heading}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{buying.description}</p>
              <p className="text-xs text-muted-foreground">As an Amazon Associate, Furniblog earns from qualifying purchases.</p>
              <div className={buying.additionalProducts?.length ? "grid gap-6 sm:grid-cols-2" : undefined}>
                {[buying, ...(buying.additionalProducts ?? [])].map(product => (
                  <div key={product.productId} data-buying-product={product.productId} className="min-w-0 space-y-3">
                    {!!buying.additionalProducts?.length && <h3 className="text-base font-semibold">{product.name}</h3>}
                    <SmartBuyLink
                      name={product.name}
                      productId={product.productId}
                      amazonUrl={resolveAmazonAffiliateLink(product.productId, product.name).url}
                      variant="block"
                      placement="blog-buying"
                    />
                  </div>
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

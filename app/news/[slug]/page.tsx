import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdSlot } from "@/components/common/AdSlot"
import { ChairCard } from "@/components/chairs/ChairCard"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { getBrands, getProductsByBrandSlug } from "@/lib/supabase/queries"
import { formatNewsDate, brandGradient } from "@/components/news/news-card"
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schemas"
import type { ProductView } from "@/lib/data/mappers"

export const dynamic = "force-dynamic"

type NewsDetail = {
  id: string
  slug: string
  url: string
  title: string | null
  source_name: string | null
  image_url: string | null
  published_at: string | null
  brand: string | null
  summary: string | null
  why_it_matters: string | null
}

const DETAIL_SELECT =
  "id, slug, url, title, source_name, image_url, published_at, brand, summary, why_it_matters"

async function getNewsBySlug(slug: string): Promise<NewsDetail | null> {
  const supabase = createPublicServerClient()
  const { data } = await supabase
    .from("news")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  return (data as NewsDetail | null) ?? null
}

async function getRelatedChairs(brandName: string | null): Promise<ProductView[]> {
  if (!brandName) return []
  const brands = await getBrands()
  const match = brands.find(
    (b) => b.name.toLowerCase() === brandName.toLowerCase()
  )
  if (!match) return []
  const products = await getProductsByBrandSlug(match.slug)
  return products.slice(0, 4)
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await props.params
  const news = await getNewsBySlug(slug)
  if (!news) return { title: "News" }
  const title = news.title?.trim() || "Furniture news"
  return {
    title: title,
    description:
      news.summary?.trim() ||
      `${news.brand ?? "Furniture"} news curated by Furniblog.`,
    alternates: { canonical: `/news/${news.slug ?? slug}` },
  }
}

export default async function NewsDetailPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const news = await getNewsBySlug(slug)
  if (!news) notFound()

  const related = await getRelatedChairs(news.brand)
  const title = news.title?.trim() || "Untitled article"
  const date = formatNewsDate(news.published_at)

  const jsonLd = [
    generateArticleSchema({
      headline: title,
      description: news.summary,
      path: `/news/${news.slug}`,
      datePublished: news.published_at,
      image: news.image_url,
      authorName: news.source_name ?? "Furniblog",
    }),
    generateBreadcrumbSchema([
      { name: "News", url: "/news" },
      { name: title, url: `/news/${news.slug}` },
    ]),
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All news
        </Link>

        {/* Article header */}
        <div className="flex flex-wrap items-center gap-2">
          {news.brand ? (
            <Link
              href={`/news?brand=${encodeURIComponent(news.brand)}`}
              className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              {news.brand}
            </Link>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {news.source_name || "News"}
            {date ? ` · ${date}` : ""}
          </span>
        </div>

        <h1 className="mt-3 font-serif text-2xl font-medium leading-tight tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>

        {/* Cover */}
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">
          {news.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={news.image_url}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`flex h-full w-full items-end bg-gradient-to-br ${brandGradient(
                news.brand
              )} p-5`}
            >
              <span className="font-serif text-xl font-medium text-white/90">
                {news.brand || "Furniture News"}
              </span>
            </div>
          )}
        </div>

        {/* Summary */}
        {news.summary?.trim() ? (
          <p className="mt-6 text-lg leading-relaxed text-foreground">
            {news.summary.trim()}
          </p>
        ) : null}

        {/* Why it matters */}
        {news.why_it_matters?.trim() ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Why it matters
            </h2>
            <p className="mt-2 leading-relaxed text-foreground">
              {news.why_it_matters.trim()}
            </p>
          </div>
        ) : null}

        {/* Outbound to original source */}
        <div className="mt-6">
          <a
            href={news.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground"
          >
            Read the full article
            {news.source_name ? ` on ${news.source_name}` : ""}
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="mt-2 text-xs text-muted-foreground">
            Summary curated by Furniblog. Full story and images belong to the
            original publisher.
          </p>
        </div>

        <div className="my-10">
          <AdSlot position="in-content" />
        </div>

        {/* Related chairs — monetized internal links */}
        {related.length > 0 && (
          <section className="border-t border-border pt-8">
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-serif text-xl font-medium text-foreground">
                {news.brand} chairs to explore
              </h2>
              {news.brand ? (
                <Link
                  href={`/news?brand=${encodeURIComponent(news.brand)}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  More {news.brand} news →
                </Link>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((product) => (
                <ChairCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

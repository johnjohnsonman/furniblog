import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { getPublicComparison } from "@/lib/comparisons/resolve"
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link"
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"
import { wrapTables } from "@/lib/blog/postprocess"
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
} from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicServerClient()
  const c = await getPublicComparison(supabase, slug)
  if (!c) return { title: "Comparison" }
  const title = c.seo_title?.trim() || c.title
  const description = c.seo_description?.trim() || c.excerpt?.trim() || c.subtitle?.trim() || undefined
  return {
    title,
    description,
    alternates: { canonical: `/compare/${c.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/compare/${c.slug}`,
      images: c.hero_image_url ? [c.hero_image_url] : undefined,
    },
  }
}

function BuyRow({ product }: { product: { slug: string; name: string } }) {
  const buy = resolveAmazonAffiliateLink(product.slug, product.name)
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
      <div className="min-w-0">
        <Link href={`/products/${product.slug}`} className="font-medium text-foreground hover:underline">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">Specs, reviews & details</p>
      </div>
      <SmartBuyLink
        variant="inline"
        productId={product.slug}
        name={product.name}
        amazonUrl={buy.url}
        amazonLabel="View on Amazon"
        className="shrink-0"
      />
    </div>
  )
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createPublicServerClient()
  const c = await getPublicComparison(supabase, slug)
  if (!c) notFound()

  const updatedAt = c.updated_at ?? c.published_at
  const updatedStr = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null

  const articleSchema = generateArticleSchema({
    headline: c.title,
    description: c.excerpt ?? c.subtitle ?? null,
    path: `/compare/${c.slug}`,
    datePublished: c.published_at,
    dateModified: updatedAt,
    image: c.hero_image_url,
  })
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: c.title, url: `/compare/${c.slug}` },
  ])
  const listSchema = generateItemListSchema(
    [c.productA, c.productB]
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({ name: p.name, url: `/products/${p.slug}` }))
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/compare" className="hover:text-foreground">Compare</Link>
          </nav>

          <header className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {c.title}
            </h1>
            {c.subtitle && <p className="mt-3 text-lg text-muted-foreground">{c.subtitle}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>By the{" "}
                <Link href="/about" className="font-medium text-foreground hover:underline">
                  Furniblog Editorial Team
                </Link>
              </span>
              {updatedStr && <span>· Updated {updatedStr}</span>}
            </div>
          </header>

          {c.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.hero_image_url} alt={c.title} className="w-full rounded-xl mb-8" />
          )}

          {(c.productA || c.productB) && (
            <div className="mb-8 grid gap-3">
              {c.productA && <BuyRow product={c.productA} />}
              {c.productB && <BuyRow product={c.productB} />}
            </div>
          )}

          <div
            className="chairpedia-body"
            dangerouslySetInnerHTML={{ __html: wrapTables(c.content_html) }}
          />

          {c.faq.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <h2 className="font-serif text-2xl font-medium text-foreground">
                Frequently asked
              </h2>
              <dl className="mt-5 space-y-5">
                {c.faq.map((f, i) => (
                  <div key={i}>
                    <dt className="font-medium text-foreground">{f.q}</dt>
                    <dd className="mt-1.5 text-muted-foreground leading-relaxed">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(c.productA || c.productB) && (
            <div className="mt-12 grid gap-3">
              {c.productA && <BuyRow product={c.productA} />}
              {c.productB && <BuyRow product={c.productB} />}
            </div>
          )}
        </article>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      {c.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(c.faq)) }} />
      )}
    </div>
  )
}

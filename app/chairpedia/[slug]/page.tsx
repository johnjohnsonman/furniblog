import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link"
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"

type ProductRef = { slug: string; name: string } | { slug: string; name: string }[] | null

type Entry = {
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
  gen_sources: string[] | null
  products: ProductRef
}

/** Wrap authored <table>s in a scroll container so wide tables don't squish on mobile. */
function wrapTables(html: string): string {
  return html
    .replace(/<table(\s[^>]*)?>/gi, '<div class="cp-table-scroll"><table$1>')
    .replace(/<\/table>/gi, "</table></div>")
}

/** Clean host label for a source URL, e.g. "https://www.steelcase.com/x" -> "steelcase.com". */
function sourceLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

async function getEntry(slug: string): Promise<Entry | null> {
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("chairpedia")
      .select(
        "slug,title,subtitle,hero_image_url,excerpt,content_html,seo_title,seo_description,published_at,updated_at,gen_sources,products(slug,name)"
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
    return (data as Entry | null) ?? null
  } catch {
    return null
  }
}

function linkedProduct(p: ProductRef): { slug: string; name: string } | null {
  if (!p) return null
  return Array.isArray(p) ? p[0] ?? null : p
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) return { title: "Chairpedia" }
  const title = entry.seo_title?.trim() || entry.title
  const description =
    entry.seo_description?.trim() || entry.excerpt?.trim() || entry.subtitle?.trim() || undefined
  return {
    title,
    description,
    alternates: { canonical: `/chairpedia/${entry.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/chairpedia/${entry.slug}`,
      images: entry.hero_image_url ? [entry.hero_image_url] : undefined,
    },
  }
}

export default async function ChairpediaEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const entry = await getEntry(slug)
  if (!entry) notFound()

  const product = linkedProduct(entry.products)
  const buy = product
    ? resolveAmazonAffiliateLink(product.slug, product.name)
    : null

  // De-duplicated research sources, surfaced publicly for trust + E-E-A-T.
  const sources = Array.from(
    new Set((entry.gen_sources ?? []).filter((u) => /^https?:\/\//.test(u)))
  )

  const updatedAt = entry.updated_at ?? entry.published_at
  const updatedStr = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null

  const articleSchema = generateArticleSchema({
    headline: entry.title,
    description: entry.excerpt ?? entry.subtitle ?? null,
    path: `/chairpedia/${entry.slug}`,
    datePublished: entry.published_at,
    dateModified: updatedAt,
    image: entry.hero_image_url,
  })
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Chairpedia", url: "/chairpedia" },
    { name: entry.title, url: `/chairpedia/${entry.slug}` },
  ])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/chairpedia" className="hover:text-foreground">Chairpedia</Link>
          </nav>

          <header className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {entry.title}
            </h1>
            {entry.subtitle && (
              <p className="mt-3 text-lg text-muted-foreground">{entry.subtitle}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>By the{" "}
                <Link href="/about" className="font-medium text-foreground hover:underline">
                  Furniblog Editorial Team
                </Link>
              </span>
              {sources.length > 0 && <span>· Researched against {sources.length} sources</span>}
              {updatedStr && <span>· Updated {updatedStr}</span>}
            </div>
          </header>

          {entry.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.hero_image_url}
              alt={entry.title}
              className="w-full rounded-xl mb-8"
            />
          )}

          {buy && (
            <div className="mb-8 rounded-xl border border-border bg-muted/40 p-4 flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Where to buy the {product?.name}</span>
              <SmartBuyLink
                variant="inline"
                productId={product?.slug}
                name={product?.name ?? ""}
                amazonUrl={buy.url}
                amazonLabel="View on Amazon"
                className="shrink-0"
              />
            </div>
          )}

          {/* Authored content (admin/AI). Styles for plain authored HTML below. */}
          <div
            className="chairpedia-body"
            dangerouslySetInnerHTML={{ __html: wrapTables(entry.content_html) }}
          />

          {sources.length > 0 && (
            <section className="mt-12 border-t border-border pt-6">
              <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
                Sources &amp; references
              </h2>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                {sources.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="break-words hover:text-foreground hover:underline"
                    >
                      {sourceLabel(url)}
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {buy && (
            <div className="mt-12 rounded-xl border border-border bg-muted/40 p-5 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Interested in the {product?.name}?
              </p>
              <div className="flex justify-center">
                <SmartBuyLink
                  variant="inline"
                  productId={product?.slug}
                  name={product?.name ?? ""}
                  amazonUrl={buy.url}
                  amazonLabel="Check the price on Amazon"
                />
              </div>
            </div>
          )}
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

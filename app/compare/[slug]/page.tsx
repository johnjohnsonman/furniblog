import { getPurchaseDecision, getPurchaseGuideLinks } from "@/lib/growth/purchase-decisions"
import { rewriteOwnedSiteLinks } from "@/lib/blog/site-links"
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
import { BuyingGuideRail } from "@/components/growth/BuyingGuideRail"
import { ContentStandardsNote } from "@/components/editorial/ContentStandardsNote"
import { wrapTables } from "@/lib/blog/postprocess"
import { neutralComparisonSummary } from "@/lib/comparisons/public-safety"
import { getVerifiedComparisonPilot } from "@/lib/comparisons/verified-pilots"
import { VerifiedComparison } from "@/components/compare/verified-comparison"
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  generateFAQSchema,
} from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"

function isPreviewEnvironment(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.CHAIRPEDIA_PREVIEW === "true"
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicServerClient()
  const c = await getPublicComparison(supabase, slug)
  if (!c) return { title: "Comparison" }
  const pilot = getVerifiedComparisonPilot(c.slug)
  const preview = isPreviewEnvironment()
  const title = (pilot?.title || c.seo_title?.trim() || c.title).replace(/\s*\|\s*(?:Furniblog|Chairpedia)\s*$/i, "")
  const description = pilot?.description || (c.requiresSourceReview ? neutralComparisonSummary(c.productA?.name, c.productB?.name) : c.seo_description?.trim() || c.excerpt?.trim() || c.subtitle?.trim() || undefined)
  return {
    title,
    description,
    alternates: preview ? undefined : { canonical: `/compare/${c.slug}` },
    robots: preview ? { index: false, follow: false, nocache: true } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: preview ? undefined : `/compare/${c.slug}`,
      images: c.hero_image_url ? [c.hero_image_url] : undefined,
    },
  }
}

function BuyRow({
  product,
  placement,
}: {
  product: { slug: string; name: string; image?: string | null }
  placement: string
}) {
  const buy = resolveAmazonAffiliateLink(product.slug, product.name)
  const decision = getPurchaseDecision(product.slug)
  const guide = getPurchaseGuideLinks(product.slug)[0]
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-lg border border-border bg-white object-contain"
          />
        )}
        <div className="min-w-0">
          <Link href={`/products/${product.slug}`} className="font-medium text-foreground hover:underline">
            {product.name}
          </Link>
          <p className="text-xs text-muted-foreground">Specs, reviews & details</p>
          {placement.startsWith("compare-top") && decision && <p className="mt-2 max-w-xl text-sm leading-relaxed">{decision.focus}</p>}
          {placement.startsWith("compare-top") && guide && <Link href={guide.href} className="mt-2 inline-block text-xs underline underline-offset-4">{guide.label}</Link>}
        </div>
      </div>
      <SmartBuyLink
        variant="inline"
        productId={product.slug}
        name={product.name}
        amazonUrl={buy.url}
        amazonLabel="View on Amazon"
        placement={placement}
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
  const pilot = getVerifiedComparisonPilot(c.slug)
  const preview = isPreviewEnvironment()
  const pageTitle = pilot?.title ?? c.title
  const pageDescription = pilot?.description ?? c.excerpt ?? c.subtitle ?? null

  const updatedAt = c.updated_at ?? c.published_at
  const displayUpdatedAt = pilot ? "2026-09-23" : updatedAt
  const updatedStr = displayUpdatedAt
    ? new Date(displayUpdatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null

  const articleSchema = generateArticleSchema({
    headline: pageTitle,
    description: pageDescription,
    path: `/compare/${c.slug}`,
    datePublished: c.published_at,
    dateModified: updatedAt,
    image: c.hero_image_url,
  })
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: pageTitle, url: `/compare/${c.slug}` },
  ])
  const listSchema = generateItemListSchema(
    [c.productA, c.productB]
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({ name: p.name, url: `/products/${p.slug}` }))
  )

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {preview && <div className="border-b border-[#b98a4b] bg-[#fff7e8] px-4 py-2 text-center text-xs font-medium uppercase tracking-[.12em] text-[#76501f]">Chairpedia preview · Not for publication</div>}
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-10">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/compare" className="hover:text-foreground">Compare</Link>
          </nav>

          <header className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              {pageTitle}
            </h1>
            {pilot ? <p className="mt-3 text-lg text-muted-foreground">{pilot.description}</p> : c.subtitle && !c.requiresSourceReview && <p className="mt-3 text-lg text-muted-foreground">{c.subtitle}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>By the{" "}
                <Link href="/about" className="font-medium text-foreground hover:underline">
                  Chairpedia Editorial Team
                </Link>
              </span>
              {updatedStr && <span>· Updated {updatedStr}</span>}
            </div>
          </header>

          {c.hero_image_url && !pilot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.hero_image_url} alt={`${pageTitle} product comparison`} className="w-full rounded-xl mb-8" />
          )}

          {!pilot && (c.productA || c.productB) && (
            <div className="mb-8 grid gap-3">
              <p className="text-sm text-muted-foreground" data-testid="comparison-affiliate-disclosure">
                As an Amazon Associate I earn from qualifying purchases. Search links may include other models or accessories; confirm the exact item, seller and condition before buying.
              </p>
              {c.productA && <BuyRow product={c.productA} placement="compare-top-a" />}
              {c.productB && <BuyRow product={c.productB} placement="compare-top-b" />}
            </div>
          )}

          {pilot ? <VerifiedComparison pilot={pilot} productA={c.productA} productB={c.productB} /> : c.requiresSourceReview ? <section className="border border-[#171717] bg-[#f5f1e8] p-6" aria-labelledby="source-review-heading"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8a5a20]">Source review in progress</p><h2 id="source-review-heading" className="mt-2 font-serif text-2xl">This comparison is being checked against model-specific sources.</h2><p className="mt-3 leading-7 text-muted-foreground">Earlier copy included claims whose exact model, configuration or source could not be confirmed. Chairpedia has withheld those claims while preserving access to both product records.</p></section> : <div className="chairpedia-body" dangerouslySetInnerHTML={{ __html: wrapTables(rewriteOwnedSiteLinks(c.content_html)) }} />}

          {c.faq.length > 0 && !c.requiresSourceReview && !pilot && (
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

          {!pilot && (c.productA || c.productB) && (
            <div className="mt-12 grid gap-3">
              <p className="text-sm text-muted-foreground">
                Affiliate links: we may earn a commission from qualifying purchases. Check current delivery, return and warranty terms on Amazon.
              </p>
              {c.productA && <BuyRow product={c.productA} placement="compare-bottom-a" />}
              {c.productB && <BuyRow product={c.productB} placement="compare-bottom-b" />}
            </div>
          )}

          {!pilot && <BuyingGuideRail title="Choose and buy with confidence" />}
          <ContentStandardsNote kind="comparison" />
        </article>
      </main>
      {pilot ? <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground"><p>Chairpedia documents model-specific sources and configuration conditions.</p><div className="mt-3 flex justify-center gap-4"><Link href="/editorial-policy" className="underline underline-offset-4">Editorial policy</Link><Link href="/affiliate-disclosure" className="underline underline-offset-4">Affiliate disclosure</Link></div></footer> : <Footer />}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      {c.faq.length > 0 && !c.requiresSourceReview && !pilot && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(c.faq)) }} />
      )}
    </div>
  )
}

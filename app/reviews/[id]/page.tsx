import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, ExternalLink, Check, X } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"

type BrandRel = { name?: string | null } | Array<{ name?: string | null }> | null

type ReviewDetailRow = {
  id: string
  source: string | null
  summary_ko: string | null
  pros: string[] | null
  cons: string[] | null
  reviewer_height_cm: number | null
  reviewer_weight_kg: number | null
  usage_hours_per_day: number | null
  usage_purpose: string | null
  source_url: string | null
  created_at: string | null
  products: {
    id: string
    slug: string
    name: string
    thumbnail_url: string | null
    brands: BrandRel
  } | null
}

const DETAIL_SELECT =
  "id, source, summary_ko, pros, cons, reviewer_height_cm, reviewer_weight_kg, usage_hours_per_day, usage_purpose, source_url, created_at, products!inner(id, slug, name, thumbnail_url, brands(name))"

function brandName(rel: BrandRel): string | null {
  const b = Array.isArray(rel) ? rel[0] : rel
  return b?.name?.trim() || null
}

function sourceLabel(source: string | null): string {
  if (!source) return "Community"
  const map: Record<string, string> = {
    reddit: "Reddit",
    youtube: "YouTube",
    naver: "Naver",
    dcinside: "DC Inside",
    trustpilot: "Trustpilot",
    review_sites: "Review sites",
    hackernews: "Hacker News",
    japan_community: "Japan community",
    chairpark: "Chairpark",
  }
  return map[source] ?? source
}

function formatDate(value: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

async function getReview(id: string): Promise<ReviewDetailRow | null> {
  // Guard against non-uuid ids hitting the DB.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const supabase = createPublicServerClient()
  const { data } = await supabase
    .from("reviews")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle()
  return (data as ReviewDetailRow | null) ?? null
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await props.params
  const review = await getReview(id)
  if (!review?.products) return { title: "Review | Furniblog" }
  const name = review.products.name
  return {
    title: `${name} review (${sourceLabel(review.source)}) | Furniblog`,
    description:
      review.summary_ko?.trim().slice(0, 160) ||
      `A user review of the ${name} office chair, with a link to the original.`,
  }
}

export default async function ReviewDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const review = await getReview(id)
  if (!review || !review.products) notFound()

  const product = review.products
  const brand = brandName(product.brands)
  const pros = (review.pros ?? []).filter(Boolean)
  const cons = (review.cons ?? []).filter(Boolean)
  const date = formatDate(review.created_at)
  const profile: string[] = []
  if (review.reviewer_height_cm) profile.push(`${review.reviewer_height_cm} cm`)
  if (review.reviewer_weight_kg) profile.push(`${review.reviewer_weight_kg} kg`)
  if (review.usage_hours_per_day)
    profile.push(`${review.usage_hours_per_day} h/day`)
  if (review.usage_purpose) profile.push(review.usage_purpose)

  const jsonLd = [
    generateArticleSchema({
      headline: `${product.name} review (${sourceLabel(review.source)})`,
      description: review.summary_ko,
      path: `/reviews/${review.id}`,
      datePublished: review.created_at,
      image: product.thumbnail_url,
      authorName: sourceLabel(review.source),
    }),
    generateBreadcrumbSchema([
      { name: "Reviews", url: "/reviews" },
      { name: product.name, url: `/products/${product.slug}` },
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
          href="/reviews"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All reviews
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {brand ? (
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
              {brand}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {sourceLabel(review.source)}
            {date ? ` · ${date}` : ""}
          </span>
        </div>

        <h1 className="mt-3 font-serif text-2xl font-medium leading-tight tracking-tight text-foreground md:text-3xl">
          <Link href={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>{" "}
          review
        </h1>

        {/* Summary (links out to the original below) */}
        {review.summary_ko?.trim() ? (
          <p className="mt-6 text-lg leading-relaxed text-foreground">
            {review.summary_ko.trim()}
          </p>
        ) : null}

        {profile.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs capitalize text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        {(pros.length > 0 || cons.length > 0) && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {pros.length > 0 && (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Pros
                </h2>
                <ul className="space-y-1.5">
                  {pros.map((p, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cons
                </h2>
                <ul className="space-y-1.5">
                  {cons.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Outbound to original */}
        {review.source_url ? (
          <div className="mt-8">
            <a
              href={review.source_url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground"
            >
              Read the original on {sourceLabel(review.source)}
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="mt-2 text-xs text-muted-foreground">
              Summary curated by Furniblog. The full review belongs to the
              original author.
            </p>
          </div>
        ) : null}

        {/* Product funnel */}
        <section className="mt-10 border-t border-border pt-8">
          <Link
            href={`/products/${product.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {product.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.thumbnail_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              {brand ? (
                <p className="text-xs text-muted-foreground">{brand}</p>
              ) : null}
              <p className="font-medium text-foreground">{product.name}</p>
              <p className="mt-1 text-sm text-foreground underline-offset-2 group-hover:underline">
                View this chair, specs &amp; price →
              </p>
            </div>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}

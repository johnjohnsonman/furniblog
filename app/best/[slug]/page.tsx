import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Check, X, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getResolvedBestList, getBestListCards } from "@/lib/best/resolve"
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"

export const dynamic = "force-dynamic"

interface BestListPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BestListPageProps): Promise<Metadata> {
  const { slug } = await params
  const list = await getResolvedBestList(slug)
  if (!list) return {}
  const description =
    list.intro?.trim() ||
    `${list.title} — expert-curated picks with specs, real reviews and prices.`
  return {
    title: list.title,
    description,
    alternates: { canonical: `/best/${slug}` },
    openGraph: {
      title: list.title,
      description,
      url: `/best/${slug}`,
      images: list.heroImage ? [list.heroImage] : undefined,
    },
  }
}

const WINNER_LABELS = ["Best overall", "Runner-up", "Also great"]

export default async function BestListPage({ params }: BestListPageProps) {
  const { slug } = await params
  const list = await getResolvedBestList(slug)
  if (!list) notFound()

  const winners = list.items.slice(0, 3)
  const related = (await getBestListCards()).filter((l) => l.slug !== slug).slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/best" className="hover:text-foreground">Best Lists</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{list.title}</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="font-serif text-3xl font-medium text-foreground lg:text-4xl">{list.title}</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            {list.intro?.trim() ||
              `Our picks for the ${list.title.toLowerCase()}, tested and reviewed. Updated for ${new Date().getFullYear()}.`}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {list.items.length} chairs · updated {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Hero image */}
        {list.heroImage && (
          <div className="mx-auto max-w-5xl px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={list.heroImage} alt={list.title} className="aspect-[2.4/1] w-full rounded-2xl object-cover" />
          </div>
        )}

        {/* Quick winners */}
        {winners.length > 0 && (
          <div className="mx-auto mt-8 max-w-5xl px-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {winners.map((w, i) => (
                <div key={w.slug} className="rounded-xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-premium-accent">
                    {WINNER_LABELS[i]}
                  </p>
                  <Link href={`/products/${w.slug}`} className="font-medium text-foreground hover:underline">
                    {w.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{w.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rankings */}
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="space-y-6">
            {list.items.map((p, index) => (
              <div key={p.slug} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex flex-col gap-6 p-6 lg:flex-row lg:gap-8 lg:p-8">
                  <div className="flex gap-4 lg:flex-col lg:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground font-bold text-background">
                      {index + 1}
                    </div>
                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg bg-premium-cream lg:h-44 lg:w-44">
                      {p.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-full w-full object-contain p-3" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    {p.brand && (
                      p.brandSlug ? (
                        <Link href={`/brands/${p.brandSlug}`} className="text-sm text-muted-foreground hover:text-foreground">
                          {p.brand}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">{p.brand}</span>
                      )
                    )}
                    <h2 className="mt-1 font-serif text-xl font-medium text-foreground">
                      <Link href={`/products/${p.slug}`} className="hover:underline">{p.name}</Link>
                    </h2>
                    <p className="mt-2 text-lg font-semibold text-foreground">{p.price}</p>

                    {p.blurb && (
                      <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-sm italic text-foreground">
                        {p.blurb}
                      </p>
                    )}
                    {p.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                    )}
                    {p.bestFor && (
                      <p className="mt-2 text-sm">
                        <span className="text-muted-foreground">Best for: </span>
                        <span className="font-medium text-foreground">{p.bestFor}</span>
                      </p>
                    )}

                    {(p.pros.length > 0 || p.cons.length > 0) && (
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {p.pros.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pros</p>
                            <ul className="space-y-1">
                              {p.pros.slice(0, 3).map((pro, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                                  <span className="text-foreground">{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {p.cons.length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Cons</p>
                            <ul className="space-y-1">
                              {p.cons.slice(0, 3).map((con, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                                  <span className="text-foreground">{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <SmartBuyLink
                        variant="inline"
                        productId={p.slug}
                        name={p.name}
                        amazonUrl={p.amazonUrl}
                        amazonLabel="View on Amazon"
                      />
                      <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                        Full Review
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            Furniblog may earn a commission when you purchase through links on this page, at no extra cost to you.
          </p>
        </div>

        {/* Related lists */}
        {related.length > 0 && (
          <section className="border-t border-border py-14">
            <div className="mx-auto max-w-5xl px-4">
              <h2 className="mb-6 font-serif text-xl font-medium text-foreground">Related lists</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <Link key={r.slug} href={`/best/${r.slug}`} className="rounded-lg border border-border bg-card p-4 transition-all hover:border-foreground/20">
                    <h3 className="text-sm font-medium text-foreground">{r.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{r.count} chairs</p>
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

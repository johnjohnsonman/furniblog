import Link from "next/link"
import {
  Briefcase,
  Crown,
  Gamepad2,
  BookOpen,
  UtensilsCrossed,
  Users,
  Armchair,
  ArrowUpFromLine,
  Gem,
  Play,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsCard } from "@/components/news/news-card"
import { ChairBand } from "@/components/home/chair-band"
import { ChairpediaHero } from "@/components/home/chairpedia-hero"
import { StatBand } from "@/components/home/stat-band"
import { Reveal } from "@/components/home/reveal"
import { bestLists } from "@/lib/data"
import {
  CHAIR_CATEGORIES,
  countByChairCategory,
} from "@/lib/chair-categories"
import {
  getSiteStats,
  getFeaturedProducts,
  getProducts,
} from "@/lib/supabase/queries"
import {
  getLatestReviews,
  getLatestVideos,
  getLatestNews,
  getHomeChairpedia,
} from "@/lib/home/feeds"
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"

export const metadata = { alternates: { canonical: "/" } }

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  office: Briefcase,
  executive: Crown,
  gaming: Gamepad2,
  study: BookOpen,
  dining: UtensilsCrossed,
  conference: Users,
  lounge: Armchair,
  standing: ArrowUpFromLine,
  design: Gem,
}

const HOME_BEST_LIST_IDS = [
  "best-office-chairs",
  "best-for-back-pain",
  "best-for-tall-people",
  "best-under-1000",
  "best-japanese-chairs",
  "best-for-long-hours",
] as const

function SectionHead({ title, href, cta }: { title: string; href: string; cta: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="font-serif text-2xl font-medium text-foreground sm:text-3xl">{title}</h2>
      <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        {cta} →
      </Link>
    </div>
  )
}

export default async function HomePage() {
  const [
    stats,
    featuredProducts,
    allProducts,
    chairpedia,
    latestReviews,
    latestVideos,
    latestNews,
  ] = await Promise.all([
    getSiteStats(),
    getFeaturedProducts(6),
    getProducts(),
    getHomeChairpedia(9),
    getLatestReviews(6),
    getLatestVideos(8),
    getLatestNews(4),
  ])
  const categoryCounts = countByChairCategory(allProducts)
  const homeBestLists = bestLists.filter((list) =>
    HOME_BEST_LIST_IDS.includes(list.id as (typeof HOME_BEST_LIST_IDS)[number])
  )
  const { brands } = await import("@/lib/data")
  const topBrands = brands.slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([generateOrganizationSchema(), generateWebsiteSchema()]),
        }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero — Chairpedia-led, image-forward */}
        <section className="border-b border-premium-border">
          <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
            <Reveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-premium-text-tertiary">
                Furniblog — premium chair database
              </p>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl font-medium leading-[1.1] tracking-tight text-premium-text sm:text-5xl lg:text-[56px] text-balance">
                Real reviews &amp; real data for premium chairs
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-premium-text-secondary">
                Honest reviews, in-depth deep dives, videos and verified specs for
                the world&apos;s best office, ergonomic and design chairs.
              </p>
            </Reveal>

            {chairpedia.length > 0 && (
              <Reveal>
                <ChairpediaHero entries={chairpedia} />
              </Reveal>
            )}
          </div>
        </section>

        {/* chA.I.r band */}
        <ChairBand />

        {/* Trust band — animated data */}
        <StatBand
          stats={[
            { value: stats.products, label: "Products" },
            { value: stats.brands, label: "Brands" },
            { value: stats.reviews, label: "Reviews" },
            { value: stats.comparisons, label: "Comparisons" },
          ]}
        />

        {/* Latest reviews — now image-forward */}
        {latestReviews.length > 0 && (
          <section className="border-t border-border py-14 lg:py-20">
            <div className="mx-auto max-w-6xl px-4">
              <Reveal>
                <SectionHead title="Latest reviews" href="/reviews" cta="View all" />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {latestReviews.map((r) => (
                    <Link
                      key={r.id}
                      href={`/reviews/${r.id}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-premium-cream">
                        {r.productImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.productImage}
                            alt={r.productName}
                            loading="lazy"
                            className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            {r.productName}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {r.brandName && (
                            <span className="rounded-full border border-border px-2 py-0.5 font-medium text-foreground">
                              {r.brandName}
                            </span>
                          )}
                          <span className="truncate">{r.productName}</span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground">
                          {r.summary}
                        </p>
                        <span className="mt-auto pt-3 text-xs font-medium text-foreground group-hover:underline">
                          Read full review →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Top rated */}
        <section className="border-t border-border bg-muted/20 py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <SectionHead title="Top rated" href="/products" cta="View all" />
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {featuredProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
                  >
                    <span className="w-5 shrink-0 font-serif text-lg text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-premium-cream">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{product.name}</h3>
                        <span className="hidden text-sm text-muted-foreground sm:inline">by {product.brand}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{product.categoryLabel ?? product.category}</span>
                        {product.bestFor && (
                          <>
                            <span>·</span>
                            <span className="text-foreground/70">{product.bestFor}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="shrink-0 text-right font-medium text-foreground">{product.price}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* New videos — rail */}
        {latestVideos.length > 0 && (
          <section className="border-t border-border py-14 lg:py-20">
            <div className="mx-auto max-w-6xl px-4">
              <Reveal>
                <SectionHead title="New videos" href="/videos" cta="View all" />
              </Reveal>
              <Reveal>
                <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
                  {latestVideos.map((v) => (
                    <a
                      key={v.id}
                      href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block w-[260px] shrink-0 snap-start sm:w-[320px]"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                        {v.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.thumbnailUrl}
                            alt={v.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : null}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-full bg-black/55 p-3 backdrop-blur-sm transition-colors group-hover:bg-black/70">
                            <Play className="h-5 w-5 fill-white text-white" />
                          </span>
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{v.title}</p>
                      {v.brand && <p className="text-xs text-muted-foreground">{v.brand}</p>}
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Browse by category */}
        <section className="border-t border-border py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <h2 className="font-serif text-2xl font-medium text-foreground sm:text-3xl">
                Browse by category
              </h2>
              <p className="mb-8 mt-1 text-sm text-muted-foreground">Explore chairs by how you use them</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CHAIR_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id] ?? Briefcase
                  const count = categoryCounts[cat.id]
                  return (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/25 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                    >
                      <Icon className="mb-3 h-6 w-6 text-foreground transition-transform group-hover:scale-110" />
                      <h3 className="text-sm font-medium leading-snug text-foreground">{cat.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count} {count === 1 ? "chair" : "chairs"}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Latest news */}
        {latestNews.length > 0 && (
          <section className="border-t border-border py-14 lg:py-20">
            <div className="mx-auto max-w-6xl px-4">
              <Reveal>
                <SectionHead title="Latest news" href="/news" cta="View all" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {latestNews.map((n) => (
                    <NewsCard key={n.id} item={n} />
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Best lists + Brands */}
        <section className="border-t border-border py-14 lg:py-20">
          <div className="mx-auto max-w-6xl space-y-14 px-4">
            <Reveal>
              <SectionHead title="Best lists" href="/best" cta="View all" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {homeBestLists.map((list) => (
                  <Link
                    key={list.id}
                    href={`/best/${list.id}`}
                    className="rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                  >
                    <h3 className="text-sm font-medium text-foreground">{list.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{list.count} chairs</p>
                  </Link>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <SectionHead title="Brands" href="/brands" cta="All brands" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {topBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.id}`}
                    className="rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-foreground/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                      {brand.logo}
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground">{brand.name}</p>
                    <p className="text-xs text-muted-foreground">{brand.country}</p>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

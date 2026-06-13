import Link from "next/link"
import {
  ArrowRight,
  Search,
  Star,
  Briefcase,
  Crown,
  Gamepad2,
  BookOpen,
  UtensilsCrossed,
  Users,
  Armchair,
  ArrowUpFromLine,
  Play,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsCard } from "@/components/news/news-card"
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
} from "@/lib/home/feeds"
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  office: Briefcase,
  executive: Crown,
  gaming: Gamepad2,
  study: BookOpen,
  dining: UtensilsCrossed,
  conference: Users,
  lounge: Armchair,
  standing: ArrowUpFromLine,
}

const HOME_BEST_LIST_IDS = [
  "best-office-chairs",
  "best-for-back-pain",
  "best-for-tall-people",
  "best-under-1000",
  "best-japanese-chairs",
  "best-for-long-hours",
] as const

export default async function HomePage() {
  const [
    stats,
    featuredProducts,
    allProducts,
    latestReviews,
    latestVideos,
    latestNews,
  ] = await Promise.all([
    getSiteStats(),
    getFeaturedProducts(6),
    getProducts(),
    getLatestReviews(9),
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
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateOrganizationSchema(),
            generateWebsiteSchema(),
          ]),
        }}
      />
      <Header />

      <main className="flex-1">
        <section className="py-10 lg:py-14">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
              Real reviews, videos &amp; news for premium chairs
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
              Everything about office &amp; ergonomic chairs in one place —
              updated daily.
            </p>

            <form action="/products" className="mt-7">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search chairs, brands, models..."
                  className="w-full h-14 pl-14 pr-32 text-base bg-card border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent placeholder:text-muted-foreground/60"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Popular:</span>
              {["Aeron", "Embody", "Gesture", "Leap"].map((term) => (
                <Link
                  key={term}
                  href={`/products?search=${term.toLowerCase()}`}
                  className="px-3 py-1.5 bg-muted rounded-full text-foreground hover:bg-muted/80 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16 border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
              Browse by Category
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              Explore chairs by how you use them
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHAIR_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id] ?? Briefcase
                const count = categoryCounts[cat.id]
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.id}`}
                    className="group p-5 bg-card rounded-xl border border-border hover:border-foreground/25 transition-all"
                  >
                    <Icon className="h-6 w-6 text-foreground mb-3" />
                    <h3 className="font-medium text-foreground text-sm leading-snug">
                      {cat.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {count} {count === 1 ? "chair" : "chairs"}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {latestReviews.length > 0 && (
          <section className="py-12 lg:py-16 border-t border-border">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Latest reviews
                </h2>
                <Link
                  href="/reviews"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {latestReviews.map((r) => (
                  <Link
                    key={r.id}
                    href={`/reviews/${r.id}`}
                    className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {r.brandName && (
                        <span className="rounded-full border border-border px-2 py-0.5 font-medium text-foreground">
                          {r.brandName}
                        </span>
                      )}
                      <span className="truncate">{r.productName}</span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-foreground">
                      {r.summary}
                    </p>
                    <span className="mt-auto pt-3 text-xs font-medium text-foreground group-hover:underline">
                      Read full review →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {latestVideos.length > 0 && (
          <section className="py-12 lg:py-16 border-t border-border bg-muted/20">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  New videos
                </h2>
                <Link
                  href="/videos"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {latestVideos.map((v) => (
                  <a
                    key={v.id}
                    href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
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
                        <span className="rounded-full bg-black/55 p-2.5 backdrop-blur-sm transition-colors group-hover:bg-black/70">
                          <Play className="h-4 w-4 fill-white text-white" />
                        </span>
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">
                      {v.title}
                    </p>
                    {v.brand && (
                      <p className="text-xs text-muted-foreground">{v.brand}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {latestNews.length > 0 && (
          <section className="py-12 lg:py-16 border-t border-border">
            <div className="mx-auto max-w-6xl px-4">
              <div className="mb-6 flex items-end justify-between">
                <h2 className="font-serif text-2xl font-medium text-foreground">
                  Latest news
                </h2>
                <Link
                  href="/news"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  View all →
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {latestNews.map((n) => (
                  <NewsCard key={n.id} item={n} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-8 border-y border-border bg-card">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.products}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Products</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.brands}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Brands</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.reviews}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Reviews</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.comparisons}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Comparisons</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-serif text-2xl font-medium text-foreground">Top Rated</h2>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </div>
            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
              {featuredProducts.map((product, index) => {
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center gap-4 p-4 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground w-5 shrink-0">{index + 1}</span>
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{product.name}</h3>
                        <span className="text-sm text-muted-foreground hidden sm:inline">by {product.brand}</span>
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
                    <div className="text-right shrink-0">
                      <p className="font-medium text-foreground">{product.price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-serif text-2xl font-medium text-foreground">Best Lists</h2>
              <Link href="/best" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {homeBestLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/best/${list.id}`}
                  className="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all"
                >
                  <h3 className="font-medium text-foreground text-sm">{list.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{list.count} chairs</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-serif text-2xl font-medium text-foreground">Brands</h2>
              <Link href="/brands" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                All brands
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {topBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.id}`}
                  className="p-4 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all text-center"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground font-semibold text-xs">
                    {brand.logo}
                  </div>
                  <p className="mt-2 font-medium text-foreground text-sm">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">{brand.country}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  )
}

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
  CheckCircle2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { bestLists, getAverageScore } from "@/lib/data"
import {
  CHAIR_CATEGORIES,
  countByChairCategory,
} from "@/lib/chair-categories"
import {
  getSiteStats,
  getFeaturedProducts,
  getProducts,
} from "@/lib/supabase/queries"
import { AdSlot } from "@/components/common/AdSlot"

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
  const [stats, featuredProducts, allProducts] = await Promise.all([
    getSiteStats(),
    getFeaturedProducts(6),
    getProducts(),
  ])
  const categoryCounts = countByChairCategory(allProducts)
  const homeBestLists = bestLists.filter((list) =>
    HOME_BEST_LIST_IDS.includes(list.id as (typeof HOME_BEST_LIST_IDS)[number])
  )
  const { comparisons, brands } = await import("@/lib/data")
  const topBrands = brands.slice(0, 6)
  const popularComparisons = comparisons.slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Find Your Perfect Chair
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
              The world&apos;s most complete database for premium seating. Real
              specs, real reviews, real comparisons.
            </p>

            <form action="/products" className="mt-10">
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

        <section className="py-6 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 flex justify-center">
            <AdSlot position="header" />
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

        <section className="py-14 lg:py-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="font-serif text-2xl font-medium text-foreground mb-8">
              Why Furniblog?
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                "Real user data from 688+ in-person chair tests (Chairpark)",
                "Specs for height, weight & posture matching",
                "Global reviews: Reddit, YouTube, Japanese communities",
                "Side-by-side comparison tool",
              ].map((text) => (
                <li key={text} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

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
                const score = getAverageScore(product)
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
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                        <span className="font-semibold text-foreground">{product.rating}</span>
                      </div>
                      {score && <p className="text-xs text-muted-foreground mt-0.5">{score}/100</p>}
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

        <section className="py-8 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 flex justify-center">
            <AdSlot position="in-content" />
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

        <section className="py-14 lg:py-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-serif text-2xl font-medium text-foreground">Popular Comparisons</h2>
              <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Compare chairs
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {popularComparisons.map((comparison) => (
                <Link
                  key={comparison.id}
                  href={`/compare?products=${comparison.products.map((p) => p.id).join(",")}`}
                  className="p-5 bg-card rounded-lg border border-border hover:border-foreground/20 transition-all"
                >
                  <div className="flex items-center justify-center gap-3">
                    {comparison.products.map((p, idx) => (
                      <div key={p.id} className="flex items-center">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        </div>
                        {idx === 0 && <span className="mx-3 text-muted-foreground text-xs font-medium">vs</span>}
                      </div>
                    ))}
                  </div>
                  <h3 className="mt-4 text-center font-medium text-foreground text-sm">{comparison.title}</h3>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    {comparison.views.toLocaleString()} views
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-16 border-t border-border">
          <div className="mx-auto max-w-6xl px-4">
            <div className="p-8 bg-foreground text-background rounded-xl lg:p-10">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-wider text-background/60 mb-2">
                  Available in Korea
                </p>
                <h2 className="font-serif text-2xl font-medium lg:text-3xl">Try before you buy at Chairpark</h2>
                <p className="mt-3 text-background/70 leading-relaxed">
                  Experience premium chairs in person at Chairpark. Compare models side by side and get expert sizing advice before you buy.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="https://chairpark.co.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background/90 transition-colors"
                  >
                    Book Showroom Visit
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-16 border-t border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 text-center">
            <h2 className="font-serif text-2xl font-medium text-foreground">Ready to find your perfect chair?</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Browse specs, community reviews, and head-to-head comparisons.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
              >
                Browse Chairs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Start Comparing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

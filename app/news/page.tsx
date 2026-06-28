import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { fetchNewsFilterOptions } from "@/lib/news/filter-options"
import { NewsCard, type NewsItem } from "@/components/news/news-card"
import { NewsHero } from "@/components/news/news-hero"

export const metadata = {
  title: "Furniture & Chair News",
  description:
    "Curated office-chair and furniture-brand news, automatically collected and filtered. Browse the latest launches, reviews, and industry stories by brand.",
}

export const dynamic = "force-dynamic"

type SearchParams = {
  brand?: string
  page?: string
  sort?: "latest" | "added"
}

const HERO_COUNT = 3
const PAGE_SIZE = 12

const NEWS_SELECT =
  "id, slug, url, title, source_name, image_url, published_at, brand, summary"

export default async function NewsPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await props.searchParams
  const supabase = createPublicServerClient()
  const selectedBrand = searchParams.brand?.trim() || ""
  const sort = searchParams.sort === "added" ? "added" : "latest"
  const orderCol = sort === "added" ? "created_at" : "published_at"
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let gridQuery = supabase
    .from("news")
    .select(NEWS_SELECT, { count: "exact" })
    .eq("status", "published")
    .order(orderCol, { ascending: false, nullsFirst: false })

  if (selectedBrand) gridQuery = gridQuery.eq("brand", selectedBrand)

  const featuredQuery = supabase
    .from("news")
    .select(NEWS_SELECT)
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(HERO_COUNT)

  const [{ data: gridData, count }, { data: featuredData }, filterOptions] =
    await Promise.all([
      gridQuery.range(from, to),
      featuredQuery,
      fetchNewsFilterOptions(supabase),
    ])

  let featured = (featuredData ?? []) as NewsItem[]
  // Fall back to the latest published articles when nothing is flagged featured.
  if (featured.length === 0) {
    const { data: latest } = await supabase
      .from("news")
      .select(NEWS_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(HERO_COUNT)
    featured = (latest ?? []) as NewsItem[]
  }

  const news = (gridData ?? []) as NewsItem[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const { brands, total: totalNews } = filterOptions
  const isFiltered = Boolean(selectedBrand)

  function brandHref(brand: string): string {
    const qs = new URLSearchParams()
    if (brand) qs.set("brand", brand)
    if (sort === "added") qs.set("sort", sort)
    const s = qs.toString()
    return s ? `/news?${s}` : "/news"
  }

  function sortHref(nextSort: "latest" | "added"): string {
    const qs = new URLSearchParams()
    if (selectedBrand) qs.set("brand", selectedBrand)
    if (nextSort === "added") qs.set("sort", nextSort)
    const s = qs.toString()
    return s ? `/news?${s}` : "/news"
  }

  function pageHref(nextPage: number): string {
    const qs = new URLSearchParams()
    if (selectedBrand) qs.set("brand", selectedBrand)
    if (sort === "added") qs.set("sort", sort)
    qs.set("page", String(nextPage))
    return `/news?${qs.toString()}`
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Furniture &amp; Chair News
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {totalNews.toLocaleString()} curated{" "}
            {totalNews === 1 ? "story" : "stories"} about office chairs and the
            brands you follow — collected automatically and filtered for
            relevance. Pick a brand to narrow the feed.
          </p>
        </header>

        {/* Hero rolling carousel (only on the unfiltered first page) */}
        {!isFiltered && page === 1 && featured.length > 0 && (
          <section className="mb-10">
            <NewsHero items={featured} />
          </section>
        )}

        {/* Sort toggle */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sort
          </span>
          {([
            { key: "latest", label: "Latest" },
            { key: "added", label: "Recently added" },
          ] as const).map((opt) => (
            <Link
              key={opt.key}
              href={sortHref(opt.key)}
              className={`rounded-full border px-3 py-1.5 transition-colors ${
                sort === opt.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Brand filter chips */}
        {brands.length > 0 && (
          <nav className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/news"
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                !selectedBrand
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              All ({totalNews.toLocaleString()})
            </Link>
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={brandHref(brand.name)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selectedBrand === brand.name
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {brand.name} ({brand.count})
              </Link>
            ))}
          </nav>
        )}

        {isFiltered && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing {total.toLocaleString()} {selectedBrand} article
            {total === 1 ? "" : "s"}.
          </p>
        )}

        {/* News grid */}
        {news.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-foreground">No published news yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different brand, or run news collection from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Previous
              </Link>
            ) : (
              <span className="rounded-md border border-border px-3 py-2 text-sm opacity-40">
                Previous
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                More
              </Link>
            ) : (
              <span className="rounded-md border border-border px-3 py-2 text-sm opacity-40">
                More
              </span>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

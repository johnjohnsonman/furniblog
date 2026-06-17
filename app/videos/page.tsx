import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { VideoEmbedFacade } from "@/components/videos/video-embed-facade"
import { fetchVideoFilterOptions } from "@/lib/videos/filter-options"
import { shuffle } from "@/lib/utils/shuffle"

export const metadata = {
  title: "Chair Videos",
  description:
    "Browse curated chair videos with concise summaries, model links, channel details, and viewing stats.",
}

export const dynamic = "force-dynamic"

type SearchParams = {
  brand?: string
  chair?: string
  sort?: "latest" | "views" | "random"
  page?: string
}

type VideoRow = {
  id: string
  youtube_id: string
  title: string | null
  channel_title: string | null
  thumbnail_url: string | null
  published_at: string | null
  view_count: number | null
  summary: string | null
  brand: string | null
  chair_id: string | null
  products?:
    | { slug?: string | null; name?: string | null }
    | Array<{ slug?: string | null; name?: string | null }>
    | null
}

function formatViewCount(value: number | null): string {
  if (!value || value <= 0) return "0 views"
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M views`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K views`
  return `${value} views`
}

function formatDate(value: string | null): string {
  if (!value) return "Unknown date"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "Unknown date"
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getProductRef(row: VideoRow): { slug: string; name: string } | null {
  const product = Array.isArray(row.products) ? row.products[0] : row.products
  if (!product?.slug || !product?.name) return null
  return { slug: product.slug, name: product.name }
}

export default async function VideosPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams
  const supabase = createPublicServerClient()
  const selectedBrand = searchParams.brand?.trim() || ""
  const selectedChairId = searchParams.chair?.trim() || ""
  const sort =
    searchParams.sort === "views"
      ? "views"
      : searchParams.sort === "latest"
        ? "latest"
        : "random"
  const isRandom = sort === "random"
  const RANDOM_POOL = 48
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1)
  const pageSize = 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("videos")
    .select(
      "id, youtube_id, title, channel_title, thumbnail_url, published_at, view_count, summary, brand, chair_id, products(slug, name)",
      { count: "exact" }
    )
    .eq("status", "published")

  if (selectedBrand) query = query.eq("brand", selectedBrand)
  if (selectedChairId) query = query.eq("chair_id", selectedChairId)
  if (sort === "views") {
    query = query.order("view_count", { ascending: false, nullsFirst: false })
  } else {
    query = query.order("published_at", { ascending: false, nullsFirst: false })
  }

  const popularQuery = supabase
    .from("videos")
    .select("id, youtube_id, title, channel_title, view_count, thumbnail_url, products(slug, name)")
    .eq("status", "published")
    .order("view_count", { ascending: false, nullsFirst: false })
    .limit(12)

  // Random: pull a wider recent pool and shuffle per request (fresh each visit);
  // otherwise page through with a DB range.
  const mainFetch = isRandom ? query.limit(RANDOM_POOL) : query.range(from, to)

  const [{ data: videosData, count }, filterOptions, { data: popularData }] =
    await Promise.all([mainFetch, fetchVideoFilterOptions(supabase), popularQuery])

  let videos = (videosData ?? []) as VideoRow[]
  if (isRandom) {
    videos = shuffle(videos).slice(from, from + pageSize)
  }
  const popular = (popularData ?? []) as VideoRow[]
  const total = count ?? 0
  const totalPages = isRandom
    ? Math.max(1, Math.ceil(Math.min(total, RANDOM_POOL) / pageSize))
    : Math.max(1, Math.ceil(total / pageSize))

  const brands = filterOptions.brands
  const chairOptions = filterOptions.chairs
  const totalVideos = filterOptions.total
  const isFiltered = Boolean(selectedBrand || selectedChairId)

  function pageHref(nextPage: number): string {
    const qs = new URLSearchParams()
    if (selectedBrand) qs.set("brand", selectedBrand)
    if (selectedChairId) qs.set("chair", selectedChairId)
    if (sort !== "random") qs.set("sort", sort)
    qs.set("page", String(nextPage))
    return `/videos?${qs.toString()}`
  }

  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm"

  function FilterForm() {
    return (
      <form method="get" className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Brand
          </label>
          <select name="brand" defaultValue={selectedBrand} className={selectClass}>
            <option value="">All brands ({totalVideos.toLocaleString()})</option>
            {brands.map((brand) => (
              <option key={brand.name} value={brand.name}>
                {brand.name} ({brand.count})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Chair
          </label>
          <select name="chair" defaultValue={selectedChairId} className={selectClass}>
            <option value="">All chairs ({totalVideos.toLocaleString()})</option>
            {chairOptions.map((chair) => (
              <option key={chair.id} value={chair.id}>
                {chair.name} ({chair.count})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sort by
          </label>
          <select name="sort" defaultValue={sort} className={selectClass}>
            <option value="random">Surprise me</option>
            <option value="latest">Latest</option>
            <option value="views">Most viewed</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-10 w-full rounded-md border border-border bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Apply filters
        </button>
      </form>
    )
  }

  function PopularList() {
    if (popular.length === 0) return null
    return (
      <ul className="space-y-4">
        {popular.map((video) => {
          const title = video.title?.trim() || "Untitled video"
          const product = getProductRef(video)
          return (
            <li key={video.id} className="flex gap-3">
              <a
                href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-[54px] w-[96px] shrink-0 overflow-hidden rounded-md border border-border bg-muted"
              >
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt={title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </a>
              <div className="min-w-0 flex-1">
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 text-sm font-medium text-foreground hover:underline"
                >
                  {title}
                </a>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {video.channel_title || "Unknown channel"} ·{" "}
                  {formatViewCount(video.view_count)}
                </p>
                {product ? (
                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-0.5 inline-block truncate text-xs text-foreground underline underline-offset-2"
                  >
                    {product.name} →
                  </Link>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12">
        <header className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground tracking-tight">
            Chair Videos
          </h1>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Explore {totalVideos.toLocaleString()} chair-focused YouTube{" "}
            {totalVideos === 1 ? "video" : "videos"} with AI one-line summaries.
            Filter by brand or model, then compare channels, view counts, and
            publish dates.
          </p>
          {isFiltered && (
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {total.toLocaleString()} of {totalVideos.toLocaleString()}{" "}
              videos
            </p>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr_300px]">
          {/* Left: filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {/* Mobile collapsible */}
            <details className="lg:hidden rounded-xl border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                Filters
              </summary>
              <div className="mt-4">
                <FilterForm />
              </div>
            </details>
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Filters
              </h2>
              <FilterForm />
            </div>
          </aside>

          {/* Center: grid */}
          <div>
            {videos.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <p className="text-foreground">No published videos found.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try changing the filters or run video collection from the admin panel.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {videos.map((video) => {
                  const title = video.title?.trim() || "Untitled video"
                  const product = getProductRef(video)
                  return (
                    <article
                      key={video.id}
                      id={`video-${video.youtube_id}`}
                      className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm scroll-mt-24"
                    >
                      <VideoEmbedFacade
                        youtubeId={video.youtube_id}
                        title={title}
                        thumbnailUrl={video.thumbnail_url}
                      />
                      <div className="mt-4 flex flex-1 flex-col space-y-2">
                        <h2 className="line-clamp-2 text-base font-medium text-foreground">
                          {title}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {video.channel_title || "Unknown channel"} ·{" "}
                          {formatViewCount(video.view_count)} ·{" "}
                          {formatDate(video.published_at)}
                        </p>
                        {video.summary?.trim() ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {video.summary.trim()}
                          </p>
                        ) : null}
                        {product ? (
                          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
                            <span className="min-w-0 truncate text-xs text-muted-foreground">
                              {product.name}
                            </span>
                            <Link
                              href={`/products/${product.slug}`}
                              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-foreground bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-background hover:text-foreground"
                            >
                              View this chair →
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
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
          </div>

          {/* Right: popular videos */}
          {popular.length > 0 && (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Popular videos
              </h2>
              <PopularList />
            </aside>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

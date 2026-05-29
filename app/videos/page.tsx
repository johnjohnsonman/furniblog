import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { VideoEmbedFacade } from "@/components/videos/video-embed-facade"
import { fetchVideoFilterOptions } from "@/lib/videos/filter-options"

export const metadata = {
  title: "Chair Videos | Furniblog",
  description:
    "Browse curated chair videos with AI summaries, including model links, channel details, and viewing stats.",
}

export const dynamic = "force-dynamic"

type SearchParams = {
  brand?: string
  chair?: string
  sort?: "latest" | "views"
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
  const sort = searchParams.sort === "views" ? "views" : "latest"
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

  const [{ data: videosData, count }, filterOptions] = await Promise.all([
    query.range(from, to),
    fetchVideoFilterOptions(supabase),
  ])

  const videos = (videosData ?? []) as VideoRow[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const brands = filterOptions.brands
  const chairOptions = filterOptions.chairs

  function pageHref(nextPage: number): string {
    const qs = new URLSearchParams()
    if (selectedBrand) qs.set("brand", selectedBrand)
    if (selectedChairId) qs.set("chair", selectedChairId)
    if (sort !== "latest") qs.set("sort", sort)
    qs.set("page", String(nextPage))
    return `/videos?${qs.toString()}`
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-12">
        <header className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground tracking-tight">
            Chair Videos
          </h1>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Explore chair-focused YouTube videos with AI one-line summaries. Filter
            by brand or model, then compare channels, view counts, and publish dates.
          </p>
        </header>

        <form method="get" className="mb-8 grid gap-3 md:grid-cols-4">
          <select
            name="brand"
            defaultValue={selectedBrand}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <select
            name="chair"
            defaultValue={selectedChairId}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All chairs</option>
            {chairOptions.map((chair) => (
              <option key={chair.id} value={chair.id}>
                {chair.name}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="latest">Latest</option>
            <option value="views">Most viewed</option>
          </select>
          <button
            type="submit"
            className="h-10 rounded-md border border-border bg-foreground px-4 text-sm text-background"
          >
            Apply filters
          </button>
        </form>

        {videos.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center">
            <p className="text-foreground">No published videos found.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try changing the filters or run video collection from the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => {
              const title = video.title?.trim() || "Untitled video"
              const product = getProductRef(video)
              return (
                <article
                  key={video.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <VideoEmbedFacade
                    youtubeId={video.youtube_id}
                    title={title}
                    thumbnailUrl={video.thumbnail_url}
                  />
                  <div className="mt-4 space-y-2">
                    <h2 className="line-clamp-2 text-base font-medium text-foreground">
                      {title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {video.channel_title || "Unknown channel"} ·{" "}
                      {formatViewCount(video.view_count)} · {formatDate(video.published_at)}
                    </p>
                    {video.summary?.trim() ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {video.summary.trim()}
                      </p>
                    ) : null}
                    {product ? (
                      <Link
                        href={`/products/${product.slug}`}
                        className="inline-flex text-sm text-foreground underline underline-offset-4"
                      >
                        About: {product.name} →
                      </Link>
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
      </main>
      <Footer />
    </div>
  )
}

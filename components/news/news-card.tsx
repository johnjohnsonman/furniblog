export type NewsItem = {
  id: string
  slug: string | null
  url: string
  title: string | null
  source_name: string | null
  image_url: string | null
  published_at: string | null
  brand: string | null
  summary: string | null
}

/** Internal detail route when a slug exists, otherwise fall back to the source URL. */
export function newsHref(item: Pick<NewsItem, "slug" | "url">): string {
  return item.slug ? `/news/${item.slug}` : item.url
}

export function formatNewsDate(value: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Deterministic muted gradient per brand, used when an article has no image. */
export function brandGradient(seed: string | null): string {
  const palettes = [
    "from-slate-700 to-slate-900",
    "from-stone-600 to-stone-900",
    "from-zinc-700 to-neutral-900",
    "from-amber-700 to-stone-900",
    "from-teal-700 to-slate-900",
    "from-indigo-700 to-slate-900",
  ]
  const key = (seed ?? "").toLowerCase()
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return palettes[hash % palettes.length]
}

export function NewsCard({ item }: { item: NewsItem }) {
  const title = item.title?.trim() || "Untitled article"
  const date = formatNewsDate(item.published_at)
  const href = newsHref(item)
  const external = !item.slug
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" as const }
    : {}

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <a
        href={href}
        {...linkProps}
        className="relative block aspect-[16/9] overflow-hidden bg-muted"
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-end bg-gradient-to-br ${brandGradient(
              item.brand
            )} p-4`}
          >
            <span className="font-serif text-lg font-medium text-white/90">
              {item.brand || "Furniture News"}
            </span>
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {item.brand ? (
            <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
              {item.brand}
            </span>
          ) : null}
          <span className="truncate text-xs text-muted-foreground">
            {item.source_name || "News"}
            {date ? ` · ${date}` : ""}
          </span>
        </div>

        <a
          href={href}
          {...linkProps}
          className="line-clamp-2 text-base font-medium text-foreground hover:underline"
        >
          {title}
        </a>

        {item.summary?.trim() ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {item.summary.trim()}
          </p>
        ) : null}

        <a
          href={href}
          {...linkProps}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-2 text-xs font-medium text-foreground underline-offset-2 hover:underline"
        >
          Read more →
        </a>
      </div>
    </article>
  )
}

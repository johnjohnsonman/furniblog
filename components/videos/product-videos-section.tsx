import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { VideoEmbedFacade } from "@/components/videos/video-embed-facade"
import { ReviewsTabLink } from "@/components/videos/reviews-tab-link"
import { RegionalAmazonLink } from "@/components/affiliate/RegionalAmazonLink"
import type { ProductVideo } from "@/lib/videos/product-videos"

type Props = {
  videos: ProductVideo[]
  total: number
  chairName: string
  chairId: string
  amazonUrl?: string | null
  reviewCount?: number
  /** Show this many videos; fold the rest into "Show N more videos". */
  initialVisible?: number
}

function formatViewCount(value: number | null): string {
  if (value === null || value < 0) return "Views unavailable"
  if (value === 0) return "0 views"
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M views`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K views`
  return `${value} views`
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

export function ProductVideosSection({
  videos,
  total,
  chairName,
  chairId,
  amazonUrl,
  reviewCount = 0,
  initialVisible,
}: Props) {
  if (videos.length === 0) return null
  // Past `initialVisible`, videos sit in a <details> block: still in the page
  // HTML, but folded so the section stays short on phones.
  const shown = initialVisible ? videos.slice(0, initialVisible) : videos
  const folded = initialVisible ? videos.slice(initialVisible) : []

  const hasAmazon = Boolean(amazonUrl)
  const hasReviews = reviewCount > 0
  const showCta = hasAmazon || hasReviews

  const renderVideo = (video: Props["videos"][number]) => {
    const title = video.title?.trim() || "Untitled video"
    const date = formatDate(video.published_at)
    return (
      <article
        key={video.id}
        className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
      >
        <VideoEmbedFacade
          youtubeId={video.youtube_id}
          title={title}
          thumbnailUrl={video.thumbnail_url}
        />
        <div className="mt-4 flex flex-1 flex-col space-y-2">
          <h3 className="break-words text-base font-medium text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {video.channel_title || "Unknown channel"} ·{" "}
            {formatViewCount(video.view_count)}
            {date ? ` · ${date}` : ""}
          </p>
          {video.summary?.trim() ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {video.summary.trim()}
            </p>
          ) : null}
          <div className="mt-auto pt-3">
            <a
              href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Watch on YouTube
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2">
      {shown.map(renderVideo)}
      {folded.length > 0 && (
        <details className="group sm:col-span-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center border border-[#171717] bg-white px-5 text-sm font-semibold hover:bg-[#f5f1e8]">
            Show {folded.length} more {folded.length === 1 ? "video" : "videos"}
          </summary>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">{folded.map(renderVideo)}</div>
        </details>
      )}

      {total > videos.length && (
        <div className="sm:col-span-2">
          <Link
            href={`/videos?chair=${encodeURIComponent(chairId)}`}
            className="inline-flex text-sm font-medium text-foreground underline underline-offset-4"
          >
            View all {total.toLocaleString()} videos for {chairName} →
          </Link>
        </div>
      )}

      {showCta && (
        <p className="sm:col-span-2 text-sm text-muted-foreground">
          Liked what you saw?{" "}
          {hasAmazon && (
            <RegionalAmazonLink
              name={chairName}
              productId={chairId}
              href={amazonUrl as string}
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            />
          )}
          {hasAmazon && hasReviews ? " or " : null}
          {hasReviews && (
            <ReviewsTabLink
              reviewCount={reviewCount}
              className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
            />
          )}
        </p>
      )}
    </div>
  )
}

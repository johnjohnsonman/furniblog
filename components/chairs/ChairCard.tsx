import Link from "next/link"
import { Armchair } from "lucide-react"
import type { ProductView } from "@/lib/data/mappers"
import type { ChairCategory } from "@/types/product"
import { ChairProductImage } from "./ChairProductImage"
import { StarRating } from "./StarRating"
import { cn } from "@/lib/utils"

const PLACEHOLDER_BG: Partial<Record<ChairCategory, string>> = {
  office: "#F0F0EB",
  gaming: "#0A0A0A",
  executive: "#1A1A2E",
  standing: "#F0F4F0",
}

interface ChairCardProps {
  product: ProductView
  reviewCount?: number
  avgScore?: number
}

export function ChairCard({ product, reviewCount, avgScore }: ChairCardProps) {
  const displayCount = reviewCount ?? product.reviewCount ?? 0
  const displayRating =
    avgScore != null && avgScore > 0 ? avgScore : product.rating ?? 0
  const hasReviews = displayCount > 0
  const imageBg =
    PLACEHOLDER_BG[product.category as ChairCategory] ?? "var(--premium-cream)"
  const isDarkPlaceholder =
    product.category === "gaming" || product.category === "executive"

  const priceDisplay =
    product.price && product.price !== "—"
      ? product.price
      : "Price on request"

  return (
    <article
      className={cn(
        "group flex flex-col bg-white border border-premium-border rounded-[2px]",
        "transition-all duration-200 ease-out",
        "hover:border-premium-border-hover hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
      )}
    >
      <Link
        href={`/products/${product.id}`}
        className="block overflow-hidden"
        style={{ backgroundColor: imageBg }}
      >
        <div className="relative aspect-square">
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-[1.02]">
            {(product.images?.[0] ?? product.image) ? (
              <ChairProductImage
                src={product.images?.[0] ?? product.image}
                alt={product.name}
                category={product.category}
                className="object-contain p-6"
              />
            ) : (
              <Armchair
                className={cn(
                  "h-16 w-16 opacity-30",
                  isDarkPlaceholder ? "text-white" : "text-premium-text"
                )}
                strokeWidth={1}
              />
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-premium-text-tertiary">
          {product.brand}
          <span className="mx-1.5 text-premium-border">·</span>
          {product.categoryLabel ?? product.category}
        </p>

        <Link href={`/products/${product.id}`} className="mt-2 block">
          <h3 className="font-serif text-xl font-medium leading-snug text-premium-text transition-colors group-hover:text-premium-text-secondary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-premium-text-secondary">
          {hasReviews ? (
            <>
              <StarRating rating={displayRating} />
              <span className="font-medium text-premium-text">
                {displayRating.toFixed(1)}
              </span>
              <span className="text-premium-text-tertiary">·</span>
              <span>
                {displayCount.toLocaleString()}{" "}
                {displayCount === 1 ? "review" : "reviews"}
              </span>
            </>
          ) : (
            <span className="text-premium-text-tertiary">
              Be the first to review
            </span>
          )}
        </div>

        <div className="mt-4 border-t border-premium-border" />

        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="text-lg font-medium text-premium-text">{priceDisplay}</p>
          <Link
            href={`/products/${product.id}`}
            className="shrink-0 text-[13px] font-medium text-premium-accent transition-colors hover:underline"
          >
            View →
          </Link>
        </div>
      </div>
    </article>
  )
}

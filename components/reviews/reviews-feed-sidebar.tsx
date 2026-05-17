import type { BrandReviewCount } from "@/lib/data/reviews"
import { cn } from "@/lib/utils"

interface ReviewsFeedSidebarProps {
  brandCounts: BrandReviewCount[]
  activeBrandId: string
  onBrandClick: (brandId: string) => void
}

export function ReviewsFeedSidebar({
  brandCounts,
  activeBrandId,
  onBrandClick,
}: ReviewsFeedSidebarProps) {
  const total = brandCounts.reduce((sum, b) => sum + b.count, 0)

  return (
    <aside className="space-y-4">
      <div className="p-5 bg-card rounded-xl border border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          All reviews
        </p>
        <p className="mt-2 text-3xl font-serif font-medium text-foreground">
          {total.toLocaleString()}
        </p>
      </div>

      <div className="p-5 bg-card rounded-xl border border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          By brand
        </p>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onBrandClick("all")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                activeBrandId === "all"
                  ? "bg-foreground text-background"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <span>All</span>
              <span className="font-semibold tabular-nums">{total}</span>
            </button>
          </li>
          {brandCounts.map(({ brandId, brandName, count }) => (
            <li key={brandId}>
              <button
                type="button"
                onClick={() => onBrandClick(brandId)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeBrandId === brandId
                    ? "bg-foreground text-background"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span className="truncate text-left">{brandName}</span>
                <span className="font-semibold tabular-nums shrink-0">
                  {count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

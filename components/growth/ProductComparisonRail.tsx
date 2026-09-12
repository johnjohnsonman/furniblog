import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { ProductComparisonLink } from "@/lib/growth/product-comparisons"

export function ProductComparisonRail({
  productName,
  comparisons,
}: {
  productName: string
  comparisons: ProductComparisonLink[]
}) {
  if (comparisons.length === 0) return null

  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="font-serif text-lg font-medium text-foreground">Compare {productName}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {comparisons.map((comparison) => (
          <Link
            key={comparison.slug}
            href={`/compare/${comparison.slug}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {comparison.title}
            <ArrowUpRight className="h-4 w-4 opacity-60" />
          </Link>
        ))}
      </div>
    </section>
  )
}

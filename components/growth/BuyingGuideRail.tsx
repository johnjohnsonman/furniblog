import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { getBuyingGuideLinks } from "@/lib/growth/buying-guides"

export function BuyingGuideRail({
  category,
  priceUsd,
  title = "Buying guides",
}: {
  category?: string | null
  priceUsd?: number | null
  title?: string
}) {
  return (
    <section className="mt-10 border-t border-border pt-6" aria-labelledby="buying-guide-rail-heading">
      <h2 id="buying-guide-rail-heading" className="font-serif text-lg font-medium text-foreground">
        {title}
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {getBuyingGuideLinks({ category, priceUsd }).map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <span>{guide.label}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 opacity-60" />
          </Link>
        ))}
      </div>
    </section>
  )
}

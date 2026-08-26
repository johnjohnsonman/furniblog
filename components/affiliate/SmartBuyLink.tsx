"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { trackAffiliateClick, type AffiliateCountry } from "@/lib/affiliate/links"
import { isSeaCountry, resolveSeaLinks, type SeaCountry } from "@/lib/affiliate/sea"

const FALLBACK_AMAZON_TAG =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || "furniblog0e-20"

function readCountryCookie(): string {
  if (typeof document === "undefined") return "US"
  const m = document.cookie.match(/(?:^|;\s*)x-country=([^;]+)/)
  return (m?.[1] || "US").toUpperCase()
}

const RETAILER_STYLE: Record<string, string> = {
  amazon: "bg-foreground text-background hover:bg-foreground/90",
  shopee: "bg-[#EE4D2D] text-white hover:bg-[#d8431f]",
  lazada: "bg-[#0F146E] text-white hover:bg-[#0b0f54]",
}

type Variant = "block" | "inline"

export interface SmartBuyLinkProps {
  /** Product name — used to build Shopee/Lazada search links (catalog names
   *  already include the brand, e.g. "Herman Miller Aeron"). */
  name: string
  /** Pre-resolved Amazon URL (catalog /dp/ or search). Falls back to an Amazon
   *  search built from `name` when omitted, so there's always a working link. */
  amazonUrl?: string | null
  /** For click tracking (product id or slug). */
  productId?: string
  variant?: Variant
  /** Amazon button label (non-SEA visitors). */
  amazonLabel?: string
  /** Show the "affiliate link" disclaimer (block variant). */
  showDisclaimer?: boolean
  className?: string
}

function amazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${FALLBACK_AMAZON_TAG}`
}

export function SmartBuyLink({
  name,
  amazonUrl,
  productId,
  variant = "block",
  amazonLabel = "View on Amazon",
  showDisclaimer = false,
  className,
}: SmartBuyLinkProps) {
  const [country, setCountry] = useState("US")
  useEffect(() => setCountry(readCountryCookie()), [])

  const query = name.trim()
  const sea = isSeaCountry(country) ? resolveSeaLinks(query, country as SeaCountry) : null

  const track = (retailer: string) =>
    void trackAffiliateClick(
      productId ?? query,
      retailer,
      (isSeaCountry(country) ? country : "US") as AffiliateCountry
    )

  const base =
    variant === "block"
      ? "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
      : "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"

  // Southeast Asia → Shopee + Lazada search deep links.
  if (sea) {
    return (
      <div className={cn(variant === "block" ? "space-y-2" : "flex flex-wrap gap-2", className)}>
        {sea.map((l) => (
          <a
            key={l.retailer}
            href={l.url}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={() => track(l.retailer)}
            className={cn(base, RETAILER_STYLE[l.retailer])}
          >
            {variant === "block" ? `Search ${l.label}` : l.label}
            <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
          </a>
        ))}
        {showDisclaimer && (
          <p className="text-[11px] italic leading-relaxed text-muted-foreground">
            Affiliate link — we may earn a commission
          </p>
        )}
      </div>
    )
  }

  // Everyone else → Amazon (OneLink localizes the store client-side).
  const href = amazonUrl || amazonSearchUrl(query)
  return (
    <div className={cn(variant === "block" ? "space-y-2" : "inline-block", className)}>
      <a
        href={href}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        onClick={() => track("amazon")}
        className={cn(base, RETAILER_STYLE.amazon)}
      >
        {amazonLabel}
        <ExternalLink className="h-4 w-4 shrink-0 opacity-90" />
      </a>
      {showDisclaimer && (
        <p className="text-[11px] italic leading-relaxed text-muted-foreground">
          Affiliate link — we may earn a commission
        </p>
      )}
    </div>
  )
}

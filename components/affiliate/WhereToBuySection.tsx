"use client"

import { useEffect, useMemo, useState } from "react"
import { PriceCompareTable } from "./PriceCompareTable"
import {
  buildPriceRowsFromCatalog,
  sortCatalogLinksForCountry,
} from "@/lib/affiliate/catalog-price-rows"
import type { CatalogAffiliateLink } from "@/lib/data/affiliate-links"
import type { AffiliateCountry } from "@/lib/affiliate/links"

function readCountryCookie(): AffiliateCountry {
  if (typeof document === "undefined") return "US"
  const match = document.cookie.match(/(?:^|;\s*)x-country=([^;]+)/)
  const value = match?.[1]?.toUpperCase()
  if (value === "KR" || value === "JP") return value
  return "US"
}

interface WhereToBuySectionProps {
  productId: string
  productName: string
  catalogLinks: CatalogAffiliateLink[]
  defaultPrice?: string
}

export function WhereToBuySection({
  productId,
  productName,
  catalogLinks,
  defaultPrice,
}: WhereToBuySectionProps) {
  const [country, setCountry] = useState<AffiliateCountry>("US")

  useEffect(() => {
    setCountry(readCountryCookie())
  }, [])

  // Coupang removed site-wide: the curated Coupang links were generic partner
  // landings (no itemId) that dead-ended on the homepage. Drop them here too.
  const buyableLinks = useMemo(
    () =>
      catalogLinks.filter(
        (l) =>
          !l.retailer.toLowerCase().includes("coupang") &&
          !l.url.includes("coupang.com")
      ),
    [catalogLinks]
  )

  const sortedLinks = useMemo(
    () => sortCatalogLinksForCountry(buyableLinks, country),
    [buyableLinks, country]
  )

  const priceRows = useMemo(
    () => buildPriceRowsFromCatalog(sortedLinks),
    [sortedLinks]
  )

  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-foreground mb-6">
        Compare retailers
      </h2>
      <PriceCompareTable
        rows={priceRows}
        productId={productId}
        defaultPrice={defaultPrice}
      />
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { PriceCompareTable } from "./PriceCompareTable"
import {
  buildPriceRowsFromCatalog,
} from "@/lib/affiliate/catalog-price-rows"
import type { CatalogAffiliateLink } from "@/lib/data/affiliate-links"
import type { AffiliateCountry } from "@/lib/affiliate/links"

function readCountryCookie(): AffiliateCountry {
  if (typeof document === "undefined") return "US"
  const match = document.cookie.match(/(?:^|;\s*)x-country=([^;]+)/)
  const value = match?.[1]?.toUpperCase()
  if (value === "KR" || value === "JP" || value === "SG") return value
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

  // Hide amazon.co.jp rows outside Japan — a US/KR visitor shouldn't be
  // sent to the Japan marketplace (and the US tag earns nothing there).
  const buyableLinks = useMemo(
    () =>
      catalogLinks.filter(
        (l) =>
          !(country !== "JP" && l.url.includes("amazon.co.jp"))
      ),
    [catalogLinks, country]
  )

  const priceRows = useMemo(
    () => buildPriceRowsFromCatalog(buyableLinks).map(row => country === "SG" && row.channel === "amazon"
      ? { ...row, retailer: "Amazon.sg", priceDisplay: "Check on Amazon.sg", shipping: "Check delivery at retailer" }
      : row),
    [buyableLinks, country]
  )

  return (
    <div>
      <h2 className="font-serif text-xl font-medium text-foreground mb-6">
        Compare retailers
      </h2>
      <PriceCompareTable
        rows={priceRows}
        productId={productId}
        productName={productName}
        defaultPrice={country === "SG" ? undefined : defaultPrice}
      />
    </div>
  )
}

"use client"

import Link from "next/link"
import type { PriceRow } from "@/lib/affiliate/price-rows"
import { BuyButton } from "./BuyButton"

export type { PriceRow } from "@/lib/affiliate/price-rows"

interface PriceCompareTableProps {
  rows: PriceRow[]
  productId: string
  productName?: string
  defaultPrice?: string
}

function buyVariantForChannel(
  channel: PriceRow["channel"]
): "amazon" | "official" | null {
  if (channel === "amazon") return "amazon"
  if (channel === "official") return "official"
  return null
}

export function PriceCompareTable({
  rows,
  productId,
  productName,
  defaultPrice,
}: PriceCompareTableProps) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-border p-6">
        <h3 className="font-medium">No verified retailer link yet</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Chairpedia has not confirmed a product-specific retailer destination for this exact model. We do not label a generic storefront as a verified listing.</p>
        <div className="mt-4 flex flex-wrap gap-3"><Link href={`/stores?model=${encodeURIComponent(productId)}`} className="min-h-11 border border-border px-4 py-2.5 text-sm font-medium">Find a showroom</Link><Link href={`/compare?chair=${encodeURIComponent(productId)}`} className="min-h-11 border border-border px-4 py-2.5 text-sm font-medium">Compare alternatives</Link></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Retailer
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Price
              </th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                Shipping
              </th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                Buy
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const variant = buyVariantForChannel(row.channel)
              return (
                <tr
                  key={`${row.retailer}-${index}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-3 px-4 font-medium text-foreground">
                    {row.retailer}
                  </td>
                  <td className="py-3 px-4 text-foreground">{row.priceDisplay}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.shipping}</td>
                  <td className="py-3 px-4 text-right">
                    {variant ? (
                      <BuyButton
                        productId={productId}
                        productName={productName}
                        baseUrl={row.url}
                        retailer={variant}
                        className="!py-1.5 !px-3 text-xs"
                      />
                    ) : (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 bg-foreground text-background rounded text-xs font-medium hover:bg-foreground/90"
                      >
                        Shop
                      </a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {defaultPrice && (
        <p className="text-xs text-muted-foreground">
          Reference price: {defaultPrice}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
        Affiliate link — we may earn a commission. Confirm the model, seller, price and delivery terms at the retailer.
      </p>
    </div>
  )
}

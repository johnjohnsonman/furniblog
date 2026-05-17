"use client"

import { cn } from "@/lib/utils"
import { parsePriceNumber, type PriceRow } from "@/lib/affiliate/price-rows"
import { BuyButton } from "./BuyButton"

export type { PriceRow } from "@/lib/affiliate/price-rows"

interface PriceCompareTableProps {
  rows: PriceRow[]
  productId: string
  defaultPrice?: string
}

function buyVariantForChannel(
  channel: PriceRow["channel"]
): "amazon" | "coupang" | "official" | null {
  if (channel === "amazon") return "amazon"
  if (channel === "coupang") return "coupang"
  if (channel === "official") return "official"
  return null
}

export function PriceCompareTable({
  rows,
  productId,
  defaultPrice,
}: PriceCompareTableProps) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No retailers listed yet.
      </p>
    )
  }

  const lowestIndex = rows.reduce((best, row, i, arr) => {
    const price = parsePriceNumber(row.priceDisplay)
    const bestPrice = parsePriceNumber(arr[best].priceDisplay)
    return price < bestPrice ? i : best
  }, 0)

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
                  className={cn(
                    "border-b border-border last:border-0",
                    index === lowestIndex && "bg-emerald-500/5"
                  )}
                >
                  <td className="py-3 px-4 font-medium text-foreground">
                    {row.retailer}
                    {index === lowestIndex && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-emerald-600 text-white font-medium">
                        Best Price
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-foreground">{row.priceDisplay}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.shipping}</td>
                  <td className="py-3 px-4 text-right">
                    {variant ? (
                      <BuyButton
                        productId={productId}
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
        Affiliate link — we may earn a commission. Prices may change in real time.
      </p>
    </div>
  )
}

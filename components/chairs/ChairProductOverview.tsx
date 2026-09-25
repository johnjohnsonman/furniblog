import Link from "next/link"
import { Check, X } from "lucide-react"
import type { ProductView } from "@/lib/data/mappers"
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link"
import { RegionalAmazonLink } from "@/components/affiliate/RegionalAmazonLink"
import { displayPriceSecondary } from "@/lib/products/price-provenance"

/** Small USD reference under a local-currency price in the comparison table. */
function PriceSecondary({ slug }: { slug: string }) {
  const text = displayPriceSecondary(slug)
  return text ? <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{text}</span> : null
}

interface ChairProductOverviewProps {
  product: ProductView
  similarProducts: ProductView[]
  claimsVerified?: boolean
  /** "main": what to know + strengths; "similar": the similar-chairs table only. */
  part?: "all" | "main" | "similar"
}

export function ChairProductOverview({
  product,
  similarProducts,
  claimsVerified = true,
  part = "all",
}: ChairProductOverviewProps) {
  const main = part !== "similar"
  const similar = part !== "main"
  // Skip "What to know" when it would repeat the hero description word for word.
  const showOverview = Boolean(product.overview?.trim()) && product.overview?.trim() !== product.description?.trim()
  return (
    <>
      {main && (showOverview || product.designer) && (
        <section>
          {showOverview && <>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">Product overview</p>
            <h2 className="mb-4 mt-1 font-serif text-3xl font-medium text-foreground">What to know</h2>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">{product.overview}</p>
          </>}
          {product.designer && (
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Designed by </span>
              {product.designerId ? (
                <Link
                  href={`/designers/${product.designerId}`}
                  className="text-foreground font-medium hover:underline"
                >
                  {product.designer}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{product.designer}</span>
              )}
            </p>
          )}
        </section>
      )}

      {main && claimsVerified && (product.pros?.length || product.cons?.length) ? (
        <section className="mt-10 border-t border-[#171717] pt-8">
          <h2 className="mb-2 font-serif text-3xl font-medium text-foreground">Recorded strengths &amp; limitations</h2>
          <p className="mb-6 max-w-3xl text-sm leading-6 text-muted-foreground">Editorial summary for comparison. Confirm configuration-dependent features and judge comfort in person.</p>
          <div className="grid grid-cols-1 gap-px border border-[#171717] bg-[#171717] md:grid-cols-2">
            {product.pros && product.pros.length > 0 && (
              <div className="bg-[#e7f4e9] p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Pros
                </h3>
                <ul className="space-y-2">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.cons && product.cons.length > 0 && (
              <div className="bg-[#fff0e8] p-5">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Cons
                </h3>
                <ul className="space-y-2">
                  {product.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {main && product.reviewSummary && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-serif text-xl font-medium text-foreground mb-4">Review Summary</h2>
          <div className="p-5 bg-muted/30 rounded-lg border border-border">
            <p className="text-muted-foreground leading-relaxed">{product.reviewSummary}</p>
          </div>
        </section>
      )}

      {similar && similarProducts.length > 0 && (
        <section className={part === "similar" ? "mt-8" : "mt-10 pt-8 border-t border-border"}>
          <div className="mb-6">
            <h2 className="font-serif text-xl font-medium text-foreground">Similar chairs</h2>
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground uppercase">
                    Product
                  </th>
                  <th className="text-center py-3 px-3 text-xs font-medium text-muted-foreground uppercase">
                    Price
                  </th>
                  <th className="text-right py-3 px-3" />
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-muted/30">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-sm">{product.price}<PriceSecondary slug={product.id} /></td>
                  <td className="py-3 px-3 text-right text-xs text-muted-foreground">Current</td>
                </tr>
                {similarProducts.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <Link href={`/products/${p.id}`} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm hover:underline">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{p.brand}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-sm">{p.price}<PriceSecondary slug={p.id} /></td>
                      <td className="py-3 px-3 text-right">
                        {p.amazonUrl && (
                          <RegionalAmazonLink
                            name={p.name}
                            productId={p.id}
                            href={resolveAmazonAffiliateLink(p.id, p.name).url}
                            className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors inline-flex items-center gap-1"
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </>
  )
}

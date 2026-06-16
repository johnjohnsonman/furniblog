import Link from "next/link"
import { Check, X, ExternalLink } from "lucide-react"
import type { ProductView } from "@/lib/data/mappers"
import { buildAffiliateUrl } from "@/lib/affiliate/links"

interface ChairProductOverviewProps {
  product: ProductView
  similarProducts: ProductView[]
}

export function ChairProductOverview({
  product,
  similarProducts,
}: ChairProductOverviewProps) {
  return (
    <>
      {product.overview && (
        <section>
          <h2 className="font-serif text-xl font-medium text-foreground mb-4">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{product.overview}</p>
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

      {(product.pros?.length || product.cons?.length) ? (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-serif text-xl font-medium text-foreground mb-6">Pros & Cons</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {product.pros && product.pros.length > 0 && (
              <div>
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
              <div>
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

      {product.reviewSummary && (
        <section className="mt-10 pt-8 border-t border-border">
          <h2 className="font-serif text-xl font-medium text-foreground mb-4">Review Summary</h2>
          <div className="p-5 bg-muted/30 rounded-lg border border-border">
            <p className="text-muted-foreground leading-relaxed">{product.reviewSummary}</p>
          </div>
        </section>
      )}

      {similarProducts.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
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
                  <td className="py-3 px-3 text-center font-medium text-sm">{product.price}</td>
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
                      <td className="py-3 px-3 text-center font-medium text-sm">{p.price}</td>
                      <td className="py-3 px-3 text-right">
                        {p.amazonUrl && (
                          <a
                            href={buildAffiliateUrl(p.amazonUrl, "amazon", "US")}
                            target="_blank"
                            rel="sponsored nofollow noopener noreferrer"
                            className="text-xs px-3 py-1.5 bg-foreground text-background rounded hover:bg-foreground/90 transition-colors inline-flex items-center gap-1"
                          >
                            Buy <ExternalLink className="h-3 w-3" />
                          </a>
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

      <div className="mt-10 p-4 bg-muted/30 rounded-lg border border-dashed border-border text-center">
        <p className="text-xs text-muted-foreground">Advertisement</p>
      </div>
    </>
  )
}

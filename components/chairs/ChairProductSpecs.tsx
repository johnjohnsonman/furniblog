import type { ProductView } from "@/lib/data/mappers"
import { ChairHeightGuide } from "./ChairHeightGuide"

interface ChairProductSpecsProps {
  product: ProductView
}

export function ChairProductSpecs({ product }: ChairProductSpecsProps) {
  return (
    <>
      <section>
        <h2 className="font-serif text-xl font-medium text-foreground mb-6">Specifications</h2>
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="space-y-3">
            {product.dimensions && (
              <p className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground text-sm">Dimensions</span>
                <span className="text-foreground text-sm font-medium">{product.dimensions}</span>
              </p>
            )}
            {product.weight && (
              <p className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground text-sm">Weight</span>
                <span className="text-foreground text-sm font-medium">{product.weight}</span>
              </p>
            )}
            {product.warranty && (
              <p className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground text-sm">Warranty</span>
                <span className="text-foreground text-sm font-medium">{product.warranty}</span>
              </p>
            )}
            {product.year && (
              <p className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground text-sm">Year</span>
                <span className="text-foreground text-sm font-medium">{product.year}</span>
              </p>
            )}
          </section>
          <section className="space-y-4">
            {product.materials && (
              <section>
                <span className="text-muted-foreground text-sm block mb-2">Materials</span>
                <section className="flex flex-wrap gap-1.5">
                  {product.materials.map((mat) => (
                    <span key={mat} className="px-2 py-1 bg-muted rounded text-xs text-foreground">
                      {mat}
                    </span>
                  ))}
                </section>
              </section>
            )}
            {product.adjustments && product.adjustments.length > 0 && (
              <section>
                <span className="text-muted-foreground text-sm block mb-2">Adjustments</span>
                <section className="flex flex-wrap gap-1.5">
                  {product.adjustments.map((adj) => (
                    <span key={adj} className="px-2 py-1 bg-muted rounded text-xs text-foreground">
                      {adj}
                    </span>
                  ))}
                </section>
              </section>
            )}
          </section>
        </section>
      </section>
      <ChairHeightGuide chairSpecs={product.chairSpecs} />
    </>
  )
}

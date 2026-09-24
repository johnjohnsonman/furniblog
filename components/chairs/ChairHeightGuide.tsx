import type { Product } from "@/types/product"
import type { ProductFitEvidence } from "@/lib/data/product-fit-evidence"

interface ChairHeightGuideProps {
  chairSpecs?: Product["chairSpecs"]
  evidence?: ProductFitEvidence[]
}

export function ChairHeightGuide({ chairSpecs, evidence = [] }: ChairHeightGuideProps) {
  const fields = new Set(evidence.map(item => item.fieldKey))
  if (!chairSpecs || fields.size === 0) return <section className="mt-8 border border-dashed border-[#a9a298] bg-[#faf8f3] p-5"><h3 className="font-medium">Fit dimensions pending verification</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Chairpedia has not yet attached field-level sources to this product’s fit measurements. We do not present catalog placeholders as verified dimensions. Confirm the exact model with the manufacturer or showroom.</p></section>

  const hasHeightRange = fields.has("recommended_height") &&
    chairSpecs.recommendedHeightMin != null && chairSpecs.recommendedHeightMax != null

  if (!hasHeightRange && !fields.has("seat_height") && !fields.has("seat_width") && !fields.has("weight_capacity")) {
    return null
  }

  return (
    <section className="mt-8 p-5 bg-muted/30 rounded-lg border border-border">
      <h3 className="font-medium text-foreground mb-4">Fit guide</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {hasHeightRange && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Recommended height</dt>
            <dd className="font-medium text-foreground">
              {chairSpecs.recommendedHeightMin}–{chairSpecs.recommendedHeightMax} cm
            </dd>
          </div>
        )}
        {fields.has("seat_height") && chairSpecs.seatHeightMin != null && chairSpecs.seatHeightMax != null && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Seat height</dt>
            <dd className="font-medium text-foreground">
              {chairSpecs.seatHeightMin}–{chairSpecs.seatHeightMax} cm
            </dd>
          </div>
        )}
        {fields.has("seat_width") && chairSpecs.seatWidth != null && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Seat width</dt>
            <dd className="font-medium text-foreground">{chairSpecs.seatWidth} cm</dd>
          </div>
        )}
        {fields.has("weight_capacity") && chairSpecs.weightCapacityKg != null && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Weight capacity</dt>
            <dd className="font-medium text-foreground">{chairSpecs.weightCapacityKg} kg</dd>
          </div>
        )}
      </dl>
      <div className="mt-5 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Measurement sources</p><ul className="mt-2 space-y-2">{evidence.map(item => <li key={`${item.fieldKey}-${item.sourceUrl}`} className="text-xs leading-5"><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">{item.sourceTitle || "Published source"}</a><span className="ml-2 text-muted-foreground">{item.fieldKey.replaceAll("_", " ")} · checked {item.checkedOn}</span></li>)}</ul></div>
    </section>
  )
}

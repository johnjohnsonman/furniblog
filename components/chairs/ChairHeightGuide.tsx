import type { Product } from "@/types/product"

interface ChairHeightGuideProps {
  chairSpecs?: Product["chairSpecs"]
}

export function ChairHeightGuide({ chairSpecs }: ChairHeightGuideProps) {
  if (!chairSpecs) return null

  const hasHeightRange =
    chairSpecs.recommendedHeightMin != null && chairSpecs.recommendedHeightMax != null

  if (!hasHeightRange && !chairSpecs.seatHeightMin) {
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
        {chairSpecs.seatHeightMin != null && chairSpecs.seatHeightMax != null && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Seat height</dt>
            <dd className="font-medium text-foreground">
              {chairSpecs.seatHeightMin}–{chairSpecs.seatHeightMax} cm
            </dd>
          </div>
        )}
        {chairSpecs.seatWidth != null && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Seat width</dt>
            <dd className="font-medium text-foreground">{chairSpecs.seatWidth} cm</dd>
          </div>
        )}
        {chairSpecs.weightCapacityKg != null && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Weight capacity</dt>
            <dd className="font-medium text-foreground">{chairSpecs.weightCapacityKg} kg</dd>
          </div>
        )}
        {chairSpecs.armrestType && (
          <div className="flex justify-between py-2 border-b border-border">
            <dt className="text-muted-foreground">Armrests</dt>
            <dd className="font-medium text-foreground">{chairSpecs.armrestType}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

export type ComparisonVisualProfile = {
  productName: string
  role: "primary product cutout"
  imageRecord: string
  originalSourceUrl: string | null
  manufacturer: string
  checkedOn: string
  modelScope: string
  alt: string
  rightsBasis: string
  objectPosition: string
  scale: number
  configurationNote?: string
  assetId?: string
  dimensions?: { width: number; height: number }
}

/**
 * Shared presentation and provenance notes for verified comparison pages.
 * The image URL remains canonical in `product_images`; `imageRecord` identifies the
 * row selected by the public comparison resolver without duplicating that URL here.
 */
export const COMPARISON_VISUALS: Record<string, ComparisonVisualProfile> = {
  "herman-miller-cosm-high-back": {
    productName: "Herman Miller Cosm High Back", role: "primary product cutout",
    imageRecord: "product_images: 69244359-4714-4eee-933e-633710adbc96", assetId: "69244359-4714-4eee-933e-633710adbc96",
    originalSourceUrl: null, manufacturer: "Herman Miller", checkedOn: "2026-09-24",
    modelScope: "Cosm High Back configuration; fixed arms visible",
    alt: "Herman Miller Cosm High Back chair with fixed arms, three-quarter view",
    rightsBasis: "Existing production asset: model_status verified, rights kept; retained under owner policy, original license not independently established",
    dimensions: { width: 1080, height: 1080 }, objectPosition: "center bottom", scale: 1.03,
    configurationNote: "Image shows Cosm High Back with fixed arms. Leaf and height-adjustable arms are other configurations.",
  },
  "herman-miller-sayl": {
    productName: "Herman Miller Sayl", role: "primary product cutout",
    imageRecord: "product_images: 00fd85ab-f0da-4462-b791-566865e8ab6b", assetId: "00fd85ab-f0da-4462-b791-566865e8ab6b",
    originalSourceUrl: null, manufacturer: "Herman Miller", checkedOn: "2026-09-24",
    modelScope: "Sayl suspension-back work chair; adjustment options require the order specification",
    alt: "Herman Miller Sayl work chair with suspension back and arms, three-quarter view",
    rightsBasis: "Existing production asset: model_status verified, rights kept; retained under owner policy, original license not independently established",
    dimensions: { width: 1080, height: 1080 }, objectPosition: "center bottom", scale: 1.05,
    configurationNote: "Image shows the suspension-back Sayl. Seat depth, lumbar, tilt and arm adjustments depend on the selected configuration.",
  },
  "humanscale-freedom": {
    productName: "Humanscale Freedom", role: "primary product cutout",
    imageRecord: "product_images: 6e15a3db-8c7f-4643-9089-ef9e9808a3ee", assetId: "6e15a3db-8c7f-4643-9089-ef9e9808a3ee",
    originalSourceUrl: null, manufacturer: "Humanscale", checkedOn: "2026-09-24",
    modelScope: "Freedom Headrest configuration; exact year, arm option and materials not determined from the photograph",
    alt: "Humanscale Freedom Headrest chair with padded back and headrest, front three-quarter view",
    rightsBasis: "Existing production asset: model_status verified, rights kept; retained under owner policy, original license not independently established",
    dimensions: { width: 1080, height: 1080 }, objectPosition: "center bottom", scale: 1.03,
    configurationNote: "Image shows Freedom Headrest. The headrest is not included on the separate Freedom Task Chair configuration.",
  },
  "herman-miller-aeron": {
    productName: "Herman Miller Aeron",
    role: "primary product cutout",
    imageRecord: "product_images: verified primary row",
    originalSourceUrl: null,
    manufacturer: "Herman Miller",
    checkedOn: "2026-09-24",
    modelScope: "Current Aeron work chair",
    alt: "Herman Miller Aeron office chair, front three-quarter view",
    rightsBasis: "Existing Chairpedia asset retained under owner policy",
    objectPosition: "center bottom",
    scale: 1.05,
  },
  "herman-miller-embody": {
    productName: "Herman Miller Embody",
    role: "primary product cutout",
    imageRecord: "product_images: verified primary row",
    originalSourceUrl: null,
    manufacturer: "Herman Miller",
    checkedOn: "2026-09-24",
    modelScope: "Current Embody work chair",
    alt: "Herman Miller Embody office chair, front three-quarter view",
    rightsBasis: "Existing Chairpedia asset retained under owner policy",
    objectPosition: "center bottom",
    scale: 1.06,
  },
  "herman-miller-mirra-2": {
    productName: "Herman Miller Mirra 2",
    role: "primary product cutout",
    imageRecord: "product_images: verified primary row",
    originalSourceUrl: null,
    manufacturer: "Herman Miller",
    checkedOn: "2026-09-24",
    modelScope: "Current Mirra 2 work chair",
    alt: "Herman Miller Mirra 2 office chair, front three-quarter view",
    rightsBasis: "Existing Chairpedia asset retained under owner policy",
    objectPosition: "center bottom",
    scale: 1.05,
  },
  "steelcase-leap-v2": {
    productName: "Steelcase Leap",
    role: "primary product cutout",
    imageRecord: "product_images: verified primary row",
    originalSourceUrl: null,
    manufacturer: "Steelcase",
    checkedOn: "2026-09-24",
    modelScope: "Current Leap work chair",
    alt: "Steelcase Leap office chair with headrest, front three-quarter view",
    rightsBasis: "Existing Chairpedia asset retained under owner policy",
    objectPosition: "center bottom",
    scale: 1.03,
    configurationNote: "Image shows a headrest-equipped configuration; the headrest is optional on eligible work-chair models.",
  },
  "steelcase-gesture": {
    productName: "Steelcase Gesture",
    role: "primary product cutout",
    imageRecord: "product_images: verified primary row",
    originalSourceUrl: null,
    manufacturer: "Steelcase",
    checkedOn: "2026-09-24",
    modelScope: "Current Gesture work chair",
    alt: "Steelcase Gesture office chair with headrest, front three-quarter view",
    rightsBasis: "Existing Chairpedia asset retained under owner policy",
    objectPosition: "center bottom",
    scale: 1.08,
    configurationNote: "Image shows a headrest-equipped configuration; Steelcase lists the integrated headrest as optional.",
  },
}

export function getComparisonVisual(slug: string): ComparisonVisualProfile | null {
  return COMPARISON_VISUALS[slug] ?? null
}

/** Fail closed for reviewed pages; never substitute an unreviewed thumbnail. */
export function isVerifiedComparisonImage(slug: string, image: { id: string; url: string; model_status: string | null; rights: string | null }): boolean {
  const visual = getComparisonVisual(slug)
  if (!visual || image.model_status !== "verified" || !["kept", "owner_policy"].includes(image.rights ?? "")) return false
  if (visual.assetId && image.id !== visual.assetId) return false
  try {
    const url = new URL(image.url)
    return url.origin === "https://bvytheznlotwgavmytfr.supabase.co" && url.pathname.startsWith("/storage/v1/object/public/product-images/")
  } catch { return false }
}

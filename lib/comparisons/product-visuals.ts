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
}

/**
 * Shared presentation and provenance notes for verified comparison pages.
 * The image URL remains canonical in `product_images`; `imageRecord` identifies the
 * row selected by the public comparison resolver without duplicating that URL here.
 */
export const COMPARISON_VISUALS: Record<string, ComparisonVisualProfile> = {
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

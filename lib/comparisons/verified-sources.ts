export type VerifiedComparisonSource = {
  id: string
  product: string
  type: "Official product page" | "Official specification guide" | "Official adjustment guide"
  title: string
  publisher: string
  url: string
  checkedOn: string
  supports: string
}

export const VERIFIED_COMPARISON_SOURCES = {
  "cosm-specs": {
    id: "cosm-specs", product: "Herman Miller Cosm", type: "Official product page", title: "Cosm specifications and configurations", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/products/seating/office-chairs/cosm-chairs/specs/", checkedOn: "2026-09-24",
    supports: "US Low, Mid and High Back dimensions; family-wide Auto-Harmonic Tilt and Intercept suspension; Leaf, fixed, height-adjustable and no-arm choices.",
  },
  "cosm-sheet": {
    id: "cosm-sheet", product: "Herman Miller Cosm", type: "Official specification guide", title: "Cosm Chairs product sheet", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/cosm_chairs_product_sheet.pdf", checkedOn: "2026-09-24",
    supports: "High Back as a Cosm family configuration, continuous suspension and automatic tilt. Cylinder-dependent historical dimensions are not used as universal current ranges.",
  },
  "sayl-details": {
    id: "sayl-details", product: "Herman Miller Sayl", type: "Official product page", title: "Sayl construction and support options", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/products/seating/office-chairs/sayl-chairs/product-details/", checkedOn: "2026-09-24",
    supports: "Unframed 3D Intelligent Suspension back and optional lumbar support; upholstered-back versions are separate configurations.",
  },
  "sayl-guide": {
    id: "sayl-guide", product: "Herman Miller Sayl", type: "Official adjustment guide", title: "Sayl Chairs adjustment guide", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/user_information/sayl_chairs_adjustment_guide.pdf", checkedOn: "2026-09-24",
    supports: "Seat height and tilt tension; seat depth, forward tilt, limiter, lumbar and arm adjustments on equipped models.",
  },
  "sayl-options": {
    id: "sayl-options", product: "Herman Miller Sayl", type: "Official specification guide", title: "Sayl US specification book — July 2026", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/pricing/PB_SYL.pdf", checkedOn: "2026-09-24",
    supports: "AS1SA suspension-back work chair, printed page 5 onward: fixed or adjustable seat depth, tilt and lumbar choices, no/fixed/height-adjustable/fully adjustable arms. Prices are not used in this comparison.",
  },
  "freedom-task": {
    id: "freedom-task", product: "Humanscale Freedom Task", type: "Official product page", title: "Freedom Task chair and configurator", publisher: "Humanscale",
    url: "https://www.humanscale.com/products/seating/freedom-task-office-chair/custom", checkedOn: "2026-09-24",
    supports: "Separate Task configuration, weight-sensitive recline, synchronous arms and configurable cylinder, arms and seat. Regional availability must be confirmed.",
  },
  "freedom-headrest": {
    id: "freedom-headrest", product: "Humanscale Freedom Headrest", type: "Official product page", title: "Freedom Headrest chair and configurator", publisher: "Humanscale",
    url: "https://www.humanscale.com/products/seating/freedom-headrest-executive-chair/custom", checkedOn: "2026-09-24",
    supports: "Headrest configuration distinct from Task; headrest movement with recline and arms attached to the backrest.",
  },
  "freedom-specs": {
    id: "freedom-specs", product: "Humanscale Freedom", type: "Official specification guide", title: "Freedom Task and Headrest mechanisms", publisher: "Humanscale",
    url: "https://apac.humanscale.com/userfiles/file/Hs_freedom-task-and-headrest_specification_english.pdf", checkedOn: "2026-09-24",
    supports: "Pages 1–2: automatic counterbalance, synchronous arms, adjustable seat depth/height and back height, and Headrest-only headrest adjustment. This regional document's numeric ranges are not generalized to current US or Ocean variants.",
  },
  "aeron-specs": {
    id: "aeron-specs", product: "Herman Miller Aeron", type: "Official product page", title: "Aeron Chair specifications", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/specs/", checkedOn: "2026-09-24",
    supports: "Sizes A, B and C; size-specific dimensions; arm and tilt options.",
  },
  "aeron-sheet": {
    id: "aeron-sheet", product: "Herman Miller Aeron", type: "Official specification guide", title: "Aeron Chairs product sheet", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf", checkedOn: "2026-09-24",
    supports: "Size and configuration information for the Aeron work chair.",
  },
  "embody-store": {
    id: "embody-store", product: "Herman Miller Embody", type: "Official product page", title: "Embody Chair product page", publisher: "Herman Miller",
    url: "https://store.hermanmiller.com/office-chairs-ergonomic-chairs/embody-chair/100147374.html?lang=en_US&sku=100147374", checkedOn: "2026-09-24",
    supports: "US work-chair seat-height and seat-depth ranges, capacity and listed configuration details.",
  },
  "embody-guide": {
    id: "embody-guide", product: "Herman Miller Embody", type: "Official adjustment guide", title: "Embody Chairs adjustment guide", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/user_information/Embody_Chairs_adjustment_guide.pdf", checkedOn: "2026-09-24",
    supports: "Seat-height, seat-depth, BackFit, tilt-tension and tilt-limiter controls.",
  },
  "leap-guide": {
    id: "leap-guide", product: "Steelcase Leap", type: "Official specification guide", title: "Leap specification guide", publisher: "Steelcase",
    url: "https://www.steelcase.com/content/uploads/2025/09/Leap-Spec-Guide-1.pdf", checkedOn: "2026-09-24",
    supports: "Leap 462 Series work-chair LiveBack, adjustable seat depth, lumbar and arm configurations, variable back stop and optional headrest.",
  },
  "gesture-product": {
    id: "gesture-product", product: "Steelcase Gesture", type: "Official product page", title: "Gesture office chair product page", publisher: "Steelcase",
    url: "https://www.steelcase.com/products/office-chairs/gesture/", checkedOn: "2026-09-24",
    supports: "Seat controls, 360 arms, back-stop control, and optional headrest and lumbar support.",
  },
  "mirra-specs": {
    id: "mirra-specs", product: "Herman Miller Mirra 2", type: "Official product page", title: "Mirra 2 Chair specifications", publisher: "Herman Miller",
    url: "https://www.hermanmiller.com/products/seating/office-chairs/mirra-2-chair/specs/", checkedOn: "2026-09-24",
    supports: "Back, arm, tilt and fixed-seat or FlexFront seat-depth configurations.",
  },
} satisfies Record<string, VerifiedComparisonSource>

export type VerifiedSourceId = keyof typeof VERIFIED_COMPARISON_SOURCES

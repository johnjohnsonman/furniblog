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

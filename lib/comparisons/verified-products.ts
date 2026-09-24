import type { VerifiedSourceId } from "./verified-sources"

export type VerifiedProductKey = "aeron" | "embody" | "leap" | "gesture" | "mirra-2" | "cosm-high" | "sayl" | "freedom"
export type VerifiedFactKey = "fit" | "seat" | "back" | "recline" | "arms" | "headrest"

export type VerifiedProductFact = {
  value: string
  status: "direct" | "conditional"
  sourceIds: VerifiedSourceId[]
}

export type VerifiedProductRecord = {
  slug: string
  name: string
  modelScope: string
  market: string | null
  review?: {
    brand: string
    checkedOn: string
    sourceIds: VerifiedSourceId[]
    availability: string
    cautions: string[]
    measurements?: { claim: string; sourceId: VerifiedSourceId; scope: string }[]
  }
  facts: Partial<Record<VerifiedFactKey, VerifiedProductFact>>
}

export const VERIFIED_PRODUCTS: Record<VerifiedProductKey, VerifiedProductRecord> = {
  "cosm-high": {
    slug: "herman-miller-cosm-high-back", name: "Herman Miller Cosm High Back",
    modelScope: "High Back configuration of the current Cosm family; Low and Mid Back are separate choices",
    market: "US manufacturer specifications; cylinder and arm choices depend on the order",
    review: {
      brand: "Herman Miller", checkedOn: "2026-09-24", sourceIds: ["cosm-specs", "cosm-sheet"],
      availability: "Current US official listing and product sheet available on review date; factory production status not independently established",
      cautions: ["Auto-Harmonic Tilt and Intercept are Cosm family features, not exclusive to High Back", "The 2021 sheet lists cylinder-dependent seat heights that differ from the current US specifications; do not merge ranges", "The reviewed image shows fixed arms; it does not establish the cylinder or production year"],
      measurements: [{ claim: "High Back: overall height 45–51.6 in, width 26.7–29.3 in, depth 26.7 in; seat height 14.8–21.4 in, depth 15.9 in, width 20.5 in", sourceId: "cosm-specs", scope: "Current US specifications page, High-Back Cosm Chair section; confirm the actual cylinder and order" }],
    },
    facts: {
      fit: { value: "High Back is one of three Cosm back heights", status: "direct", sourceIds: ["cosm-sheet"] },
      seat: { value: "Published seat depth: 15.9 inches; confirm seat height for the selected cylinder", status: "conditional", sourceIds: ["cosm-specs"] },
      back: { value: "Continuous Intercept suspension across seat and back", status: "direct", sourceIds: ["cosm-sheet"] },
      recline: { value: "Auto-Harmonic Tilt responds automatically to body and posture", status: "direct", sourceIds: ["cosm-specs"] },
      arms: { value: "Leaf, fixed, height-adjustable or no arms, depending on configuration", status: "conditional", sourceIds: ["cosm-specs"] },
    },
  },
  sayl: {
    slug: "herman-miller-sayl", name: "Herman Miller Sayl",
    modelScope: "Current Sayl suspension-back work chair; not the upholstered-back or side chair",
    market: "US AS1SA work-chair options; other markets and order configurations can differ",
    review: {
      brand: "Herman Miller", checkedOn: "2026-09-24", sourceIds: ["sayl-details", "sayl-guide", "sayl-options"],
      availability: "Current official product page, adjustment guide and July 2026 US specification book available",
      cautions: ["The suspension-back image cannot establish seat-depth, lumbar, tilt or arm adjustment options", "3D Intelligent Suspension describes the back construction; no medical or comfort outcome is inferred", "Fixed depth is 16 inches and adjustable depth is 16–18 inches in the US AS1SA specification; the adjustable seat is an order choice"],
    },
    facts: {
      fit: { value: "Suspension-back work chair with order-dependent adjustments", status: "conditional", sourceIds: ["sayl-options"] },
      seat: { value: "Seat height adjusts; fixed-depth and adjustable-depth seats are separate choices", status: "conditional", sourceIds: ["sayl-guide", "sayl-options"] },
      back: { value: "Unframed 3D Intelligent Suspension back; additional lumbar support is optional", status: "conditional", sourceIds: ["sayl-details"] },
      recline: { value: "Tilt tension control; limiter and forward tilt depend on installed options", status: "conditional", sourceIds: ["sayl-guide"] },
      arms: { value: "No, fixed, height-adjustable or fully adjustable arms; check the order", status: "conditional", sourceIds: ["sayl-options"] },
    },
  },
  freedom: {
    slug: "humanscale-freedom", name: "Humanscale Freedom",
    modelScope: "Freedom Task and Freedom Headrest configurations; the image shows Headrest",
    market: "Current manufacturer Task/Headrest listings; regional mechanism sheet, with local options to confirm",
    review: {
      brand: "Humanscale", checkedOn: "2026-09-24", sourceIds: ["freedom-task", "freedom-headrest", "freedom-specs"],
      availability: "Task and Headrest configurators and manufacturer support resources remain available on review date",
      cautions: ["Task and Headrest are distinct configurations, not successive generations", "Ocean and current US store measurements differ from the regional sheet; no universal dimensions or capacity are claimed", "The retained image establishes Headrest configuration, not exact production year, upholstery, arm option or Ocean material specification", "Arm pads, advanced arm mechanisms and cylinders vary with market and order"],
    },
    facts: {
      fit: { value: "Seat height, seat depth and backrest height can be adjusted", status: "direct", sourceIds: ["freedom-specs"] },
      seat: { value: "Manual seat-height and seat-depth adjustments", status: "direct", sourceIds: ["freedom-specs"] },
      back: { value: "Height-adjustable, pivoting padded backrest", status: "direct", sourceIds: ["freedom-specs"] },
      recline: { value: "Self-adjusting, weight-sensitive recline", status: "direct", sourceIds: ["freedom-task"] },
      arms: { value: "Synchronous height movement on arm-equipped models; arm options vary", status: "conditional", sourceIds: ["freedom-task", "freedom-specs"] },
      headrest: { value: "Adjustable headrest on Freedom Headrest; not included on Freedom Task", status: "conditional", sourceIds: ["freedom-headrest", "freedom-specs"] },
    },
  },
  aeron: {
    slug: "herman-miller-aeron", name: "Herman Miller Aeron", modelScope: "Current Aeron work chair; not Aeron Classic", market: "US manufacturer specifications; options can vary by market",
    facts: {
      fit: { value: "Three chair sizes: A, B and C", status: "direct", sourceIds: ["aeron-specs", "aeron-sheet"] },
      seat: { value: "Fixed dimensions differ by chair size", status: "conditional", sourceIds: ["aeron-specs"] },
      back: { value: "Support options vary by configuration", status: "conditional", sourceIds: ["aeron-specs"] },
      recline: { value: "Tilt options vary by configuration", status: "conditional", sourceIds: ["aeron-specs"] },
      arms: { value: "Arm options vary by configuration", status: "conditional", sourceIds: ["aeron-specs"] },
    },
  },
  embody: {
    slug: "herman-miller-embody", name: "Herman Miller Embody", modelScope: "Current Embody work chair", market: "US product configuration where stated",
    facts: {
      fit: { value: "Adjustable seat depth", status: "direct", sourceIds: ["embody-guide"] },
      seat: { value: "Adjustable seat depth", status: "direct", sourceIds: ["embody-guide"] },
      back: { value: "BackFit adjustment is available on some models", status: "conditional", sourceIds: ["embody-guide"] },
      recline: { value: "Tilt tension and tilt limiter are available on some models", status: "conditional", sourceIds: ["embody-guide"] },
    },
  },
  leap: {
    slug: "steelcase-leap-v2", name: "Steelcase Leap", modelScope: "Current Leap 462 Series work chair in the linked specification guide", market: "North American specification guide; options can vary by market",
    facts: {
      fit: { value: "Adjustable seat depth within the chair configuration", status: "direct", sourceIds: ["leap-guide"] },
      seat: { value: "Adjustable seat depth", status: "direct", sourceIds: ["leap-guide"] },
      back: { value: "LiveBack with documented lumbar options", status: "conditional", sourceIds: ["leap-guide"] },
      recline: { value: "Variable back stop", status: "direct", sourceIds: ["leap-guide"] },
      arms: { value: "Height, depth, width and pivot adjustments on arm models", status: "conditional", sourceIds: ["leap-guide"] },
      headrest: { value: "Optional headrest on eligible work-chair models", status: "conditional", sourceIds: ["leap-guide"] },
    },
  },
  gesture: {
    slug: "steelcase-gesture", name: "Steelcase Gesture", modelScope: "Current Gesture office chair", market: "Global product page; availability and options can vary by market",
    facts: {
      fit: { value: "Seat-height and seat-depth controls", status: "direct", sourceIds: ["gesture-product"] },
      seat: { value: "Seat-height and seat-depth controls", status: "direct", sourceIds: ["gesture-product"] },
      back: { value: "Back support with an optional additional lumbar support", status: "conditional", sourceIds: ["gesture-product"] },
      recline: { value: "Back-stop and tension controls", status: "direct", sourceIds: ["gesture-product"] },
      arms: { value: "360 arms", status: "direct", sourceIds: ["gesture-product"] },
      headrest: { value: "Optional headrest", status: "conditional", sourceIds: ["gesture-product"] },
    },
  },
  "mirra-2": {
    slug: "herman-miller-mirra-2", name: "Herman Miller Mirra 2", modelScope: "Current Mirra 2 work chair; not the original Mirra", market: "US manufacturer specifications; options can vary by market",
    facts: {
      fit: { value: "Configuration-dependent adjustments", status: "conditional", sourceIds: ["mirra-specs"] },
      seat: { value: "Fixed-seat or FlexFront configuration", status: "conditional", sourceIds: ["mirra-specs"] },
      back: { value: "TriFlex or Butterfly back", status: "conditional", sourceIds: ["mirra-specs"] },
      recline: { value: "Tilt options vary by configuration", status: "conditional", sourceIds: ["mirra-specs"] },
      arms: { value: "Arm options vary by configuration", status: "conditional", sourceIds: ["mirra-specs"] },
    },
  },
}

export function getVerifiedFact(product: VerifiedProductKey, fact: VerifiedFactKey): VerifiedProductFact | null {
  return VERIFIED_PRODUCTS[product].facts[fact] ?? null
}

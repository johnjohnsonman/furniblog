import type { VerifiedSourceId } from "./verified-sources"

export type VerifiedProductKey = "aeron" | "embody" | "leap" | "gesture" | "mirra-2"
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
  facts: Partial<Record<VerifiedFactKey, VerifiedProductFact>>
}

export const VERIFIED_PRODUCTS: Record<VerifiedProductKey, VerifiedProductRecord> = {
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

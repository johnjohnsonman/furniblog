import { VERIFIED_PRODUCTS, type VerifiedFactKey, type VerifiedProductKey } from "./verified-products"
import { VERIFIED_COMPARISON_SOURCES, type VerifiedComparisonSource, type VerifiedSourceId } from "./verified-sources"

export type VerifiedComparisonRow = { label: string; fact: VerifiedFactKey }
export type VerifiedComparisonPilot = {
  slug: string; title: string; description: string; summary: string[]
  productA: VerifiedProductKey; productB: VerifiedProductKey
  rows: VerifiedComparisonRow[]
  conditions: { title: string; body: string; sourceIds: VerifiedSourceId[] }[]
  sourceIds: VerifiedSourceId[]; relatedComparisonSlugs: string[]
}

const trialConditions = [
  { title: "Check the seat in your working posture", body: "Set the documented seat controls with your feet supported, then compare usable depth and pressure at the seat edge.", sourceIds: [] as VerifiedSourceId[] },
  { title: "Check desk and arm clearance", body: "Set the available arm controls for typing and confirm clearance with your desk on the exact configuration.", sourceIds: [] as VerifiedSourceId[] },
  { title: "Test the back through its full range", body: "Use the documented back and tilt controls on the exact configuration and compare support while upright and reclining.", sourceIds: [] as VerifiedSourceId[] },
]

const commonRows: VerifiedComparisonRow[] = [
  { label: "Fit approach", fact: "fit" }, { label: "Seat adjustment", fact: "seat" },
  { label: "Back adjustment", fact: "back" }, { label: "Recline controls", fact: "recline" },
  { label: "Arm options", fact: "arms" }, { label: "Headrest", fact: "headrest" },
]

const pilots: VerifiedComparisonPilot[] = [
  {
    slug: "herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn",
    title: "Herman Miller Aeron vs Embody: Fit and Adjustment Comparison",
    description: "Compare the documented sizing, seat adjustment and recline controls of the Herman Miller Aeron and Embody.",
    summary: ["Aeron organizes fit around three chair sizes, while Embody provides adjustable seat depth.", "The useful distinction is size selection versus the seat-depth and BackFit controls you can test on the exact chair."],
    productA: "aeron", productB: "embody", rows: commonRows,
    conditions: [
      { title: "Examine Aeron first when", body: "Choosing among three chair sizes is the main fit question.", sourceIds: ["aeron-specs"] },
      { title: "Examine Embody first when", body: "Seat-depth and BackFit controls are the main items you want to test.", sourceIds: ["embody-guide"] }, ...trialConditions,
    ],
    sourceIds: ["aeron-specs", "aeron-sheet", "embody-store", "embody-guide"],
    relatedComparisonSlugs: ["herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj", "herman-miller-embody-vs-steelcase-gesture-which-should-you-buy-msb7uv7l"],
  },
  {
    slug: "steelcase-leap-v2-vs-herman-miller-aeron-which-should-you-buy-ms42l6wz",
    title: "Herman Miller Aeron vs Steelcase Leap: Fit and Adjustment Comparison",
    description: "Compare Aeron's size-based fit system with the Steelcase Leap's documented seat, back and arm adjustments.",
    summary: ["Aeron separates the current work chair into sizes A, B and C. The linked current Leap guide documents adjustable seat depth, LiveBack, arm adjustments and a variable back stop.", "Use the exact model and configuration rather than either product name as a universal fit result."],
    productA: "aeron", productB: "leap", rows: commonRows,
    conditions: [
      { title: "Examine Aeron first when", body: "Choosing among defined chair sizes is the main fit question.", sourceIds: ["aeron-specs"] },
      { title: "Examine Leap first when", body: "Seat depth, back stop and multi-direction arm adjustment are the controls you need to compare.", sourceIds: ["leap-guide"] }, ...trialConditions,
    ],
    sourceIds: ["aeron-specs", "aeron-sheet", "leap-guide"],
    relatedComparisonSlugs: ["steelcase-leap-v2-vs-steelcase-gesture-which-should-you-buy-ms42m8es", "herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn"],
  },
  {
    slug: "steelcase-leap-v2-vs-steelcase-gesture-which-should-you-buy-ms42m8es",
    title: "Steelcase Leap vs Gesture: Controls and Adjustment Comparison",
    description: "Compare the documented seat, back, recline and arm controls of the Steelcase Leap and Gesture.",
    summary: ["Both current chairs document adjustable seat depth and back-stop controls. Leap documents LiveBack and multi-direction arm adjustments; Gesture documents 360 arms.", "Optional lumbar support and headrest details are identified as configuration-dependent rather than standard equipment."],
    productA: "leap", productB: "gesture", rows: commonRows,
    conditions: [
      { title: "Examine Leap first when", body: "LiveBack, lumbar configuration and its documented arm movements are central to the comparison.", sourceIds: ["leap-guide"] },
      { title: "Examine Gesture first when", body: "The 360 arm system or an optional headrest is a required configuration question.", sourceIds: ["gesture-product"] }, ...trialConditions,
    ],
    sourceIds: ["leap-guide", "gesture-product"],
    relatedComparisonSlugs: ["steelcase-leap-v2-vs-herman-miller-aeron-which-should-you-buy-ms42l6wz", "herman-miller-embody-vs-steelcase-gesture-which-should-you-buy-msb7uv7l"],
  },
  {
    slug: "herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj",
    title: "Herman Miller Aeron vs Mirra 2: Sizes, Back Options and Seat Adjustment",
    description: "Compare Aeron's three-size system with Mirra 2's documented back, arm, tilt and seat-depth configurations.",
    summary: ["The current Aeron uses sizes A, B and C. Mirra 2 offers configuration-dependent back, arm, tilt and seat choices.", "Confirm the exact order configuration because the model name alone does not establish which options are present."],
    productA: "aeron", productB: "mirra-2", rows: commonRows,
    conditions: [
      { title: "Examine Aeron first when", body: "The choice among three chair sizes is the main fit question.", sourceIds: ["aeron-specs"] },
      { title: "Examine Mirra 2 first when", body: "Back construction or the FlexFront seat option is a configuration you need to evaluate.", sourceIds: ["mirra-specs"] }, ...trialConditions,
    ],
    sourceIds: ["aeron-specs", "aeron-sheet", "mirra-specs"],
    relatedComparisonSlugs: ["herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn"],
  },
  {
    slug: "herman-miller-embody-vs-steelcase-gesture-which-should-you-buy-msb7uv7l",
    title: "Herman Miller Embody vs Steelcase Gesture: Fit, Controls and Options",
    description: "Compare the documented seat, back, recline and configuration controls of the Herman Miller Embody and Steelcase Gesture.",
    summary: ["Embody documents adjustable seat depth, BackFit and tilt controls. Gesture documents seat-depth, back-stop and tension controls plus 360 arms.", "Gesture lumbar support and headrest are optional configurations; confirm the exact chair rather than assuming those features are included."],
    productA: "embody", productB: "gesture", rows: commonRows,
    conditions: [
      { title: "Examine Embody first when", body: "BackFit and its seat-depth and tilt controls are the main items you want to test.", sourceIds: ["embody-guide"] },
      { title: "Examine Gesture first when", body: "360 arms, a headrest option or its back-stop control is central to the configuration.", sourceIds: ["gesture-product"] }, ...trialConditions,
    ],
    sourceIds: ["embody-store", "embody-guide", "gesture-product"],
    relatedComparisonSlugs: ["herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn", "steelcase-leap-v2-vs-steelcase-gesture-which-should-you-buy-ms42m8es"],
  },
]

const pilotBySlug = new Map(pilots.map((pilot) => [pilot.slug, pilot]))
export const VERIFIED_COMPARISON_PILOT_SLUGS = pilots.map((pilot) => pilot.slug)
export function getVerifiedComparisonPilot(slug: string): VerifiedComparisonPilot | null { return pilotBySlug.get(slug) ?? null }
export function getPilotProduct(pilot: VerifiedComparisonPilot, side: "a" | "b") { return VERIFIED_PRODUCTS[side === "a" ? pilot.productA : pilot.productB] }
export function getPilotSources(pilot: VerifiedComparisonPilot): VerifiedComparisonSource[] { return pilot.sourceIds.map((id) => VERIFIED_COMPARISON_SOURCES[id]) }

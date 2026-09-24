import { VERIFIED_PRODUCTS, type VerifiedFactKey, type VerifiedProductKey } from "./verified-products"
import { VERIFIED_COMPARISON_SOURCES, type VerifiedComparisonSource, type VerifiedSourceId } from "./verified-sources"

export type VerifiedComparisonRow = { label: string; fact: VerifiedFactKey }
export type VerifiedComparisonPilot = {
  slug: string; title: string; description: string; summary: string[]
  productA: VerifiedProductKey; productB: VerifiedProductKey
  rows: VerifiedComparisonRow[]
  conditions: { title: string; body: string; sourceIds: VerifiedSourceId[] }[]
  checkItems: string[]
  sourceIds: VerifiedSourceId[]; relatedComparisonSlugs: string[]
}

const commonRows: VerifiedComparisonRow[] = [
  { label: "Fit approach", fact: "fit" }, { label: "Seat adjustment", fact: "seat" },
  { label: "Back adjustment", fact: "back" }, { label: "Recline controls", fact: "recline" },
  { label: "Arm options", fact: "arms" }, { label: "Headrest", fact: "headrest" },
]

const pilots: VerifiedComparisonPilot[] = [
  {
    slug: "herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn",
    title: "Herman Miller Embody vs Aeron: Seat Depth or Chair Size?",
    description: "Compare Embody's adjustable seat depth and BackFit controls with Aeron's three-size fit system.",
    summary: ["Embody lets you adjust usable seat depth on one current chair form. Aeron instead separates the current work chair into sizes A, B and C, with dimensions that change by size.", "Start with the fit system that matches your decision, then test back support and recline on the exact configuration before choosing."],
    productA: "embody", productB: "aeron", rows: commonRows,
    conditions: [
      { title: "Start with Embody if", body: "Adjustable seat depth and the BackFit control are the main features you need to test.", sourceIds: ["embody-guide"] },
      { title: "Start with Aeron if", body: "Choosing among three defined chair sizes is the main fit question.", sourceIds: ["aeron-specs"] },
    ],
    checkItems: ["Whether Embody's seat-depth range supports your thighs without pressure at the seat edge", "Which Aeron size places the seat edge, arms and back support correctly for you", "How BackFit and the selected Aeron back-support option feel while upright", "The recline range and arm options installed on each exact chair"],
    sourceIds: ["aeron-specs", "aeron-sheet", "embody-store", "embody-guide"],
    relatedComparisonSlugs: ["herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj", "herman-miller-embody-vs-steelcase-gesture-which-should-you-buy-msb7uv7l"],
  },
  {
    slug: "steelcase-leap-v2-vs-herman-miller-aeron-which-should-you-buy-ms42l6wz",
    title: "Steelcase Leap vs Herman Miller Aeron: Adjustable Fit or Three Sizes?",
    description: "Compare Leap's seat, back and arm adjustments with Aeron's size-based fit system.",
    summary: ["Leap combines adjustable seat depth, LiveBack and a variable back stop in the documented current work chair. Aeron uses three chair sizes, so selecting A, B or C is part of the fit decision.", "Compare the Leap controls with the dimensions and installed options of the exact Aeron size you are considering."],
    productA: "leap", productB: "aeron", rows: commonRows,
    conditions: [
      { title: "Start with Leap if", body: "Seat depth, back stop and multi-direction arm adjustment are the controls you most need to compare.", sourceIds: ["leap-guide"] },
      { title: "Start with Aeron if", body: "Choosing among defined chair sizes is the main fit question.", sourceIds: ["aeron-specs"] },
    ],
    checkItems: ["Leap seat depth with your back against the LiveBack backrest", "The correct Aeron size before comparing any optional support", "Leap arm movement versus the arm option installed on the Aeron", "How Leap's back stop differs from the selected Aeron tilt configuration"],
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
      { title: "Start with Leap if", body: "LiveBack, lumbar configuration and its documented arm movements are central to the comparison.", sourceIds: ["leap-guide"] },
      { title: "Start with Gesture if", body: "The 360 arm system or an optional headrest is a required configuration question.", sourceIds: ["gesture-product"] },
    ],
    checkItems: ["Leap's LiveBack response through your normal sitting positions", "Gesture's 360 arms at your keyboard, mouse and mobile-device positions", "The usable seat-depth range on both chairs", "Whether the exact Gesture includes the optional lumbar support or headrest you expect"],
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
      { title: "Start with Aeron if", body: "The choice among three chair sizes is the main fit question.", sourceIds: ["aeron-specs"] },
      { title: "Start with Mirra 2 if", body: "Back construction or the FlexFront seat option is a configuration you need to evaluate.", sourceIds: ["mirra-specs"] },
    ],
    checkItems: ["Which Aeron size aligns the seat, arms and back support for you", "TriFlex and Butterfly back versions of Mirra 2, if both are available", "The fixed-seat or FlexFront Mirra 2 configuration you would actually order", "The tilt and arm options installed on both exact chairs"],
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
      { title: "Start with Embody if", body: "BackFit and its seat-depth and tilt controls are the main items you want to test.", sourceIds: ["embody-guide"] },
      { title: "Start with Gesture if", body: "360 arms, a headrest option or its back-stop control is central to the configuration.", sourceIds: ["gesture-product"] },
    ],
    checkItems: ["Embody's BackFit response in your upright and reclined postures", "Gesture's 360 arms across the devices you use at your desk", "Seat-depth adjustment and front-edge pressure on both chairs", "Whether the exact Gesture includes its optional lumbar support or headrest"],
    sourceIds: ["embody-store", "embody-guide", "gesture-product"],
    relatedComparisonSlugs: ["herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn", "steelcase-leap-v2-vs-steelcase-gesture-which-should-you-buy-ms42m8es"],
  },
  {
    slug: "herman-miller-aeron-vs-steelcase-gesture-which-should-you-buy-ms42k2uo",
    title: "Herman Miller Aeron vs Steelcase Gesture: Chair Size or Adjustable Seat?",
    description: "Compare Aeron's three-size fit system with Gesture's adjustable seat, 360 arms and configuration options.",
    summary: ["Aeron asks you to choose among three chair sizes, with seat dimensions that change by size. Gesture uses seat-height and seat-depth controls within one current office-chair design.", "After resolving that fit difference, compare the installed arm, back-support and tilt options on the exact chairs available to you."],
    productA: "aeron", productB: "gesture", rows: commonRows,
    conditions: [
      { title: "Start with Aeron if", body: "Selecting among sizes A, B and C is the first fit decision you need to resolve.", sourceIds: ["aeron-specs", "aeron-sheet"] },
      { title: "Start with Gesture if", body: "Seat-depth adjustment or the 360 arm system is the feature set you most need to test.", sourceIds: ["gesture-product"] },
    ],
    checkItems: ["Which Aeron size places the seat edge, arms and back support correctly for you", "Gesture seat depth with your back against the backrest", "The arm option installed on Aeron versus Gesture's 360 arms", "Whether the exact Gesture includes the optional headrest or additional lumbar support shown or described"],
    sourceIds: ["aeron-specs", "aeron-sheet", "gesture-product"],
    relatedComparisonSlugs: ["steelcase-leap-v2-vs-herman-miller-aeron-which-should-you-buy-ms42l6wz", "herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj"],
  },
  {
    slug: "steelcase-leap-v2-vs-herman-miller-embody-which-should-you-buy-mstsjr00",
    title: "Steelcase Leap vs Herman Miller Embody: Back Controls and Seat Depth",
    description: "Compare Leap's LiveBack and variable back stop with Embody's BackFit, seat-depth and tilt controls.",
    summary: ["Both chairs document adjustable seat depth, but their back controls differ. Leap pairs LiveBack with lower-back firmness and a variable back stop; Embody documents BackFit plus tilt tension and a tilt limiter on applicable models.", "Test the seat edge and back response together because the official controls describe adjustment methods, not how either chair will feel to a particular person."],
    productA: "leap", productB: "embody", rows: commonRows,
    conditions: [
      { title: "Start with Leap if", body: "LiveBack, lower-back firmness and a variable back stop are the controls you want to evaluate first.", sourceIds: ["leap-guide"] },
      { title: "Start with Embody if", body: "BackFit and the seat-depth handles are the adjustment approach you most want to test.", sourceIds: ["embody-guide"] },
    ],
    checkItems: ["Seat depth and front-edge pressure on both chairs", "Leap's LiveBack and lower-back firmness through your normal sitting positions", "Embody's BackFit response in upright and reclined positions", "Whether the exact Leap configuration includes the arm, lumbar or headrest options you expect"],
    sourceIds: ["leap-guide", "embody-store", "embody-guide"],
    relatedComparisonSlugs: ["herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn", "steelcase-leap-v2-vs-steelcase-gesture-which-should-you-buy-ms42m8es"],
  },
  {
    slug: "steelcase-leap-v2-vs-herman-miller-mirra-2-which-should-you-buy-mt0xr0o4",
    title: "Steelcase Leap vs Herman Miller Mirra 2: Standard Controls or Selected Options?",
    description: "Compare Leap's documented seat and back controls with Mirra 2's configuration-dependent seat, back, arm and tilt choices.",
    summary: ["Leap documents adjustable seat depth, LiveBack and a variable back stop for the current work chair. Mirra 2 separates several decisions by configuration, including fixed or FlexFront seat, TriFlex or Butterfly back, arms and tilt options.", "Confirm the exact Mirra 2 specification before comparing it with Leap, then test the selected seat edge, back and recline controls in person."],
    productA: "leap", productB: "mirra-2", rows: commonRows,
    conditions: [
      { title: "Start with Leap if", body: "A documented seat-depth control, LiveBack and variable back stop are your main comparison points.", sourceIds: ["leap-guide"] },
      { title: "Start with Mirra 2 if", body: "Choosing the seat edge and back construction is central to the configuration you are considering.", sourceIds: ["mirra-specs"] },
    ],
    checkItems: ["Leap seat depth with your back positioned against LiveBack", "The fixed or FlexFront seat on the exact Mirra 2", "TriFlex and Butterfly back versions if both are available", "The arm, lumbar, headrest and tilt options actually installed on the two chairs"],
    sourceIds: ["leap-guide", "mirra-specs"],
    relatedComparisonSlugs: ["steelcase-leap-v2-vs-herman-miller-aeron-which-should-you-buy-ms42l6wz", "herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj"],
  },
  {
    slug: "herman-miller-mirra-2-vs-steelcase-gesture-which-should-you-buy-msfi63em",
    title: "Herman Miller Mirra 2 vs Steelcase Gesture: Configuration or 360 Arms?",
    description: "Compare Mirra 2's configurable seat and back choices with Gesture's seat controls, 360 arms and optional support features.",
    summary: ["Mirra 2 offers alternative seat, back, arm and tilt configurations, so its exact order specification matters. Gesture documents seat-height and seat-depth controls, a variable back stop and 360 arms, with an integrated headrest and extra lumbar support listed as options.", "Use the official feature lists to identify the configuration, then compare the seat edge, back construction and arm movement on the actual chairs."],
    productA: "mirra-2", productB: "gesture", rows: commonRows,
    conditions: [
      { title: "Start with Mirra 2 if", body: "The FlexFront seat choice or TriFlex versus Butterfly back is the configuration question you need to settle.", sourceIds: ["mirra-specs"] },
      { title: "Start with Gesture if", body: "Seat-depth adjustment and 360 arm movement are the controls you most need to compare.", sourceIds: ["gesture-product"] },
    ],
    checkItems: ["The exact Mirra 2 seat, back, arm and tilt configuration", "Gesture's seat depth and variable back stop through your working positions", "Mirra 2 arm movement versus Gesture's 360 arms", "Whether the Gesture shown includes its optional headrest or adjustable lumbar support"],
    sourceIds: ["mirra-specs", "gesture-product"],
    relatedComparisonSlugs: ["herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj", "herman-miller-embody-vs-steelcase-gesture-which-should-you-buy-msb7uv7l"],
  },
]

const pilotBySlug = new Map(pilots.map((pilot) => [pilot.slug, pilot]))
export const VERIFIED_COMPARISON_PILOT_SLUGS = pilots.map((pilot) => pilot.slug)
export function getVerifiedComparisonPilot(slug: string): VerifiedComparisonPilot | null { return pilotBySlug.get(slug) ?? null }
export function getPilotProduct(pilot: VerifiedComparisonPilot, side: "a" | "b") { return VERIFIED_PRODUCTS[side === "a" ? pilot.productA : pilot.productB] }
export function getPilotSources(pilot: VerifiedComparisonPilot): VerifiedComparisonSource[] { return pilot.sourceIds.map((id) => VERIFIED_COMPARISON_SOURCES[id]) }

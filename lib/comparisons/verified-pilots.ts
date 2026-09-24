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
  {
    slug: "herman-miller-cosm-high-back-vs-steelcase-gesture-which-should-you-buy-ms8cz38y",
    title: "Herman Miller Cosm High Back vs Steelcase Gesture: Automatic Tilt or Manual Controls?",
    description: "Compare Cosm High Back's automatic tilt and suspension with Gesture's seat-depth, back-stop, tension and arm controls.",
    summary: ["Cosm High Back uses the Cosm family's automatic tilt and continuous suspension. Gesture provides seat-depth, back-stop and tension controls, so the distinction is how you set up and change the chair during use.", "High Back identifies a Cosm configuration, not a separate generation. Check its arm choice alongside Gesture's 360 arms and optional headrest before testing the two chairs."],
    productA: "cosm-high", productB: "gesture", rows: commonRows,
    conditions: [
      { title: "Start with Cosm High Back if", body: "You want to evaluate automatic tilt with a continuous suspension surface, after checking the selected arm configuration.", sourceIds: ["cosm-specs", "cosm-sheet"] },
      { title: "Start with Gesture if", body: "You need to test manual seat-depth and recline controls together with the 360 arm system.", sourceIds: ["gesture-product"] },
    ],
    checkItems: ["Whether Cosm's published seat depth leaves suitable clearance behind your knees", "Cosm's automatic response versus Gesture's chosen tension and back-stop settings", "Fixed, Leaf or height-adjustable Cosm arms at your desk, compared with Gesture's 360 arms", "The exact Gesture headrest option and the reach of Cosm's High Back in recline"],
    sourceIds: ["cosm-specs", "cosm-sheet", "gesture-product"],
    relatedComparisonSlugs: ["steelcase-leap-v2-vs-herman-miller-cosm-high-back-which-should-you-buy-mssd4uxq", "steelcase-leap-v2-vs-steelcase-gesture-which-should-you-buy-ms42m8es"],
  },
  {
    slug: "steelcase-leap-v2-vs-herman-miller-cosm-high-back-which-should-you-buy-mssd4uxq",
    title: "Steelcase Leap vs Herman Miller Cosm High Back: LiveBack or Continuous Suspension?",
    description: "Compare Leap's LiveBack, seat-depth adjustment and variable back stop with the High Back configuration of Cosm.",
    summary: ["Leap combines LiveBack, adjustable seat depth and a variable back stop. Cosm High Back instead pairs a continuous suspension surface with the automatic tilt used across the Cosm family.", "The practical test is whether Leap's seat and stop adjustments or Cosm's automatic movement fit your working positions; the official mechanisms alone cannot settle how either will feel."],
    productA: "leap", productB: "cosm-high", rows: commonRows,
    conditions: [
      { title: "Start with Leap if", body: "Setting seat depth and a back stop is central to the fit you want to test with LiveBack.", sourceIds: ["leap-guide"] },
      { title: "Start with Cosm High Back if", body: "You want to try continuous suspension and automatic tilt in the tallest Cosm back configuration.", sourceIds: ["cosm-sheet", "cosm-specs"] },
    ],
    checkItems: ["Leap's usable seat depth versus the seat edge of the selected Cosm", "How LiveBack and Cosm suspension contact your back through upright and reclined positions", "Leap's back-stop settings versus Cosm's automatic tilt response", "The Cosm cylinder and arm choice, and whether the Leap includes its optional headrest"],
    sourceIds: ["leap-guide", "cosm-specs", "cosm-sheet"],
    relatedComparisonSlugs: ["herman-miller-cosm-high-back-vs-steelcase-gesture-which-should-you-buy-ms8cz38y", "steelcase-leap-v2-vs-herman-miller-aeron-which-should-you-buy-ms42l6wz"],
  },
  {
    slug: "herman-miller-sayl-vs-steelcase-gesture-which-should-you-buy-msid1zj6",
    title: "Herman Miller Sayl vs Steelcase Gesture: Seat Options and Arm Movement",
    description: "Compare Sayl's suspension back and configuration-dependent adjustments with Gesture's seat controls and 360 arms.",
    summary: ["Sayl's suspension-back work chair can have a fixed-depth or adjustable-depth seat, and its arms and tilt features depend on the order. Gesture documents seat-depth control and 360 arms, with additional lumbar support and a headrest offered as options.", "Check the Sayl configuration first, then compare its unframed suspension back and installed arm movements with the actual Gesture available to you."],
    productA: "sayl", productB: "gesture", rows: commonRows,
    conditions: [
      { title: "Start with Sayl if", body: "You want to test the suspension back while choosing the seat-depth, arm and tilt options for your order.", sourceIds: ["sayl-details", "sayl-options", "sayl-guide"] },
      { title: "Start with Gesture if", body: "Seat-depth adjustment and 360 arm movement are your first checks, with headrest and lumbar choices considered separately.", sourceIds: ["gesture-product"] },
    ],
    checkItems: ["Whether the actual Sayl has a fixed or adjustable seat, before comparing thigh support", "Sayl arm height and pad movement versus Gesture arms at your keyboard and mouse", "Contact with Sayl's suspension back and its selected lumbar support", "Whether Sayl's forward tilt or limiter and Gesture's optional headrest are actually installed"],
    sourceIds: ["sayl-details", "sayl-guide", "sayl-options", "gesture-product"],
    relatedComparisonSlugs: ["steelcase-leap-v2-vs-herman-miller-sayl-which-should-you-buy-mt9id44p", "herman-miller-mirra-2-vs-steelcase-gesture-which-should-you-buy-msfi63em"],
  },
  {
    slug: "steelcase-leap-v2-vs-herman-miller-sayl-which-should-you-buy-mt9id44p",
    title: "Steelcase Leap vs Herman Miller Sayl: Back Construction and Seat Configuration",
    description: "Compare Leap's documented LiveBack and seat-depth control with Sayl's suspension back, seat choices and tilt options.",
    summary: ["Leap documents adjustable seat depth and LiveBack for the current North American 462 Series work chair. Sayl's suspension-back work chair separates fixed and adjustable seat depth into order choices, with additional lumbar support optional.", "Resolve that seat configuration before testing the back construction and recline: Leap's variable back stop and Sayl's installed tilt options should be compared on the actual chairs."],
    productA: "leap", productB: "sayl", rows: commonRows,
    conditions: [
      { title: "Start with Leap if", body: "You want to evaluate LiveBack with seat-depth adjustment and a variable back stop as the main controls.", sourceIds: ["leap-guide"] },
      { title: "Start with Sayl if", body: "The suspension back and the choice of fixed or adjustable seat depth are the first configuration decisions.", sourceIds: ["sayl-details", "sayl-options"] },
    ],
    checkItems: ["Seat-edge pressure on Leap and on the exact fixed-depth or adjustable-depth Sayl", "LiveBack versus the Sayl suspension back through your normal working positions", "Which Sayl tilt limiter, forward tilt and lumbar options are present", "The installed arms on each chair and the optional headrest on eligible Leap models"],
    sourceIds: ["leap-guide", "sayl-details", "sayl-guide", "sayl-options"],
    relatedComparisonSlugs: ["herman-miller-sayl-vs-steelcase-gesture-which-should-you-buy-msid1zj6", "steelcase-leap-v2-vs-herman-miller-mirra-2-which-should-you-buy-mt0xr0o4"],
  },
  {
    slug: "humanscale-freedom-vs-steelcase-gesture-which-should-you-buy-ms6xi78h",
    title: "Humanscale Freedom vs Steelcase Gesture: Synchronous Arms or 360 Arms?",
    description: "Compare Freedom's synchronous arms and self-adjusting recline with Gesture's 360 arms and manual recline controls.",
    summary: ["Freedom pairs self-adjusting recline with synchronous arm-height movement on arm-equipped configurations. Gesture pairs its 360 arms with manual back-stop and tension controls; both document seat-depth adjustment.", "The Freedom image shows the Headrest configuration, which is distinct from Freedom Task. Compare that choice with Gesture's optional headrest, rather than treating either pictured headrest as universal equipment."],
    productA: "freedom", productB: "gesture", rows: commonRows,
    conditions: [
      { title: "Start with Freedom if", body: "You want to try synchronous arm movement and weight-sensitive recline, choosing Task or Headrest explicitly.", sourceIds: ["freedom-task", "freedom-headrest", "freedom-specs"] },
      { title: "Start with Gesture if", body: "360 arm movement and manually set recline tension and back stops are the controls you need to compare.", sourceIds: ["gesture-product"] },
    ],
    checkItems: ["Freedom's synchronous arms versus Gesture's arm movement at your desk and devices", "Freedom's automatic recline response versus Gesture's manual settings", "Seat depth on the actual cylinder and seat configuration of both chairs", "Freedom Headrest height and movement, if selected, versus Gesture's optional headrest"],
    sourceIds: ["freedom-task", "freedom-headrest", "freedom-specs", "gesture-product"],
    relatedComparisonSlugs: ["steelcase-leap-v2-vs-humanscale-freedom-which-should-you-buy-msgxmbd7", "herman-miller-cosm-high-back-vs-steelcase-gesture-which-should-you-buy-ms8cz38y"],
  },
  {
    slug: "steelcase-leap-v2-vs-humanscale-freedom-which-should-you-buy-msgxmbd7",
    title: "Steelcase Leap vs Humanscale Freedom: Back Stops or Self-Adjusting Recline?",
    description: "Compare Leap's LiveBack and variable back stop with Freedom's pivoting back, self-adjusting recline and Task/Headrest choices.",
    summary: ["Leap provides a variable back stop with LiveBack, while Freedom uses a self-adjusting recline and a height-adjustable pivoting backrest. Both document manual seat-depth adjustment, so recline control and back movement are the distinctions to test first.", "Freedom Task and Freedom Headrest are separate configurations; the photograph shows Headrest. Leap's pictured headrest is also optional on eligible work-chair models."],
    productA: "leap", productB: "freedom", rows: commonRows,
    conditions: [
      { title: "Start with Leap if", body: "Selecting a back-stop position and evaluating LiveBack are central to how you want to set up recline.", sourceIds: ["leap-guide"] },
      { title: "Start with Freedom if", body: "You want to try automatic recline with a pivoting backrest and manually set the backrest height.", sourceIds: ["freedom-task", "freedom-specs"] },
    ],
    checkItems: ["Leap back-stop positions versus Freedom's movement as you lean back", "Freedom backrest height and pivot versus Leap's LiveBack contact", "Seat-edge clearance after setting depth and height on both chairs", "Whether you are testing Freedom Task or Headrest, and whether the Leap has its optional headrest"],
    sourceIds: ["leap-guide", "freedom-task", "freedom-headrest", "freedom-specs"],
    relatedComparisonSlugs: ["humanscale-freedom-vs-steelcase-gesture-which-should-you-buy-ms6xi78h", "steelcase-leap-v2-vs-steelcase-gesture-which-should-you-buy-ms42m8es"],
  },
]

const pilotBySlug = new Map(pilots.map((pilot) => [pilot.slug, pilot]))
export const VERIFIED_COMPARISON_PILOT_SLUGS = pilots.map((pilot) => pilot.slug)
export function getVerifiedComparisonPilot(slug: string): VerifiedComparisonPilot | null { return pilotBySlug.get(slug) ?? null }
export function getPilotProduct(pilot: VerifiedComparisonPilot, side: "a" | "b") { return VERIFIED_PRODUCTS[side === "a" ? pilot.productA : pilot.productB] }
export function getPilotSources(pilot: VerifiedComparisonPilot): VerifiedComparisonSource[] { return pilot.sourceIds.map((id) => VERIFIED_COMPARISON_SOURCES[id]) }

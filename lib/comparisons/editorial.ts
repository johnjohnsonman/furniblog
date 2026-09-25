import type { VerifiedProductKey } from "./verified-products"
import type { VerifiedSourceId } from "./verified-sources"

type Note = { title: string; body: string; sourceIds: VerifiedSourceId[] }
export type ComparisonEditorial = { questions: Note[]; request: string }
export const COMPARISON_EDITORIAL: Partial<Record<`${VerifiedProductKey}:${VerifiedProductKey}`, ComparisonEditorial>> = {
  "leap:aeron": {
    questions: [
      { title: "Can the seat be adjusted, or must the size change?", body: "A Leap seat-depth trial changes a control on the chair. An Aeron trial starts with the correct A, B or C shell size. If the seat edge is the problem, ask to adjust Leap and try another Aeron size before judging either backrest.", sourceIds: ["leap-guide", "aeron-specs"] },
      { title: "Is the recline comparison like for like?", body: "Leap's guide documents a variable back stop. Aeron's tilt is an order choice. Record the available stop and tilt settings on the demonstration chairs, rather than assuming a showroom's Aeron has the same options as a used listing.", sourceIds: ["leap-guide", "aeron-specs"] },
      { title: "What should a used-chair listing establish?", body: "Ask for the Leap 462 Series identification and installed lumbar, arms and headrest details. Ask separately for Aeron's generation, size and support/tilt order specification. A photograph of a headrest-equipped Leap does not make that option standard on every Leap.", sourceIds: ["leap-guide", "aeron-sheet"] },
    ], request: "Request a seat-depth demonstration for Leap and size identification for Aeron, plus rear and under-seat photos showing the actual support and recline controls.",
  },
  "leap:gesture": {
    questions: [
      { title: "If both seats adjust, what separates the trial?", body: "After setting seat depth on both chairs, move to arm placement. Compare Leap's documented height, width, depth and pivot movements with Gesture's 360 arms at the keyboard and mouse positions you actually use. The feature names alone do not show whether an arm clears your desk.", sourceIds: ["leap-guide", "gesture-product"] },
      { title: "Which back controls should you isolate?", body: "Try Leap's lower-back firmness and back stop separately. On Gesture, identify the tension and back-stop controls before reclining. Ask whether the displayed lumbar component is included in the offered configuration; do not equate the two chairs' support systems merely because both recline.", sourceIds: ["leap-guide", "gesture-product"] },
      { title: "Are the pictured headrests included?", body: "Both retained images show configurations that require checking. Ask the seller to name the headrest and lumbar options on the actual order and confirm the model identifier. Compare the chairs without treating a pictured accessory as a universal specification.", sourceIds: ["leap-guide", "gesture-product"] },
    ], request: "Ask for a short arm-motion demonstration on each chair and a written list of included headrest/lumbar options, not just two front-view photographs.",
  },
  "aeron:mirra-2": {
    questions: [
      { title: "Size selection or seat-edge configuration?", body: "Aeron's seat dimensions follow A, B or C. Mirra 2 can have a fixed seat or FlexFront. Ask which Mirra 2 seat is offered before comparing the front edge; a fixed-seat example cannot demonstrate the FlexFront choice.", sourceIds: ["aeron-specs", "mirra-specs"] },
      { title: "Which back is being compared?", body: "For Mirra 2, name TriFlex or Butterfly on the order. For Aeron, identify the selected back-support option. These are configuration questions, so a model-only comparison leaves out a decision you still need to make before a trial.", sourceIds: ["mirra-specs", "aeron-specs"] },
      { title: "What makes the seller's photos useful?", body: "Request the Aeron size/generation and Mirra 2 model label, then rear, arm and seat-edge views. Match the offered tilt and arm options to each manufacturer's specification. Keep original Mirra and Aeron Classic listings outside these current-model specifications.", sourceIds: ["mirra-specs", "aeron-sheet"] },
    ], request: "Ask to see Aeron's size identification and Mirra 2's seat-edge and back configuration. If FlexFront is advertised, request a demonstration on that exact chair.",
  },
  "embody:gesture": {
    questions: [
      { title: "How should you compare their seat controls?", body: "Ask to operate Embody's front seat-depth handles and Gesture's seat-depth control. Set each chair up before checking the front edge; a product photo cannot establish the usable setting for your legs.", sourceIds: ["embody-guide", "gesture-product"] },
      { title: "BackFit or arm movement: which trial answers your question?", body: "If backrest setup is your unresolved question, ask for a BackFit demonstration on Embody. If your desk positions vary, try Gesture's 360 arms across those positions. These are different checks, not evidence that either chair suits every user better.", sourceIds: ["embody-guide", "gesture-product"] },
      { title: "What should the order confirm?", body: "Request Embody's work-chair identification and its installed BackFit/tilt controls. For Gesture, confirm additional lumbar support and headrest separately. The pictured Gesture headrest is an option; the model name alone does not confirm it will arrive.", sourceIds: ["embody-guide", "gesture-product"] },
    ], request: "Request photos of Embody's rear BackFit control and Gesture's arm/headrest configuration, with the exact order specification for each.",
  },
  "aeron:gesture": {
    questions: [
      { title: "What needs deciding before a meaningful trial?", body: "Choose the Aeron size being evaluated before comparing it with Gesture's adjustable seat depth. If an Aeron size is unavailable locally, record that gap instead of treating one size as representative of all three.", sourceIds: ["aeron-specs", "gesture-product"] },
      { title: "Are you comparing the actual arm options?", body: "Gesture documents 360 arms. Aeron lists different arm configurations, so identify the installed type before testing desk clearance or reach. A fully adjustable Aeron demonstration does not establish the arm movement of another listing.", sourceIds: ["gesture-product", "aeron-specs"] },
      { title: "What should you ask about the back?", body: "Have the seller identify Aeron's back-support and tilt options, and Gesture's additional lumbar/headrest choices. Request rear and side views and a control demonstration; the front silhouettes do not resolve those order details.", sourceIds: ["aeron-specs", "gesture-product"] },
    ], request: "Send the seller three questions: which Aeron size, which Aeron arms/tilt/support, and which Gesture lumbar/headrest options are included?",
  },
  "leap:embody": {
    questions: [
      { title: "Both have seat-depth adjustment; what remains to compare?", body: "Use each seat-depth control first, then compare how readily you can find and repeat the setting. Leap's guide and Embody's front-handle instructions describe different operations. A nominal feature match does not replace trying the actual controls.", sourceIds: ["leap-guide", "embody-guide"] },
      { title: "How do you separate back shape from recline?", body: "Compare Leap's lower-back firmness adjustment with Embody's BackFit while upright, then test the back stop or tilt limiter separately. Mixing these steps makes it hard to tell which control changed the experience.", sourceIds: ["leap-guide", "embody-guide"] },
      { title: "Which model information avoids a false match?", body: "Request the Leap 462 Series label and headrest/arm configuration, and the Embody work-chair order details. Keep other Leap variants and gaming-branded Embody listings separate until their own specifications have been checked.", sourceIds: ["leap-guide", "embody-store"] },
    ], request: "Ask for separate demonstrations of Leap's lower-back firmness and Embody's BackFit, followed by the installed recline-limit controls on both chairs.",
  },
  "leap:mirra-2": {
    questions: [
      { title: "Is Mirra 2 equipped for the seat trial you want?", body: "Leap documents adjustable seat depth. Mirra 2's fixed-seat and FlexFront choices must be identified first. Ask to see the actual Mirra 2 seat-edge movement rather than assuming every example offers it.", sourceIds: ["leap-guide", "mirra-specs"] },
      { title: "Which back construction is on the shortlist?", body: "Compare Leap's LiveBack with the named TriFlex or Butterfly Mirra 2 configuration. If a dealer can show both Mirra 2 backs, keep your seat and arm setup consistent while comparing them; changing the whole configuration obscures the back question.", sourceIds: ["leap-guide", "mirra-specs"] },
      { title: "What should be written into the quote?", body: "Request the Mirra 2 back, seat, arms and tilt choices together. On Leap, confirm the lumbar and arm configuration and whether the optional headrest is included. Match both quotes to the demonstration chairs before comparing them.", sourceIds: ["mirra-specs", "leap-guide"] },
    ], request: "Request a Mirra 2 option list naming back and seat type, alongside Leap's 462 Series identification and included support/arm options.",
  },
  "mirra-2:gesture": {
    questions: [
      { title: "Seat-edge choice or seat-depth control?", body: "Establish fixed-seat versus FlexFront on Mirra 2 before comparing Gesture's seat-depth adjustment. The useful trial is the offered Mirra 2 configuration against the offered Gesture, not a fully equipped brochure example against an unspecified listing.", sourceIds: ["mirra-specs", "gesture-product"] },
      { title: "How do the arm and back questions differ?", body: "Mirra 2 requires a back choice between TriFlex and Butterfly and confirmation of the arm option. Gesture's 360 arms shift the trial toward reachable working positions. Ask to test the actual arm movement after identifying the Mirra 2 back.", sourceIds: ["mirra-specs", "gesture-product"] },
      { title: "What can a photograph leave unresolved?", body: "A Mirra 2 photograph does not confirm every tilt or seat option. Gesture's pictured headrest likewise does not confirm an order includes it. Request the option list and short adjustment videos before travelling to view either chair.", sourceIds: ["mirra-specs", "gesture-product"] },
    ], request: "Ask for Mirra 2 back/seat/arm/tilt identification and a Gesture 360-arm demonstration with headrest and lumbar options stated separately.",
  },
  "cosm-high:gesture": {
    questions: [
      { title: "Automatic response or settings you choose?", body: "Cosm's Auto-Harmonic Tilt responds automatically; Gesture provides tension and back-stop controls. Try reclining from the same working posture, then ask which Gesture setting you changed. The choice is about the adjustment approach you want to evaluate, not a universal comfort ranking.", sourceIds: ["cosm-specs", "gesture-product"] },
      { title: "Does the seat and arm configuration match your desk?", body: "Check the selected Cosm cylinder and arm type against the order, and compare its seat edge with Gesture after setting seat depth. Cosm fixed, Leaf and height-adjustable arms are different choices; one photographed arm cannot demonstrate the others.", sourceIds: ["cosm-specs", "gesture-product"] },
      { title: "Is a high back being mistaken for a headrest option?", body: "Specify Cosm High Back rather than Low or Mid Back. Separately confirm whether Gesture includes its optional headrest. Compare the actual upper-back/head contact during a trial rather than treating these different configurations as equivalent accessories.", sourceIds: ["cosm-specs", "gesture-product"] },
    ], request: "Request Cosm's back height, cylinder and arm order codes, then Gesture's recline-control demonstration and explicit headrest choice.",
  },
  "leap:cosm-high": {
    questions: [
      { title: "Do you want to set a stop or evaluate automatic tilt?", body: "Leap's variable back stop lets you select a recline limit. Cosm's Auto-Harmonic Tilt is the automatic approach. Test each from your normal upright position and decide whether the control process itself fits how you work.", sourceIds: ["leap-guide", "cosm-specs"] },
      { title: "What if the front edge is the deciding issue?", body: "Adjust Leap's seat depth before comparing it with the selected Cosm seat and cylinder. Do not transfer a dimension from another Cosm cylinder or an older sheet to the chair being offered; ask the dealer to identify the order first.", sourceIds: ["leap-guide", "cosm-specs", "cosm-sheet"] },
      { title: "What should the two quotes distinguish?", body: "Ask for Cosm High Back and the exact arm choice. On Leap, confirm its arm movements, lumbar configuration and optional headrest. A tall Cosm back and a headrest-equipped Leap should be tried as those specific configurations.", sourceIds: ["cosm-specs", "leap-guide"] },
    ], request: "Ask to compare Leap's chosen back-stop position with Cosm's automatic response, using the exact High Back/cylinder/arm configuration in the quote.",
  },
  "sayl:gesture": {
    questions: [
      { title: "Is the Sayl seat fixed or adjustable?", body: "The US Sayl suspension-back work chair has separate fixed-depth and adjustable-depth choices. Confirm which one is offered before comparing Gesture's seat-depth control. An adjustment shown in the Sayl guide is not proof that every order includes it.", sourceIds: ["sayl-options", "sayl-guide", "gesture-product"] },
      { title: "Which support and arm options need a trial?", body: "Identify Sayl's optional lumbar and arm configuration, then compare the installed arms with Gesture's 360 system at your desk. Keep the suspension-back Sayl separate from upholstered-back or side-chair versions.", sourceIds: ["sayl-details", "sayl-options", "gesture-product"] },
      { title: "What should the seller demonstrate below the seat?", body: "Ask whether the Sayl has forward tilt and a tilt limiter, and request a demonstration of those installed controls. Compare them with Gesture's back-stop and tension controls. Confirm Gesture's headrest separately rather than reading it into the base model name.", sourceIds: ["sayl-guide", "gesture-product"] },
    ], request: "Request Sayl's suspension-back work-chair specification with seat-depth, arms and tilt options, plus Gesture's lumbar/headrest selection.",
  },
  "leap:sayl": {
    questions: [
      { title: "What makes the seat comparison incomplete?", body: "Leap documents adjustable seat depth, while Sayl may have fixed or adjustable depth. A quote that says only Sayl leaves that question open. Resolve the seat option before comparing front-edge clearance during a trial.", sourceIds: ["leap-guide", "sayl-options"] },
      { title: "Which back control should you ask to operate?", body: "On Leap, isolate lower-back firmness from the recline stop. On suspension-back Sayl, first identify the optional lumbar component and installed tilt controls. These are distinct setups; counting adjustment names does not tell you how either configuration fits.", sourceIds: ["leap-guide", "sayl-details", "sayl-guide"] },
      { title: "What order details can change the result?", body: "Sayl's no-arm, fixed, height-adjustable and fully adjustable choices require an explicit order selection. Match that choice against the Leap arms actually included, and ask separately about Leap's optional headrest.", sourceIds: ["sayl-options", "leap-guide"] },
    ], request: "Ask for Sayl's exact seat and arm choices before visiting, and photographs of Leap's lower-back and back-stop controls on the offered chair.",
  },
  "freedom:gesture": {
    questions: [
      { title: "How does the recline trial differ?", body: "Freedom uses weight-sensitive recline, while Gesture has manually set tension and back-stop controls. Try Freedom's response, then adjust Gesture deliberately. A trial with an unexplained Gesture setting cannot answer which approach you prefer.", sourceIds: ["freedom-task", "gesture-product"] },
      { title: "What arm movement should you observe?", body: "Freedom documents synchronous arm movement on arm-equipped configurations; Gesture documents 360 arms. Ask to observe arm position while reclining and while using the desk. Confirm the Freedom arm option and market because configurations can differ.", sourceIds: ["freedom-specs", "freedom-task", "gesture-product"] },
      { title: "Task or Headrest: which Freedom is on offer?", body: "Freedom Task and Freedom Headrest are separate configurations, not a generation sequence. The retained photo shows Headrest. Ask which one the quote covers and separately confirm Gesture's optional headrest before making a head-support comparison.", sourceIds: ["freedom-task", "freedom-headrest", "gesture-product"] },
    ], request: "Request a Freedom Task/Headrest and arm specification, plus a recline demonstration showing arm movement; ask for Gesture's headrest choice separately.",
  },
  "leap:freedom": {
    questions: [
      { title: "Recline limit or weight-sensitive movement?", body: "Leap offers a variable back stop; Freedom uses self-adjusting recline. Ask to try a chosen Leap stop and Freedom's movement from a comparable working posture. Do not describe the two controls as interchangeable simply because both chairs lean back.", sourceIds: ["leap-guide", "freedom-task"] },
      { title: "How should you set the back before comparing it?", body: "Set Freedom's backrest height and seat depth, then compare the pivoting back with Leap's LiveBack and lower-back firmness. Adjusting the back first helps separate a setup issue from the different mechanism you are testing.", sourceIds: ["freedom-specs", "leap-guide"] },
      { title: "Which variants must the seller identify?", body: "Request Leap 462 Series identification and its headrest/arm options. For Freedom, distinguish Task from Headrest and request local cylinder and arm details. The regional Freedom mechanism sheet does not establish universal current measurements for every market or variant.", sourceIds: ["leap-guide", "freedom-task", "freedom-headrest", "freedom-specs"] },
    ], request: "Ask the seller to demonstrate Freedom's back-height adjustment and Leap's lower-back firmness, and identify both chairs' exact headrest and arm configurations.",
  },
  "embody:aeron": {
    questions: [
      { title: "Seat size or adjustable depth: what should you try first?", body: "On Embody, ask to operate the two front seat-depth handles while keeping your back against the backrest. On Aeron, establish A, B or C before the trial: its seat dimensions belong to that size. A deeper Embody setting and a larger Aeron size are different decisions; compare the actual front-edge clearance rather than the chairs' overall depth.", sourceIds: ["embody-guide", "aeron-specs"] },
      { title: "Which back and tilt controls are actually on the chair?", body: "BackFit changes Embody's backrest setting; tilt tension and the limiter address recline. Aeron's back-support and tilt choices belong to the order configuration. Ask the seller to demonstrate these separately. The Embody guide marks some controls as model-dependent, so neither a model name nor a front-view photo confirms every control.", sourceIds: ["embody-guide", "aeron-specs"] },
      { title: "What evidence should arrive before a store visit?", body: "Request the product label and order specification, then a rear view and clear photos of both sides below the seat. For Embody, ask where the seat-depth handles, BackFit and tilt controls are. For Aeron, request the size and named back-support, tilt and arm options. Use the current Aeron documents only after the seller identifies the generation; they do not establish Classic specifications.", sourceIds: ["embody-guide", "aeron-specs", "aeron-sheet"] },
    ],
    request: "Ask for an Embody seat-depth/BackFit demonstration and an Aeron size-and-options order sheet for the exact chairs available to try. Photos identify which controls need checking; they do not prove condition or fit.",
  },
}

export function getComparisonEditorial(a: VerifiedProductKey, b: VerifiedProductKey) { return COMPARISON_EDITORIAL[`${a}:${b}`] }

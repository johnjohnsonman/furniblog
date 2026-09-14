export type PurchaseDecision = { focus: string; checks: [string, string] }

const decisions: Record<string, PurchaseDecision> = {
  "sihoo-doro-c300": { focus: "Match the exact Doro C300 model before comparing offers.", checks: ["Confirm the model name, included arms and headrest in the selected listing.", "Measure seat height and arm clearance against your desk, then check return shipping costs."] },
  "humanscale-freedom": { focus: "Choose the back and headrest configuration before comparing sellers.", checks: ["Confirm whether the listing includes a headrest and which upholstery is supplied.", "For used chairs, check adjustment operation, condition and the seller's return policy."] },
  "herman-miller-aeron": { focus: "Choose the size and generation before comparing offers.", checks: ["Match size A, B or C to the exact chair in the listing.", "Confirm Classic or Remastered, fitted controls and condition."] },
  "steelcase-leap-v2": { focus: "Compare the version, condition and included adjustments.", checks: ["Confirm V2 rather than relying on the word Leap.", "For a used or refurbished chair, ask which parts were replaced."] },
  "steelcase-gesture": { focus: "Check the arm setup and desk clearance before choosing.", checks: ["Confirm the headrest and arm configuration shown in the offer.", "Compare seat and arm adjustment ranges with your desk."] },
  "okamura-contessa-ii": { focus: "Identify the generation before comparing a new or used offer.", checks: ["Confirm Contessa II / Seconda rather than the original Contessa.", "Check the listed seat material, headrest and regional configuration."] },
  "kokuyo-ing-cloud": { focus: "Match the offer to ingCloud and the configuration you want.", checks: ["Distinguish ingCloud from ing and ingLIFE in the listing.", "Confirm the included options and delivery destination."] },
  "autonomous-ergochair-pro": { focus: "Compare the exact model and configuration shown by the seller.", checks: ["Match the model name on the listing and product label.", "Check seat and arm adjustment ranges against your workspace."] },
  "nouhaus-ergo3d": { focus: "Check the chair configuration and seller terms together.", checks: ["Confirm the offer is for the Ergo3D chair, not replacement parts.", "Compare seat height, depth and arm clearance with your desk."] },
  "steelcase-series-2": { focus: "Compare the included options before comparing prices.", checks: ["Confirm the exact Series 2 arm and back configuration.", "Check condition, seller coverage and return costs."] },
  "libernovo-omni": { focus: "This purchase path is for the original Omni model.", checks: ["Do not assume the offer also covers Omni SE, Pro or Maxis.", "Confirm the selected chair, accessories and delivery country."] },
}

export function getPurchaseDecision(slug: string): PurchaseDecision | null {
  return Object.prototype.hasOwnProperty.call(decisions, slug) ? decisions[slug] : null
}

const guideLinks: Record<string, { href: string; label: string }[]> = {
  "herman-miller-aeron": [
    { href: "/blog/herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c", label: "Choose Aeron size A, B or C" },
    { href: "/blog/herman-miller-aeron-classic-vs-remastered-identification-guide", label: "Identify Classic vs Remastered" },
  ],
  "steelcase-leap-v2": [{ href: "/blog/used-steelcase-leap-buying-guide-v1-vs-v2-identification-and-inspection", label: "Identify and inspect a used Leap" }],
  "steelcase-gesture": [{ href: "/chairpedia/steelcase-gesture", label: "Read the Gesture fit and adjustment guide" }],
  "sihoo-doro-c300": [{ href: "/chairpedia/sihoo-doro-c300-advanced-ergonomic-office-chair-review", label: "Read the Doro C300 configuration guide" }],
  "libernovo-omni": [{ href: "/blog/libernovo-lineup-explained-omni-omni-se-omni-pro-maxis-compared", label: "Check the Libernovo model lineup" }],
  "autonomous-ergochair-pro": [{ href: "/chairpedia/autonomous-ergochair-pro", label: "Read the ErgoChair Pro guide" }],
  "okamura-contessa-ii": [{ href: "/chairpedia/okamura-contessa-ii-contessa-seconda", label: "Read the Contessa II / Seconda guide" }],
  "humanscale-freedom": [{ href: "/chairpedia/humanscale-freedom-task-chair", label: "Read the Freedom configuration guide" }],
}

export function getPurchaseGuideLinks(slug: string) {
  return Object.prototype.hasOwnProperty.call(guideLinks, slug) ? guideLinks[slug] : []
}

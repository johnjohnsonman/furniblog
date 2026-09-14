export type PurchaseDecision = { focus: string; checks: [string, string] }

const decisions: Record<string, PurchaseDecision> = {
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

type ReviewBuyingNotes = {
  productSlug: string
  sourceUrl: string
  title: string
  description: string
  sourceNote: string
  heading: string
  answer: string
  checks: string[]
  references: { label: string; url: string }[]
  amazonQuery: string
}

const NOTES: Record<string, ReviewBuyingNotes> = {
  "2bbad15d-6f56-4d90-8b8b-c2ae857bd4c1": {
    productSlug: "vitra-panton-chair",
    sourceUrl: "https://www.youtube.com/watch?v=yjiRZmpuN7w",
    title: "Vitra Panton Chair: Video Summary & US Buying Checks",
    description: "Vitra Panton Chair video summary and US buying checks: manufacturer, seller, condition and return terms. Includes the original video and product links.",
    sourceNote: "This is a curated summary of a promotional video and its discussion, not a hands-on Furniblog test. Reported experiences do not establish typical lifespan or authenticate a chair.",
    heading: "Buying a genuine Vitra Panton Chair in the US",
    answer: "Start with Vitra's US product information and dealer finder when checking a new Vitra Panton Chair. An Amazon search can help locate offers, but its results are not a list of authenticated Vitra products.",
    checks: [
      "Confirm the manufacturer, exact model and seller rather than relying on a similar silhouette or a product title alone.",
      "For used or vintage offers, ask for condition photographs and documentation before treating the chair as an original.",
      "Check the selected offer's delivery, return costs and warranty terms; these are not established by the video summary.",
    ],
    references: [
      { label: "Vitra Panton Chair", url: "https://www.vitra.com/en-us/product/details/panton-chair" },
      { label: "Vitra US dealer finder", url: "https://www.vitra.com/en-us/find-vitra" },
    ],
    amazonQuery: "Vitra Panton Chair",
  },
  "1bf8e255-9465-4eb8-8edc-c1fadf363dd9": {
    productSlug: "hay-soft-edge",
    sourceUrl: "https://www.youtube.com/watch?v=32lAGmUwcXU",
    title: "HAY Soft Edge P10: Review Summary & Buying Checks",
    description: "HAY Soft Edge P10 review summary with model, finish and seller checks. Separate the reviewer's experience from current delivery and purchase conditions.",
    sourceNote: "The summary describes a reviewer's P10 chair and comments on that video, not a hands-on Furniblog test. The reported delivery time and damage are individual accounts, not current shipping estimates or a verified failure rate.",
    heading: "Check the Soft Edge model before buying",
    answer: "HAY's Soft Edge family includes several models and configurations. Use the full model name when comparing offers, then confirm the seat, base, finish and dimensions with the seller rather than assuming every Soft Edge chair matches the P10 in this review.",
    checks: [
      "Compare the listed model and materials with HAY's product information; a family name alone does not identify the configuration.",
      "Check whether the offer is for one chair or a set, and whether it is new or used.",
      "Request current delivery and return terms for your address. The reviewer's Denmark order is not a US delivery forecast.",
    ],
    references: [
      { label: "HAY Soft Edge series", url: "https://www.hay.com/products/furniture/seating/chairs/soft-edge-chairs" },
    ],
    amazonQuery: "HAY Soft Edge P10 chair",
  },
}

export function getReviewBuyingNotes(id: string, productSlug: string, sourceUrl: string | null): ReviewBuyingNotes | null {
  const notes = NOTES[id]
  return notes?.productSlug === productSlug && notes.sourceUrl === sourceUrl ? notes : null
}

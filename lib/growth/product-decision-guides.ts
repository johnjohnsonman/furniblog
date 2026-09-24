export type ProductDecisionGuide = {
  verdict: string
  shortlist: string[]
  verify: string[]
}

const guides: Record<string, ProductDecisionGuide> = {
  "herman-miller-aeron": {
    verdict: "A strong shortlist candidate for shoppers who want a breathable mesh chair and are prepared to choose the correct size and options before ordering.",
    shortlist: ["You prefer a suspended mesh seat and back", "You can test or verify the Aeron size before buying", "Long warranty coverage matters to your purchase"],
    verify: ["Size A, B or C and whether the listing is Remastered or Classic", "Installed lumbar, arm and tilt options", "Seller authorization, return costs and condition on used listings"],
  },
  "kokuyo-ing-cloud": {
    verdict: "Worth shortlisting if you want a chair designed around movement and can confirm the exact regional configuration in person.",
    shortlist: ["You want a less static sitting experience", "Japanese and Asian showroom access is useful to you", "You are willing to compare the motion system in person"],
    verify: ["Exact back, arm and upholstery configuration", "Local warranty and service coverage", "Delivered price and return terms in your market"],
  },
  "steelcase-leap-v2": {
    verdict: "A practical all-day work-chair candidate when adjustment range and a conventional padded seat matter more than a light visual profile.",
    shortlist: ["You want adjustable seat depth, arms and recline", "You prefer a padded seat over a mesh seat", "New and professionally remanufactured options are both under consideration"],
    verify: ["Manufacture age and condition on used or remanufactured chairs", "Arm, lumbar and upholstery options", "Seller warranty, return freight and final delivered cost"],
  },
  "okamura-contessa-ii": {
    verdict: "A premium executive-chair candidate for shoppers who value control access and finish quality and can verify a costly configuration before purchase.",
    shortlist: ["You want controls accessible from the arm area", "A refined executive-chair finish matters", "You have access to an Okamura showroom or knowledgeable dealer"],
    verify: ["Seat, back, headrest and arm configuration", "Local parts, warranty and dealer support", "Desk clearance and the exact return policy"],
  },
  "knoll-generation": {
    verdict: "A movement-oriented shortlist option for people who change posture often and can try its flexible back and seat edge before committing.",
    shortlist: ["You shift between conventional and side-seated postures", "A flexible back is more appealing than a rigidly shaped backrest", "You can compare the exact Knoll configuration locally"],
    verify: ["Installed arms, lumbar and upholstery", "Current local availability and warranty", "How the flexible seat edge feels during your usual work posture"],
  },
}

export function getProductDecisionGuide(slug: string, product?: { name: string; bestFor?: string; categoryLabel?: string; priceRange?: string }) {
  if (guides[slug]) return guides[slug]
  const type = product?.categoryLabel || "chair"
  return {
    verdict: product?.bestFor
      ? `${product.name} is recorded as best suited to ${product.bestFor.toLowerCase()}. Use the checks below to decide whether the exact configuration belongs on your shortlist.`
      : `Chairpedia has a catalog record for ${product?.name ?? "this chair"}, but its ideal-use evidence is still incomplete. Treat it as a research candidate until the exact configuration is verified.`,
    shortlist: [
      product?.bestFor ? `The recorded use case—${product.bestFor}—matches your priority` : `A ${type.toLowerCase()} matches the type of chair you are researching`,
      `Its price tier (${product?.priceRange || "not yet confirmed"}) fits the range you plan to compare`,
      "You can compare it with at least one alternative before deciding",
    ],
    verify: [
      "Exact model, options and dimensions with the manufacturer or seller",
      "Local warranty, return freight and final delivered price",
      "Display availability with the showroom before travelling",
    ],
  }
}

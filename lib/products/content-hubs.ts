export type GuideIntent = "Choose" | "Compare" | "Identify" | "Adjust" | "Buy"

export type ContentHubLink = {
  label: string
  href: string
  description: string
  intent?: GuideIntent
  image?: string
  imageAlt?: string
}

export type ProductContentHub = {
  edition: string
  heroFacts: string[]
  sourceNote: string
  buyingChecks: ContentHubLink[]
  versions: ContentHubLink[]
  steps?: ContentHubLink[]
  explainers: Array<{
    title: string
    body: string
    image: string
    alt: string
    caption: string
    href?: string
    cta?: string
  }>
  quickComparison?: {
    title: string
    columns: [string, string]
    rows: Array<[string, string, string]>
    href: string
  }
  guides: ContentHubLink[]
  comparisons: ContentHubLink[]
  officialSources: ContentHubLink[]
}

const EMBODY_AERON = "/compare/herman-miller-embody-vs-herman-miller-aeron-which-should-you-buy-ms6xh0fn"

export const productContentHubs: Record<string, ProductContentHub> = {
  "herman-miller-aeron": {
    edition: "Current Remastered Aeron; used listings may be Classic",
    heroFacts: ["Three fixed frame sizes", "8Z Pellicle suspension", "Configuration-dependent back support", "No factory headrest"],
    sourceNote: "Facts below describe the current US Remastered Aeron unless a link explicitly discusses the discontinued Classic.",
    buyingChecks: [
      { label: "Choose A, B or C first", href: "/blog/herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c", description: "The frame size is fixed, so use Herman Miller's height-and-weight chart and inspect the size marks.", intent: "Choose" },
      { label: "Confirm Classic or Remastered", href: "/blog/herman-miller-aeron-classic-vs-remastered-identification-guide", description: "Used and refurbished listings mix generations. Ask for the underside label and mechanism photos.", intent: "Identify" },
      { label: "Identify the installed back support", href: "/chairpedia/herman-miller-aeron-chair-review", description: "PostureFit SL and other support configurations are options, not a promise attached to every Aeron.", intent: "Buy" },
      { label: "Check controls before judging fit", href: "/blog/how-to-use-the-herman-miller-aeron-a-complete-control-guide", description: "Verify tilt, tension and arm controls on the exact chair before purchase.", intent: "Adjust" },
      { label: "Treat used condition as part of the configuration", href: "/blog/how-to-buy-a-used-herman-miller-aeron-without-getting-burned", description: "Confirm size, generation, fitted options, label, mesh and seller terms rather than relying on the model name alone.", intent: "Buy" },
    ],
    versions: [],
    steps: [
      { label: "1. Classic or Remastered?", href: "/blog/herman-miller-aeron-classic-vs-remastered-identification-guide", description: "Establish the generation before comparing features or parts." },
      { label: "2. A, B or C?", href: "/blog/herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c", description: "Choose the fixed frame size with the official chart and an in-person fit check." },
      { label: "3. Which back-support option?", href: "/chairpedia/herman-miller-aeron-chair-review", description: "Ask for a rear photo and the exact support name." },
      { label: "4. Which arms and tilt controls?", href: "/blog/how-to-use-the-herman-miller-aeron-a-complete-control-guide", description: "Confirm the controls actually fitted to the listing." },
    ],
    explainers: [
      { title: "Recognize the support configuration", body: "This verified rear view shows a Remastered Aeron with PostureFit SL. A rear photo helps identify the fitted support; it does not establish frame size or condition.", image: "https://bvytheznlotwgavmytfr.supabase.co/storage/v1/object/public/gallery/chairpedia-1782723042902.webp", alt: "Herman Miller Aeron Remastered rear view with PostureFit SL support", caption: "Verified Remastered rear view. Furniblog library; manufacturer marketing image retained under the site's owner-policy record.", href: "/chairpedia/herman-miller-aeron-chair-review", cta: "Review Aeron configurations" },
    ],
    guides: [
      { label: "Aeron size guide", href: "/blog/herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c", description: "Choose among A, B and C.", intent: "Choose" },
      { label: "Classic vs Remastered", href: "/blog/herman-miller-aeron-classic-vs-remastered-identification-guide", description: "Identify the generation in a listing.", intent: "Identify" },
      { label: "Aeron controls", href: "/blog/how-to-use-the-herman-miller-aeron-a-complete-control-guide", description: "Set and inspect the available controls.", intent: "Adjust" },
      { label: "Used Aeron checklist", href: "/blog/how-to-buy-a-used-herman-miller-aeron-without-getting-burned", description: "Inspect a used or refurbished chair.", intent: "Buy" },
    ],
    comparisons: [
      { label: "Aeron vs Embody", href: EMBODY_AERON, description: "Fixed frame sizes and mesh versus adjustable seat depth and BackFit.", intent: "Compare" },
      { label: "Aeron vs Leap V2", href: "/compare/steelcase-leap-v2-vs-herman-miller-aeron-which-should-you-buy-ms42l6wz", description: "Compare configuration and adjustment checks.", intent: "Compare" },
      { label: "Aeron vs Mirra 2", href: "/compare/herman-miller-aeron-vs-herman-miller-mirra-2-which-should-you-buy-ms9sbrcj", description: "Compare two current Herman Miller mesh platforms.", intent: "Compare" },
    ],
    officialSources: [
      { label: "Herman Miller Aeron product page", href: "https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/", description: "Current product, sizes and configuration options." },
      { label: "Aeron product sheet", href: "https://www.hermanmiller.com/content/dam/hermanmiller/documents/product_literature/product_sheets/aeron_chairs_product_sheet.pdf", description: "Published product specifications." },
    ],
  },
  "herman-miller-embody": {
    edition: "Standard office Embody",
    heroFacts: ["One adaptive frame size", "Adjustable seat depth", "BackFit adjustment", "Standard and Gaming editions are separate products"],
    sourceNote: "This page covers the standard office Embody. It does not silently substitute the Logitech G Gaming edition.",
    buyingChecks: [
      { label: "Set seat depth and BackFit", href: "/chairpedia/herman-miller-embody-chair", description: "Fit comes from these adjustments rather than an A/B/C frame choice.", intent: "Adjust" },
      { label: "Confirm Standard or Gaming", href: "/chairpedia/herman-miller-embody-gaming-chair", description: "The shared platform does not make the upholstery, foam and styling identical.", intent: "Identify" },
      { label: "Check arms, textile and casters", href: "/chairpedia/herman-miller-embody-chair", description: "Ask the seller to name the fitted configuration and show the product label.", intent: "Buy" },
    ],
    versions: [{ label: "Embody Gaming", href: "/products/herman-miller-embody-gaming", description: "The Logitech G edition uses the Embody platform with gaming-specific foam and styling.", image: "https://bvytheznlotwgavmytfr.supabase.co/storage/v1/object/public/product-images/herman-miller-embody-gaming-1781598605296.jpg", imageAlt: "Herman Miller x Logitech G Embody Gaming Chair" }],
    explainers: [],
    quickComparison: {
      title: "Standard Embody or Embody Gaming?",
      columns: ["Standard Embody", "Embody Gaming"],
      rows: [
        ["Core platform", "Embody", "Embody"],
        ["Seat depth", "Adjustable", "Adjustable"],
        ["Edition-specific treatment", "Office textile/configuration range", "Gaming-specific foam and Logitech G styling"],
        ["Purchase check", "Textile, arms and casters", "Edition, colorway and seller terms"],
      ],
      href: "/chairpedia/herman-miller-embody-gaming-chair",
    },
    guides: [
      { label: "Standard Embody guide", href: "/chairpedia/herman-miller-embody-chair", description: "Platform, adjustments and configuration checks.", intent: "Buy" },
      { label: "Embody Gaming guide", href: "/chairpedia/herman-miller-embody-gaming-chair", description: "What is specific to the Logitech G edition.", intent: "Identify" },
    ],
    comparisons: [{ label: "Embody vs Aeron", href: EMBODY_AERON, description: "Adjustable seat depth and BackFit versus three fixed Aeron frame sizes.", intent: "Compare" }],
    officialSources: [{ label: "Herman Miller Embody product page", href: "https://www.hermanmiller.com/products/seating/office-chairs/embody-chairs/", description: "Current standard Embody features and configuration." }],
  },
  "herman-miller-embody-gaming": {
    edition: "Herman Miller x Logitech G Embody Gaming Chair",
    heroFacts: ["Embody platform", "Adjustable seat depth", "BackFit adjustment", "Gaming-specific foam and styling"],
    sourceNote: "This page covers the Logitech G Gaming edition. Standard Embody is linked as a related version.",
    buyingChecks: [
      { label: "Confirm the exact edition", href: "/chairpedia/herman-miller-embody-gaming-chair", description: "Ask for the product label and photos instead of inferring the edition from a dark colorway.", intent: "Identify" },
      { label: "Set seat depth and BackFit", href: "/chairpedia/herman-miller-embody-gaming-chair", description: "The gaming edition retains the platform's core fit adjustments.", intent: "Adjust" },
      { label: "Check seller, warranty and returns", href: "/chairpedia/herman-miller-embody-gaming-chair", description: "Confirm the market and exact listing terms before ordering.", intent: "Buy" },
    ],
    versions: [{ label: "Standard Embody", href: "/products/herman-miller-embody", description: "The office edition offers its own textile and configuration range on the same underlying platform.", image: "https://bvytheznlotwgavmytfr.supabase.co/storage/v1/object/public/product-images/herman-miller-embody-1781598305833.jpg", imageAlt: "Herman Miller Embody office chair" }],
    explainers: [],
    quickComparison: {
      title: "Gaming edition or Standard Embody?",
      columns: ["Embody Gaming", "Standard Embody"],
      rows: [
        ["Core platform", "Embody", "Embody"],
        ["Seat depth", "Adjustable", "Adjustable"],
        ["Edition-specific treatment", "Gaming-specific foam and Logitech G styling", "Office textile/configuration range"],
        ["Purchase check", "Edition, colorway and seller terms", "Textile, arms and casters"],
      ],
      href: "/chairpedia/herman-miller-embody-gaming-chair",
    },
    guides: [{ label: "Embody Gaming guide", href: "/chairpedia/herman-miller-embody-gaming-chair", description: "Edition-specific features and buying checks.", intent: "Identify" }, { label: "Standard Embody guide", href: "/chairpedia/herman-miller-embody-chair", description: "Understand the underlying office platform.", intent: "Buy" }],
    comparisons: [{ label: "Standard Embody vs Aeron", href: EMBODY_AERON, description: "This comparison covers Standard Embody; it does not merge the Gaming edition into the result.", intent: "Compare" }],
    officialSources: [{ label: "Herman Miller x Logitech G Embody", href: "https://store.hermanmiller.com/gaming-chairs-embody-gaming-chair?lang=en_US", description: "Current US Gaming edition details and configuration." }],
  },
}

export function getProductContentHub(slug: string) {
  return productContentHubs[slug]
}

export const guideProductRelations: Record<string, { productSlug: string; intent: GuideIntent }> = {
  "herman-miller-aeron-size-guide-how-to-choose-between-a-b-and-c": { productSlug: "herman-miller-aeron", intent: "Choose" },
  "herman-miller-aeron-classic-vs-remastered-identification-guide": { productSlug: "herman-miller-aeron", intent: "Identify" },
  "how-to-use-the-herman-miller-aeron-a-complete-control-guide": { productSlug: "herman-miller-aeron", intent: "Adjust" },
  "how-to-buy-a-used-herman-miller-aeron-without-getting-burned": { productSlug: "herman-miller-aeron", intent: "Buy" },
  "herman-miller-aeron-chair-review": { productSlug: "herman-miller-aeron", intent: "Buy" },
  "herman-miller-embody-chair": { productSlug: "herman-miller-embody", intent: "Buy" },
  "herman-miller-embody-gaming-chair": { productSlug: "herman-miller-embody-gaming", intent: "Identify" },
}

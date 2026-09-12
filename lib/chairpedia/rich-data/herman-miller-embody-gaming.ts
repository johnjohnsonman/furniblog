import type { RichReview } from "@/lib/chairpedia/rich-types"
import { HERMAN_MILLER_EMBODY } from "./herman-miller-embody"

/** Reviewed gaming-edition view; the superseded DB body remains stored for rollback. */
export const HERMAN_MILLER_EMBODY_GAMING: RichReview = {
  ...HERMAN_MILLER_EMBODY,
  includeDeepDive: false,
  eyebrow: "Herman Miller x Logitech G · Gaming chair · Buying guide",
  heroIntro:
    "The Embody Gaming Chair uses the standard Embody's pixelated support, BackFit adjustment and adjustable seat depth, then adds copper-infused cooling foam and extra upper-back foam for forward-leaning play. This guide separates those documented changes from claims the available sources do not establish.",
  verdictOneLiner:
    "Choose it for the Embody platform with gaming-edition foam and styling, not for a racing-chair shape or a separate lumbar control.",
  verdictNote: "Research-based guide — hands-on lab test not completed.",
  quickFactsNote:
    "Herman Miller and Logitech G product documentation reviewed September 2026. Price, seller and stock are not treated as fixed facts.",
  checks: [
    HERMAN_MILLER_EMBODY.checks[0],
    HERMAN_MILLER_EMBODY.checks[1],
    { n: "03", title: "Confirm the gaming edition", body: "Check for Logitech G branding and the exact upholstery and colour. Search results can mix the standard Embody, used chairs, parts and accessories." },
    { n: "04", title: "Check seller and warranty coverage", body: "Marketplace condition and seller terms can affect returns and warranty support. Confirm both on the exact offer." },
  ],
  forWhoTitle: "The Embody Gaming edition makes sense for",
  forWho: [
    "Buyers who want the Embody support platform with the gaming-edition foam package",
    "People who alternate between upright and forward-leaning desk postures",
    "Shoppers who prefer office-chair ergonomics over a racing-style shell",
  ],
  skipWho: [
    "Need a headrest or a separate adjustable lumbar pad",
    "Want an all-mesh seat and back",
    "Cannot verify the edition, condition, seller or return terms",
  ],
  buy: {
    productTitle: "Herman Miller x Logitech G Embody Gaming Chair",
    retailerNote: "Amazon listing or search — confirm that the selected item is the gaming edition",
    ctaLabel: "View on Amazon",
    rows: [
      { k: "Edition", v: "Confirm Logitech G branding and the gaming-edition foam and upholstery." },
      { k: "Condition", v: "Check whether the offer is new, renewed, open-box or used." },
      { k: "Seller terms", v: "Verify delivery, returns and warranty coverage on the exact listing." },
    ],
    officialStore: {
      label: "Herman Miller (official)",
      note: "Official product information and current configuration details. Direct link, not an affiliate link.",
      url: "https://www.hermanmiller.com/products/seating/office-chairs/embody-chairs/",
    },
    disclaimer:
      "Furniblog does not verify live price, inventory, seller authorization or warranty eligibility. The Amazon destination may include other Embody versions or accessories; confirm the exact item before buying.",
  },
  verdict: [
    "The gaming edition is best understood as an Embody configuration, not a separate racing-style chair. Its documented differences are the cooling-foam treatment, additional upper-back foam and Logitech G presentation; the core support concept and adjustments come from Embody.",
    "Choose it when those edition-specific changes matter, and choose the standard Embody when broader finish choices matter more. In either case, verify the exact offer and seller terms before paying a premium.",
  ],
  verdictPullQuote:
    "An Embody first and a gaming edition second — verify the edition and seller before paying for the difference.",
  faqs: [
    ...HERMAN_MILLER_EMBODY.faqs.filter((item) => !/gaming Embody different/i.test(item.q)),
    { q: "How does the gaming edition differ from the standard Embody?", a: "Herman Miller and Logitech G describe copper-infused cooling foam, additional upper-back foam for forward-leaning posture and gaming-specific styling. The underlying support concept and core adjustments remain." },
  ],
  sources: [
    { k: "Herman Miller (official)", url: "https://www.hermanmiller.com/products/seating/office-chairs/embody-chairs/", v: "Product family documentation for Embody's support concept and adjustments, reviewed September 2026." },
    { k: "Logitech G (official)", url: "https://www.logitechg.com/en-us/products/gaming-furniture/embody-gaming-chair.html", v: "Gaming-edition product documentation for the collaboration and foam treatment, reviewed September 2026." },
  ],
  sourcesFooter:
    "This page uses manufacturer documentation and does not report a Furniblog hands-on test. Live price, stock, seller status and warranty eligibility can change; confirm them on the selected offer.",
}

export type BuyingGuideLink = { label: string; href: string }

const RETURNS: BuyingGuideLink = {
  label: "Compare chair return policies and warranties",
  href: "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon",
}

const FIT: BuyingGuideLink = {
  label: "Check seat height and armrest clearance",
  href: "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance",
}

const AMAZON: BuyingGuideLink = {
  label: "How to evaluate an Amazon chair listing",
  href: "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it",
}

const SHOP: BuyingGuideLink = {
  label: "Browse chairs with model-specific Amazon listings",
  href: "/best/best-chairs-to-buy",
}

export function getBuyingGuideLinks(options: {
  category?: string | null
  priceUsd?: number | null
  limit?: number
} = {}): BuyingGuideLink[] {
  const { category, priceUsd, limit = 4 } = options
  const links: BuyingGuideLink[] = [SHOP]

  if (category === "standing") {
    links.push({
      label: "Office chairs for standing and tall desks",
      href: "/blog/office-chairs-for-standing-desks-and-tall-desks-documented-picks",
    })
  } else if (typeof priceUsd === "number" && priceUsd >= 800) {
    links.push(
      {
        label: "Aeron alternatives by budget",
        href: "/blog/herman-miller-aeron-alternatives-by-budget",
      },
      {
        label: "Refurbished vs remanufactured vs open-box vs used",
        href: "/blog/refurbished-vs-remanufactured-vs-open-box-vs-used-office-chairs",
      }
    )
  } else {
    links.push({
      label: "Best office chairs under $300",
      href: "/blog/best-office-chairs-under-300-verified-picks",
    })
  }

  links.push(AMAZON, RETURNS, FIT)
  return links.slice(0, limit)
}

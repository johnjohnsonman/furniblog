import type { ProductView } from "@/lib/data/mappers"
import type { Review } from "@/types/review"
import type { AffiliateLink } from "@/types/affiliate-link"
import {
  formatProductPrice,
  resolvePriceUsd,
  PRICE_ON_REQUEST,
} from "@/lib/pricing"
import { buildAffiliateUrl } from "@/lib/affiliate/links"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.furniblog.com"

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function generateArticleSchema(params: {
  headline: string
  description?: string | null
  path: string
  datePublished?: string | null
  dateModified?: string | null
  image?: string | null
  authorName?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    ...(params.description ? { description: params.description } : {}),
    url: `${SITE_URL}${params.path}`,
    mainEntityOfPage: `${SITE_URL}${params.path}`,
    ...(params.datePublished ? { datePublished: params.datePublished } : {}),
    ...(params.dateModified ? { dateModified: params.dateModified } : {}),
    ...(params.image ? { image: params.image } : {}),
    author: {
      "@type": "Organization",
      name: params.authorName ?? "Furniblog",
    },
    publisher: {
      "@type": "Organization",
      name: "Furniblog",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
  }
}

/** ItemList of named URLs — helps Google/AI engines parse comparisons & lists. */
export function generateItemListSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

/** FAQPage — genuine on-page Q&A (rich results + AI-engine citations). */
export function generateFAQSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Furniblog",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
  }
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Furniblog",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

export function generateChairSchema(
  product: ProductView,
  _reviews: Review[],
  affiliateLinks: AffiliateLink[] = product.affiliateLinks ?? []
) {
  const priceUsd = resolvePriceUsd(
    product.priceUsd,
    product.priceLabel
  )
  const price = formatProductPrice(priceUsd)
  const productUrl = `${SITE_URL}/products/${product.slug ?? product.id}`

  const offers = affiliateLinks
    .filter((link) => link.url)
    .map((link) => ({
      "@type": "Offer",
      url: buildAffiliateUrl(link.url, link.channel, "US"),
      priceCurrency: "USD",
      price: priceUsd ?? undefined,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: link.label,
      },
    }))

  if (offers.length === 0 && product.officialUrl) {
    offers.push({
      "@type": "Offer",
      url: product.officialUrl,
      priceCurrency: "USD",
      price: priceUsd ?? undefined,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: product.brand,
      },
    })
  }

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.overview,
    image: product.image,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    url: productUrl,
    sku: product.slug ?? product.id,
    category: product.categoryLabel ?? product.category,
  }

  // Review / AggregateRating structured data is intentionally NOT emitted.
  // Our per-product scores are derived from third-party and AI-summarised
  // reviews, not genuine first-party ratings, so surfacing them as Google
  // review stars would be non-compliant. The original review data in the DB
  // and the existing exclusion policy are unchanged; only the schema output
  // is withheld.

  if (offers.length > 0) {
    schema.offers =
      offers.length === 1
        ? offers[0]
        : {
            "@type": "AggregateOffer",
            offerCount: offers.length,
            lowPrice: priceUsd ?? undefined,
            priceCurrency: "USD",
            offers,
          }
  }

  if (price !== PRICE_ON_REQUEST) {
    schema.offers = schema.offers ?? {
      "@type": "Offer",
      price,
      priceCurrency: "USD",
    }
  }

  return schema
}

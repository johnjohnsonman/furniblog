import type { ProductView } from "@/lib/data/mappers"
import type { Review } from "@/types/review"
import type { AffiliateLink } from "@/types/affiliate-link"
import {
  formatProductPrice,
  resolvePriceUsd,
  PRICE_ON_REQUEST,
} from "@/lib/pricing"
import { buildAffiliateUrl } from "@/lib/affiliate/links"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://furniblog.vercel.app"

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
  reviews: Review[],
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

  if (reviews.length > 0) {
    const ratingOf = (r: Review): number | null => {
      const v = (r.scores as { overall?: number } | null)?.overall
      return typeof v === "number" && v > 0 ? v : null
    }

    schema.review = reviews.slice(0, 5).map((review) => {
      const rating = ratingOf(review)
      return {
        "@type": "Review",
        reviewBody: review.summary,
        author: { "@type": "Person", name: review.source },
        ...(rating
          ? {
              reviewRating: {
                "@type": "Rating",
                ratingValue: rating,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      }
    })

    // AggregateRating drives the ★ stars in Google/Bing results. Only emit it
    // when we actually have rated reviews (Google requires genuine ratings).
    const rated = reviews.map(ratingOf).filter((n): n is number => n !== null)
    if (rated.length > 0) {
      const avg = rated.reduce((a, b) => a + b, 0) / rated.length
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: Math.round(avg * 10) / 10,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      }
    }
  }

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

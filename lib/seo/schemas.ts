import type { ProductView } from "@/lib/data/mappers"
import type { Review } from "@/types/review"
import type { AffiliateLink } from "@/types/affiliate-link"

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
  _affiliateLinks: AffiliateLink[] = product.affiliateLinks ?? []
) {
  const productUrl = `${SITE_URL}/products/${product.slug ?? product.id}`

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

  // AffiliateLink has no verified model-specific price, market or inventory.
  // Keep product identity, but do not turn catalog estimates/search URLs into
  // merchant offers. Restore offers only when verified listing data is available.

  return schema
}

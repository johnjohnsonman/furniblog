import type { Product } from "@/types/product"
import type { AffiliateChannel } from "@/types/affiliate-link"
import type { Designer } from "@/types/designer"
import { getChairCategoryLabel } from "@/lib/chair-categories"
import { resolveProductImageUrl } from "@/lib/chair-placeholder-images"
import { formatProductPrice, resolvePriceUsd } from "@/lib/pricing"

export function getAffiliateUrl(
  product: Product,
  channel: AffiliateChannel
): string | undefined {
  return product.affiliateLinks?.find((link) => link.channel === channel)?.url
}

export function toProductView(product: Product) {
  const longHourUse = Math.round(
    (product.ratingComfort + product.ratingErgonomics) / 2
  )
  const priceUsd = resolvePriceUsd(product.priceUsd, product.priceLabel)

  return {
    ...product,
    priceUsd: priceUsd ?? undefined,
    categoryLabel: getChairCategoryLabel(product.category),
    image: resolveProductImageUrl(product.imageUrl, product.category),
    rating: product.ratingOverall,
    reviewCount: product.reviewCount ?? 0,
    description: product.summary,
    overview: product.overview ?? product.summary,
    price: formatProductPrice(priceUsd),
    year: product.launchYear,
    scores: {
      comfort: product.ratingComfort,
      ergonomics: product.ratingErgonomics,
      buildQuality: product.ratingBuildQuality,
      design: product.ratingDesign,
      value: product.ratingValue,
      longHourUse,
    },
    officialUrl: getAffiliateUrl(product, "official"),
    amazonUrl: getAffiliateUrl(product, "amazon"),
    coupangUrl: getAffiliateUrl(product, "coupang"),
    naverUrl: getAffiliateUrl(product, "naver"),
    rakutenUrl: getAffiliateUrl(product, "rakuten"),
    chairparkUrl: getAffiliateUrl(product, "chairpark"),
  }
}

export type ProductView = ReturnType<typeof toProductView>

export function toDesignerView(designer: Designer) {
  return {
    ...designer,
    image: designer.imageUrl,
    brands: designer.brandIds,
  }
}

export type DesignerView = ReturnType<typeof toDesignerView>

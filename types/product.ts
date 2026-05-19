import type { AffiliateLink } from "./affiliate-link"

export type ChairCategory =
  | "office"
  | "executive"
  | "gaming"
  | "study"
  | "dining"
  | "conference"
  | "lounge"
  | "standing"

export type PriceRange = "$" | "$$" | "$$$" | "$$$$"

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  brandId: string
  category: ChairCategory
  chairType?: string
  country: string
  designer?: string
  designerId?: string
  launchYear?: number
  priceRange: PriceRange
  priceLabel?: string
  priceUsd?: number
  priceKrw?: number
  imageUrl: string
  /** Gallery URLs from product_images (Supabase); falls back to imageUrl */
  galleryImages?: string[]
  summary: string
  pros: string[]
  cons: string[]
  bestFor: string
  ratingOverall: number
  ratingComfort: number
  ratingErgonomics: number
  ratingBuildQuality: number
  ratingDesign: number
  ratingValue: number
  reviewCount?: number
  availableInKorea: boolean
  tryAtChairpark: boolean
  affiliateLinks: AffiliateLink[]
  overview?: string
  materials?: string[]
  dimensions?: string
  weight?: string
  warranty?: string
  adjustments?: string[]
  reviewSummary?: string
  chairSpecs?: {
    recommendedHeightMin?: number
    recommendedHeightMax?: number
    seatHeightMin?: number
    seatHeightMax?: number
    seatWidth?: number
    seatDepth?: number
    backrestHeight?: number
    armrestType?: "4D" | "3D" | "2D" | "fixed" | "none"
    hasLumbarSupport?: boolean
    hasHeadrest?: boolean
    reclineRange?: number
    weightCapacityKg?: number
    chairWeightKg?: number
    warrantyYears?: number
  }
  publishedAt?: string
  updatedAt?: string
}

export interface ProductScores {
  comfort: number
  ergonomics: number
  buildQuality: number
  design: number
  value: number
  longHourUse: number
}

/** UI/sample reviews shown on product detail pages */
export interface ProductReview {
  id: string
  productId: string
  productName: string
  productImage: string
  author: string
  rating: number
  title: string
  excerpt: string
  date: string
}

export interface Comparison {
  id: string
  title: string
  products: { id: string; name: string; image: string }[]
  views: number
}

export interface BestList {
  id: string
  title: string
  count: number
}

export interface FilterOption {
  label: string
  value: string
}

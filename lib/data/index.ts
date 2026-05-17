export {
  chairTypes,
  categories,
  countries,
  priceRanges,
  ratingRanges,
} from "./products"

export { products } from "./views"
export { brands } from "./brands"
export { designers } from "./views"
export {
  reviews,
  getFeedReviews,
  getFeedBrandCounts,
  getBrandsForCategory,
} from "./reviews"
export type { FeedReview } from "./reviews"
export { comparisons, bestLists, listProductMap } from "./lists"

export {
  getProductById,
  getProductBySlug,
  getBrandById,
  getDesignerById,
  getProductsByBrand,
  getProductsByDesigner,
  getSimilarProducts,
  getAverageScore,
  getFeaturedProducts,
} from "./queries"

export type { ProductView, DesignerView } from "./mappers"
export type {
  Product,
  ProductReview,
  Comparison,
  BestList,
  FilterOption,
  PriceRange,
  ProductScores,
} from "@/types/product"
export type {
  Review,
  ReviewSource,
  ChairScores,
  FurnitureScores,
} from "@/types/review"
export type { QueueItem } from "@/types/pipeline"
export type { AffiliateLink, AffiliateChannel } from "@/types/affiliate-link"
export type { Brand } from "@/types/brand"
export type { Designer } from "@/types/designer"

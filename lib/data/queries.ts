import type { ProductView } from "./mappers"
import type { Brand } from "@/types/brand"
import type { DesignerView } from "./mappers"
import { brands } from "./brands"
import { designers as rawDesigners } from "./designers"
import { toDesignerView } from "./mappers"
import { products } from "./views"

export function getProductById(id: string): ProductView | undefined {
  return products.find((p) => p.id === id || p.slug === id)
}

export function getProductBySlug(slug: string): ProductView | undefined {
  return products.find((p) => p.slug === slug)
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id || b.slug === id)
}

export function getDesignerById(id: string): DesignerView | undefined {
  const designer = rawDesigners.find((d) => d.id === id || d.slug === id)
  return designer ? toDesignerView(designer) : undefined
}

export function getProductsByBrand(brandId: string): ProductView[] {
  return products.filter((p) => p.brandId === brandId)
}

export function getProductsByDesigner(designerId: string): ProductView[] {
  return products.filter((p) => p.designerId === designerId)
}

export function getSimilarProducts(
  product: ProductView,
  limit: number = 3
): ProductView[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.brandId === product.brandId)
    )
    .slice(0, limit)
}

export function getAverageScore(product: ProductView): number | null {
  if (!product.scores) return null
  const values = Object.values(product.scores)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

export function getFeaturedProducts(limit: number = 6): ProductView[] {
  return [...products]
    .sort((a, b) => b.ratingOverall - a.ratingOverall)
    .slice(0, limit)
}

import type { Comparison, BestList } from "@/types/product"
import { products } from "./products"

function comparisonProduct(id: string) {
  const product = products.find((p) => p.id === id)!
  return { id: product.id, name: product.name, image: product.imageUrl }
}

export const comparisons: Comparison[] = [
  {
    id: "1",
    title: "Aeron vs Embody",
    products: [
      comparisonProduct("herman-miller-aeron"),
      comparisonProduct("herman-miller-embody"),
    ],
    views: 45230,
  },
  {
    id: "2",
    title: "Leap vs Gesture",
    products: [
      comparisonProduct("steelcase-leap"),
      comparisonProduct("steelcase-gesture"),
    ],
    views: 28410,
  },
  {
    id: "3",
    title: "ING vs ING Cloud",
    products: [
      comparisonProduct("kokuyo-ing"),
      comparisonProduct("kokuyo-ing-cloud"),
    ],
    views: 19870,
  },
]

export const bestLists: BestList[] = [
  { id: "best-office-chairs", title: "Best Office Chairs", count: 12 },
  { id: "best-for-back-pain", title: "Best for Back Pain", count: 8 },
  { id: "best-for-tall-people", title: "Best for Tall People", count: 6 },
  { id: "best-under-1000", title: "Best Under $1,000", count: 10 },
  { id: "best-japanese-chairs", title: "Best Japanese Chairs", count: 6 },
  { id: "best-for-long-hours", title: "Best for Long Hours", count: 8 },
]

export const listProductMap: Record<string, string[]> = {
  "best-office-chairs": [
    "herman-miller-aeron",
    "herman-miller-embody",
    "steelcase-leap",
    "steelcase-gesture",
    "humanscale-freedom",
    "kokuyo-ing",
    "kokuyo-ing-cloud",
    "okamura-sylphy",
  ],
  "best-for-back-pain": [
    "herman-miller-aeron",
    "herman-miller-embody",
    "steelcase-gesture",
    "kokuyo-ing-cloud",
  ],
  "best-for-tall-people": [
    "herman-miller-aeron",
    "steelcase-gesture",
    "okamura-contessa-ii",
  ],
  "best-under-1000": [
    "herman-miller-sayl",
    "steelcase-leap",
    "itoki-act2",
    "knoll-generation",
  ],
  "best-japanese-chairs": [
    "okamura-contessa-ii",
    "okamura-sylphy",
    "itoki-act2",
    "kokuyo-ing",
    "kokuyo-ing-cloud",
  ],
  "best-for-long-hours": [
    "herman-miller-aeron",
    "herman-miller-embody",
    "steelcase-gesture",
    "humanscale-freedom",
    "kokuyo-ing-cloud",
    "okamura-sylphy",
  ],
}

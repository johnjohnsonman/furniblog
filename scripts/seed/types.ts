export type ChairSeedInput = {
  name: string
  brand: string
  category: string
}

export type ChairSpecsPayload = {
  recommendedHeightMin: number
  recommendedHeightMax: number
  seatHeightMin: number
  seatHeightMax: number
  seatWidth: number
  seatDepth: number
  backrestHeight: number
  armrestType: "4D" | "3D" | "2D" | "fixed" | "none"
  hasLumbarSupport: boolean
  hasHeadrest: boolean
  reclineRange: number
  weightCapacityKg: number
  chairWeightKg: number
  warrantyYears: number
}

export type HardcodedChair = ChairSeedInput & {
  slug: string
  nameEn: string
  descriptionEn: string
  priceUsd: number
  priceKrw: number
  chairSpecs: ChairSpecsPayload
  pros: string[]
  cons: string[]
  bestFor: string
  chairType?: string
  seoTitle: string
  seoDescription: string
}

export type BrandRow = {
  slug: string
  name: string
  country: string
  tier: "ultra_premium" | "premium" | "mid_range"
  founded_year: number
}

import type { ChairSpecsPayload, HardcodedChair } from "./types"

type SpecPreset = "premium_mesh" | "premium_task" | "executive" | "gaming" | "conference" | "study" | "standing" | "lounge"

const PRESETS: Record<SpecPreset, ChairSpecsPayload> = {
  premium_mesh: {
    recommendedHeightMin: 165,
    recommendedHeightMax: 195,
    seatHeightMin: 40,
    seatHeightMax: 57,
    seatWidth: 51,
    seatDepth: 43,
    backrestHeight: 58,
    armrestType: "4D",
    hasLumbarSupport: true,
    hasHeadrest: false,
    reclineRange: 125,
    weightCapacityKg: 159,
    chairWeightKg: 19,
    warrantyYears: 12,
  },
  premium_task: {
    recommendedHeightMin: 160,
    recommendedHeightMax: 190,
    seatHeightMin: 39,
    seatHeightMax: 52,
    seatWidth: 50,
    seatDepth: 42,
    backrestHeight: 55,
    armrestType: "4D",
    hasLumbarSupport: true,
    hasHeadrest: false,
    reclineRange: 120,
    weightCapacityKg: 136,
    chairWeightKg: 22,
    warrantyYears: 12,
  },
  executive: {
    recommendedHeightMin: 168,
    recommendedHeightMax: 198,
    seatHeightMin: 42,
    seatHeightMax: 55,
    seatWidth: 52,
    seatDepth: 45,
    backrestHeight: 62,
    armrestType: "4D",
    hasLumbarSupport: true,
    hasHeadrest: true,
    reclineRange: 130,
    weightCapacityKg: 150,
    chairWeightKg: 28,
    warrantyYears: 10,
  },
  gaming: {
    recommendedHeightMin: 165,
    recommendedHeightMax: 195,
    seatHeightMin: 44,
    seatHeightMax: 54,
    seatWidth: 54,
    seatDepth: 50,
    backrestHeight: 85,
    armrestType: "4D",
    hasLumbarSupport: true,
    hasHeadrest: true,
    reclineRange: 165,
    weightCapacityKg: 150,
    chairWeightKg: 32,
    warrantyYears: 5,
  },
  conference: {
    recommendedHeightMin: 160,
    recommendedHeightMax: 190,
    seatHeightMin: 44,
    seatHeightMax: 52,
    seatWidth: 48,
    seatDepth: 44,
    backrestHeight: 50,
    armrestType: "fixed",
    hasLumbarSupport: false,
    hasHeadrest: false,
    reclineRange: 105,
    weightCapacityKg: 120,
    chairWeightKg: 12,
    warrantyYears: 5,
  },
  study: {
    recommendedHeightMin: 155,
    recommendedHeightMax: 185,
    seatHeightMin: 42,
    seatHeightMax: 52,
    seatWidth: 49,
    seatDepth: 46,
    backrestHeight: 52,
    armrestType: "3D",
    hasLumbarSupport: true,
    hasHeadrest: false,
    reclineRange: 120,
    weightCapacityKg: 120,
    chairWeightKg: 18,
    warrantyYears: 3,
  },
  standing: {
    recommendedHeightMin: 160,
    recommendedHeightMax: 195,
    seatHeightMin: 50,
    seatHeightMax: 70,
    seatWidth: 40,
    seatDepth: 35,
    backrestHeight: 45,
    armrestType: "none",
    hasLumbarSupport: false,
    hasHeadrest: false,
    reclineRange: 0,
    weightCapacityKg: 120,
    chairWeightKg: 14,
    warrantyYears: 7,
  },
  lounge: {
    recommendedHeightMin: 160,
    recommendedHeightMax: 190,
    seatHeightMin: 38,
    seatHeightMax: 45,
    seatWidth: 55,
    seatDepth: 48,
    backrestHeight: 70,
    armrestType: "fixed",
    hasLumbarSupport: false,
    hasHeadrest: false,
    reclineRange: 110,
    weightCapacityKg: 130,
    chairWeightKg: 16,
    warrantyYears: 5,
  },
}

export function presetForCategory(category: string): SpecPreset {
  switch (category) {
    case "executive":
      return "executive"
    case "gaming":
      return "gaming"
    case "conference":
      return "conference"
    case "study":
      return "study"
    case "standing":
      return "standing"
    case "lounge":
      return "lounge"
    default:
      return "premium_mesh"
  }
}

export function defineChair(
  input: Omit<HardcodedChair, "chairSpecs"> & {
    preset?: SpecPreset
    chairSpecs?: Partial<ChairSpecsPayload>
  }
): HardcodedChair {
  const preset = input.preset ?? presetForCategory(input.category)
  const base = PRESETS[preset]
  return {
    ...input,
    chairSpecs: { ...base, ...input.chairSpecs },
  }
}

export function priceRangeFromUsd(usd: number): "$" | "$$" | "$$$" | "$$$$" {
  if (usd < 500) return "$"
  if (usd < 1000) return "$$"
  if (usd < 2000) return "$$$"
  return "$$$$"
}

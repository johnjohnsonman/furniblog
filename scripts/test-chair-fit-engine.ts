import assert from "node:assert/strict"
import { buildFitProfile, evaluateProductFit } from "../lib/recommend/fit"
import { recommend, type Affinity, type ProductFeature } from "../lib/recommend/engine"
import { rankRecommendationResults } from "../lib/recommend/ranking"

const affinity: Affinity = {
  liftPain: {},
  liftJob: {},
  liftSit: {},
  reliefPain: {},
  picks: {},
  totalPicks: 1,
}

const base: ProductFeature = {
  id: "fit-chair",
  slug: "fit-chair",
  name: "Fit Chair",
  brand: "Test",
  category: "office",
  chairType: "Mesh",
  priceRange: "$$",
  priceUsd: 500,
  bestFor: "Long office work",
  pros: ["Adjustable lumbar"],
  cons: [],
  editorial: 0.8,
  hasDirectBuy: false,
  picks: 5,
  image: null,
  material: "mesh",
  specs: {
    recommendedHeightMin: 165,
    recommendedHeightMax: 188,
    seatHeightMin: 40,
    seatHeightMax: 52,
    seatDepthMin: 39,
    seatDepthMax: 46,
    seatWidth: 49,
    weightCapacityKg: 136,
    armrestFloorHeightMin: 62,
    armrestFloorHeightMax: 78,
  },
}

const profile = buildFitProfile({ heightCm: 175, deskHeightCm: 74 })
assert(profile.suggestedSeatHeightCm)
assert(profile.suggestedSeatDepthCm)

const fit = evaluateProductFit(
  { heightCm: 175, weightKg: 75, deskHeightCm: 74, armrestsUnderDesk: true },
  base.specs,
)
assert.equal(fit.status, "good")
assert.equal(fit.confidence, "high")
assert(fit.evidence.length >= 3)
assert.equal(fit.conflicts.length, 0)

const unsafe = evaluateProductFit({ heightCm: 205, weightKg: 150 }, base.specs)
assert.equal(unsafe.status, "conditional")
assert(unsafe.conflicts.length >= 1)

const limited = evaluateProductFit({ heightCm: 175 }, null)
assert.equal(limited.status, "insufficient-data")
assert.equal(limited.confidence, "limited")

const missingClearance = evaluateProductFit(
  { heightCm: 175, deskHeightCm: 74, armrestsUnderDesk: true },
  { ...base.specs, armrestFloorHeightMin: undefined, armrestFloorHeightMax: undefined },
)
assert.equal(missingClearance.components.deskClearance, null)
assert(missingClearance.score < fit.score)
assert(missingClearance.unknowns.includes("Floor-to-armrest clearance"))

const results = recommend(
  [base, { ...base, id: "unsafe", slug: "unsafe", specs: { ...base.specs, weightCapacityKg: 60 } }],
  affinity,
  { heightCm: 175, weightKg: 75, useCase: "office", budget: "$$" },
  5,
)
assert.equal(results.length, 1)
assert.equal(results[0].slug, "fit-chair")
assert.equal(results[0].fitStatus, "good")

const ranked = rankRecommendationResults([
  {
    ...results[0],
    id: "fit-chair",
    priceUsd: 500,
    fit,
    fitStatus: fit.status,
    fitConfidence: fit.confidence,
  },
  {
    ...results[0],
    id: "value-chair",
    slug: "value-chair",
    name: "Value Chair",
    priceUsd: 250,
    fit: { ...fit, score: fit.score - 2 },
  },
])
assert.equal(ranked.standouts[0].id, "fit-chair")
assert(ranked.standouts.some((chair) => chair.id === "value-chair"))
assert(ranked.standouts.flatMap((chair) => chair.awards).some((award) => award.id === "value"))

console.log("Chair Fit engine tests passed")

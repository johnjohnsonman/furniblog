export type FitStatus = "good" | "conditional" | "insufficient-data"
export type FitConfidence = "high" | "medium" | "limited"

export type FitInputs = {
  heightCm?: number
  weightKg?: number
  deskHeightCm?: number
  armrestsUnderDesk?: boolean
}

export type FitSpecs = {
  recommendedHeightMin?: number
  recommendedHeightMax?: number
  weightCapacityKg?: number
  seatDepth?: number
  seatDepthMin?: number
  seatDepthMax?: number
  seatWidth?: number
  seatHeightMin?: number
  seatHeightMax?: number
  armrestFloorHeightMin?: number
  armrestFloorHeightMax?: number
}

export type Range = { min: number; max: number }

export type FitProfile = {
  suggestedSeatHeightCm: Range | null
  suggestedSeatDepthCm: Range | null
  deskSeatGapCm: Range | null
  notes: string[]
}

export type ProductFit = {
  status: FitStatus
  confidence: FitConfidence
  score: number
  evidence: string[]
  conflicts: string[]
  unknowns: string[]
  measurements: {
    seatHeightCm: Range | null
    seatDepthCm: Range | null
    seatWidthCm: number | null
    capacityKg: number | null
    armrestFloorHeightCm: Range | null
  }
  components: {
    bodyHeight: number | null
    seatHeight: number | null
    seatDepth: number | null
    weightCapacity: number | null
    deskClearance: number | null
  }
}

const roundHalf = (value: number) => Math.round(value * 2) / 2
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

function range(min?: number, max?: number): Range | null {
  if (min == null || max == null || !Number.isFinite(min) || !Number.isFinite(max))
    return null
  return { min: Math.min(min, max), max: Math.max(min, max) }
}

function overlapScore(a: Range, b: Range, tolerance = 0): number {
  const overlap = Math.min(a.max, b.max) - Math.max(a.min, b.min)
  if (overlap >= 0) {
    const smaller = Math.max(1, Math.min(a.max - a.min, b.max - b.min))
    return clamp(0.72 + 0.28 * (overlap / smaller), 0, 1)
  }
  const gap = Math.max(a.min, b.min) - Math.min(a.max, b.max)
  return gap <= tolerance ? 0.48 : gap <= tolerance * 2 ? 0.2 : 0
}

export function buildFitProfile(input: FitInputs): FitProfile {
  const notes: string[] = []
  let suggestedSeatHeightCm: Range | null = null
  let suggestedSeatDepthCm: Range | null = null

  if (input.heightCm) {
    // Broad anthropometric starting ranges. These are intentionally ranges,
    // not prescriptions; leg proportions and footwear still matter.
    suggestedSeatHeightCm = {
      min: roundHalf(input.heightCm * 0.235),
      max: roundHalf(input.heightCm * 0.265),
    }
    suggestedSeatDepthCm = {
      min: roundHalf(input.heightCm * 0.215),
      max: roundHalf(input.heightCm * 0.255),
    }
  } else {
    notes.push("Add your height to estimate seat height and seat depth.")
  }

  let deskSeatGapCm: Range | null = null
  if (input.deskHeightCm) {
    deskSeatGapCm = { min: 24, max: 31 }
    const deskRange = {
      min: input.deskHeightCm - deskSeatGapCm.max,
      max: input.deskHeightCm - deskSeatGapCm.min,
    }
    if (suggestedSeatHeightCm) {
      const intersection = {
        min: Math.max(suggestedSeatHeightCm.min, deskRange.min),
        max: Math.min(suggestedSeatHeightCm.max, deskRange.max),
      }
      if (intersection.min <= intersection.max) suggestedSeatHeightCm = intersection
      else
        notes.push(
          "Your desk height and body-based seat range do not overlap cleanly; a keyboard tray or footrest may help.",
        )
    }
  }

  return { suggestedSeatHeightCm, suggestedSeatDepthCm, deskSeatGapCm, notes }
}

export function evaluateProductFit(
  input: FitInputs,
  specs: FitSpecs | null,
  profile = buildFitProfile(input),
): ProductFit {
  const evidence: string[] = []
  const conflicts: string[] = []
  const unknowns: string[] = []
  const components: ProductFit["components"] = {
    bodyHeight: null,
    seatHeight: null,
    seatDepth: null,
    weightCapacity: null,
    deskClearance: null,
  }
  const seatHeight = range(specs?.seatHeightMin, specs?.seatHeightMax)
  const seatDepth = range(
    specs?.seatDepthMin ?? specs?.seatDepth,
    specs?.seatDepthMax ?? specs?.seatDepth,
  )
  const armrestHeight = range(
    specs?.armrestFloorHeightMin,
    specs?.armrestFloorHeightMax,
  )

  if (input.heightCm) {
    const userRange = range(specs?.recommendedHeightMin, specs?.recommendedHeightMax)
    if (userRange) {
      const distance =
        input.heightCm < userRange.min
          ? userRange.min - input.heightCm
          : input.heightCm > userRange.max
            ? input.heightCm - userRange.max
            : 0
      components.bodyHeight = distance === 0 ? 1 : distance <= 5 ? 0.45 : 0
      if (distance === 0)
        evidence.push(
          `Your height is within the published ${userRange.min}-${userRange.max} cm user range.`,
        )
      else
        conflicts.push(
          `Your height is ${distance} cm outside the published user range.`,
        )
    } else unknowns.push("Published user-height range")
  }

  if (profile.suggestedSeatHeightCm) {
    if (seatHeight) {
      components.seatHeight = overlapScore(profile.suggestedSeatHeightCm, seatHeight, 2)
      if (components.seatHeight >= 0.7)
        evidence.push(
          `The ${seatHeight.min}-${seatHeight.max} cm seat-height range overlaps your suggested range.`,
        )
      else if (components.seatHeight < 0.45)
        conflicts.push("The seat-height range may not support a neutral foot position.")
    } else unknowns.push("Seat-height range")
  }

  if (profile.suggestedSeatDepthCm) {
    if (seatDepth) {
      components.seatDepth = overlapScore(profile.suggestedSeatDepthCm, seatDepth, 2)
      if (components.seatDepth >= 0.7)
        evidence.push(
          `The ${seatDepth.min === seatDepth.max ? seatDepth.min : `${seatDepth.min}-${seatDepth.max}`} cm seat depth is in your suggested range.`,
        )
      else if (components.seatDepth < 0.45)
        conflicts.push("The documented seat depth may be too short or too deep for your height.")
    } else unknowns.push("Usable seat depth")
  }

  if (input.weightKg) {
    const capacity = specs?.weightCapacityKg
    if (capacity != null) {
      const margin = capacity / input.weightKg
      components.weightCapacity = margin >= 1.2 ? 1 : margin >= 1 ? 0.45 : 0
      if (margin >= 1.2)
        evidence.push(`The ${capacity} kg capacity leaves at least a 20% margin.`)
      else if (margin >= 1)
        conflicts.push("The documented capacity leaves less than a 20% margin.")
      else conflicts.push(`The ${capacity} kg capacity is below the entered weight.`)
    } else unknowns.push("Weight capacity")
  }

  if (input.armrestsUnderDesk && input.deskHeightCm) {
    if (armrestHeight) {
      components.deskClearance = armrestHeight.min <= input.deskHeightCm - 1 ? 1 : 0
      if (components.deskClearance === 1)
        evidence.push("The minimum armrest height should clear the entered desk height.")
      else conflicts.push("The armrests may not fit below the entered desk height.")
    } else unknowns.push("Floor-to-armrest clearance")
  }

  const known = Object.values(components).filter((v): v is number => v != null)
  const score = known.length
    ? Math.round((known.reduce((sum, value) => sum + value, 0) / known.length) * 100)
    : 50
  const criticalKnown = [seatHeight, seatDepth, specs?.weightCapacityKg].filter(Boolean).length
  const confidence: FitConfidence =
    criticalKnown >= 3 && known.length >= 4
      ? "high"
      : criticalKnown >= 2 || known.length >= 3
        ? "medium"
        : "limited"
  const hasHardConflict = Object.values(components).some((value) => value === 0)
  const status: FitStatus = hasHardConflict
    ? "conditional"
    : confidence === "limited"
      ? "insufficient-data"
      : score >= 68
        ? "good"
        : "conditional"

  return {
    status,
    confidence,
    score,
    evidence: evidence.slice(0, 4),
    conflicts: conflicts.slice(0, 3),
    unknowns: [...new Set(unknowns)].slice(0, 4),
    measurements: {
      seatHeightCm: seatHeight,
      seatDepthCm: seatDepth,
      seatWidthCm: specs?.seatWidth ?? null,
      capacityKg: specs?.weightCapacityKg ?? null,
      armrestFloorHeightCm: armrestHeight,
    },
    components,
  }
}

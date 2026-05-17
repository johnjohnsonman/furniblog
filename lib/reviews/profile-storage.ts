import type { ReviewFilters } from "./review-filters"
import { DEFAULT_REVIEW_FILTERS } from "./review-filters"

const STORAGE_KEY = "furniblog-reviewer-profile"

export function loadSavedProfile(): Partial<ReviewFilters> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<ReviewFilters>
  } catch {
    return null
  }
}

export function saveProfile(filters: ReviewFilters): void {
  if (typeof window === "undefined") return
  const payload: Partial<ReviewFilters> = {
    heightRange: filters.heightRange,
    weightRange: filters.weightRange,
    bodyType: filters.bodyType,
    sittingHours: filters.sittingHours,
    occupations: filters.occupations,
    usagePurpose: filters.usagePurpose,
    backIssues: filters.backIssues,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function mergeWithSavedProfile(
  base: ReviewFilters
): ReviewFilters {
  const saved = loadSavedProfile()
  if (!saved) return base
  return { ...base, ...saved }
}

export function getDefaultFilters(): ReviewFilters {
  return { ...DEFAULT_REVIEW_FILTERS }
}

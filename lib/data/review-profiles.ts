import type {
  BackIssueId,
  BodyType,
  Review,
  ReviewOccupation,
} from "@/types/review"

type ProfilePatch = Pick<
  Review,
  | "reviewerHeightCm"
  | "reviewerWeightKg"
  | "usageHoursPerDay"
  | "usagePurpose"
  | "occupation"
  | "bodyType"
  | "backIssues"
>

/** Realistic reviewer profiles keyed by review id */
export const REVIEW_PROFILE_BY_ID: Record<string, ProfilePatch> = {
  "rev-aeron-1": {
    reviewerHeightCm: 178,
    reviewerWeightKg: 72,
    usageHoursPerDay: 9,
    usagePurpose: "office",
    occupation: "office_worker",
    bodyType: "average",
    backIssues: ["lower_back_pain"],
  },
  "rev-aeron-2": {
    reviewerHeightCm: 182,
    reviewerWeightKg: 85,
    usageHoursPerDay: 10,
    usagePurpose: "office",
    occupation: "developer",
    bodyType: "athletic",
    backIssues: ["lower_back_pain", "neck_pain"],
  },
  "rev-aeron-3": {
    reviewerHeightCm: 175,
    reviewerWeightKg: 68,
    usageHoursPerDay: 8,
    usagePurpose: "office",
    occupation: "creator",
    bodyType: "slim",
    backIssues: ["no_issues"],
  },
  "rev-aeron-4": {
    reviewerHeightCm: 168,
    reviewerWeightKg: 58,
    usageHoursPerDay: 7,
    usagePurpose: "home",
    occupation: "designer",
    bodyType: "slim",
    backIssues: ["neck_pain"],
  },
  "rev-aeron-5": {
    reviewerHeightCm: 173,
    reviewerWeightKg: 75,
    usageHoursPerDay: 6,
    usagePurpose: "gaming",
    occupation: "student",
    bodyType: "average",
    backIssues: ["no_issues"],
  },
  "rev-gesture-1": {
    reviewerHeightCm: 180,
    reviewerWeightKg: 78,
    usageHoursPerDay: 9,
    usagePurpose: "office",
    occupation: "developer",
    bodyType: "average",
    backIssues: ["lower_back_pain"],
  },
  "rev-gesture-2": {
    reviewerHeightCm: 185,
    reviewerWeightKg: 90,
    usageHoursPerDay: 8,
    usagePurpose: "office",
    occupation: "executive",
    bodyType: "athletic",
    backIssues: ["no_issues"],
  },
  "rev-embody-1": {
    reviewerHeightCm: 172,
    reviewerWeightKg: 65,
    usageHoursPerDay: 9,
    usagePurpose: "office",
    occupation: "office_worker",
    bodyType: "slim",
    backIssues: ["scoliosis"],
  },
  "rev-leap-1": {
    reviewerHeightCm: 176,
    reviewerWeightKg: 70,
    usageHoursPerDay: 8,
    usagePurpose: "office",
    occupation: "developer",
    bodyType: "average",
    backIssues: ["lower_back_pain"],
  },
  "rev-leap-2": {
    reviewerHeightCm: 181,
    reviewerWeightKg: 82,
    usageHoursPerDay: 7,
    usagePurpose: "office",
    occupation: "designer",
    bodyType: "athletic",
    backIssues: ["no_issues"],
  },
  "rev-freedom-1": {
    reviewerHeightCm: 170,
    reviewerWeightKg: 62,
    usageHoursPerDay: 6,
    usagePurpose: "home",
    occupation: "designer",
    bodyType: "slim",
    backIssues: ["hip_pain"],
  },
  "rev-sayl-1": {
    reviewerHeightCm: 165,
    reviewerWeightKg: 55,
    usageHoursPerDay: 5,
    usagePurpose: "study",
    occupation: "student",
    bodyType: "slim",
    backIssues: ["no_issues"],
  },
  "rev-contessa-1": {
    reviewerHeightCm: 177,
    reviewerWeightKg: 74,
    usageHoursPerDay: 10,
    usagePurpose: "office",
    occupation: "executive",
    bodyType: "average",
    backIssues: ["neck_pain"],
  },
  "rev-ing-1": {
    reviewerHeightCm: 174,
    reviewerWeightKg: 71,
    usageHoursPerDay: 8,
    usagePurpose: "office",
    occupation: "office_worker",
    bodyType: "average",
    backIssues: ["lower_back_pain"],
  },
  "rev-gesture-3": {
    reviewerHeightCm: 183,
    reviewerWeightKg: 88,
    usageHoursPerDay: 9,
    usagePurpose: "gaming",
    occupation: "developer",
    bodyType: "athletic",
    backIssues: ["no_issues"],
  },
  "rev-aeron-6": {
    reviewerHeightCm: 188,
    reviewerWeightKg: 92,
    usageHoursPerDay: 10,
    usagePurpose: "office",
    occupation: "executive",
    bodyType: "plus",
    backIssues: ["lower_back_pain", "herniated_disc"],
  },
}

export function applyReviewProfile(review: Review): Review {
  const patch = REVIEW_PROFILE_BY_ID[review.id]
  if (!patch) return review
  return {
    ...review,
    ...patch,
    backIssues: patch.backIssues ?? review.backIssues,
    occupation: patch.occupation ?? review.occupation,
    bodyType: patch.bodyType ?? review.bodyType,
  }
}

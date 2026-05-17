import { HERMAN_MILLER_CHAIRS } from "./herman-miller"
import { STEELCASE_CHAIRS } from "./steelcase"
import { JAPAN_KOREA_CHAIRS } from "./japan-korea"
import { EUROPE_AMERICA_CHAIRS } from "./europe-america"
import { GAMING_LUXURY_MISC_CHAIRS } from "./gaming-luxury-misc"
import type { HardcodedChair } from "../types"

export const HARD_CODED_CHAIRS: HardcodedChair[] = [
  ...HERMAN_MILLER_CHAIRS,
  ...STEELCASE_CHAIRS,
  ...JAPAN_KOREA_CHAIRS,
  ...EUROPE_AMERICA_CHAIRS,
  ...GAMING_LUXURY_MISC_CHAIRS,
]

export const HARD_CODED_BY_SLUG = new Map(
  HARD_CODED_CHAIRS.map((c) => [c.slug, c])
)

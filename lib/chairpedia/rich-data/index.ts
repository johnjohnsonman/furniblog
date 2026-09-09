import type { RichReview } from "@/lib/chairpedia/rich-types"
import { SIHOO_DORO_C300 } from "./sihoo-doro-c300"
import { SIHOO_M18 } from "./sihoo-m18"
import { HBADA_P5 } from "./hbada-p5"
import { NOUHAUS_ERGO3D } from "./nouhaus-ergo3d"
import { HERMAN_MILLER_AERON } from "./herman-miller-aeron"
import { STEELCASE_LEAP_V2 } from "./steelcase-leap-v2"
import { HAWORTH_FERN } from "./haworth-fern"

/**
 * Registry: chairpedia slug → rich buying-guide data.
 * A chairpedia entry whose slug is a key here renders the rich template
 * (components/chairpedia/rich-review.tsx); everything else falls back to the
 * plain content_html layout.
 */
export const RICH_REVIEWS: Record<string, RichReview> = {
  "sihoo-doro-c300-advanced-ergonomic-office-chair-review": SIHOO_DORO_C300,
  "sihoo-m18-ergonomic-office-chair": SIHOO_M18,
  "hbada-p5-ergonomic-office-chair": HBADA_P5,
  "nouhaus-ergo3d-ergonomic-office-chair": NOUHAUS_ERGO3D,
  "herman-miller-aeron-chair-review": HERMAN_MILLER_AERON,
  "steelcase-leap-v2": STEELCASE_LEAP_V2,
  "haworth-fern": HAWORTH_FERN,
}

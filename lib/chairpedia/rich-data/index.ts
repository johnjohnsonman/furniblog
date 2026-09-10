import type { RichReview } from "@/lib/chairpedia/rich-types"
import { SIHOO_DORO_C300 } from "./sihoo-doro-c300"
import { SIHOO_M18 } from "./sihoo-m18"
import { HBADA_P5 } from "./hbada-p5"
import { NOUHAUS_ERGO3D } from "./nouhaus-ergo3d"
import { HERMAN_MILLER_AERON } from "./herman-miller-aeron"
import { STEELCASE_LEAP_V2 } from "./steelcase-leap-v2"
import { HAWORTH_FERN } from "./haworth-fern"
import { TICOVA_ERGONOMIC } from "./ticova-ergonomic"
import { GABRYLLY_ERGONOMIC } from "./gabrylly-ergonomic"
import { DURAMONT_ERGONOMIC } from "./duramont-ergonomic"
import { MIMOGLAD_HIGH_BACK } from "./mimoglad-high-back"
import { BRANCH_ERGONOMIC_CHAIR } from "./branch-ergonomic-chair"
import { FLEXISPOT_C7 } from "./flexispot-c7"
import { HON_IGNITION_2 } from "./hon-ignition-2"
import { SIHOO_DORO_S300 } from "./sihoo-doro-s300"
import { OFFICE_STAR_PROGRID } from "./office-star-progrid"
import { SIDIZ_T50 } from "./sidiz-t50"

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
  // Batch 1 (2026-09-10)
  "ticova-ergonomic-office-chair": TICOVA_ERGONOMIC,
  "gabrylly-ergonomic-office-chair": GABRYLLY_ERGONOMIC,
  "duramont-ergonomic-office-chair": DURAMONT_ERGONOMIC,
  "mimoglad-high-back-office-chair": MIMOGLAD_HIGH_BACK,
  "branch-ergonomic-chair": BRANCH_ERGONOMIC_CHAIR,
  "flexispot-c7-office-chair": FLEXISPOT_C7,
  "hon-ignition-2-office-chair": HON_IGNITION_2,
  "sihoo-doro-s300-office-chair": SIHOO_DORO_S300,
  "office-star-progrid-office-chair": OFFICE_STAR_PROGRID,
  "sidiz-t50-office-chair": SIDIZ_T50,
}

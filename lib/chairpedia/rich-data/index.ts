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
import { STEELCASE_GESTURE } from "./steelcase-gesture"
import { HERMAN_MILLER_SAYL } from "./herman-miller-sayl"
import { HERMAN_MILLER_COSM } from "./herman-miller-cosm"
import { OKAMURA_CONTESSA_II } from "./okamura-contessa-ii"
import { HUMANSCALE_FREEDOM } from "./humanscale-freedom"
import { HAWORTH_ZODY } from "./haworth-zody"
import { HERMAN_MILLER_EMBODY } from "./herman-miller-embody"
import { HERMAN_MILLER_EMBODY_GAMING } from "./herman-miller-embody-gaming"
import { HERMAN_MILLER_MIRRA_2 } from "./herman-miller-mirra-2"
import { STEELCASE_SERIES_1 } from "./steelcase-series-1"
import { VITRA_ID_TRIM } from "./vitra-id-trim"

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
  // Batch 2 — famous brands (2026-09-10). Group A keys reuse existing Chairpedia
  // deep-dives (rendered as the "In depth" section); Group B are new entries.
  "steelcase-gesture": STEELCASE_GESTURE,
  "herman-miller-sayl-chair": HERMAN_MILLER_SAYL,
  "herman-miller-cosm": HERMAN_MILLER_COSM,
  "okamura-contessa-ii-contessa-seconda": OKAMURA_CONTESSA_II,
  "humanscale-freedom-task-chair": HUMANSCALE_FREEDOM,
  "haworth-zody-ii": HAWORTH_ZODY,
  "herman-miller-embody-chair": HERMAN_MILLER_EMBODY,
  "herman-miller-embody-gaming-chair": HERMAN_MILLER_EMBODY_GAMING,
  "herman-miller-mirra-2-chair": HERMAN_MILLER_MIRRA_2,
  "steelcase-series-1-chair": STEELCASE_SERIES_1,
  "vitra-id-trim-chair": VITRA_ID_TRIM,
}

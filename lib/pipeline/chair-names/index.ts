import type { ChairNameEntry } from "@/lib/pipeline/chair-names-types"
import { HERMAN_MILLER_CHAIRS } from "@/lib/pipeline/chair-names/herman-miller"
import { STEELCASE_CHAIRS } from "@/lib/pipeline/chair-names/steelcase"
import { OKAMURA_CHAIRS } from "@/lib/pipeline/chair-names/okamura"
import { HUMANSCALE_HAG_CHAIRS } from "@/lib/pipeline/chair-names/humanscale-hag"
import { KNOLL_HAWORTH_VITRA_CHAIRS } from "@/lib/pipeline/chair-names/knoll-haworth-vitra"
import { WILKHAHN_SEDUS_KOKUYO_ITOKI_CHAIRS } from "@/lib/pipeline/chair-names/wilkhahn-sedus-kokuyo-itoki"
import { INTERSTUHL_GIRSBERGER_GAMING_CHAIRS } from "@/lib/pipeline/chair-names/interstuhl-girsberger-gaming"
import { MISC_AUTONOMOUS_CHAIRS } from "@/lib/pipeline/chair-names/misc-autonomous"
import { ADDITIONAL_CHAIRS } from "@/lib/pipeline/chair-names/additional"

export const CHAIR_NAMES: Record<string, ChairNameEntry> = {
  ...HERMAN_MILLER_CHAIRS,
  ...STEELCASE_CHAIRS,
  ...OKAMURA_CHAIRS,
  ...HUMANSCALE_HAG_CHAIRS,
  ...KNOLL_HAWORTH_VITRA_CHAIRS,
  ...WILKHAHN_SEDUS_KOKUYO_ITOKI_CHAIRS,
  ...INTERSTUHL_GIRSBERGER_GAMING_CHAIRS,
  ...MISC_AUTONOMOUS_CHAIRS,
  ...ADDITIONAL_CHAIRS,
}

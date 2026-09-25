import type { Store } from "@/lib/showrooms/types"
import { locationGroups } from "@/lib/showrooms/locations"
import type { TrialPage } from "@/lib/showrooms/trial-pages"
import { SEARCH_CLICK_EXCEPTIONS } from "./search-click-exceptions"

/**
 * Thin-page rules (2026-09-25 quality review). Pages stay public for visitors;
 * these rules only decide sitemap inclusion and, for the clearest cases, noindex.
 *
 * Thin store: no weekly hours, < 150 characters of text unique to the store,
 * and no model with a confirmed trial. "Unique" notes are ones shared by at
 * most two stores after replacing the store name and city.
 */

export type StoreSearchPolicy = "index" | "sitemap-exclude" | "noindex"

const KOKUYO_DEALER_NOTE = "KOKUYO lists this business as an office-furniture dealer"

const hasWeeklyHours = (s: Store) => Object.values(s.hours?.weekly ?? {}).some((slots) => Array.isArray(slots) && slots.length > 0)
const normalizedNote = (s: Store) => (s.visit_notes ?? "").split(s.name).join("{N}").split(s.city).join("{C}")

type StoreFlags = { thin: boolean; kokuyoDealer: boolean; noBrands: boolean }

const cache = new WeakMap<Store[], Map<string, StoreFlags>>()

export function storeFlags(stores: Store[]): Map<string, StoreFlags> {
  const hit = cache.get(stores)
  if (hit) return hit
  const live = stores.filter((s) => s.status === "published")
  const noteCount = new Map<string, number>()
  const transportCount = new Map<string, number>()
  for (const s of live) {
    noteCount.set(normalizedNote(s), (noteCount.get(normalizedNote(s)) ?? 0) + 1)
    if (s.transport_notes) transportCount.set(s.transport_notes, (transportCount.get(s.transport_notes) ?? 0) + 1)
  }
  const flags = new Map<string, StoreFlags>()
  for (const s of live) {
    const uniqueNote = (noteCount.get(normalizedNote(s)) ?? 0) <= 2 ? (s.visit_notes ?? "").length : 0
    const uniqueTransport = s.transport_notes && (transportCount.get(s.transport_notes) ?? 0) <= 2 ? s.transport_notes.length : 0
    const thin = !hasWeeklyHours(s) && uniqueNote + uniqueTransport < 150 && !s.models.some((m) => m.trial === "confirmed")
    flags.set(s.slug, { thin, kokuyoDealer: (s.visit_notes ?? "").startsWith(KOKUYO_DEALER_NOTE), noBrands: s.brands.length === 0 })
  }
  cache.set(stores, flags)
  return flags
}

const clicked = (path: string) => SEARCH_CLICK_EXCEPTIONS.has(path)

/**
 * noindex: KOKUYO dealer-template stores and thin stores with no brand data.
 * sitemap-exclude: other thin stores. Pages with search clicks keep "index".
 */
export function storeSearchPolicy(stores: Store[], slug: string): StoreSearchPolicy {
  const f = storeFlags(stores).get(slug)
  if (!f || clicked(`/stores/${slug}`)) return "index"
  if (f.kokuyoDealer || (f.noBrands && f.thin)) return "noindex"
  return f.thin ? "sitemap-exclude" : "index"
}

/** City location paths whose listed stores are all thin (kept public, out of the sitemap). */
export function thinCityPaths(stores: Store[]): Set<string> {
  const flags = storeFlags(stores)
  const out = new Set<string>()
  for (const g of locationGroups(stores)) {
    for (const c of g.cities) {
      if (c.stores.length >= 3 && c.stores.every((s) => flags.get(s.slug)?.thin) && !clicked(c.path)) out.add(c.path)
    }
  }
  return out
}

/** "Try" pages that list a single store (kept public, out of the sitemap). */
export const isThinTrialPage = (page: TrialPage) => page.stores.length === 1 && !clicked(page.path)

const QUESTION_SUMMARY = /^(the |a |this )?(user|poster|author|reviewer|op)\b[^.]{0,40}\b(ask|asks|asking|seek|seeks|seeking|wonder|wonders|wondering)\b/i

/** Thin review: summary under 250 characters with no pros/cons, or a question post rather than a review. */
export function isThinReview(r: { id: string; summary_ko: string | null; pros: unknown; cons: unknown }): boolean {
  if (clicked(`/reviews/${r.id}`)) return false
  const summary = (r.summary_ko ?? "").trim()
  const points = (Array.isArray(r.pros) ? r.pros.length : 0) + (Array.isArray(r.cons) ? r.cons.length : 0)
  return (summary.length < 250 && points === 0) || QUESTION_SUMMARY.test(summary)
}

import type { Store, StorePreview } from "./types";

export const locationSlug = (s: string) => {
  const normalized = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const latin = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // Stable ASCII keys also avoid non-ASCII cache-tag headers in the hosting adapter.
  const native = s.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return latin || (native ? `city-${Array.from(native).map(c => c.codePointAt(0)!.toString(16)).join("-")}` : "");
};
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryNameOverrides: Record<string, string> = { HK: "Hong Kong" };
export const countryName = (code: string) => countryNameOverrides[code] || countryNames.of(code) || code;
export const countryPath = (code: string) => `/stores/locations/${locationSlug(countryName(code))}`;
// Include US states and Japanese prefectures to distinguish same-name cities.
export const cityKey = (s: Store | StorePreview) => locationSlug(s.city + (s.country_code === "US" || (s.country_code === "JP" && s.region && /[\u3040-\u30ff\u3400-\u9fff]/.test(s.city)) ? ` ${s.region}` : ""));
export const cityLabel = (s: Store | StorePreview) => s.city + ((s.country_code === "US" || s.country_code === "JP") && s.region ? `, ${s.region}` : "");
export const cityPath = (s: Store | StorePreview) => `${countryPath(s.country_code)}/${cityKey(s)}`;
export function locationGroups(stores: Store[]) {
  const live = stores.filter(s => s.status === "published");
  return Array.from(new Set(live.map(s => s.country_code))).map(code => {
    const members = live.filter(s => s.country_code === code);
    const cities = Array.from(new Set(members.map(cityKey))).map(key => {
      const list = members.filter(s => cityKey(s) === key);
      return { key, name: cityLabel(list[0]), path: cityPath(list[0]), stores: list };
    }).sort((a,b) => a.name.localeCompare(b.name, "en"));
    return { code, name: countryName(code), path: countryPath(code), stores: members, cities };
  }).sort((a,b) => a.name.localeCompare(b.name, "en"));
}
export function locationPages(stores: Store[]) {
  return locationGroups(stores).flatMap(g => [
    ...(g.stores.length >= 2 ? [g.path] : []),
    ...g.cities.filter(c => c.stores.length >= 3).map(c => c.path),
  ]);
}

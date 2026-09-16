import type { Store } from "./types";

export const locationSlug = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
export const countryName = (code: string) => countryNames.of(code) || code;
export const countryPath = (code: string) => `/stores/locations/${locationSlug(countryName(code))}`;
// Include the US state so cities with the same name never merge.
export const cityKey = (s: Store) => locationSlug(s.city + (s.country_code === "US" ? ` ${s.region}` : ""));
export const cityLabel = (s: Store) => s.city + (s.country_code === "US" && s.region ? `, ${s.region}` : "");
export const cityPath = (s: Store) => `${countryPath(s.country_code)}/${cityKey(s)}`;
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

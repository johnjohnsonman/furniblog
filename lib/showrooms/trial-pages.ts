import type { Store } from "./types";
import { cityKey, cityLabel, countryName } from "./locations";

export type TrialPage = {
  productId: string; productSlug: string; productName: string; brandName: string;
  cityKey: string; cityName: string; countryCode: string; countryName: string;
  path: string; stores: Store[];
};

export function trialPages(stores: Store[]): TrialPage[] {
  const pages = new Map<string, TrialPage>();
  for (const store of stores.filter(s => s.status === "published")) {
    for (const model of store.models.filter(m => m.trial === "confirmed" && m.slug && m.name)) {
      const key = `${model.product_id}:${store.country_code}:${cityKey(store)}`;
      const existing = pages.get(key);
      if (existing) { existing.stores.push(store); continue; }
      const brand = store.brands.find(b => b.brand_id === model.brand_id);
      const city = cityKey(store);
      pages.set(key, { productId:model.product_id, productSlug:model.slug!, productName:model.name!, brandName:brand?.name||"Chair", cityKey:city, cityName:cityLabel(store), countryCode:store.country_code, countryName:countryName(store.country_code), path:`/stores/try/${model.slug}/${city}`, stores:[store] });
    }
  }
  return [...pages.values()].sort((a,b) => a.path.localeCompare(b.path));
}

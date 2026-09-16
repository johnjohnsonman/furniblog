import "server-only";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import type { Store, Catalog } from "./types";
import registry from "@/content/showrooms/registry.json";
import { storeSchema } from "./validation";
const publishedRegistry: Store[] = registry.stores.map(s => storeSchema.parse(s)).filter(s => s.status === "published");
export async function getStoreCatalog(): Promise<Catalog> {
  if (process.env.SHOWROOM_DATA_SOURCE === "registry") return registry.catalog as Catalog;
  const db = createPublicServerClient();
  const [b, p] = await Promise.all([
    db.from("brands").select("id,name,slug").order("name"),
    db
      .from("products")
      .select("id,name,slug,brand_id")
      .eq("published", true)
      .eq("track", "chair")
      .order("name"),
  ]);
  if (b.error || p.error) throw new Error("Store catalog unavailable");
  return { brands: b.data ?? [], models: p.data ?? [] };
}
export async function getPublicStores(): Promise<{
  stores: Store[];
  unavailable: boolean;
}> {
  if (process.env.SHOWROOM_DATA_SOURCE === "registry") return { stores: publishedRegistry, unavailable: false };
  try {
    const db = createPublicServerClient(),
      rows: Store[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await db
        .from("showrooms")
        .select("*,brands:showroom_brands(*),models:showroom_models(*)")
        .eq("status", "published")
        .order("id")
        .range(offset, offset + 499);
      if (error) throw error;
      rows.push(...((data ?? []) as Store[]));
      if (!data || data.length < 500) break;
    }
    return { stores: rows, unavailable: false };
  } catch {
    return { stores: [], unavailable: true };
  }
}
export function enrichStore(s: Store, c: Catalog): Store {
  return {
    ...s,
    brands: s.brands.map((b) => ({
      ...b,
      ...c.brands.find((x) => x.id === b.brand_id),
    })),
    models: s.models.map((m) => ({
      ...m,
      ...c.models.find((x) => x.id === m.product_id),
    })),
  };
}

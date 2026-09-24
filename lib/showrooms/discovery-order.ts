import type { StorePreview } from "./types"

// Stable across runtimes and requests; ordering never changes the membership.
function hash(value: string): number {
  let result = 2166136261
  for (let i = 0; i < value.length; i++) result = Math.imul(result ^ value.charCodeAt(i), 16777619)
  return result >>> 0
}
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
export function discoveryOrder(stores: StorePreview[]): StorePreview[] {
  const countries = new Map<string, StorePreview[]>()
  for (const store of stores) {
    const bucket = countries.get(store.country_code) ?? []
    bucket.push(store)
    countries.set(store.country_code, bucket)
  }
  const groups = [...countries.entries()].sort(([a], [b]) => hash(a) - hash(b) || compare(a, b))
    .map(([, items]) => items.sort((a, b) => hash(a.id) - hash(b.id) || compare(a.id, b.id)))
  const output: StorePreview[] = []
  const usedBrands = new Map<string, number>()
  while (groups.some(g => g.length)) {
    for (const group of groups) {
      if (!group.length) continue
      // Prefer less represented carried brands within each country's next turn.
      const penalty = (s: StorePreview) => {
        const brands = s.brands.filter(b => b.carried === "confirmed")
        return brands.length ? Math.max(...brands.map(b => usedBrands.get(b.brand_id) ?? 0)) : 0
      }
      let best = 0
      for (let i = 1; i < group.length; i++) if (penalty(group[i]) < penalty(group[best])) best = i
      const [store] = group.splice(best, 1)
      output.push(store)
      for (const brand of store.brands.filter(b => b.carried === "confirmed")) usedBrands.set(brand.brand_id, (usedBrands.get(brand.brand_id) ?? 0) + 1)
    }
  }
  return output
}

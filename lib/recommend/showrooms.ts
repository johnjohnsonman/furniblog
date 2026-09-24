import { enrichStore, getPublicStores, getStoreCatalog } from "@/lib/showrooms/server"
import type { Recommendation } from "@/lib/recommend/engine"
import type { Store } from "@/lib/showrooms/types"

export type ShowroomMatch = {
  slug: string
  name: string
  city: string
  region: string
  countryCode: string
  path: string
  trial: "confirmed" | "brand-carried"
  appointment: "required" | "walk_in" | "unknown"
  distanceKm: number | null
  checkedOn: string
}

export type RecommendationShowrooms = {
  productSlug: string
  finderPath: string
  exactTrialCount: number
  brandStoreCount: number
  nearby: ShowroomMatch[]
}

function distanceKm(
  latitude: number | undefined,
  longitude: number | undefined,
  store: Store,
) {
  if (
    latitude == null ||
    longitude == null ||
    store.latitude == null ||
    store.longitude == null
  )
    return null
  const radians = (value: number) => (value * Math.PI) / 180
  const dLat = radians(store.latitude - latitude)
  const dLng = radians(store.longitude - longitude)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(latitude)) *
      Math.cos(radians(store.latitude)) *
      Math.sin(dLng / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

export async function matchRecommendationShowrooms(
  recommendations: Recommendation[],
  options: { countryCode?: string; latitude?: number; longitude?: number },
): Promise<RecommendationShowrooms[]> {
  if (!recommendations.length || process.env.SHOWROOMS_ENABLED !== "true") return []
  const [{ stores }, catalog] = await Promise.all([getPublicStores(), getStoreCatalog()])
  const enriched = stores.map((store) => enrichStore(store, catalog))
  const country = options.countryCode?.trim().toUpperCase()

  return recommendations.map((recommendation) => {
    const model = catalog.models.find(
      (item) => item.id === recommendation.id || item.slug === recommendation.slug,
    )
    const brand = model
      ? catalog.brands.find((item) => item.id === model.brand_id)
      : catalog.brands.find(
          (item) => item.name.toLowerCase() === recommendation.brand?.toLowerCase(),
        )
    const candidates = enriched
      .map((store) => {
        const exact = store.models.some(
          (item) =>
            (item.product_id === recommendation.id ||
              item.product_id === model?.id ||
              item.slug === recommendation.slug) &&
            item.trial === "confirmed",
        )
        const carriesBrand = Boolean(
          brand &&
            store.brands.some(
              (item) => item.brand_id === brand.id && item.carried === "confirmed",
            ),
        )
        if (!exact && !carriesBrand) return null
        return {
          store,
          exact,
          distance: distanceKm(options.latitude, options.longitude, store),
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort(
        (a, b) =>
          Number(country !== a.store.country_code) -
            Number(country !== b.store.country_code) ||
          Number(b.exact) - Number(a.exact) ||
          (a.distance ?? Number.MAX_SAFE_INTEGER) -
            (b.distance ?? Number.MAX_SAFE_INTEGER) ||
          a.store.name.localeCompare(b.store.name),
      )
    const selected = candidates.slice(0, 3).map(({ store, exact, distance }) => ({
      slug: store.slug,
      name: store.name,
      city: store.city,
      region: store.region,
      countryCode: store.country_code,
      path: `/stores/${store.slug}`,
      trial: exact ? ("confirmed" as const) : ("brand-carried" as const),
      appointment: store.appointment,
      distanceKm: distance,
      checkedOn: store.checked_on,
    }))
    const query = new URLSearchParams({ model: recommendation.slug })
    if (country) query.set("country", country)
    return {
      productSlug: recommendation.slug,
      finderPath: `/stores?${query.toString()}`,
      exactTrialCount: candidates.filter((item) => item.exact).length,
      brandStoreCount: candidates.filter((item) => !item.exact).length,
      nearby: selected,
    }
  })
}

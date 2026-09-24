import "server-only"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { homeCatalog, type HomeProductRow } from "./catalog"
import { VERIFIED_PRODUCTS } from "@/lib/comparisons/verified-products"
import { VERIFIED_COMPARISON_SOURCES } from "@/lib/comparisons/verified-sources"
import { VERIFIED_COMPARISON_PILOT_SLUGS, getVerifiedComparisonPilot, getPilotProduct } from "@/lib/comparisons/verified-pilots"
import { getComparisonVisual } from "@/lib/comparisons/product-visuals"
import { showroomsEnabled } from "@/lib/navigation/showrooms"
import { getPublicStores } from "@/lib/showrooms/server"
import { locationGroups } from "@/lib/showrooms/locations"

// Editorial selection, not example data: titles, publication and product relationships
// are resolved from the live database. Missing or mismatched entries are omitted.
export const HOME_GUIDES = [
  { slug: "herman-miller-aeron-chair-review", product: "herman-miller-aeron", description: "A closer look at Aeron sizes, configurations and the questions to ask before buying." },
  { slug: "herman-miller-embody-chair", product: "herman-miller-embody", description: "Explore the standard Embody work chair and the choices that distinguish its configurations." },
  { slug: "steelcase-leap-v2", product: "steelcase-leap-v2", description: "Understand Leap generations, adjustments and what to check on a used chair." },
  { slug: "herman-miller-mirra-2-chair", product: "herman-miller-mirra-2", description: "Compare back construction, seat and arm options before choosing a Mirra 2." },
] as const
export const HOME_BUYING_SLUGS = [
  "how-to-read-an-amazon-office-chair-listing-before-you-trust-it",
  "herman-miller-aeron-classic-vs-remastered-identification-guide",
  "used-steelcase-leap-buying-guide-v1-vs-v2-identification-and-inspection",
] as const

export async function getHomePageData() {
  const db = createPublicServerClient()
  const [productResult, guideResult, buyingResult, stores] = await Promise.all([
    db.from("products").select("id,slug,name,category,published,track,brands(slug,name),product_images(id,url,model_status,rights,is_thumbnail,sort_order)").eq("published", true).eq("track", "chair").order("name"),
    db.from("chairpedia").select("slug,title,product_id").eq("status", "published").in("slug", HOME_GUIDES.map(item => item.slug)),
    db.from("blog_posts").select("slug,title").eq("status", "published").in("slug", [...HOME_BUYING_SLUGS]),
    showroomsEnabled() ? getPublicStores() : Promise.resolve({ stores: [], unavailable: false }),
  ])
  if (productResult.error) throw new Error("Homepage catalog unavailable")
  const catalog = homeCatalog((productResult.data ?? []) as HomeProductRow[], process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  const order = ["herman-miller-aeron", "steelcase-gesture", "herman-miller-embody", "steelcase-leap-v2", "herman-miller-mirra-2", "herman-miller-sayl", "herman-miller-cosm-high-back", "humanscale-freedom"]
  catalog.products.sort((a,b) => (order.includes(a.slug) ? order.indexOf(a.slug) : 99) - (order.includes(b.slug) ? order.indexOf(b.slug) : 99) || a.name.localeCompare(b.name))
  for (const product of catalog.products) {
    const verified = Object.values(VERIFIED_PRODUCTS).find(record => record.slug === product.slug)
    const fact = verified?.facts.fit
    product.scope = verified?.modelScope
    product.note = getComparisonVisual(product.slug)?.configurationNote
    if (fact) product.fact = { value: fact.value, href: VERIFIED_COMPARISON_SOURCES[fact.sourceIds[0]].url }
  }
  const guides = HOME_GUIDES.flatMap(selection => {
    const row = guideResult.data?.find(row => row.slug === selection.slug)
    const product = catalog.products.find(product => product.slug === selection.product && product.id === row?.product_id)
    return row && product ? [{ slug: row.slug, title: row.title as string, description: selection.description, product }] : []
  })
  const buying = HOME_BUYING_SLUGS.flatMap(slug => buyingResult.data?.filter(row => row.slug === slug) ?? [])
  const locations = locationGroups(stores.stores).filter(group => group.stores.length >= 2).map(group => ({
    name: group.name, href: group.path, count: group.stores.length,
    cities: group.cities.filter(city => city.stores.length >= 3).slice(0, 3).map(city => ({ name: city.name, href: city.path })),
  }))
  const comparisons = VERIFIED_COMPARISON_PILOT_SLUGS.flatMap(slug => {
    const pilot = getVerifiedComparisonPilot(slug)
    if (!pilot) return []
    const a = getPilotProduct(pilot, "a").slug, b = getPilotProduct(pilot, "b").slug
    return catalog.products.some(product => product.slug === a) && catalog.products.some(product => product.slug === b)
      ? [{ slug, title: pilot.title, a, b }] : []
  })
  return { ...catalog, guides, buying, locations, comparisons }
}

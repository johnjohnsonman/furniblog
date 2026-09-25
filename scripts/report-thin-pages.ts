/**
 * Lists thin-page actions (noindex / sitemap-exclude) using the same rules the
 * site applies (lib/seo/thin-pages.ts). Read-only. Usage:
 *   SHOWROOM_DATA_SOURCE=registry npx ts-node -r tsconfig-paths/register --project scripts/tsconfig.json scripts/report-thin-pages.ts <out.json>
 */
import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
dotenv.config({ path: path.resolve(".env.local"), quiet: true })
import { createClient } from "@supabase/supabase-js"
import { getPublicStores, getStoreCatalog, enrichStore } from "@/lib/showrooms/server"
import { trialPages } from "@/lib/showrooms/trial-pages"
import { storeFlags, storeSearchPolicy, thinCityPaths, isThinTrialPage, isThinReview } from "@/lib/seo/thin-pages"
import { SEARCH_CLICK_EXCEPTIONS } from "@/lib/seo/search-click-exceptions"

async function main() {
  const { stores } = await getPublicStores()
  const flags = storeFlags(stores)
  const byPolicy: Record<string, string[]> = { noindex: [], "sitemap-exclude": [], index: [] }
  for (const s of stores.filter((s) => s.status === "published")) byPolicy[storeSearchPolicy(stores, s.slug)].push(s.slug)
  const kokuyo = byPolicy.noindex.filter((s) => flags.get(s)?.kokuyoDealer)
  const noBrandThin = byPolicy.noindex.filter((s) => !flags.get(s)?.kokuyoDealer)
  const catalog = await getStoreCatalog()
  const thinTry = trialPages(stores.map((s) => enrichStore(s, catalog))).filter(isThinTrialPage).map((p) => p.path)
  const thinCities = [...thinCityPaths(stores)]
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const reviews: { id: string; summary_ko: string | null; pros: unknown; cons: unknown }[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("reviews").select("id, summary_ko, pros, cons").eq("excluded", false).not("source_url", "is", null).order("id").range(from, from + 999)
    if (error) throw error
    reviews.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  const thinReviews = reviews.filter(isThinReview).map((r) => `/reviews/${r.id}`)
  const keptByClicks = [...SEARCH_CLICK_EXCEPTIONS]
  const out = {
    generatedAt: new Date().toISOString(),
    counts: { storesNoindexKokuyo: kokuyo.length, storesNoindexNoBrandThin: noBrandThin.length, storesSitemapExcludeThin: byPolicy["sitemap-exclude"].length, cityPagesSitemapExclude: thinCities.length, tryPagesSitemapExclude: thinTry.length, reviewsSitemapExclude: thinReviews.length, keptByClickException: keptByClicks.length },
    noindex: { kokuyoDealerStores: kokuyo.map((s) => `/stores/${s}`), noBrandThinStores: noBrandThin.map((s) => `/stores/${s}`) },
    sitemapExcludeOnly: { thinStores: byPolicy["sitemap-exclude"].map((s) => `/stores/${s}`), cityPages: thinCities, tryPages: thinTry, reviews: thinReviews },
    keptByClickException: keptByClicks,
  }
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1))
  console.log(JSON.stringify(out.counts))
}
main().catch((e) => { console.error(e); process.exit(1) })

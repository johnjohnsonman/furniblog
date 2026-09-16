import { SITE_URL } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getPublicStores,
  getStoreCatalog,
  enrichStore,
  storePreview,
} from "@/lib/showrooms/server";
import { ShowroomFinder } from "@/components/showrooms/ShowroomFinder";
export const revalidate = 300;
export function generateMetadata(): Metadata {
  return {
    title: "Find a Showroom: Try Chairs Near You",
    description:
      "Find registered chair showrooms and retailers. Check brands, confirmed models to try, visit arrangements and contact information.",
    alternates: { canonical: "/stores" },
  };
}
export default async function StoresPage() {
  if (process.env.SHOWROOMS_ENABLED !== "true") notFound();
  const [result, catalog] = await Promise.all([
    getPublicStores(),
    getStoreCatalog(),
  ]);
  return (
    <>
    <link rel="preload" href="https://tiles.openfreemap.org/styles/positron" as="fetch" crossOrigin="anonymous" />
    <link rel="preload" href="/maplibre/maplibre-gl-worker.mjs" as="script" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", "@id": SITE_URL + "/stores#page", url: SITE_URL + "/stores", name: "Worldwide chair store map", inLanguage: "en", description: "Find chair stores by country, city, brand and model. Confirm visit arrangements with the store.", mainEntity: { "@type": "ItemList", name: "Chair stores by country and city", url: SITE_URL + "/stores/locations" } }).replace(/</g, "\\u003c") }} />
    <Suspense fallback={<div className="atlas-map-status">Loading chair stores…</div>}>
    <ShowroomFinder
      stores={result.stores.map((s) => storePreview(enrichStore(s, catalog)))}
      catalog={catalog}
      unavailable={result.unavailable}
      correctionsEnabled={process.env.SHOWROOM_DATA_SOURCE !== "registry"}
    />
    </Suspense>
    </>
  );
}

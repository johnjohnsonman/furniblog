import { SITE_URL } from "@/lib/site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicStores,
  getStoreCatalog,
  enrichStore,
} from "@/lib/showrooms/server";
import { ShowroomFinder } from "@/components/showrooms/ShowroomFinder";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<Metadata> {
  const q = await searchParams;
  return {
    title: "Find a Showroom: Try Chairs Near You",
    description:
      "Find registered chair showrooms and retailers. Check brands, confirmed models to try, visit arrangements and contact information.",
    alternates: { canonical: "/stores" },
    ...(Object.keys(q).length
      ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } }
      : {}),
  };
}
export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; country?: string; city?: string }>;
}) {
  if (process.env.SHOWROOMS_ENABLED !== "true") notFound();
  const [result, catalog, q] = await Promise.all([
    getPublicStores(),
    getStoreCatalog(),
    searchParams,
  ]);
  const model =
    catalog.models.find((m) => m.id === q.model || m.slug === q.model)?.id ??
    "";
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", "@id": SITE_URL + "/stores#page", url: SITE_URL + "/stores", name: "Worldwide chair store map", inLanguage: "en", description: "Find chair stores by country, city, brand and model. Confirm visit arrangements with the store.", mainEntity: { "@type": "ItemList", name: "Chair stores by country and city", url: SITE_URL + "/stores/locations" } }).replace(/</g, "\\u003c") }} />
    <ShowroomFinder
      stores={result.stores.map((s) => enrichStore(s, catalog))}
      catalog={catalog}
      initialModel={model}
      initialCountry={q.country || ""}
      initialCity={q.city || ""}
      unavailable={result.unavailable}
      correctionsEnabled={process.env.SHOWROOM_DATA_SOURCE !== "registry"}
    />
    </>
  );
}

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
    <ShowroomFinder
      stores={result.stores.map((s) => enrichStore(s, catalog))}
      catalog={catalog}
      initialModel={model}
      initialCountry={q.country || ""}
      initialCity={q.city || ""}
      unavailable={result.unavailable}
      correctionsEnabled={process.env.SHOWROOM_DATA_SOURCE !== "registry"}
    />
  );
}

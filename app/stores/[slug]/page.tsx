import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  getPublicStores,
  getStoreCatalog,
  enrichStore,
} from "@/lib/showrooms/server";
import { StoreDetails } from "@/components/showrooms/StoreDetails";
import "@/components/showrooms/atlas.css";
import { SITE_URL } from "@/lib/site-config";
import { storeSearchPolicy } from "@/lib/seo/thin-pages";
import { countryPath, countryName } from "@/lib/showrooms/locations";
import { AtlasHeader } from "@/components/showrooms/AtlasHeader";
export const revalidate = 300;
export function generateStaticParams() { return []; }
const load = cache(async (slug: string) => {
  if (process.env.SHOWROOMS_ENABLED !== "true") notFound();
  const [r, c] = await Promise.all([getPublicStores(), getStoreCatalog()]);
  if (r.unavailable) throw new Error("Store directory temporarily unavailable");
  const s = r.stores.find((s) => s.slug === slug);
  if (!s) notFound();
  return enrichStore(s, c);
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const s = await load((await params).slug);
  return {
    title: `${s.name} — Chair Showroom in ${s.city}`,
    description: `Visit information for ${s.name} in ${s.city}: brands, chairs to try, address and contact details. Confirm model availability before travelling.`,
    alternates: { canonical: `/stores/${s.slug}` },
    openGraph: { title: `${s.name} | Chairpedia`, url: `/stores/${s.slug}` },
    // Dealer-directory template pages stay visible but are kept out of search.
    ...(storeSearchPolicy((await getPublicStores()).stores, s.slug) === "noindex" ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const s = await load((await params).slug);
  return (
    <main className="atlas atlas-standalone">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FurnitureStore",
        "@id": `${SITE_URL}/stores/${s.slug}#store`, name: s.name,
        url: s.website_url || `${SITE_URL}/stores/${s.slug}`,
        address: { "@type": "PostalAddress", streetAddress: [s.address, s.unit].filter(Boolean).join(", "), addressLocality: s.city, addressRegion: s.region, addressCountry: s.country_code },
        geo: { "@type": "GeoCoordinates", latitude: s.latitude, longitude: s.longitude },
        ...(s.phone ? { telephone: s.phone } : {}),
      }).replace(/</g, "\\u003c") }} />
      <AtlasHeader />
      {/*
      <header className="atlas-header">
        <Link className="atlas-wordmark" href="/">
          Chairpedia
        </Link>
        <Link href="/stores">← All showrooms</Link>
      </header>
      */}
      <StoreDetails store={s} correctionsEnabled={process.env.SHOWROOM_DATA_SOURCE !== "registry"} />
      <nav aria-label="More stores" style={{ padding: "20px" }}><Link href={countryPath(s.country_code)}>More chair stores in {countryName(s.country_code)} →</Link></nav>
    </main>
  );
}

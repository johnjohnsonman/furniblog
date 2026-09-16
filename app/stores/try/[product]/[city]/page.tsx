import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { RegionalAmazonLink } from "@/components/affiliate/RegionalAmazonLink";
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link";
import { getPublicStores, getStoreCatalog, enrichStore } from "@/lib/showrooms/server";
import { trialPages } from "@/lib/showrooms/trial-pages";
import { countryPath } from "@/lib/showrooms/locations";
import { SITE_URL } from "@/lib/site-config";
import "@/app/stores/locations/[[...place]]/locations.css";

export const revalidate = 300;
export function generateStaticParams() { return []; }

const load = cache(async (product: string, city: string) => {
  if (process.env.SHOWROOMS_ENABLED !== "true") notFound();
  const [result, catalog] = await Promise.all([getPublicStores(), getStoreCatalog()]);
  if (result.unavailable) throw new Error("Store directory temporarily unavailable");
  const page = trialPages(result.stores.map((store) => enrichStore(store, catalog)))
    .find((item) => item.productSlug === product && item.cityKey === city);
  if (!page) notFound();
  return page;
});

type Props = { params: Promise<{ product: string; city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const value = await params;
  const page = await load(value.product, value.city);
  const title = `Where to Try ${page.productName} in ${page.cityName}`;
  const description = `Find source-confirmed places to try ${page.productName} in ${page.cityName}, ${page.countryName}. Check addresses, appointments and availability before visiting.`;
  return { title, description, alternates: { canonical: page.path }, openGraph: { title, description, url: page.path, type: "website" }, robots: { index: true, follow: true } };
}

export default async function TrialPageRoute({ params }: Props) {
  const value = await params;
  const page = await load(value.product, value.city);
  const amazon = resolveAmazonAffiliateLink(page.productSlug, page.productName, page.brandName);
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": SITE_URL + page.path,
    url: SITE_URL + page.path,
    name: `Where to try ${page.productName} in ${page.cityName}`,
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: page.stores.length,
      itemListElement: page.stores.map((store, index) => ({ "@type": "ListItem", position: index + 1, name: store.name, url: `${SITE_URL}/stores/${store.slug}` })),
    },
  };

  return <main className="store-locations">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="location-header">
      <Link href="/" className="location-logo">Chairpedia</Link>
      <Link href="/stores">Explore the map →</Link>
    </header>
    <div className="location-wrap">
      <nav className="location-crumbs" aria-label="Breadcrumb">
        <Link href="/stores">Find stores</Link> / <Link href={countryPath(page.countryCode)}>{page.countryName}</Link> / <span>{page.productName}</span>
      </nav>
      <section className="location-hero">
        <p className="location-eyebrow">SOURCE-CONFIRMED CHAIR TRIALS</p>
        <h1>Where to try {page.productName} in {page.cityName}</h1>
        <p>{page.stores.length} {page.stores.length === 1 ? "location lists" : "locations list"} this model as available to try. Contact the store before travelling because configurations, stock and access can change.</p>
        <div className="location-card-actions">
          <Link href={`/products/${page.productSlug}`}>Research {page.productName} →</Link>
          <Link href="/compare">Compare chair models →</Link>
          <RegionalAmazonLink href={amazon.url} name={`${page.brandName} ${page.productName}`} productId={page.productId} />
        </div>
      </section>
      <section>
        <h2>Places to try this chair</h2>
        <div className="location-store-grid">
          {page.stores.map((store) => <article className="location-store-card" key={store.id}>
            <p className="location-eyebrow">{store.city} · CONFIRMED MODEL</p>
            <h3><Link href={`/stores/${store.slug}`}>{store.name}</Link></h3>
            <p>{[store.address, store.unit].filter(Boolean).join(", ")}</p>
            <p><strong>{store.appointment === "required" ? "Appointment required" : store.appointment === "walk_in" ? "Walk-ins welcome" : "Contact before visiting"}</strong></p>
            <div className="location-card-actions">
              <Link href={`/stores/${store.slug}`}>Visit details →</Link>
              <a href={store.source_url} target="_blank" rel="noopener noreferrer">Verification source →</a>
            </div>
          </article>)}
        </div>
      </section>
      <section className="location-advice">
        <h2>Before visiting</h2>
        <p>Ask the store to confirm the exact size, upholstery and options you want to test. A source-confirmed model may still be sold, moved or temporarily unavailable after the latest check.</p>
        <p><Link href={`/products/${page.productSlug}`}>Read specifications and reviews</Link> before your visit, then compare seat fit, controls and warranty terms in person.</p>
      </section>
    </div>
  </main>;
}

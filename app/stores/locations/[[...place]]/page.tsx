import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getPublicStores, getStoreCatalog, enrichStore } from "@/lib/showrooms/server";
import { locationGroups } from "@/lib/showrooms/locations";
import { SITE_URL } from "@/lib/site-config";
import "./locations.css";

export const dynamic = "force-dynamic";
const load = cache(async () => {
  if (process.env.SHOWROOMS_ENABLED !== "true") notFound();
  const [result, catalog] = await Promise.all([getPublicStores(), getStoreCatalog()]);
  if (result.unavailable) throw new Error("Store directory temporarily unavailable");
  const stores = result.stores.map(s => enrichStore(s, catalog));
  return { stores, groups: locationGroups(stores) };
});
async function resolve(place: string[] = []) {
  const data = await load();
  if (place.length > 2) notFound();
  const country = place.length ? data.groups.find(g => g.path.endsWith(`/` + place[0])) : undefined;
  if (place.length && !country) notFound();
  const city = place.length === 2 ? country?.cities.find(c => c.key === place[1] && c.stores.length >= 3) : undefined;
  if (place.length === 2 && !city) notFound();
  const stores = city?.stores ?? country?.stores ?? data.stores;
  const name = city ? `${city.name}, ${country!.name}` : country?.name;
  return { ...data, country, city, stores, name, path: city?.path ?? country?.path ?? "/stores/locations" };
}
type Props = { params: Promise<{ place?: string[] }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await resolve((await params).place);
  const title = r.name ? `Chair Stores in ${r.name}: Showrooms & Visit Details` : "Chair Stores by Country & City";
  const description = r.name ? `Find ${r.stores.length} listed chair stores in ${r.name}. Compare addresses, listed brands, appointment requirements and source-checked visit details before travelling.` : "Browse chair stores by country and city. Find local showrooms, check visiting arrangements and explore the worldwide chair store map.";
  const index = !r.country || r.stores.length >= 2;
  return { title, description, alternates: { canonical: r.path }, robots: { index, follow: true, googleBot: { index, follow: true } }, openGraph: { title, description, url: r.path, type: "website" }, twitter: { card: "summary", title, description } };
}
export default async function LocationsPage({ params }: Props) {
  const r = await resolve((await params).place);
  const brands = Array.from(new Set(r.stores.flatMap(s => s.brands.filter(b => b.carried === "confirmed").map(b => b.name).filter(Boolean)))).sort();
  const appointmentCount = r.stores.filter(s => s.appointment === "required").length;
  const mapParams = new URLSearchParams(r.country ? { country: r.country.code } : {});
  if (r.city) mapParams.set("city", r.city.key);
  const mapHref = `/stores${mapParams.size ? `?${mapParams}` : ""}`;
  const crumbs = [{ name: "Chairpedia", path: "/" }, { name: "Find stores", path: "/stores" }, { name: "Locations", path: "/stores/locations" }, ...(r.country ? [{ name: r.country.name, path: r.country.path }] : []), ...(r.city ? [{ name: r.city.name, path: r.city.path }] : [])];
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "BreadcrumbList", itemListElement: crumbs.map((c,i) => ({ "@type": "ListItem", position: i+1, name: c.name, item: SITE_URL+c.path })) },
    { "@type": "CollectionPage", "@id": SITE_URL+r.path, url: SITE_URL+r.path, name: r.name ? `Chair stores in ${r.name}` : "Chair stores by country and city", inLanguage: "en", mainEntity: { "@type": "ItemList", numberOfItems: r.country ? r.stores.length : r.groups.length, itemListElement: (r.country ? r.stores.map(s => ({ name: s.name, path: `/stores/${s.slug}` })) : r.groups.map(g => ({ name: g.name, path: g.path }))).map((s,i) => ({ "@type": "ListItem", position: i+1, name: s.name, url: SITE_URL+s.path })) } }
  ] };
  return <main className="store-locations">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g,"\\u003c") }} />
    <header className="location-header"><Link href="/" className="location-logo">Chairpedia</Link><Link href="/stores">Explore the map ↗</Link></header>
    <div className="location-wrap">
      <nav aria-label="Breadcrumb" className="location-crumbs">{crumbs.map((c,i) => <span key={c.path}>{i > 0 && " / "}<Link href={c.path} aria-current={i === crumbs.length-1 ? "page" : undefined}>{c.name}</Link></span>)}</nav>
      <section className="location-hero"><p className="location-eyebrow">FIND YOUR CHAIR. PLAN YOUR VISIT.</p><h1>{r.name ? `Chair stores in ${r.name}` : "A better chair starts with a visit."}</h1><p>{r.name ? `Explore ${r.stores.length} listed chair stores in ${r.name}. Compare the addresses and visit arrangements below, then contact your shortlist to check the exact chair you want to try.` : `Explore ${r.stores.length} chair stores across ${r.groups.length} countries. Start with a country, discover local showrooms and plan where to try your next chair.`}</p><Link className="location-cta" href={mapHref}>{r.name ? "View these stores on the map" : "Open the world map"} ↗</Link></section>
      {!r.country ? <section aria-labelledby="countries-title"><h2 id="countries-title">Browse by country</h2><div className="location-grid">{r.groups.map(g => <Link className="location-tile" key={g.code} href={g.path}><h3>{g.name}</h3><p>{g.stores.length} stores · {g.cities.length} cities</p><span>Explore stores →</span></Link>)}</div></section> : <>
        <aside className="location-summary"><div><strong>{r.stores.length}</strong><span>Listed stores</span></div><div><strong>{brands.length}</strong><span>Listed brands</span></div><div><strong>{appointmentCount}</strong><span>Appointment required</span></div></aside>
        {brands.length > 0 && <p className="location-brands"><strong>Brands in this directory:</strong> {brands.join(", ")}. A brand listing does not confirm that every model is on display.</p>}
        {!r.city && <section><h2>Choose a city</h2><div className="location-city-links">{r.country.cities.map(c => <Link key={c.key} href={c.stores.length >= 3 ? c.path : `/stores?country=${r.country!.code}&city=${c.key}`}>{c.name} <span>{c.stores.length}</span></Link>)}</div></section>}
        <section aria-labelledby="stores-title"><h2 id="stores-title">{r.city ? `Where to shop in ${r.city.name}` : `Stores in ${r.country.name}`}</h2><div className="location-store-grid">{r.stores.map(s => <article className="location-store-card" key={s.id}><p className="location-eyebrow">{s.city} · CHAIR STORE</p><h3><Link href={`/stores/${s.slug}`}>{s.name}</Link></h3><p>{[s.address,s.unit].filter(Boolean).join(", ")}</p><p><strong>{s.appointment === "required" ? "Appointment required" : s.appointment === "walk_in" ? "Walk-ins welcome" : "Contact before visiting"}</strong></p>{s.visit_notes && <p>{s.visit_notes}</p>}<p>{s.brands.filter(b => b.carried === "confirmed").map(b => b.name).filter(Boolean).join(" · ") || "Contact the store for its current chair range."}</p><div className="location-card-actions"><Link href={`/stores/${s.slug}`}>Visit details →</Link><a href={s.website_url || s.source_url} target="_blank" rel="noopener noreferrer">Official website ↗</a></div><small>Source checked: {s.checked_on} · <a href={s.source_url} target="_blank" rel="noopener noreferrer">Source</a></small></article>)}</div></section>
      </>}
      <section className="location-advice"><h2>Before you visit</h2><ol><li><strong>Confirm the exact model.</strong> Ask about the size, upholstery, headrest and adjustments you want to compare.</li><li><strong>Check access and hours.</strong> Some showrooms require an appointment. Holiday opening times may differ.</li><li><strong>Bring your desk measurements.</strong> Check seat height, armrest clearance and how the chair feels while typing and reclining.</li><li><strong>Ask about the purchase.</strong> Confirm delivery, assembly, returns and warranty coverage for your location.</li></ol><p>Listings are researched from public sources; coverage is growing and is not a complete inventory. Source checks do not guarantee current stock or opening hours. <Link href="/contact">Suggest a store or correction</Link>.</p><div className="location-card-actions"><Link href="/products">Compare chair specifications →</Link><Link href="/stores/locations">Browse all countries →</Link></div></section>
    </div>
  </main>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getPublicStores, getStoreCatalog, enrichStore } from "@/lib/showrooms/server";
import { locationGroups } from "@/lib/showrooms/locations";
import { trialPages } from "@/lib/showrooms/trial-pages";
import { SITE_URL } from "@/lib/site-config";
import "./locations.css";

export const revalidate = 300;
export function generateStaticParams() { return []; }
const countryEditorial: Record<string, string> = {
  MX: "Compare chair showrooms and workplace furniture dealers in Mexico City, Monterrey, Guadalajara, Querétaro, Tijuana and other listed markets. The directory includes official brand showrooms and public dealer locations where visitors can ask about ergonomic office seating.",
  NZ: "Browse workplace furniture and chair showrooms across Auckland, Wellington, Christchurch and Hamilton. Many New Zealand commercial showrooms recommend or require contacting the team before visiting, so confirm public access and the chair range first.",
  IN: "Find source-checked chair showrooms in Bengaluru, Chennai, Gurugram, Hyderabad and Mumbai. These locations include working brand experience centres where availability and visitor access should be confirmed in advance.",
  SG: "Explore chair and workplace showrooms across Singapore, including official brand spaces and specialist ergonomic seating retailers. Check appointments and current display models before travelling.",
  MY: "Find chair showrooms in Kuala Lumpur and Johor Bahru, including official brand locations and specialist workplace furniture stores. Contact each location for current chair availability and weekend access.",
  TH: "Compare chair and workplace showrooms in Bangkok from international seating brands and regional office furniture specialists. Most listed locations are commercial showrooms, so arrange your visit before travelling.",
  ID: "Browse verified chair showrooms in Jakarta, including international brand experience spaces. Confirm appointment requirements and the exact chair configuration you want to test.",
  VN: "Find chair showrooms in Ho Chi Minh City and Hanoi, from international workplace brands to local ergonomic chair specialists. Use the official source on each listing to confirm access and stock.",
  PH: "Find verified workplace and ergonomic seating showrooms in Metro Manila. Coverage is expanding; contact the listed showroom before travelling to confirm public access and available chairs.",
  HK: "Compare ergonomic chair retailers and international workplace showrooms across Hong Kong. Several brand studios require appointments, while specialist retailers offer public chair trials; always confirm the exact model before travelling.",
  TW: "Find source-checked ergonomic seating showrooms in Taiwan. Initial coverage focuses on Taipei and will expand as additional public showroom addresses are verified.",
  AE: "Browse international chair and workplace showrooms in Dubai. Many are commercial design centres that require advance appointments, so confirm access and the exact seating range before visiting.",
  SA: "Find source-checked workplace furniture showrooms in Saudi Arabia. Coverage is in its first stage; contact each location before travelling because public access and chair displays can change.",
};
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
  const brands = Array.from(new Map(r.stores.flatMap(s => s.brands.filter(b => b.carried === "confirmed" && b.name).map(b => [b.brand_id, b] as const))).values()).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  const appointmentCount = r.stores.filter(s => s.appointment === "required").length;
  const trials = trialPages(r.stores);
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
        {countryEditorial[r.country.code] && <section className="location-advice" aria-label={`${r.country.name} directory overview`}><p>{countryEditorial[r.country.code]}</p></section>}
        <aside className="location-summary"><div><strong>{r.stores.length}</strong><span>Listed stores</span></div><div><strong>{brands.length}</strong><span>Listed brands</span></div><div><strong>{appointmentCount}</strong><span>Appointment required</span></div></aside>
        {brands.length > 0 && <p className="location-brands"><strong>Brands in this directory:</strong>{" "}{brands.map((brand, index) => <span key={brand.brand_id}>{index > 0 && ", "}{brand.slug ? <Link href={`/brands/${brand.slug}`}>{brand.name}</Link> : brand.name}</span>)}. A brand listing does not confirm that every model is on display.</p>}
        {!r.city && <section><h2>Choose a city</h2><div className="location-city-links">{r.country.cities.map(c => <Link key={c.key} href={c.stores.length >= 3 ? c.path : `/stores?country=${r.country!.code}&city=${c.key}`}>{c.name} <span>{c.stores.length}</span></Link>)}</div></section>}
        {trials.length > 0 && <section><h2>Chairs confirmed to try</h2><p>These model links are based on store-specific public sources. Contact the store to reconfirm availability.</p><div className="location-city-links">{trials.slice(0,18).map(page => <Link key={page.path} href={page.path}>{page.productName} in {page.cityName} <span>{page.stores.length}</span></Link>)}</div></section>}
        <section aria-labelledby="stores-title"><h2 id="stores-title">{r.city ? `Where to shop in ${r.city.name}` : `Stores in ${r.country.name}`}</h2><div className="location-store-grid">{r.stores.map(s => <article className="location-store-card" key={s.id}><p className="location-eyebrow">{s.city} · CHAIR STORE</p><h3><Link href={`/stores/${s.slug}`}>{s.name}</Link></h3><p>{[s.address,s.unit].filter(Boolean).join(", ")}</p><p><strong>{s.appointment === "required" ? "Appointment required" : s.appointment === "walk_in" ? "Walk-ins welcome" : "Contact before visiting"}</strong></p>{s.visit_notes && <p>{s.visit_notes}</p>}<p>{s.brands.filter(b => b.carried === "confirmed").map(b => b.name).filter(Boolean).join(" · ") || "Contact the store for its current chair range."}</p><div className="location-card-actions"><Link href={`/stores/${s.slug}`}>Visit details →</Link><a href={s.website_url || s.source_url} target="_blank" rel="noopener noreferrer">Official website ↗</a></div><small>Source checked: {s.checked_on} · <a href={s.source_url} target="_blank" rel="noopener noreferrer">Source</a></small></article>)}</div></section>
      </>}
      {r.city && <section><h2>Other cities in {r.country!.name}</h2><div className="location-city-links">{r.country!.cities.filter(c => c.key !== r.city!.key && c.stores.length >= 3).map(c => <Link key={c.path} href={c.path}>{c.name} <span>{c.stores.length} stores</span></Link>)}</div></section>}
      <section className="location-advice" aria-labelledby="visit-questions"><h2 id="visit-questions">Chair store visit questions{r.name ? ' — ' + r.name : ''}</h2>
        <h3>Where can I try a chair before buying?</h3><p>{r.name ? 'Use the store addresses listed on this page to build a shortlist in ' + r.name + '.' : 'Choose a country and city in this directory, then open a store listing for its address and official contact details.'} Contact the store to confirm the exact model, size and configuration before travelling.</p>
        <h3>Do I need an appointment?</h3><p>{r.country ? appointmentCount + ' of the ' + r.stores.length + ' listed stores explicitly require an appointment. ' : ''}Each listing distinguishes confirmed appointment requirements from unknown visiting arrangements. Unknown does not mean walk-ins are accepted.</p>
        <h3>How is this directory checked?</h3><p>Each listing links to its public source and shows the date that source was checked. A listed brand does not guarantee stock or a chair available for testing. Check the store website for current hours, access and availability.</p>
      </section>
      <section className="location-advice"><h2>Before you visit</h2><ol><li><strong>Confirm the exact model.</strong> Ask about the size, upholstery, headrest and adjustments you want to compare.</li><li><strong>Check access and hours.</strong> Some showrooms require an appointment. Holiday opening times may differ.</li><li><strong>Bring your desk measurements.</strong> Check seat height, armrest clearance and how the chair feels while typing and reclining.</li><li><strong>Ask about the purchase.</strong> Confirm delivery, assembly, returns and warranty coverage for your location.</li></ol><p>Listings are researched from public sources; coverage is growing and is not a complete inventory. Source checks do not guarantee current stock or opening hours. <Link href="/contact">Suggest a store or correction</Link>.</p><div className="location-card-actions"><Link href="/products">Browse chair specifications →</Link><Link href="/compare">Compare chair models →</Link><Link href="/best/best-chairs-to-buy">See the best chairs to buy →</Link><Link href="/stores/locations">Browse all countries →</Link></div></section>
    </div>
  </main>;
}

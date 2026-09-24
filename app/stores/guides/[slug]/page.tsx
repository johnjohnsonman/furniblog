import { Header } from "@/components/header";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site-config";
import { getPublicStores, getStoreCatalog, enrichStore } from "@/lib/showrooms/server";
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink";
import "../../locations/[[...place]]/locations.css";

const guides = {
  "best-ergonomic-chair-showrooms-singapore": {
    title: "Best Ergonomic Chair Showrooms in Singapore",
    description: "Compare source-checked ergonomic chair showrooms in Singapore, from specialist local retailers to international workplace brands.",
    heading: "Ergonomic chair showrooms in Singapore",
    intro: "A chair that looks suitable online can feel very different after twenty minutes. Singapore has a useful mix of specialist ergonomic retailers, direct brand showrooms and workplace design centres where shoppers can compare adjustments, materials and seat sizes before buying.",
    terms: ["ErgoTune", "Hinomi", "SIHOO", "Serone", "Ergoworks", "Humanscale", "Haworth", "Steelcase"],
  },
  "where-to-try-herman-miller-chairs-singapore": {
    title: "Where to Try Herman Miller Chairs in Singapore",
    description: "Find source-checked Singapore stores that publicly list Herman Miller seating, with addresses and visit-planning advice.",
    heading: "Where to try Herman Miller chairs in Singapore",
    intro: "Herman Miller chairs vary by size, adjustment package and upholstery. Trying the exact configuration matters, especially for Aeron sizing and the distinct back support of Embody, Sayl and Cosm. These listings are based on public dealer or retailer information, but display inventory can change.",
    terms: ["XTRA", "Atlas Lifestyle"],
  },
  "where-to-try-office-chairs-singapore": {
    title: "Where to Try Office Chairs in Singapore",
    description: "Plan an office-chair shopping trip in Singapore with verified showroom addresses, appointment notes and questions to ask before visiting.",
    heading: "Where to try office chairs in Singapore",
    intro: "Singapore chair shopping is spread across the CBD, Kallang, Geylang, Eunos, Tampines and industrial showroom districts. Build a shortlist by chair type and price, then contact each store to make sure the model you want is assembled and available for a proper seated trial.",
    terms: [],
  },
} as const;

type GuideSlug = keyof typeof guides;
export const revalidate = 300;
export function generateStaticParams(){ return []; }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const slug=(await params).slug as GuideSlug, guide=guides[slug]; if(!guide) return {};
  return {title:guide.title,description:guide.description,alternates:{canonical:`/stores/guides/${slug}`},openGraph:{title:guide.title,description:guide.description,url:`/stores/guides/${slug}`,type:"article"}};
}
export default async function StoreGuide({params}:{params:Promise<{slug:string}>}){
  const slug=(await params).slug as GuideSlug,guide=guides[slug];if(!guide)notFound();
  const [result,catalog]=await Promise.all([getPublicStores(),getStoreCatalog()]);if(result.unavailable)throw new Error("Store directory temporarily unavailable");
  const singapore=result.stores.filter(s=>s.country_code==="SG").map(s=>enrichStore(s,catalog));
  const selected=guide.terms.length?singapore.filter(s=>guide.terms.some(term=>s.name.toLowerCase().includes(term.toLowerCase()))):singapore;
  const faq=[
    {q:"Can I walk into every Singapore chair showroom?",a:"No. Some workplace showrooms require an appointment and others publish walk-in hours. Check the visit status and official source on each listing before travelling."},
    {q:"Will every chair model be available to try?",a:"No. A listed brand does not guarantee that every chair, size or configuration is assembled. Contact the store and ask about the exact model before visiting."},
    {q:"What should I test in an ergonomic chair?",a:"Check seat height, seat depth, lumbar support, recline resistance, armrest clearance and comfort while typing. Sit for long enough to notice pressure points."},
  ];
  const path=`/stores/guides/${slug}`;
  const schema={"@context":"https://schema.org","@graph":[{"@type":"Article",headline:guide.title,description:guide.description,url:SITE_URL+path,inLanguage:"en",author:{"@type":"Organization",name:"Chairpedia"},mainEntityOfPage:SITE_URL+path},{"@type":"ItemList",numberOfItems:selected.length,itemListElement:selected.map((s,i)=>({"@type":"ListItem",position:i+1,name:s.name,url:`${SITE_URL}/stores/${s.slug}`}))},{"@type":"FAQPage",mainEntity:faq.map(x=>({"@type":"Question",name:x.q,acceptedAnswer:{"@type":"Answer",text:x.a}}))}]};
  return <main className="store-locations"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/><Header /><div className="location-wrap">
    <nav className="location-crumbs" aria-label="Breadcrumb"><Link href="/">Chairpedia</Link> / <Link href="/stores">Find stores</Link> / <Link href="/stores/locations/singapore">Singapore</Link> / <span>{guide.title}</span></nav>
    <section className="location-hero"><p className="location-eyebrow">SINGAPORE CHAIR SHOPPING GUIDE</p><h1>{guide.heading}</h1><p>{guide.intro}</p><Link className="location-cta" href="/stores?country=SG">Open the Singapore store map →</Link></section>
    <section className="location-advice"><h2>Plan a useful chair trial</h2><p>Start with two or three chairs that match your desk height, body size and budget. Ask the showroom whether the headrest, armrests and upholstery on display match the version sold online. Bring your desk measurements and spend time typing, reclining and returning upright.</p><p>Compare the full delivered cost, return terms and warranty support after the trial. A cheaper listing can represent a different configuration, seller or warranty route.</p></section>
    <section><h2>Source-checked Singapore showrooms</h2><div className="location-store-grid">{selected.map(s=><article className="location-store-card" key={s.id}><p className="location-eyebrow">{s.city} · CHAIR STORE</p><h3><Link href={`/stores/${s.slug}`}>{s.name}</Link></h3><p>{s.address}</p><p><strong>{s.appointment==="required"?"Appointment required":s.appointment==="walk_in"?"Walk-ins listed":"Contact before visiting"}</strong></p><p>{s.visit_notes}</p><div className="location-card-actions"><Link href={`/stores/${s.slug}`}>Visit details →</Link><a href={s.source_url} target="_blank" rel="noopener noreferrer">Official source →</a></div></article>)}</div></section>
    <section className="location-advice"><h2>Compare an online option</h2><p>Use the showroom visit to learn which adjustments fit, then compare the exact model and seller online. Search results and prices change and do not confirm showroom stock.</p><SmartBuyLink name="SIHOO Doro C300 ergonomic office chair" productId="sihoo-doro-c300" placement={`sg_guide_${slug.slice(0,24)}`} showDisclaimer/></section>
    <section className="location-advice"><h2>Frequently asked questions</h2>{faq.map(x=><div key={x.q}><h3>{x.q}</h3><p>{x.a}</p></div>)}</section>
    <section className="location-advice"><h2>Continue researching</h2><div className="location-card-actions"><Link href="/stores/locations/singapore">All Singapore chair stores →</Link><Link href="/products">Chair specifications →</Link><Link href="/compare">Compare chairs →</Link><Link href="/best/best-chairs-to-buy">Best chairs to buy →</Link></div></section>
  </div></main>;
}

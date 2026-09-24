"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, BookOpen, Check, MapPin, Search } from "lucide-react"

type Product = { slug:string; name:string; brand:string; category:string; categoryLabel:string; image:string|null; sourcedFields:number }
type Props = { products:Product[]; categories:{id:string;label:string;count:number}[]; totals:{chairs:number;brands:number;categories:number} }

const comparisons = [
  ["Browse chair comparisons", "/compare"],
  ["Fern vs Gesture", "/compare"],
  ["Explore comparison research", "/compare"],
] as const
const guides = [
  ["Will it fit my desk?", "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance"],
  ["What a return actually costs", "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon"],
  ["Used Leap: V1 vs V2", "/blog/used-steelcase-leap-buying-guide-v1-vs-v2-identification-and-inspection"],
] as const

function ProductImage({ product }: { product:Product }) {
  return <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#f1eee8]">
    {product.image ? <img src={product.image} alt={`${product.brand} ${product.name}`} className="h-full w-full object-contain p-[10%] transition-transform duration-300 group-hover:scale-[1.02]" /> : <span className="px-5 text-center text-xs text-[#746f68]">Image not yet available</span>}
  </div>
}

export function ReferenceHome({ products, categories, totals }:Props) {
  const [query,setQuery] = useState("")
  const [region,setRegion] = useState("US")
  const matches = useMemo(() => {
    const q=query.trim().toLowerCase()
    return q ? products.filter(p => `${p.brand} ${p.name} ${p.categoryLabel}`.toLowerCase().includes(q)).slice(0,8) : []
  },[products,query])
  const hero = useMemo(() => {
    const selected:Product[]=[]
    for (const category of ["office","dining","lounge","design","gaming","executive"]) {
      const item=products.find(p=>p.category===category&&p.image&&!selected.includes(p)); if(item) selected.push(item)
    }
    for(const item of products){if(selected.length>=6)break;if(item.image&&!selected.includes(item))selected.push(item)}
    return selected.slice(0,6)
  },[products])

  return <div className="cp-home overflow-x-hidden">
    <section className="border-b border-[#c9c3ba]"><div className="mx-auto max-w-[1320px] px-5 pb-12 pt-14 sm:px-8 lg:pb-16 lg:pt-20">
      <div className="grid min-w-0 gap-10 lg:grid-cols-12"><div className="min-w-0 lg:col-span-7">
        <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#2c4a78]">Chairpedia · The global chair reference</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl font-normal leading-[.98] tracking-[-.035em] sm:text-6xl lg:text-7xl">Explore the world of chairs.</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-[#57524d]">Research source-linked specifications, exact configurations, comparisons and places to try chairs around the world.</p>
        <div className="relative mt-8 max-w-2xl"><Search className="pointer-events-none absolute left-4 top-7 size-5 -translate-y-1/2 text-[#706a63]"/><input value={query} onChange={e=>setQuery(e.target.value)} className="h-14 w-full border border-[#7e7870] bg-white pl-12 pr-4 text-base outline-none focus:border-[#2c4a78] focus:ring-2 focus:ring-[#2c4a78]/20" placeholder="Search a chair, brand or category" aria-label="Search Chairpedia"/>{query&&<div className="absolute z-30 mt-1 w-full border border-[#7e7870] bg-white shadow-lg">{matches.length?matches.map(p=><Link key={p.slug} href={`/products/${p.slug}`} className="flex min-h-14 items-center justify-between border-b border-[#ded9d1] px-4 py-2 last:border-0 hover:bg-[#f1eee8]"><span><strong className="block font-medium">{p.name}</strong><small className="text-[#706a63]">{p.brand} · {p.categoryLabel}</small></span><ArrowRight size={15}/></Link>):<p className="p-4 text-sm text-[#706a63]">No matching chairs. Browse the complete database instead.</p>}</div>}</div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm"><Link href="/products" className="inline-flex min-h-11 items-center bg-[#2c4a78] px-5 font-semibold text-white">Browse all chairs</Link><Link href="/chair-fit-calculator" className="inline-flex min-h-11 items-center border border-[#9d968d] px-4">Find my fit</Link><Link href="/compare" className="inline-flex min-h-11 items-center border border-[#9d968d] px-4">Compare</Link><Link href="/stores" className="inline-flex min-h-11 items-center border border-[#9d968d] px-4">Find stores</Link></div>
      </div><div className="flex min-w-0 items-start justify-start lg:col-span-5 lg:justify-end"><label className="flex min-h-11 max-w-full items-center gap-3 border-b border-[#9d968d] text-sm"><span className="shrink-0 text-[#706a63]">Region</span><select value={region} onChange={e=>setRegion(e.target.value)} className="min-w-0 max-w-48 bg-transparent font-semibold outline-none"><option value="US">United States</option><option value="GB">United Kingdom</option><option value="DE">Germany</option><option value="JP">Japan</option></select></label></div></div>
      {hero.length>0&&<div className="mt-12 flex snap-x overflow-x-auto border-l border-t border-[#c9c3ba] md:grid md:grid-cols-6 md:overflow-visible">{hero.map(p=><Link key={p.slug} href={`/products/${p.slug}`} className="group w-[44vw] max-w-[190px] shrink-0 snap-start border-b border-r border-[#c9c3ba] bg-white md:w-auto md:max-w-none"><ProductImage product={p}/><div className="min-h-20 p-3"><p className="text-[9px] uppercase tracking-[.12em] text-[#706a63]">{p.brand}</p><p className="mt-1 font-serif text-sm leading-tight">{p.name}</p></div></Link>)}</div>}
    </div></section>

    <section className="border-b border-[#c9c3ba] py-14 lg:py-20"><div className="mx-auto max-w-[1320px] px-5 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-[#1b1a19] pt-4"><div><h2 className="font-serif text-3xl font-normal sm:text-4xl">Explore the chair database</h2><p className="mt-2 max-w-3xl text-sm text-[#706a63]">A random selection from the catalog. Region sets prices, sellers and available configurations; prices are never converted between markets.</p></div><Link href="/products" className="text-sm font-semibold text-[#2c4a78]">View all {totals.chairs.toLocaleString()} chairs →</Link></div>
      <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0,12).map(p=><article key={p.slug} className="group"><Link href={`/products/${p.slug}`}><ProductImage product={p}/><p className="mt-4 text-[10px] uppercase tracking-[.14em] text-[#706a63]">{p.brand}</p><h3 className="mt-1 font-serif text-xl font-normal">{p.name}</h3><p className="mt-2 text-sm text-[#706a63]">{p.categoryLabel}</p>{p.sourcedFields>0&&<p className="mt-3 flex items-center gap-1.5 text-xs text-[#85590f]"><Check size={13}/>{p.sourcedFields} sourced {p.sourcedFields===1?"field":"fields"}</p>}<span className="mt-3 inline-flex text-sm text-[#2c4a78]">View chair →</span></Link></article>)}</div>
    </div></section>

    <section className="border-b border-[#c9c3ba] py-14"><div className="mx-auto max-w-[1320px] px-5 sm:px-8"><h2 className="border-t-2 border-[#1b1a19] pt-4 font-serif text-3xl font-normal">Browse by category</h2><div className="mt-6 grid grid-cols-2 border-l border-t border-[#c9c3ba] md:grid-cols-4">{categories.filter(c=>c.count>0).map(c=><Link key={c.id} href={`/products?category=${c.id}`} className="flex min-h-20 items-center justify-between border-b border-r border-[#c9c3ba] px-4 hover:bg-[#f1eee8]"><span>{c.label}</span><span className="text-sm text-[#706a63]">{c.count}</span></Link>)}</div></div></section>

    <section className="border-b border-[#c9c3ba] py-14 lg:py-20"><div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-12"><div className="lg:col-span-4"><BookOpen className="size-6 text-[#2c4a78]"/><h2 className="mt-5 font-serif text-3xl font-normal">How Chairpedia documents chairs</h2><p className="mt-4 text-sm leading-6 text-[#57524d]">Facts remain tied to identifiable sources, exact configurations and markets. Unknown values stay visibly unverified.</p><div className="mt-6 flex flex-col items-start gap-2 text-sm text-[#2c4a78]"><Link href="/editorial-policy">Read our methodology →</Link><Link href="/products">View source coverage →</Link></div></div><div className="grid border-l border-t border-[#c9c3ba] sm:grid-cols-2 lg:col-span-8">{[["Manufacturer specifications","Dimensions and capacities are linked to identifiable manufacturer or retailer sources."],["Exact configurations","Sizes, cylinders and options remain separate wherever their specifications differ."],["Regional availability","Prices, sellers and available configurations follow the selected market."],["Transparent unknowns","Missing information is marked as not yet verified rather than inferred."]].map(([title,copy])=><div key={title} className="border-b border-r border-[#c9c3ba] p-6"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#57524d]">{copy}</p></div>)}</div></div></section>

    <section className="border-b border-[#c9c3ba] py-14"><div className="mx-auto grid max-w-[1320px] gap-10 px-5 sm:px-8 lg:grid-cols-3"><HomeLinks title="Compare models" links={comparisons}/><div><h2 className="border-t-2 border-[#1b1a19] pt-4 font-serif text-2xl font-normal">Try or buy near you</h2><div className="mt-5 space-y-3 text-sm"><Link href="/stores" className="flex items-center justify-between border-b border-[#c9c3ba] pb-3"><span className="flex items-center gap-2"><MapPin size={15}/>Search showrooms</span><ArrowRight size={14}/></Link><Link href="/stores" className="flex justify-between border-b border-[#c9c3ba] pb-3">Browse listed stores <ArrowRight size={14}/></Link><Link href="/products" className="flex justify-between border-b border-[#c9c3ba] pb-3">Browse chair records <ArrowRight size={14}/></Link></div><p className="mt-5 text-xs leading-5 text-[#706a63]">Chairpedia may earn a commission from qualifying purchases at no extra cost to you.</p></div><HomeLinks title="Research guides" links={guides}/></div></section>
    <section className="py-10"><div className="mx-auto grid max-w-[1320px] grid-cols-3 border-l border-t border-[#c9c3ba] px-5 sm:px-8"><Stat value={totals.chairs} label="Chairs"/><Stat value={totals.brands} label="Brands"/><Stat value={totals.categories} label="Categories"/></div></section>
  </div>
}

function HomeLinks({title,links}:{title:string;links:readonly(readonly[string,string])[]}){return <div><h2 className="border-t-2 border-[#1b1a19] pt-4 font-serif text-2xl font-normal">{title}</h2><div className="mt-5">{links.map(([label,href])=><Link key={label} href={href} className="flex min-h-11 items-center justify-between border-b border-[#c9c3ba] text-sm hover:text-[#2c4a78]">{label}<ArrowRight size={14}/></Link>)}</div></div>}
function Stat({value,label}:{value:number;label:string}){return <div className="border-b border-r border-[#c9c3ba] py-6 text-center"><strong className="font-serif text-3xl font-normal">{value.toLocaleString()}</strong><span className="mt-1 block text-xs uppercase tracking-[.14em] text-[#706a63]">{label}</span></div>}

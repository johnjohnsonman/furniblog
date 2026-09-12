"use client"

import NextImage, { type ImageProps } from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, GitCompareArrows, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export type FinderProduct = {
  id: string
  name: string
  brand: string
  brandId: string
  category: string
  categoryLabel: string
  priceUsd?: number
  price: string
  image: string
  rating: number
  bestFor?: string
}

const STORAGE_KEY = "chairpedia-home-compare"
const Image = (props: ImageProps) => <NextImage {...props} unoptimized />

function trackHomeAction(action: string, product?: FinderProduct) {
  const win = window as typeof window & { dataLayer?: Record<string, unknown>[] }
  win.dataLayer = win.dataLayer || []
  win.dataLayer.push({ event: "home_finder_action", action, product_id: product?.id, product_name: product?.name, brand: product?.brand })
}

export function ChairFinder({ products }: { products: FinderProduct[] }) {
  const [category, setCategory] = useState("all")
  const [brand, setBrand] = useState("all")
  const [budget, setBudget] = useState("all")
  const [activeId, setActiveId] = useState(products[0]?.id ?? "")
  const [compare, setCompare] = useState<string[]>([])
  const [dockOpen, setDockOpen] = useState(false)

  useEffect(() => {
    try { setCompare(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")) } catch {}
  }, [])
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(compare)) }, [compare])

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products])
  const categories = useMemo(() => [...new Map(products.map((p) => [p.category, p.categoryLabel])).entries()], [products])
  const matches = useMemo(() => products.filter((p) => {
    const max = budget === "all" ? Infinity : Number(budget)
    return (category === "all" || p.category === category) &&
      (brand === "all" || p.brand === brand) &&
      (p.priceUsd == null || p.priceUsd <= max)
  }).sort((a, b) => (b.rating || 0) - (a.rating || 0)), [products, category, brand, budget])

  const active = matches.find((p) => p.id === activeId) ?? matches[0] ?? products[0]
  const activeIndex = Math.max(0, matches.findIndex((p) => p.id === active?.id))
  const move = (step: number) => {
    if (!matches.length) return
    setActiveId(matches[(activeIndex + step + matches.length) % matches.length].id)
  }
  const toggleCompare = (id: string) => {
    const product = products.find((p) => p.id === id)
    trackHomeAction(compare.includes(id) ? "compare_remove" : "compare_add", product)
    setCompare((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current)
  }
  const compared = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean) as FinderProduct[]

  return (
    <section className="border-b border-[#171717] bg-white">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.05fr_.95fr]">
        <div className="border-[#171717] px-5 py-10 lg:border-r lg:px-8 lg:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#52606d]">Chair database · live product data</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">Real reviews &amp; real data for premium chairs</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#555]">Set your conditions. The shortlist and featured chair update instantly, using fields available in our catalog.</p>

          <div className="mt-9 border-l-4 border-[#3157e8] bg-[#eef2ff] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#3157e8]">Your conditions</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-lg font-semibold">
              <span>Show me</span>
              <select aria-label="Chair category" value={category} onChange={(e) => setCategory(e.target.value)} className="min-w-36 border-b-2 border-[#3157e8] bg-transparent px-2 py-1">
                <option value="all">any chair</option>{categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <span>under</span>
              <select aria-label="Maximum budget" value={budget} onChange={(e) => setBudget(e.target.value)} className="border-b-2 border-[#3157e8] bg-transparent px-2 py-1">
                <option value="all">any price</option><option value="300">$300</option><option value="500">$500</option><option value="1000">$1,000</option><option value="1500">$1,500</option>
              </select>
              <span>from</span>
              <select aria-label="Chair brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="min-w-36 border-b-2 border-[#3157e8] bg-transparent px-2 py-1">
                <option value="all">any brand</option>{brands.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between border-b border-[#171717] pb-2 text-xs">
            <strong>{matches.length} chairs match</strong><Link href="/products" className="text-[#3157e8] underline underline-offset-4">Browse all chairs</Link>
          </div>
          <div className="divide-y divide-[#d8d8d8]">
            {matches.slice(0, 6).map((p, index) => (
              <button key={p.id} onClick={() => setActiveId(p.id)} className={`grid w-full grid-cols-[28px_46px_1fr_auto] items-center gap-3 px-2 py-3 text-left transition-all hover:bg-[#f2f5ff] ${active?.id === p.id ? "border-l-4 border-[#3157e8] bg-[#eef2ff]" : "border-l-4 border-transparent"}`}>
                <span className="text-xs text-[#777]">{index + 1}</span><Image src={p.image} alt="" width={46} height={46} className="h-11 w-11 object-contain" />
                <span className="min-w-0"><strong className="block truncate text-sm">{p.name}</strong><span className="block truncate text-xs text-[#777]">{p.categoryLabel}{p.bestFor ? ` · ${p.bestFor}` : ""}</span></span>
                <span className="text-right text-xs font-semibold">{p.price}</span>
              </button>
            ))}
          </div>
        </div>

        {active && <div key={active.id} className="animate-[finder-in_.32s_ease-out] bg-[#f5f1e8]">
          <div className="relative flex aspect-[4/3] items-center justify-center border-b border-[#171717] bg-[#eaf3ff] p-10 lg:aspect-auto lg:min-h-[490px]">
            <span className="absolute left-5 top-5 bg-[#f0bf3a] px-2 py-1 text-[10px] font-bold uppercase">Best match</span>
            <div className="absolute right-5 top-5 flex gap-2"><button aria-label="Previous chair" onClick={() => move(-1)} className="border border-[#171717] bg-white p-2"><ArrowLeft size={17} /></button><button aria-label="Next chair" onClick={() => move(1)} className="border border-[#171717] bg-white p-2"><ArrowRight size={17} /></button></div>
            <Image src={active.image} alt={active.name} width={620} height={620} priority className="h-full max-h-[390px] w-full object-contain" />
          </div>
          <div className="bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#53606a]">{active.brand} · {active.categoryLabel}</p>
            <h2 className="mt-1 font-serif text-3xl">{active.name}</h2>
            <div className="mt-4 grid grid-cols-2 border border-[#171717] text-xs"><div className="p-3"><span className="block text-[#777]">Price</span><strong>{active.price}</strong></div><div className="border-l border-[#171717] p-3"><span className="block text-[#777]">Best for</span><strong>{active.bestFor || "See full specifications"}</strong></div></div>
            <div className="mt-3 grid grid-cols-2 gap-2"><Link href={`/products/${active.id}`} className="flex items-center justify-center bg-[#171717] px-3 py-3 text-sm font-bold text-white">View chair details</Link><button onClick={() => toggleCompare(active.id)} className="flex items-center justify-center gap-2 border border-[#3157e8] px-3 py-3 text-sm font-bold text-[#3157e8]">{compare.includes(active.id) ? <Check size={16} /> : <GitCompareArrows size={16} />} {compare.includes(active.id) ? "Added" : "Add to compare"}</button></div>
          </div>
        </div>}
      </div>

      {compared.length > 0 && <div className="sticky bottom-0 z-40 border-y border-[#171717] bg-white shadow-[0_-8px_30px_rgba(0,0,0,.1)]">
        <div className="mx-auto max-w-7xl px-4 py-3"><button className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-[.12em]" onClick={() => setDockOpen(!dockOpen)}><span>Compare · {compared.length}/3</span><span>{dockOpen ? "Collapse" : "Expand"}</span></button>
          {dockOpen && <div className="mt-3 grid gap-2 sm:grid-cols-3">{compared.map((p) => <div key={p.id} className="flex items-center gap-3 border border-[#bbb] p-2"><Image src={p.image} alt="" width={44} height={44} className="h-11 w-11 object-contain" /><Link href={`/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</Link><button aria-label={`Remove ${p.name}`} onClick={() => toggleCompare(p.id)}><X size={16} /></button></div>)}</div>}
        </div>
      </div>}
    </section>
  )
}

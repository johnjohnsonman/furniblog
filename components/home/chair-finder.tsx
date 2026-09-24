"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react"
import { filterHomeProducts, moveHomeSelection, toggleHomeComparison, type HomeProduct } from "@/lib/home/catalog"
import styles from "./homepage.module.css"

type Comparison = { slug: string; title: string; a: string; b: string }
export function ChairFinder({ products, total, comparisons }: { products: HomeProduct[]; total: number; comparisons: Comparison[] }) {
  const [category, setCategory] = useState("all")
  const [brand, setBrand] = useState("all")
  const [activeSlug, setActiveSlug] = useState(products[0]?.slug ?? "")
  const [selected, setSelected] = useState<string[]>([])
  const [failed, setFailed] = useState<string[]>([])
  const available = useMemo(() => products.filter(product => !failed.includes(product.slug)), [products, failed])
  const matches = useMemo(() => filterHomeProducts(available, category, brand), [available, category, brand])
  const active = matches.find(product => product.slug === activeSlug) ?? matches[0]
  const index = active ? matches.indexOf(active) : 0
  const start = Math.floor(index / 6) * 6
  const brands = [...new Map(available.map(product => [product.brandSlug, product.brand])).entries()].sort((a,b) => a[1].localeCompare(b[1]))
  const categories = [...new Map(available.map(product => [product.category, product.categoryLabel])).entries()]
  const selectedProducts = selected.flatMap(slug => available.filter(product => product.slug === slug))
  const pair = selectedProducts.length === 2 ? comparisons.find(item => selected.includes(item.a) && selected.includes(item.b)) : null
  const related = selectedProducts.length === 1 ? comparisons.filter(item => item.a === selected[0] || item.b === selected[0]).slice(0, 3) : []
  const reset = () => { setCategory("all"); setBrand("all"); setActiveSlug(products[0]?.slug ?? "") }
  const fail = (slug: string) => setFailed(current => current.includes(slug) ? current : [...current, slug])

  return <section className={styles.finder} aria-label="Find a chair">
    <div className={styles.finderGrid}>
      <div className={styles.finderIntro}>
        <p className={styles.eyebrow}>Chair research, made clearer</p>
        <h1>Find your chair{" "}<br />with Chairpedia</h1>
        <p className={styles.lede}>Start with the chair, then explore the details. Compare models, understand the options and make a shortlist of your own.</p>
        <div className={styles.filters}>
          <p className={styles.eyebrow}>Your conditions</p>
          <div className={styles.filterFields}>
            <label>Chair type<select aria-label="Chair type" value={category} onChange={event => setCategory(event.target.value)}><option value="all">Any chair type</option>{categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            <label>Brand<select aria-label="Brand" value={brand} onChange={event => setBrand(event.target.value)}><option value="all">Any brand</option>{brands.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
          </div>
        </div>
      </div>
      <div className={styles.results}>
        <div className={styles.resultsHeading}><p role="status"><strong>{matches.length}</strong> chairs to explore</p><button onClick={reset}>Reset filters</button></div>
        <div className={styles.productList}>
          {matches.slice(start, start + 6).map((product, offset) => <button key={product.slug} aria-pressed={active?.slug === product.slug} onClick={() => setActiveSlug(product.slug)} className={styles.productRow}>
            <span className={styles.rowNumber}>{String(start + offset + 1).padStart(2, "0")}</span>
            <Image unoptimized src={product.image} alt="" width={52} height={52} onError={() => fail(product.slug)} />
            <span><strong>{product.name}</strong><small>{product.categoryLabel}</small></span><ArrowRight size={16} aria-hidden="true" />
          </button>)}
          {!matches.length && <div className={styles.empty}><p>No chairs match these filters.</p><button className={styles.secondaryButton} onClick={reset}>Reset filters</button></div>}
        </div>
        <Link href="/products" className={styles.browseAll}>Browse all {total} chairs <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
      {active && <div className={styles.selected} data-selected-product={active.slug}>
        <div className={styles.selectedImage}>
          <span className={styles.selectedLabel}>Selected chair</span>
          <div className={styles.arrows}><button aria-label="Previous chair" disabled={matches.length < 2} onClick={() => setActiveSlug(moveHomeSelection(matches, active.slug, -1))}><ArrowLeft size={18} /></button><button aria-label="Next chair" disabled={matches.length < 2} onClick={() => setActiveSlug(moveHomeSelection(matches, active.slug, 1))}><ArrowRight size={18} /></button></div>
          <Image unoptimized src={active.image} alt={active.name} width={620} height={620} priority onError={() => fail(active.slug)} />
        </div>
        <div className={styles.selectedInfo}>
          <p className={styles.eyebrow}>{active.brand} · {active.categoryLabel}</p>
          <h2>{active.name}</h2>
          {active.fact ? <p className={styles.productFact}>{active.fact.value} <a href={active.fact.href} target="_blank" rel="noopener noreferrer">Official source <span className={styles.srOnly}>(opens in a new tab)</span>↗</a></p> : <p className={styles.productFact}>Explore this model and check the exact configuration with the manufacturer or seller.</p>}
          {active.scope && <p className={styles.scope}>{active.scope}.</p>}
          {active.note && <p className={styles.configuration}>{active.note}</p>}
          <div className={styles.actions}><Link className={styles.primaryButton} href={`/products/${active.slug}`}>View chair details <ArrowRight size={16} aria-hidden="true" /></Link><button className={styles.secondaryButton} aria-pressed={selected.includes(active.slug)} onClick={() => setSelected(current => toggleHomeComparison(current, active.slug))}>{selected.includes(active.slug) ? <Check size={16} /> : <Plus size={16} />} {selected.includes(active.slug) ? "Added to compare" : "Add to compare"}</button></div>
        </div>
      </div>}
    </div>
    {selectedProducts.length > 0 && <div className={styles.compareTray} aria-label="Comparison shortlist">
      <div><h2>Compare your shortlist</h2><p>Choose two chairs to find a published comparison. Adding a third replaces the first.</p></div>
      <ul>{selectedProducts.map(product => <li key={product.slug}>{product.name}<button aria-label={`Remove ${product.name} from comparison`} onClick={() => setSelected(current => current.filter(slug => slug !== product.slug))}><X size={16} /></button></li>)}</ul>
      {pair && <Link className={styles.primaryButton} href={`/compare/${pair.slug}`}>Read this comparison <ArrowRight size={16} /></Link>}
      {selectedProducts.length === 2 && !pair && <p>No verified comparison is available for this pair yet. <Link href="/compare">Browse published comparisons</Link>.</p>}
      {related.length > 0 && <div className={styles.related}><p>Published comparisons for {selectedProducts[0].name}</p>{related.map(item => <Link key={item.slug} href={`/compare/${item.slug}`}>{item.title} <ArrowRight size={16} aria-hidden="true" /></Link>)}</div>}
    </div>}
  </section>
}

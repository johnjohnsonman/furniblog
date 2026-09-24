import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChairFinder } from "@/components/home/chair-finder"
import { getHomePageData } from "@/lib/home/page-data"
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schemas"
import styles from "@/components/home/homepage.module.css"

export const dynamic = "force-dynamic"
const title = "Chairpedia | Chair Comparisons & Buying Guides"
const description = "Find your chair with Chairpedia. Explore chair models, compare documented features and read guides to generations, configurations and buying decisions."
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: "https://www.chairpedia.com/" },
  openGraph: { type: "website", title, description, url: "https://www.chairpedia.com/", images: [{ url: "/opengraph-image", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
}

function SectionHead({ title: heading, href, linkText = "View all" }: { title: string; href: string; linkText?: string }) {
  return <div className={styles.sectionHead}><h2>{heading}</h2><Link href={href}>{linkText} <ArrowRight size={15} aria-hidden="true" /></Link></div>
}

export default async function HomePage() {
  const data = await getHomePageData()
  const [feature, ...guides] = data.guides
  const topBrands = [...data.brands].sort((a,b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 7)
  const locations = [...data.locations].sort((a,b) => b.count - a.count).slice(0, 4)
  return <div className={styles.home}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([generateOrganizationSchema(), generateWebsiteSchema()]).replace(/</g, "\\u003c") }} />
    <Header />
    <main>
      <ChairFinder products={data.products} total={data.total} comparisons={data.comparisons} />
      <section className={styles.intro} aria-labelledby="research-title"><div className={styles.container}>
        <h2 id="research-title">Chairpedia: research before you buy</h2>
        <p>Get to know the chair behind the model name. We connect specifications to sources, distinguish generations and configurations, and keep regional differences in view. Where a detail is unknown, we leave it open for you to confirm.</p>
        <nav aria-label="Start your chair research" className={styles.researchLinks}><Link href="/products">Browse chairs</Link><Link href="/compare">Compare models</Link><Link href="/chairpedia">Read chair guides</Link><Link href="/reviews">Explore reviews</Link><Link href="/editorial-policy">How we research</Link><Link href="/about">About Chairpedia</Link></nav>
      </div></section>
      {locations.length > 0 && <section className={styles.stores} aria-labelledby="stores-title"><div className={styles.container}>
        <h2 id="stores-title">Try a chair near you</h2><p>Find a showroom, check the models on display and contact the store before travelling.</p>
        <div className={styles.locationGrid}>{locations.map(location => <div key={location.href}><Link href={location.href}><strong>{location.name}</strong><small>{location.count} stores</small></Link><div className={styles.cities}>{location.cities.map(city => <Link key={city.href} href={city.href}>{city.name}</Link>)}</div></div>)}</div>
        <nav aria-label="More showroom locations" className={styles.researchLinks}><Link href="/stores">Explore the showroom map</Link><Link href="/stores/locations">All countries and cities</Link></nav>
      </div></section>}
      {feature && <section className={styles.feature} aria-labelledby="feature-title"><div className={`${styles.container} ${styles.featureGrid}`}>
        <div className={styles.featureImage}><Image unoptimized src={feature.product.image} alt={feature.product.name} width={600} height={600} /></div>
        <div className={styles.featureCopy}><p className={styles.eyebrow}>From Chairpedia · A closer look</p><h2 id="feature-title">{feature.title}</h2><p>{feature.description}</p><Link href={`/chairpedia/${feature.slug}`} className={styles.primaryButton}>Read the guide <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </div></section>}
      {guides.length > 0 && <section className={styles.section}><div className={styles.container}>
        <SectionHead title="Explore chair guides" href="/chairpedia" />
        <div className={styles.guideGrid}>{guides.map(guide => <Link key={guide.slug} href={`/chairpedia/${guide.slug}`} className={styles.guideCard}><div className={styles.guideImage}><Image unoptimized src={guide.product.image} alt={guide.product.name} width={420} height={420} /></div><p className={styles.eyebrow}>{guide.product.brand}</p><h3>{guide.title}</h3><p>{guide.description}</p></Link>)}</div>
      </div></section>}
      {/* Reviews, videos and news need individually reviewed source and media provenance.
          No placeholders or unscreened random feeds are substituted for those sections. */}
      {data.buying.length > 0 && <section className={styles.section}><div className={styles.container}>
        <SectionHead title="Buying guides" href="/blog" /><div className={styles.buyingGrid}>{data.buying.map(guide => <Link key={guide.slug} href={`/blog/${guide.slug}`}>{guide.title}<ArrowRight size={18} aria-hidden="true" /></Link>)}</div>
      </div></section>}
      <section className={`${styles.section} ${styles.database}`}><div className={styles.container}>
        <SectionHead title="Browse the chair database" href="/products" linkText={`${data.total} chairs`} />
        <div className={styles.databaseGrid}>
          <div><h3>Categories</h3>{data.categories.map(category => <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`}>{category.name}<span>{category.count}</span></Link>)}</div>
          <div><h3>Research collections</h3><Link href="/compare">Model comparisons <ArrowRight size={14} aria-hidden="true" /></Link><Link href="/chairpedia">Chair guides <ArrowRight size={14} aria-hidden="true" /></Link><Link href="/blog">Buying and identification guides <ArrowRight size={14} aria-hidden="true" /></Link><Link href="/editorial-policy">How we research <ArrowRight size={14} aria-hidden="true" /></Link></div>
          <div><h3>Brands</h3>{topBrands.map(brand => <Link key={brand.slug} href={`/brands/${encodeURIComponent(brand.slug)}`}>{brand.name}<span>{brand.count}</span></Link>)}<Link href="/brands">All chair brands <ArrowRight size={14} aria-hidden="true" /></Link></div>
        </div>
      </div></section>
    </main><Footer />
  </div>
}

import NextImage, { type ImageProps } from "next/image"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChairFinder } from "@/components/home/chair-finder"
import { bestLists, brands } from "@/lib/data"
import { CHAIR_CATEGORIES, countByChairCategory } from "@/lib/chair-categories"
import { getProducts } from "@/lib/supabase/queries"
import { getHomeChairpedia, getLatestNews, getLatestReviews, getLatestVideos } from "@/lib/home/feeds"
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schemas"

export const dynamic = "force-dynamic"
export const metadata = { alternates: { canonical: "/" } }

const guides = [
  ["What a return actually costs", "/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon"],
  ["How to read an Amazon listing", "/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it"],
  ["Best chairs under $300", "/blog/best-office-chairs-under-300-verified-picks"],
  ["Aeron Classic vs Remastered", "/blog/herman-miller-aeron-classic-vs-remastered-identification-guide"],
  ["Used Leap: V1 vs V2", "/blog/used-steelcase-leap-buying-guide-v1-vs-v2-identification-and-inspection"],
  ["Will it fit my desk?", "/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance"],
] as const

const Image = (props: ImageProps) => <NextImage {...props} unoptimized />

function Head({ children, href }: { children: React.ReactNode; href: string }) {
  return <div className="mb-6 flex items-end justify-between"><h2 className="font-serif text-3xl sm:text-4xl">{children}</h2><Link href={href} className="flex items-center gap-1 text-xs font-bold text-[#3157e8]">View all <ArrowRight size={14} /></Link></div>
}

export default async function HomePage() {
  const [products, chairpedia, reviews, videos, news] = await Promise.all([getProducts(), getHomeChairpedia(4), getLatestReviews(3), getLatestVideos(5), getLatestNews(4)])
  const finderProducts = products.filter((p) => p.image).slice(0, 16).map((p) => ({ id: p.id, name: p.name, brand: p.brand, brandId: p.brandId, category: p.category, categoryLabel: p.categoryLabel, priceUsd: p.priceUsd, price: p.price, image: p.image, rating: p.rating, bestFor: p.bestFor }))
  const counts = countByChairCategory(products)
  return <div className="min-h-screen bg-white text-[#171717]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([generateOrganizationSchema(), generateWebsiteSchema()]) }} />
    <Header /><main><ChairFinder products={finderProducts} />

      {chairpedia[0] && <section className="border-b border-[#171717] bg-[#cdeff0]"><Link href={`/chairpedia/${chairpedia[0].slug}`} className="mx-auto grid max-w-7xl lg:grid-cols-[1.05fr_.95fr]"><div className="relative aspect-[16/10] overflow-hidden border-[#171717] lg:border-r"><Image src={chairpedia[0].heroImage} alt={chairpedia[0].title} fill sizes="(min-width:1024px) 55vw,100vw" className="object-cover transition-transform duration-700 hover:scale-[1.025]" /></div><div className="flex flex-col justify-center p-7 lg:p-12"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#17676b]">From Chairpedia</p><h2 className="mt-3 font-serif text-3xl sm:text-5xl">{chairpedia[0].title}</h2><p className="mt-4 max-w-xl text-sm leading-6">{chairpedia[0].excerpt}</p><span className="mt-6 flex items-center gap-2 text-sm font-bold">Read the deep dive <ArrowRight size={16} /></span></div></Link></section>}

      {chairpedia.length > 1 && <section className="border-b border-[#171717] py-14"><div className="mx-auto max-w-7xl px-5"><Head href="/chairpedia">Comparisons people decide with</Head><div className="grid gap-px border border-[#171717] bg-[#171717] sm:grid-cols-3">{chairpedia.slice(1,4).map((item) => <Link key={item.slug} href={`/chairpedia/${item.slug}`} className="group bg-white p-4"><div className="relative aspect-[16/9] overflow-hidden bg-[#eef2ff]"><Image src={item.heroImage} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" /></div><p className="mt-4 text-[10px] font-bold uppercase text-[#3157e8]">Chairpedia</p><h3 className="mt-1 font-serif text-xl">{item.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#666]">{item.excerpt}</p></Link>)}</div></div></section>}

      <section className="border-b border-[#171717] py-14"><div className="mx-auto max-w-7xl px-5"><Head href="/reviews">Latest reviews</Head><div className="grid gap-px border border-[#171717] bg-[#171717] md:grid-cols-3">{reviews.map((r, i) => <Link key={r.id} href={`/reviews/${r.id}`} className={`group p-5 ${i === 2 ? "bg-[#fff0c7]" : "bg-white"}`}><div className="relative aspect-[16/10] bg-[#eef2ff]">{r.productImage && <Image src={r.productImage} alt={r.productName} fill className="object-contain p-5 transition-transform duration-500 group-hover:scale-105" />}</div><p className="mt-4 text-[10px] font-bold uppercase text-[#3157e8]">{r.brandName || "Review"}</p><h3 className="mt-1 font-serif text-xl">{r.productName}</h3><p className="mt-2 line-clamp-3 text-sm leading-6">{r.summary}</p></Link>)}</div></div></section>

      <section className="border-b border-[#171717] py-14"><div className="mx-auto max-w-7xl px-5"><Head href="/blog">Buying guides</Head><div className="grid gap-px border border-[#171717] bg-[#171717] sm:grid-cols-2 lg:grid-cols-3">{guides.map(([title, href]) => <Link key={href} href={href} className="flex min-h-24 items-center justify-between bg-white p-5 font-semibold transition-colors hover:bg-[#fff0c7]">{title}<ArrowRight size={16} /></Link>)}</div></div></section>

      <section className="border-b border-[#171717] bg-[#171717] py-12 text-white"><div className="mx-auto max-w-7xl px-5"><Head href="/videos">New videos</Head><div className="flex snap-x gap-3 overflow-x-auto pb-2">{videos.map((v) => <a key={v.id} href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noopener noreferrer" className="group w-[260px] shrink-0 snap-start"><div className="relative aspect-video overflow-hidden bg-[#292929]">{v.thumbnailUrl && <Image src={v.thumbnailUrl} alt={v.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />}<span className="absolute bottom-3 left-3 bg-[#f0bf3a] p-2 text-black"><Play size={15} fill="currentColor" /></span></div><p className="mt-2 line-clamp-2 text-sm font-semibold">{v.title}</p></a>)}</div></div></section>

      <section className="border-b border-[#171717] bg-[#f5f1e8] py-14"><div className="mx-auto max-w-7xl px-5"><Head href="/products">Browse the chair database</Head><div className="grid gap-8 md:grid-cols-3"><div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider">Categories</h3>{CHAIR_CATEGORIES.filter((c) => counts[c.id]).slice(0,7).map((c) => <Link key={c.id} href={`/products?category=${c.id}`} className="flex justify-between border-b border-[#c8c1b5] py-2 text-sm"><span>{c.label}</span><span>{counts[c.id]}</span></Link>)}</div><div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider">Best lists</h3>{bestLists.slice(0,6).map((l) => <Link key={l.id} href={`/best/${l.id}`} className="block border-b border-[#c8c1b5] py-2 text-sm">{l.title}</Link>)}</div><div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider">Brands</h3>{brands.slice(0,7).map((b) => <Link key={b.id} href={`/brands/${b.id}`} className="block border-b border-[#c8c1b5] py-2 text-sm">{b.name}</Link>)}</div></div></div></section>

      {news.length > 0 && <section className="py-10"><div className="mx-auto max-w-7xl px-5"><h2 className="mb-3 text-xs font-bold uppercase tracking-wider">Latest news</h2>{news.map((n) => <Link key={n.id} href={`/news/${n.slug}`} className="flex items-center justify-between border-t border-[#ccc] py-3 text-sm hover:text-[#3157e8]"><span>{n.title}</span><ArrowRight size={14} /></Link>)}</div></section>}
    </main><Footer /></div>
}

import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { ChairpediaLanding, type ChairpediaCard } from "@/components/chairpedia/chairpedia-landing"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Chairpedia — The in-depth chair encyclopedia",
  description:
    "Deep, sourced editorial guides to the chairs worth knowing — design, technology, history and honest verdicts on premium office, ergonomic and gaming chairs.",
  alternates: { canonical: "/chairpedia" },
}

type ProductRef =
  | { name: string; category: string | null }
  | { name: string; category: string | null }[]
  | null

type Row = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  hero_image_url: string | null
  origin: string | null
  collections: string[] | null
  featured: boolean | null
  products: ProductRef
}

function prod(p: ProductRef) {
  if (!p) return null
  return Array.isArray(p) ? p[0] ?? null : p
}

async function getEntries(): Promise<ChairpediaCard[]> {
  try {
    const supabase = createPublicServerClient()
    const [{ data }, { data: brandRows }] = await Promise.all([
      supabase
        .from("chairpedia")
        .select(
          "slug,title,subtitle,excerpt,hero_image_url,origin,collections,featured,products(name,category)"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(500),
      supabase.from("brands").select("name"),
    ])

    // Longest-first so e.g. "Herman Miller" wins over a shorter accidental match.
    const brandNames = (((brandRows as { name: string }[]) ?? [])
      .map((b) => b.name)
      .filter(Boolean) as string[]).sort((a, b) => b.length - a.length)
    const brandFromTitle = (title: string): string | null => {
      const t = title.toLowerCase()
      return brandNames.find((n) => t.includes(n.toLowerCase())) ?? null
    }

    return ((data as Row[]) ?? []).map((r) => {
      const p = prod(r.products)
      return {
        slug: r.slug,
        title: r.title,
        subtitle: r.subtitle,
        excerpt: r.excerpt,
        heroImage: r.hero_image_url,
        origin: r.origin,
        collections: r.collections ?? [],
        featured: Boolean(r.featured),
        // Linked product name when available; otherwise fall back to a brand
        // detected in the title so every card always shows a label.
        brand: p?.name ?? brandFromTitle(r.title),
        category: p?.category ?? null,
      }
    })
  } catch {
    return []
  }
}

export default async function ChairpediaIndexPage() {
  const entries = await getEntries()
  // Editor-pool random: pick a featured entry server-side (force-dynamic = new each visit).
  const pool = entries.filter((e) => e.featured)
  const source = pool.length ? pool : entries
  const featuredSlug = source.length
    ? source[Math.floor(Math.random() * source.length)].slug
    : null

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <ChairpediaLanding entries={entries} featuredSlug={featuredSlug} />
      </main>
      <Footer />
    </div>
  )
}

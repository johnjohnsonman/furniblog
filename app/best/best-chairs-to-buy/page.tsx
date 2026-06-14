import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Check, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { AFFILIATE_LINKS_DATA } from "@/lib/data/affiliate-links"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Best Office & Gaming Chairs You Can Buy Online (2026)",
  description:
    "Our editor picks of ergonomic office and gaming chairs you can actually buy online today — budget to premium, from SIHOO and Steelcase to Razer. Specs, pros and where to buy.",
  alternates: { canonical: "/best/best-chairs-to-buy" },
  openGraph: {
    title: "Best Office & Gaming Chairs You Can Buy Online (2026)",
    description:
      "Ergonomic office and gaming chairs you can buy online today — budget to premium, with full specs and reviews.",
    url: "/best/best-chairs-to-buy",
  },
}

type GuideRow = {
  slug: string
  name: string
  category: string | null
  chair_type: string | null
  description_ko: string | null
  description_en: string | null
  best_for: string | null
  pros: string[] | null
  brands?: { name?: string | null } | { name?: string | null }[] | null
}

// Chairs that have a direct buy link in the catalog are the buyable picks.
function buyableSlugs(): string[] {
  return Object.entries(AFFILIATE_LINKS_DATA)
    .filter(([, links]) => links.some((l) => l.url.includes("/dp/")))
    .map(([slug]) => slug)
}

const CATEGORY_ORDER = ["office", "gaming", "executive", "standing", "study"]

function brandName(row: GuideRow): string {
  const b = Array.isArray(row.brands) ? row.brands[0] : row.brands
  return b?.name ?? ""
}

export default async function BestChairsToBuyPage() {
  const slugs = buyableSlugs()
  let rows: GuideRow[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && slugs.length > 0) {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("products")
      .select(
        "slug,name,category,chair_type,description_ko,description_en,best_for,pros,brands(name)"
      )
      .in("slug", slugs)
      .eq("published", true)
    rows = (data ?? []) as GuideRow[]
  }

  rows.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category ?? "")
    const cb = CATEGORY_ORDER.indexOf(b.category ?? "")
    if (ca !== cb) return (ca === -1 ? 99 : ca) - (cb === -1 ? 99 : cb)
    return a.name.localeCompare(b.name)
  })

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Office & Gaming Chairs You Can Buy Online",
    itemListElement: rows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `/products/${r.slug}`,
      name: r.name,
    })),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Header />

      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/best" className="hover:text-foreground transition-colors">Best Lists</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Chairs to buy online</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Buying guide
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium text-foreground lg:text-4xl">
            Best Office &amp; Gaming Chairs You Can Buy Online
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            Showroom icons like the Herman Miller Aeron are sold direct only.
            These are the ergonomic office and gaming chairs you can actually buy
            online today — chosen for real comfort-per-dollar, from budget mesh to
            name-brand picks. Tap any chair for full specs, reviews and where to buy.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {rows.length} chairs · updated {new Date().getFullYear()} · Furniblog may
            earn a commission from links, at no extra cost to you.
          </p>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-16">
          <ol className="space-y-4">
            {rows.map((row, i) => {
              const desc = row.description_en ?? row.description_ko ?? ""
              return (
                <li
                  key={row.slug}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                          {brandName(row)}
                        </span>
                        {row.chair_type && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {row.chair_type}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2 font-serif text-xl font-medium text-foreground">
                        <Link href={`/products/${row.slug}`} className="hover:underline">
                          {row.name}
                        </Link>
                      </h2>
                      {row.best_for && (
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {row.best_for}
                        </p>
                      )}
                      {desc && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {desc}
                        </p>
                      )}
                      {row.pros && row.pros.length > 0 && (
                        <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
                          {row.pros.slice(0, 3).map((pro) => (
                            <li key={pro} className="flex gap-1.5 text-xs text-foreground">
                              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4">
                        <Link
                          href={`/products/${row.slug}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                        >
                          View chair &amp; price
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>

          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Our picks are being updated — check back shortly.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

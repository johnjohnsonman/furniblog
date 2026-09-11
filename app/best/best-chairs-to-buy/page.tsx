import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight, Check, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { AFFILIATE_LINKS_DATA } from "@/lib/data/affiliate-links-data"
import { amazonListingSlugs } from "@/lib/best/amazon-listings"
import { resolveAmazonAffiliateLink } from "@/lib/affiliate/resolve-amazon-link"
import { SmartBuyLink } from "@/components/affiliate/SmartBuyLink"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Office & Gaming Chairs: Amazon Listings",
  description:
    "Compare office and gaming chairs with Amazon listing links. Check product details, seller, condition, delivery and return terms before buying.",
  alternates: { canonical: "/best/best-chairs-to-buy" },
  openGraph: {
    title: "Office & Gaming Chairs: Amazon Listings",
    description:
      "Explore office and gaming chair listing links, product details and purchase checks. Current stock and prices are not verified.",
    url: "/best/best-chairs-to-buy",
  },
}

type GuideRow = {
  slug: string
  name: string
  thumbnail_url: string | null
  category: string | null
  chair_type: string | null
  description_ko: string | null
  description_en: string | null
  best_for: string | null
  pros: string[] | null
  brands?: { name?: string | null } | { name?: string | null }[] | null
}

const CATEGORY_ORDER = ["office", "gaming", "executive", "standing", "study"]

function brandName(row: GuideRow): string {
  const b = Array.isArray(row.brands) ? row.brands[0] : row.brands
  return b?.name ?? ""
}

export default async function BestChairsToBuyPage() {
  const slugs = amazonListingSlugs(AFFILIATE_LINKS_DATA)
  let rows: GuideRow[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && slugs.length > 0) {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("products")
      .select(
        "slug,name,thumbnail_url,category,chair_type,description_ko,description_en,best_for,pros,brands(name)"
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
    name: "Office & Gaming Chairs: Amazon Listings",
    itemListElement: rows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.furniblog.com/products/${r.slug}`,
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
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
            Office &amp; Gaming Chairs: Amazon Listings
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">
            These published catalog chairs have Amazon.com listing links. A link does not confirm
            stock, current price or seller authorization. Check the model, condition, delivery,
            warranty and return terms on Amazon. Chairs are grouped by category, then name, not test score.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {rows.length} chairs. As an Amazon Associate, Furniblog earns from qualifying purchases.
          </p>

          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Before you buy
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              <li>
                <a href="/blog/how-to-read-an-amazon-office-chair-listing-before-you-trust-it" className="underline underline-offset-4">
                  How to read an Amazon chair listing
                </a>{" "}
                — seller types, capacity claims and what a BIFMA badge does (and doesn&apos;t) mean.
              </li>
              <li>
                <a href="/blog/office-chair-return-policies-and-warranties-compared-herman-miller-steelcase-amazon" className="underline underline-offset-4">
                  What returning a chair actually costs
                </a>{" "}
                — Amazon vs the Herman Miller and Steelcase stores, from the official policy pages.
              </li>
              <li>
                <a href="/blog/office-chair-desk-fit-guide-seat-height-and-armrest-clearance" className="underline underline-offset-4">
                  Will it fit your desk?
                </a>{" "}
                — documented seat-height ranges and the three measurements that decide fit.
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 pb-16">
          <ol className="space-y-4">
            {rows.map((row, i) => {
              const desc = row.description_en ?? row.description_ko ?? ""
              return (
                <li
                  key={row.slug}
                  data-buying-product={row.slug}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {row.thumbnail_url && <div className="h-36 w-36 shrink-0 self-center overflow-hidden rounded-lg bg-muted sm:self-start">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={row.thumbnail_url} alt={row.name} loading="lazy" className="h-full w-full object-contain p-2" />
                    </div>}
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
                      <div className="mt-4 flex flex-wrap items-start gap-3">
                        <SmartBuyLink name={row.name} productId={row.slug} amazonUrl={resolveAmazonAffiliateLink(row.slug, row.name).url} variant="inline" />
                        <Link
                          href={`/products/${row.slug}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                        >
                          Product details
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

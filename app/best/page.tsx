import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getBestListCards } from "@/lib/best/resolve"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Office Chair Buying Guides",
  description:
    "Compare office chair shortlists by budget and intended use. Explore product details and purchase options before choosing a chair.",
  alternates: { canonical: "/best" },
}

export default async function BestListsPage() {
  const lists = await getBestListCards()
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">Best Lists</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mx-auto max-w-5xl px-4 py-10">
          <h1 className="font-serif text-3xl font-medium text-foreground lg:text-4xl">Office Chair Buying Guides</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
            Compare chair options by budget and intended use. Check dimensions, available adjustments and seller terms before choosing.
          </p>
        </div>

        {/* Lists */}
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <Link
            href="/best/best-chairs-to-buy"
            className="mb-4 block rounded-xl border border-foreground/15 bg-card p-6 transition-all hover:border-foreground/30"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Online purchase options
            </span>
            <h2 className="mt-1 font-serif text-xl font-medium text-foreground">
              Office &amp; Gaming Chairs: Amazon Listings
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore chairs with Amazon listing links in our catalog. Availability and current prices vary by seller.
            </p>
          </Link>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <Link
                key={list.slug}
                href={`/best/${list.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              >
                {list.heroImage ? (
                  <div className="aspect-[16/9] overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={list.heroImage}
                      alt={list.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-serif text-lg font-medium text-foreground">{list.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{list.count} chairs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

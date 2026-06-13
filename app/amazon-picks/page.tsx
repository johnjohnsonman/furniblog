import type { Metadata } from "next"
import { Check } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BuyButton } from "@/components/affiliate/BuyButton"
import { AdSlot } from "@/components/common/AdSlot"
import { AMAZON_PICKS } from "@/lib/data/amazon-picks"

export const metadata: Metadata = {
  title: "Best Office Chairs on Amazon (2026) — Tested Picks",
  description:
    "The best office and ergonomic chairs you can actually buy on Amazon right now — budget to premium, with direct links. SIHOO, Steelcase Series 1, Flexispot, Nouhaus and more.",
  alternates: { canonical: "/amazon-picks" },
  openGraph: {
    title: "Best Office Chairs on Amazon (2026)",
    description:
      "Budget to premium office & ergonomic chairs you can buy on Amazon today, with direct links.",
    url: "/amazon-picks",
  },
}

function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}`
}

export default function AmazonPicksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Buyer&apos;s guide
          </p>
          <h1 className="mt-1 font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Best Office Chairs on Amazon
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Famous chairs like the Herman Miller Aeron are sold direct — not on
            Amazon. These are the office &amp; ergonomic chairs you can actually{" "}
            <strong className="text-foreground">buy on Amazon today</strong>, from
            budget to premium, each chosen for real comfort-per-dollar.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            As an Amazon Associate, Furniblog earns from qualifying purchases.
            Prices and availability change — tap through to check the latest.
          </p>
        </header>

        <ol className="space-y-5">
          {AMAZON_PICKS.map((pick, i) => (
            <li
              key={pick.asin}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {i + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                      {pick.brand}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {pick.tier}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {pick.category}
                    </span>
                  </div>

                  <h2 className="mt-2 font-serif text-xl font-medium text-foreground">
                    {pick.name}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {pick.bestFor}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {pick.blurb}
                  </p>

                  <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
                    {pick.pros.map((pro) => (
                      <li
                        key={pro}
                        className="flex gap-1.5 text-xs text-foreground"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                        {pro}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4">
                    <BuyButton
                      productId={pick.asin}
                      baseUrl={amazonUrl(pick.asin)}
                      retailer="amazon"
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="my-10">
          <AdSlot position="in-content" />
        </div>

        <section className="rounded-xl border border-border bg-muted/30 p-5">
          <h2 className="font-serif text-lg font-medium text-foreground">
            How we pick
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We prioritise chairs with genuine ergonomic adjustability (real
            lumbar support, multi-direction armrests, recline control), strong
            owner feedback across sources, and availability on Amazon so you can
            buy and return easily. We update this list as models change.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  )
}

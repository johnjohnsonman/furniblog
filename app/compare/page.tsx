import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { getComparisonCards } from "@/lib/comparisons/resolve"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Chair Comparisons — Head-to-Head Matchups",
  description:
    "Side-by-side office chair comparisons — real specs and reviews to help you pick between two chairs.",
  alternates: { canonical: "/compare" },
}

export default async function CompareIndexPage() {
  const supabase = createPublicServerClient()
  const cards = await getComparisonCards(supabase)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="font-serif text-3xl font-medium text-foreground">Comparisons</h1>
            <p className="mt-1 text-muted-foreground">
              Head-to-head matchups — real specs and reviews to settle &ldquo;A vs B&rdquo;.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12">
          {cards.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No comparisons yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-[0_10px_34px_rgba(0,0,0,0.07)]"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                    {c.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.hero_image_url}
                        alt={c.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Furniblog
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {c.tier && (
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-premium-accent">
                        {c.tier}
                      </span>
                    )}
                    <h2 className="mt-1.5 font-serif text-xl font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
                      {c.title}
                    </h2>
                    {(c.excerpt || c.subtitle) && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {c.excerpt || c.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { getComparisonCards } from "@/lib/comparisons/resolve"
import { ComparisonsIndex } from "@/components/compare/comparisons-index"

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
          <ComparisonsIndex cards={cards} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

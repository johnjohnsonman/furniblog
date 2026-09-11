import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { getComparisonCards } from "@/lib/comparisons/resolve"
import { orderComparisonCards } from "@/lib/comparisons/editorial-order"
import { ComparisonsIndex } from "@/components/compare/comparisons-index"

export const dynamic = "force-dynamic"

const metadata: Metadata = {
  title: "Chair Comparisons — Head-to-Head Matchups",
  description:
    "Side-by-side office chair comparisons — real specs and reviews to help you pick between two chairs.",
  alternates: { canonical: "/compare" },
}

type Props = { searchParams: Promise<{ page?: string | string[] }> }

function readPage(value: string | string[] | undefined) {
  if (value === undefined) return 1
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) notFound()
  const page = Number(value)
  if (!Number.isSafeInteger(page)) notFound()
  return page
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = readPage((await searchParams).page)
  return {
    ...metadata,
    title: page === 1 ? metadata.title : `Chair Comparisons - Page ${page}`,
    alternates: { canonical: page === 1 ? "/compare" : `/compare?page=${page}` },
  }
}

export default async function CompareIndexPage({ searchParams }: Props) {
  const page = readPage((await searchParams).page)
  const supabase = createPublicServerClient()
  const cards = orderComparisonCards(await getComparisonCards(supabase))
  if (page > Math.max(1, Math.ceil(cards.length / 12))) notFound()

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
          <ComparisonsIndex key={page} cards={cards} initialPage={page} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

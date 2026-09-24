import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { getComparisonCards } from "@/lib/comparisons/resolve"
import { orderComparisonCards } from "@/lib/comparisons/editorial-order"
import { ComparisonsIndex } from "@/components/compare/comparisons-index"
import { getVerifiedComparisonPilot } from "@/lib/comparisons/verified-pilots"

export const dynamic = "force-dynamic"

const metadata: Metadata = {
  title: "Chair Comparisons — Head-to-Head Matchups",
  description:
    "Source-linked chair comparisons and model records. Review status is shown before you open each comparison.",
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
  const cards = orderComparisonCards(await getComparisonCards(supabase)).map(card => {
    const pilot = getVerifiedComparisonPilot(card.slug)
    return { ...card, title: pilot?.title ?? card.title, excerpt: pilot?.description ?? (card.requiresSourceReview ? "Source review pending. Product records remain available; this page is not a completed source-linked comparison." : "Read the comparison and check its cited sources and exact configuration before deciding."), subtitle: null, reviewed: Boolean(pilot) }
  }).sort((a, b) => Number(b.reviewed) - Number(a.reviewed) || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
  if (page > Math.max(1, Math.ceil(cards.length / 12))) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="font-serif text-3xl font-medium text-foreground">Comparisons</h1>
            <p className="mt-1 text-muted-foreground">
              Compare documented fit systems and configuration choices. Source-linked comparisons appear first; other records are marked for source review.
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

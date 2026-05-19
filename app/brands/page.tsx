import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BrandsPageClient } from "@/components/brands/brands-page-client"
import { getBrandsWithCounts } from "@/lib/supabase/queries"

export const dynamic = "force-dynamic"

type BrandsPageProps = {
  searchParams: Promise<{ search?: string; country?: string }>
}

function BrandsPageFallback() {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-10 max-w-xl animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  )
}

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const params = await searchParams
  const brands = await getBrandsWithCounts()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<BrandsPageFallback />}>
          <BrandsPageClient
            brands={brands}
            initialSearch={params.search ?? ""}
            initialCountry={params.country ?? "all"}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

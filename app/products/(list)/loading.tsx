import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChairCardSkeleton } from "@/components/chairs/ChairCardSkeleton"

export default function ProductsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <section className="border-b border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12 md:py-14 space-y-4">
            <div className="h-10 w-2/3 max-w-lg animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-1/2 max-w-md animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
          </div>
        </section>

        <section className="border-b border-[#E5E5E5] bg-white">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-20 animate-pulse rounded-full bg-gray-100"
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChairCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

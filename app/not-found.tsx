import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Next.js already adds <meta name="robots" content="noindex"> to 404 responses.
// Clear the layout's default "index, follow" so that is the only robots tag.
export const metadata: Metadata = {
  title: "Page not found",
  robots: null,
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-20">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">404</p>
        <h1 className="mt-4 font-serif text-4xl">This page could not be found.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">The link may be out of date or mistyped.</p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/products" className="border border-[#171717] px-4 py-2 hover:bg-[#f5f1e8]">Browse chairs</Link>
          <Link href="/chairpedia" className="border border-[#171717] px-4 py-2 hover:bg-[#f5f1e8]">Chair guides</Link>
          <Link href="/compare" className="border border-[#171717] px-4 py-2 hover:bg-[#f5f1e8]">Comparisons</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

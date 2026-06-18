import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Chairpedia — In-depth chair encyclopedia",
  description:
    "Deep, sourced editorial guides to premium office, ergonomic and gaming chairs — design, technology, history and honest verdicts.",
  alternates: { canonical: "/chairpedia" },
}

type Card = {
  slug: string
  title: string
  subtitle: string | null
  hero_image_url: string | null
  excerpt: string | null
}

async function getEntries(): Promise<Card[]> {
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("chairpedia")
      .select("slug,title,subtitle,hero_image_url,excerpt")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(200)
    return (data as Card[]) ?? []
  } catch {
    return []
  }
}

export default async function ChairpediaIndexPage() {
  const entries = await getEntries()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12">
        <header className="mb-10 max-w-2xl">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Chairpedia
          </h1>
          <p className="mt-3 text-muted-foreground">
            In-depth, sourced guides to the chairs worth knowing — design, technology, history and honest verdicts.
          </p>
        </header>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center">
            New entries are on the way.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((e) => (
              <Link
                key={e.slug}
                href={`/chairpedia/${e.slug}`}
                className="group rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {e.hero_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.hero_image_url}
                      alt={e.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-medium text-foreground leading-snug">{e.title}</h2>
                  {(e.subtitle || e.excerpt) && (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {e.subtitle || e.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog — Chair Guides, Tips & Stories | Furniblog",
  description:
    "Guides, comparisons and stories about office, ergonomic and design chairs — from the Furniblog team.",
  alternates: { canonical: "/blog" },
}

type Row = {
  slug: string
  title: string
  subtitle: string | null
  excerpt: string | null
  hero_image_url: string | null
  published_at: string | null
  featured: boolean | null
}

async function getPosts(): Promise<Row[]> {
  try {
    const supabase = createPublicServerClient()
    const { data } = await supabase
      .from("blog_posts")
      .select("slug,title,subtitle,excerpt,hero_image_url,published_at,featured")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200)
    return (data as Row[] | null) ?? []
  } catch {
    return []
  }
}

export default async function BlogIndexPage() {
  const posts = await getPosts()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl px-4 py-10">
            <h1 className="font-serif text-3xl font-medium text-foreground">Blog</h1>
            <p className="mt-1 text-muted-foreground">
              Guides, comparisons and stories about chairs.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
                    {p.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.hero_image_url}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Furniblog
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-serif text-xl font-medium leading-snug text-foreground group-hover:text-foreground/80">
                      {p.title}
                    </h2>
                    {(p.excerpt || p.subtitle) && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {p.excerpt || p.subtitle}
                      </p>
                    )}
                    {p.published_at && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {new Date(p.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
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

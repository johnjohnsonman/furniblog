import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createPublicServerClient } from "@/lib/supabase/public-server"
import { BlogIndex, type BlogCard } from "@/components/blog/blog-index"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog — Chair Guides, Tips & Stories | Furniblog",
  description:
    "Guides, comparisons and stories about office, ergonomic and design chairs — from the Furniblog team.",
  alternates: { canonical: "/blog" },
}

const BASE_COLS = "slug,title,subtitle,excerpt,hero_image_url,published_at,featured"

async function getPosts(): Promise<BlogCard[]> {
  const supabase = createPublicServerClient()
  // Try with category; fall back without it if migration 036 hasn't run yet.
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select(`${BASE_COLS},category`)
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(200)
    if (error) throw error
    return (data as BlogCard[] | null) ?? []
  } catch {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select(BASE_COLS)
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(200)
      return ((data as Omit<BlogCard, "category">[] | null) ?? []).map((p) => ({
        ...p,
        category: null,
      }))
    } catch {
      return []
    }
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

        <div className="mx-auto max-w-6xl px-4 py-12">
          <BlogIndex posts={posts} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

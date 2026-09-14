import { enrichBlogPosts } from "@/lib/blog/media-server"
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

type PostWithBody = BlogCard & { content_html: string }

const BASE_COLS = "content_html,slug,title,subtitle,excerpt,hero_image_url,published_at,featured"

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
    return enrichBlogPosts((data as PostWithBody[] | null) ?? [])
  } catch {
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select(BASE_COLS)
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(200)
      return enrichBlogPosts(((data as Omit<PostWithBody, "category">[] | null) ?? []).map((p) => ({
        ...p,
        category: null,
      })))
    } catch {
      return []
    }
  }
}

// Published A-vs-B comparisons (separate `comparisons` table) surfaced in the
// blog under the "Comparisons" category — cards link out to /compare/[slug].
async function getComparisonCardsAsBlog(): Promise<BlogCard[]> {
  const supabase = createPublicServerClient()
  try {
    const { data, error } = await supabase
      .from("comparisons")
      .select("slug,title,subtitle,excerpt,hero_image_url,published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(100)
    if (error) throw error
    return ((data as Array<Omit<BlogCard, "featured" | "category" | "href">> | null) ?? []).map(
      (c) => ({
        ...c,
        featured: false, // don't let comparisons dominate the rotating hero
        category: "Comparisons",
        href: `/compare/${c.slug}`,
      })
    )
  } catch {
    return []
  }
}

export default async function BlogIndexPage() {
  const [blogPosts, comparisonCards] = await Promise.all([
    getPosts(),
    getComparisonCardsAsBlog(),
  ])

  // Merge, then sort featured-first and newest-first so comparisons interleave
  // by date with regular posts (matching getPosts' ordering).
  const posts = [...blogPosts, ...comparisonCards].sort((a, b) => {
    const fa = a.featured ? 1 : 0
    const fb = b.featured ? 1 : 0
    if (fa !== fb) return fb - fa
    const ta = a.published_at ? new Date(a.published_at).getTime() : 0
    const tb = b.published_at ? new Date(b.published_at).getTime() : 0
    return tb - ta
  })

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="font-serif text-3xl font-medium text-foreground">Blog</h1>
            <p className="mt-1 text-muted-foreground">
              Guides, comparisons and stories about chairs.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-12">
          <BlogIndex posts={posts.map(post => ({
            slug: post.slug, title: post.title, subtitle: post.subtitle,
            excerpt: post.excerpt, hero_image_url: post.hero_image_url,
            published_at: post.published_at, featured: post.featured,
            category: post.category, href: post.href,
          }))} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

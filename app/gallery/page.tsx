import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import {
  GalleryPageClient,
  type GalleryImage,
} from "@/components/gallery/gallery-page-client"
import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

// Don't let Google index an empty gallery (it would be flagged Soft 404). Once
// images exist the page becomes indexable automatically.
export async function generateMetadata(): Promise<Metadata> {
  const hasImages = (await getInitialGallery()).length > 0
  return {
    title: "Chair Gallery",
    description: "Beautiful spaces featuring premium seating",
    alternates: { canonical: "/gallery" },
    robots: hasImages ? undefined : { index: false, follow: true },
  }
}

type GalleryRow = {
  id: string
  url: string
  caption: string | null
  category: string
  width: number | null
  height: number | null
  products: { slug: string; name: string } | { slug: string; name: string }[] | null
}

// Server-render the first gallery page so crawlers (and users) see images
// immediately — the grid used to load only client-side, which left an empty
// shell for Googlebot (Soft 404 risk).
async function getInitialGallery(): Promise<GalleryImage[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("gallery_images")
      .select(
        "id, url, caption, category, width, height, sort_order, products(slug, name)"
      )
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range(0, 59)

    if (error || !data) return []

    return (data as GalleryRow[]).map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products
      return {
        id: row.id,
        url: row.url,
        caption: row.caption,
        category: row.category,
        width: row.width,
        height: row.height,
        product: product ? { slug: product.slug, name: product.name } : null,
      }
    })
  } catch {
    return []
  }
}

export default async function GalleryPage() {
  const initialImages = await getInitialGallery()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-12">
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground tracking-tight">
            Chair Gallery
          </h1>
          <p className="mt-3 text-muted-foreground">
            Beautiful spaces featuring premium seating
          </p>
        </header>
        <GalleryPageClient initialImages={initialImages} />
      </main>
      <Footer />
    </div>
  )
}

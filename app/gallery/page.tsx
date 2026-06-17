import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GalleryPageClient } from "@/components/gallery/gallery-page-client"

export const metadata = {
  title: "Chair Gallery",
  description: "Beautiful spaces featuring premium seating",
}

export default function GalleryPage() {
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
        <GalleryPageClient />
      </main>
      <Footer />
    </div>
  )
}

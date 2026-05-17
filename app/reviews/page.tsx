import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReviewsFeed } from "@/components/reviews/reviews-feed"
import { getFeedReviews } from "@/lib/data/reviews"

export const metadata = {
  title: "Review Feed | Furniblog",
  description:
    "Find chair reviews from people like you—filter by height, weight, occupation, sitting hours, and back health across global sources.",
}

export default function ReviewsPage() {
  const reviews = getFeedReviews()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ReviewsFeed reviews={reviews} />
      </main>
      <Footer />
    </div>
  )
}

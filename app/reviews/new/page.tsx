import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ExperienceReviewWizard } from "@/components/reviews/experience-review-wizard"

export const metadata = {
  title: "Write a Review | Furniblog",
  description:
    "Share your hands-on chair ranking — anonymous, based on your own experience.",
}

export default function ExperienceReviewNewPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            Write a Review
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Share your hands-on chair ranking — anonymous, based on your own experience.
          </p>
        </div>
        <ExperienceReviewWizard />
      </main>
      <Footer />
    </div>
  )
}
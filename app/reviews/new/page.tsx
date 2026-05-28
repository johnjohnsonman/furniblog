import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ExperienceReviewWizard } from "@/components/reviews/experience-review-wizard"

export const metadata = {
  title: "체험 후기 작성 | Furniblog",
  description: "의자 체험 후기를 간단한 위저드로 작성하고 제출하세요.",
}

export default function ExperienceReviewNewPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
            체험 후기 작성
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            익명 기준 정보를 바탕으로 의자 체험 순위를 남겨주세요.
          </p>
        </div>
        <ExperienceReviewWizard />
      </main>
      <Footer />
    </div>
  )
}

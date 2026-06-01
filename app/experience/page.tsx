import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoreExperienceWizard } from "@/components/experience/store-experience-wizard"

export const metadata = {
  title: "체어파크 체험 후기 | Furniblog",
  description:
    "체어파크 매장에서 직접 앉아본 의자, 어떠셨나요? 1분이면 끝나는 간단한 후기를 남겨주세요.",
}

export const dynamic = "force-dynamic"

export default function ExperiencePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <StoreExperienceWizard />
      </main>
      <Footer />
    </div>
  )
}

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoreExperienceWizard } from "@/components/experience/store-experience-wizard"

export const metadata = {
  alternates: { canonical: "/experience" },
  title: "Share your chair experience",
  description:
    "Tried a chair at a showroom? Share your experience to help other shoppers.",
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

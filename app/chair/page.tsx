import type { Metadata } from "next"
import { Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChairAI } from "@/components/chair-ai/chair-ai"

export const metadata: Metadata = {
  title: "chA.I.r — AI Chair Finder | Furniblog",
  description:
    "Describe how you sit, your budget, your body and the look you want — chA.I.r, Furniblog's AI chair advisor, matches you to the right office, ergonomic or design chair from a catalog of 180+ models.",
  alternates: { canonical: "/chair" },
  openGraph: {
    title: "chA.I.r — AI Chair Finder",
    description:
      "Tell chA.I.r what you need in plain words and get matched to the right chairs, with a reason for each pick.",
    url: "/chair",
    type: "website",
  },
}

const FAQ = [
  {
    q: "How does chA.I.r work?",
    a: "You describe what you need in your own words — budget, how many hours you sit, any back pain, your height, the style you like. chA.I.r reads Furniblog's catalog of 180+ chairs and recommends the best matches, with a short reason for each pick.",
  },
  {
    q: "Is chA.I.r free?",
    a: "Yes. chA.I.r is a free tool. When you buy through some of our links we may earn a commission at no extra cost to you.",
  },
  {
    q: "Does chA.I.r only recommend chairs you sell?",
    a: "chA.I.r recommends from Furniblog's reviewed catalog of office, ergonomic, gaming, executive and design chairs. It won't invent models — every suggestion links to a real chair you can research further.",
  },
]

export default function ChairAIPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="flex min-h-screen flex-col bg-premium-bg">
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-12 pb-6 text-center sm:pt-16">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-premium-border bg-white px-3 py-1 text-xs font-medium text-premium-text-secondary">
            <Sparkles className="h-3.5 w-3.5 text-premium-accent" />
            AI chair finder
          </div>
          <h1 className="font-serif text-3xl font-medium leading-tight text-premium-text sm:text-[42px] sm:leading-[1.12]">
            Tell me how you sit.
            <br />
            I&apos;ll find your chair.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-premium-text-secondary">
            Describe your needs in plain words — budget, hours, back pain, height,
            style. <span className="font-medium text-premium-text">chA.I.r</span>{" "}
            matches you to the right seat from 180+ reviewed chairs, and tells you
            why each one fits.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16">
          <ChairAI />
        </section>

        {/* SEO / FAQ */}
        <section className="border-t border-premium-border bg-white">
          <div className="mx-auto max-w-3xl px-4 py-12">
            <h2 className="font-serif text-2xl font-medium text-premium-text">
              About chA.I.r
            </h2>
            <div className="mt-6 space-y-6">
              {FAQ.map((f) => (
                <div key={f.q}>
                  <h3 className="font-medium text-premium-text">{f.q}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-premium-text-secondary">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  )
}

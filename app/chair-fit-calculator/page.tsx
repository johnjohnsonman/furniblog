import type { Metadata } from "next"
import Link from "next/link"
import { ChairFinderShell } from "@/components/chair-fit/chair-finder-shell"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.chairpedia.com"
const PAGE_PATH = "/chair-fit-calculator"

const faq = [
  {
    question: "What does the Chairpedia Fit Score mean?",
    answer:
      "Fit Score is a 0–100 evidence index comparing your entered requirements with published chair dimensions. It is not a probability, medical assessment, or comfort guarantee.",
  },
  {
    question: "Which chair measurements does the calculator use?",
    answer:
      "The calculator checks published seat-height and seat-depth ranges, weight capacity when weight is entered, and floor-to-armrest clearance when desk clearance is requested. Missing measurements remain marked as unknown.",
  },
  {
    question: "Does a high Fit Score guarantee that a chair will be comfortable?",
    answer:
      "No. Dimensions can rule out likely conflicts, but cushion feel, mesh tension, recline behavior, and personal preference still require an in-person trial when possible.",
  },
  {
    question: "How does Chairpedia choose recommended chairs?",
    answer:
      "Chairpedia compares the same personal ranges against every fit-ready catalog record, keeps missing data visible, and assigns independent awards such as Best Overall Fit or Best Value only when the available evidence supports them.",
  },
]

export const metadata: Metadata = {
  title: "Chair Finder: Compare Fit & Discover Your Chair",
  description: "Compare your body and desk measurements with published chair dimensions. See an explainable Fit Score, missing data, trade-offs, and verified places to try matching chairs.",
  alternates: { canonical: PAGE_PATH },
  keywords: [
    "chair fit calculator",
    "office chair size calculator",
    "seat height calculator",
    "chair seat depth",
    "desk armrest clearance",
    "ergonomic chair fit",
  ],
  openGraph: {
    title: "Chair Finder | Chairpedia",
    description: "Measurement-backed chair matches with transparent evidence, unknowns, and showroom paths.",
    url: PAGE_PATH,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chair Finder | Chairpedia",
    description: "Compare your measurements with published chair dimensions and see why each chair is recommended.",
  },
  robots: { index: true, follow: true },
}

export default async function ChairFitCalculatorPage({ searchParams }: { searchParams: Promise<{ mode?: string; q?: string }> }) {
  const { mode, q } = await searchParams
  const pageUrl = `${SITE_URL}${PAGE_PATH}`
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: "Chair Fit Calculator",
        description:
          "Compare body and desk requirements with published office-chair dimensions and inspect the evidence behind each result.",
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${pageUrl}#calculator` },
      },
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#calculator`,
        name: "Chairpedia Chair Fit Calculator",
        url: pageUrl,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        description:
          "A measurement-backed chair fit calculator using published seat height, seat depth, capacity, and desk-clearance data.",
        provider: { "@type": "Organization", name: "Chairpedia", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Chairpedia", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Chair Fit Calculator", item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#292723]">
      <Header />
      <ChairFinderShell initialMode={mode} initialQuery={q}>
      <section className="border-y border-[#aaa397] bg-[#eee9df]" aria-labelledby="fit-reference-title">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#244f73]">Reference notes</p>
            <h2 id="fit-reference-title" className="mt-3 font-serif text-3xl text-[#1f1d19]">How to read your chair-fit results</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#575249]">
              Chairpedia uses published dimensions to identify likely fit conflicts. It keeps product facts, editorial judgment, and unknown values separate.
            </p>
            <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#244f73]" aria-label="Chair fit reference links">
              <Link href="/editorial-policy" className="underline underline-offset-4">Editorial policy</Link>
              <Link href="/chairpedia" className="underline underline-offset-4">Chair reference library</Link>
              <Link href="/stores" className="underline underline-offset-4">Verified showroom finder</Link>
            </nav>
          </div>
          <div className="divide-y divide-[#bdb6aa] border-y border-[#bdb6aa]">
            {faq.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 font-semibold text-[#292723] marker:content-none">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#575249]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Footer />
      </ChairFinderShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "About Furniblog — Two Generations of Chairs",
  description:
    "Furniblog is built on a lifetime in chairs — a family furniture business since 2001 and more than two decades sitting in, selling and studying the world's seating. Independent reviews, real specs, honest comparisons.",
  alternates: { canonical: "/about" },
}

const STATS = [
  { value: "2001", label: "In the trade since" },
  { value: "26 years", label: "Selling & studying chairs" },
  { value: "70+", label: "Brands tracked" },
  { value: "1,300+", label: "Reviews gathered" },
]

// Refined section heading with the hairline divider motif used across the site.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-14">
      <div className="mb-5 h-px w-full bg-border" />
      <h2 className="font-serif text-2xl font-medium text-foreground">
        {children}
      </h2>
    </div>
  )
}

export default function AboutPage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Furniblog",
    url: "https://www.furniblog.com",
    description:
      "An independent database of premium office, ergonomic and design chairs — real specs, global reviews and honest comparisons, built on a family furniture business and more than two decades of hands-on chair experience.",
    founder: {
      "@type": "Person",
      description:
        "Second-generation furniture specialist who has spent 26 years (since 2001) selling, sourcing and studying chairs, and has personally sat in tens of thousands of models.",
    },
    knowsAbout: [
      "Office chairs",
      "Ergonomic seating",
      "Designer furniture",
      "Chair reviews",
    ],
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">About</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              About Furniblog
            </p>
            <h1 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground sm:text-[42px] sm:leading-[1.15]">
              One family. One object.
              <br />A quarter-century of chairs.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              I was raised inside a furniture business my father built. For as
              long as I can remember, our family has studied a single object,
              obsessively — the chair. Over 26 years in the trade I have sat in
              more of them than almost anyone alive. Furniblog is where that
              experience becomes something you can use.
            </p>
          </div>
        </section>

        {/* Stat band */}
        <section className="border-b border-border">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden px-4 py-10 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-2 text-center">
                <div className="font-serif text-2xl font-medium text-foreground sm:text-3xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Body */}
        <div className="mx-auto max-w-3xl px-4 py-12">
          <SectionHeading>Where this began</SectionHeading>
          <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-muted-foreground">
            <p>
              It started with my father. He spent his life on furniture, and on
              one piece of it above all others. I grew up inside that workshop
              and that obsession — learning that a chair is not a commodity but a
              quiet machine the body lives in for thousands of hours a year.
            </p>
            <p>
              In 2001 I began my own chapter in the same trade, here in Korea.
              Twenty-six years later I have sourced, sold and lived with
              countless models — from mass-market task chairs to the icons of
              Herman Miller, Knoll, Vitra, Poltrona Frau and the great Japanese
              and European houses. Two generations, one subject.
            </p>
          </div>

          <SectionHeading>What 26 years teaches you</SectionHeading>
          <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-muted-foreground">
            <p>
              A spec sheet can tell you a backrest reclines. It cannot tell you
              whether that recline still holds you at hour nine, whether the mesh
              softens after a year, or whether a chair that dazzles in a showroom
              quietly punishes your lower back by Friday.
            </p>
            <p>
              You only learn those things by sitting — in hundreds of chairs,
              across decades, paying attention. That tacit knowledge, built over
              a career and inherited across two generations, is the lens we bring
              to every entry on this site.
            </p>
          </div>

          <SectionHeading>Why Furniblog exists</SectionHeading>
          <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-muted-foreground">
            <p>
              Most chair &ldquo;reviews&rdquo; online are written by people who
              have never sat in the chair. I built Furniblog to be the opposite:
              an independent, global database grounded in real seating, verified
              specs and honest, like-for-like comparison — so you can choose the
              right chair with confidence, whether you have a hundred dollars or
              ten thousand to spend.
            </p>
          </div>

          <SectionHeading>How we review</SectionHeading>
          <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-muted-foreground">
            <p>
              Every chair is assessed across six criteria that actually decide
              whether you&rsquo;ll be happy a year from now:
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {[
                "Comfort",
                "Ergonomics",
                "Build quality",
                "Design",
                "Value",
                "Long-hour use",
              ].map((c) => (
                <li
                  key={c}
                  className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground"
                >
                  {c}
                </li>
              ))}
            </ul>
            <p>
              Our judgments draw on hands-on experience, verified manufacturer
              specs, and reviews gathered from real owners around the world —
              not marketing copy.
            </p>
          </div>

          <SectionHeading>Independence &amp; how we make money</SectionHeading>
          <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-muted-foreground">
            <p>
              No brand can buy a good word here. Our editorial content is
              independent of our affiliate partnerships, and we recommend chairs
              on merit — never on commission rates. When you buy through some of
              our links we may earn a commission at no extra cost to you, which
              keeps the database free and growing.
            </p>
            <p>
              Read our{" "}
              <Link
                href="/editorial-policy"
                className="text-foreground underline underline-offset-4"
              >
                Editorial Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/affiliate-disclosure"
                className="text-foreground underline underline-offset-4"
              >
                Affiliate Disclosure
              </Link>{" "}
              for the full details.
            </p>
          </div>

          {/* Closing / signature */}
          <div className="mt-14 rounded-xl border border-border bg-muted/40 p-6">
            <p className="font-serif text-lg italic leading-relaxed text-foreground">
              &ldquo;I&rsquo;ve spent my life in chairs so you don&rsquo;t have
              to guess. Find the one that fits you.&rdquo;
            </p>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              — Founder, Furniblog
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Explore the chair database
            </Link>
            <Link
              href="/chairpedia"
              className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Read Chairpedia
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </div>
  )
}

import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

/**
 * Refined call-to-action for the review wizard (/reviews/new). Sells the value
 * — your ranking powers the "people like you" matches — rather than just a bare
 * button. Dark editorial panel with a warm gold accent to stand out on the
 * otherwise light Reviews page.
 */
export function WriteReviewCTA() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#1c1a17] via-[#241f1a] to-[#3a322a] px-6 py-7 text-white md:px-9 md:py-9">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#9a7b4f]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-[#9a7b4f]/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e9c98c]">
            <Sparkles className="h-3.5 w-3.5" />
            Share your experience
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug md:text-[27px]">
            What are the best chairs you&apos;ve actually sat in?
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-white/70">
            Rank up to three chairs from your own experience. It&apos;s anonymous and
            takes about a minute — and it powers the &ldquo;people like you&rdquo;
            matches that help others find the right chair.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/65">
            <span className="rounded-full border border-white/15 px-2.5 py-1">Anonymous</span>
            <span className="rounded-full border border-white/15 px-2.5 py-1">~1 minute</span>
            <span className="rounded-full border border-white/15 px-2.5 py-1">Based on real use</span>
          </div>
        </div>

        <Link
          href="/reviews/new"
          className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#1c1a17] shadow-sm transition-colors hover:bg-white/90"
        >
          Write your review
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
